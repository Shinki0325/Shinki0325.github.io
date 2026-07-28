import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  birthdayPublicAssets,
  type PublicAssetCollectionConfig,
} from "../src/config/public-assets";
import {
  BirthdayDataClient,
  sha256Hex,
} from "../src/lib/birthday-data-client";

const snapshotId = "character-birthday-data-2026-07-28-phase-0";
const avatarPath =
  "birthdays/v1/avatars/43/4374bdbc37e04b9a8e90f17f4ad2825c8caecf8bbaef07bde14ed6721bb8ecd8.webp";

const work = {
  id: "karumaruka-circle",
  title: "カルマルカ＊サークル",
  localizedTitle: "卡尔玛露卡＊同好会",
  sourceUrl: "https://private.invalid/source",
};

const character = {
  id: "karumaruka-circle-14919",
  name: "天ヶ瀬奈月",
  reading: "あまがせなつき",
  workId: work.id,
  birthday: "07-01",
  gender: "female",
  avatar: avatarPath,
  sourceId: "14919",
  bangumiId: "private-id",
};

const payload = (month: string, schemaVersion: string) => ({
  schemaVersion,
  snapshotId,
  generatedAt: "2026-07-28T00:00:00.000Z",
  month,
  works: [work],
  characters: [{ ...character, birthday: `${month}-01` }],
});

const createHarness = async () => {
  const summary = payload("07", "character-birthday-summary-v1");
  const july = payload("07", "character-birthday-month-v1");
  const august = payload("08", "character-birthday-month-v1");
  const manifest = {
    schemaVersion: "character-birthday-data-v1",
    collection: "character-birthday-data",
    snapshotId,
    generatedAt: "2026-07-28T00:00:00.000Z",
    files: [
      "birthdays/v1/summary.json",
      "birthdays/v1/months/07.json",
      "birthdays/v1/months/08.json",
      avatarPath,
    ].map((path) => ({
      path,
      bytes: 100,
      sha256: "d".repeat(64),
      mime: path.endsWith(".json") ? "application/json" : "image/webp",
      kind: path.endsWith(".json") ? "birthday-data" : "birthday-avatar",
      sourceId: path,
      public: true,
      ...(path.endsWith(".webp") ? { width: 320, height: 320 } : {}),
    })),
  };
  const manifestText = JSON.stringify(manifest);
  const config: PublicAssetCollectionConfig = {
    ...birthdayPublicAssets,
    manifestSha256: await sha256Hex(new TextEncoder().encode(manifestText)),
  };
  const responses = new Map<string, unknown>([
    ["assets-manifest.json", manifestText],
    ["birthdays/v1/summary.json", summary],
    ["birthdays/v1/months/07.json", july],
    ["birthdays/v1/months/08.json", august],
  ]);
  const calls: string[] = [];
  const fetcher = vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    const path = url.replace(config.baseUrl, "");
    calls.push(path);
    const body = responses.get(path);
    if (body === undefined) return new Response("not found", { status: 404 });
    return new Response(typeof body === "string" ? body : JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });

  return { calls, client: new BirthdayDataClient(config, fetcher), responses };
};

describe("birthday progressive data client", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("does not request public data until a caller activates it", async () => {
    const { calls, client } = await createHarness();

    expect(calls).toEqual([]);
    await client.loadSummary();
    expect(calls).toEqual(["assets-manifest.json", "birthdays/v1/summary.json"]);
  });

  it("exposes the verified snapshot so summary and month requests can start together", async () => {
    const { calls, client } = await createHarness();

    const verifiedSnapshotId = await client.loadSnapshotId();
    const summaryRequest = client.loadSummary();
    const monthRequest = client.loadMonth("07", verifiedSnapshotId);

    expect(verifiedSnapshotId).toBe(snapshotId);
    await vi.waitFor(() => expect(calls).toEqual([
      "assets-manifest.json",
      "birthdays/v1/summary.json",
      "birthdays/v1/months/07.json",
    ]));
    await Promise.all([summaryRequest, monthRequest]);
  });

  it("maps only approved display fields and resolves manifest-backed avatars", async () => {
    const { client } = await createHarness();
    const summary = await client.loadSummary();

    expect(summary.characters[0]).toEqual({
      id: character.id,
      name: character.name,
      reading: character.reading,
      workId: work.id,
      birthday: "07-01",
      gender: "female",
      avatar: `${birthdayPublicAssets.baseUrl}${avatarPath}`,
    });
    expect(summary.works[0]).toEqual({
      id: work.id,
      title: work.title,
      localizedTitle: work.localizedTitle,
    });
    expect(summary.characters[0]).not.toHaveProperty("sourceId");
    expect(summary.characters[0]).not.toHaveProperty("bangumiId");
    expect(summary.works[0]).not.toHaveProperty("sourceUrl");
  });

  it("deduplicates successful month shards by snapshot and month", async () => {
    const { calls, client } = await createHarness();
    const summary = await client.loadSummary();

    const first = await client.loadMonth("07", summary.snapshotId);
    const second = await client.loadMonth("07", summary.snapshotId);

    expect(second).toBe(first);
    expect(calls.filter((path) => path === "birthdays/v1/months/07.json")).toHaveLength(1);
    expect(calls).not.toContain("birthdays/v1/months/08.json");
  });

  it("keeps successful cache entries and retries only a failed target month", async () => {
    const { calls, client, responses } = await createHarness();
    const summary = await client.loadSummary();
    const july = await client.loadMonth("07", summary.snapshotId);
    responses.delete("birthdays/v1/months/08.json");

    await expect(client.loadMonth("08", summary.snapshotId)).rejects.toThrow();
    responses.set("birthdays/v1/months/08.json", payload("08", "character-birthday-month-v1"));
    const august = await client.loadMonth("08", summary.snapshotId);

    expect(await client.loadMonth("07", summary.snapshotId)).toBe(july);
    expect(august.month).toBe("08");
    expect(calls.filter((path) => path === "birthdays/v1/months/08.json")).toHaveLength(2);
    expect(calls.filter((path) => path === "birthdays/v1/months/07.json")).toHaveLength(1);
  });

  it("rejects month data from a different snapshot", async () => {
    const { client } = await createHarness();
    const summary = await client.loadSummary();

    await expect(client.loadMonth("07", `${summary.snapshotId}-stale`)).rejects.toThrow(
      /snapshot/i,
    );
  });
});
