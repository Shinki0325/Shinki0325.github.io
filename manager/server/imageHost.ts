import crypto from "node:crypto";

type ImageHostConfig = {
  provider: string;
  endpoint: string;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
};

const trimSlash = (value: string) => value.replace(/\/+$/, "");

const getConfig = (): ImageHostConfig | null => {
  const provider = process.env.IMAGE_HOST_PROVIDER ?? "";
  const endpoint = process.env.IMAGE_HOST_ENDPOINT ?? "";
  const bucket = process.env.IMAGE_HOST_BUCKET ?? "";
  const accessKeyId = process.env.IMAGE_HOST_ACCESS_KEY_ID ?? "";
  const secretAccessKey = process.env.IMAGE_HOST_SECRET_ACCESS_KEY ?? "";
  const publicBaseUrl = process.env.IMAGE_HOST_PUBLIC_BASE_URL ?? "";

  if (!provider || !endpoint || !bucket || !accessKeyId || !secretAccessKey || !publicBaseUrl) {
    return null;
  }

  return {
    provider,
    endpoint: trimSlash(endpoint),
    bucket,
    region: process.env.IMAGE_HOST_REGION ?? "auto",
    accessKeyId,
    secretAccessKey,
    publicBaseUrl: trimSlash(publicBaseUrl)
  };
};

const hmac = (key: Buffer | string, value: string) => crypto.createHmac("sha256", key).update(value).digest();
const sha256Hex = (value: Buffer | string) => crypto.createHash("sha256").update(value).digest("hex");

const getSigningKey = (secretAccessKey: string, date: string, region: string) => {
  const dateKey = hmac(`AWS4${secretAccessKey}`, date);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, "s3");
  return hmac(serviceKey, "aws4_request");
};

const toAmzDate = (date: Date) => date.toISOString().replace(/[:-]|\.\d{3}/g, "");
const toDateStamp = (date: Date) => toAmzDate(date).slice(0, 8);

const extensionForContentType = (contentType: string) => {
  if (contentType === "image/png") {
    return "png";
  }
  if (contentType === "image/webp") {
    return "webp";
  }
  return "jpg";
};

const sanitizeKey = (value: string) =>
  value
    .replace(/^\/+/, "")
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9/_@.-]+/g, "-");

export const getImageHostStatus = () => {
  const config = getConfig();
  return {
    enabled: Boolean(config),
    provider: config?.provider ?? process.env.IMAGE_HOST_PROVIDER ?? "",
    publicBaseUrl: config?.publicBaseUrl ?? process.env.IMAGE_HOST_PUBLIC_BASE_URL ?? "",
    bucket: config?.bucket ?? process.env.IMAGE_HOST_BUCKET ?? ""
  };
};

export const uploadOriginalToImageHost = async (
  buffer: Buffer,
  targetDir: string,
  filename: string,
  contentType: string
): Promise<string | undefined> => {
  const config = getConfig();
  if (!config) {
    return undefined;
  }
  if (config.provider !== "s3") {
    throw new Error(`Unsupported IMAGE_HOST_PROVIDER: ${config.provider}`);
  }

  const key = sanitizeKey(`${targetDir}/${filename}.${extensionForContentType(contentType)}`);
  const endpoint = new URL(config.endpoint);
  const canonicalUri = `/${config.bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
  const uploadUrl = `${config.endpoint}${canonicalUri}`;
  const now = new Date();
  const amzDate = toAmzDate(now);
  const dateStamp = toDateStamp(now);
  const payloadHash = sha256Hex(buffer);
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${endpoint.host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`
  ].join("\n");
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    `${canonicalHeaders}\n`,
    signedHeaders,
    payloadHash
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest)
  ].join("\n");
  const signature = crypto.createHmac("sha256", getSigningKey(config.secretAccessKey, dateStamp, config.region)).update(stringToSign).digest("hex");

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      "content-type": contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate
    },
    body: new Uint8Array(buffer)
  });

  if (!response.ok) {
    throw new Error(`Image host upload failed: ${response.status} ${response.statusText}`);
  }

  return `${config.publicBaseUrl}/${key}`;
};
