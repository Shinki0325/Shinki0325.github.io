import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("manager api contract", () => {
  it("keeps the local content listing handler wired to supported content kinds", async () => {
    const routeSource = await fs.readFile("manager/server/routes/content.ts", "utf8");

    expect(routeSource).toContain("registerContentRoutes");
    expect(routeSource).toContain("getContentKinds");
  });

  it("registers albums as a supported manager content kind", async () => {
    const filesSource = await fs.readFile("manager/server/files.ts", "utf8");
    const typesSource = await fs.readFile("manager/src/types.ts", "utf8");

    expect(typesSource).toContain('| "albums"');
    expect(filesSource).toContain('albums: "albums"');
  });

  it("adds a birthday data service for local CRUD and image operations", async () => {
    const birthdaySource = await fs.readFile("manager/server/birthdays.ts", "utf8");

    expect(birthdaySource).toContain("readBirthdayData");
    expect(birthdaySource).toContain("writeBirthdayData");
    expect(birthdaySource).toContain("getBirthdayStats");
    expect(birthdaySource).toContain("saveBirthdayWork");
    expect(birthdaySource).toContain("deleteBirthdayWork");
    expect(birthdaySource).toContain("saveBirthdayCharacter");
    expect(birthdaySource).toContain("deleteBirthdayCharacter");
    expect(birthdaySource).toContain("copyBirthdayImage");
    expect(birthdaySource).toContain("saveUploadedBirthdayImage");
    expect(birthdaySource).toContain("cropBirthdayAvatar");
    expect(birthdaySource).toContain("character-birthdays.json");
    expect(birthdaySource).toContain("public/uploads/character-birthdays");
    expect(birthdaySource).toContain("missingAvatar");
    expect(birthdaySource).toContain("missingImage");
    expect(birthdaySource).toContain("todo");
  });

  it("registers birthday manager routes and client API helpers", async () => {
    const indexSource = await fs.readFile("manager/server/index.ts", "utf8");
    const routeSource = await fs.readFile("manager/server/routes/birthdays.ts", "utf8");
    const apiSource = await fs.readFile("manager/src/api.ts", "utf8");
    const typesSource = await fs.readFile("manager/src/types.ts", "utf8");

    expect(indexSource).toContain("registerBirthdayRoutes");
    expect(routeSource).toContain("/api/birthdays");
    expect(routeSource).toContain("/api/birthdays/character/save");
    expect(routeSource).toContain("/api/birthdays/image/upload");
    expect(apiSource).toContain("getBirthdayData");
    expect(apiSource).toContain("saveBirthdayCharacter");
    expect(apiSource).toContain("uploadBirthdayImage");
    expect(typesSource).toContain("BirthdayDataFile");
    expect(typesSource).toContain("BirthdayCharacterDraft");
  });

  it("keeps birthday character save avatar nullable at the route boundary", async () => {
    const routeSource = await fs.readFile("manager/server/routes/birthdays.ts", "utf8");

    expect(routeSource).toContain("parseBirthdayCharacterDraft");
    expect(routeSource).toContain("avatar: body.avatar");
    expect(routeSource).not.toMatch(/requireFields\([^)]*\[[^\]]*"avatar"/s);
  });

  it("accepts common local image upload formats for birthday image conversion", async () => {
    const routeSource = await fs.readFile("manager/server/routes/birthdays.ts", "utf8");

    expect(routeSource).toContain("webp|png|jpe?g");
    expect(routeSource).toContain("data:image/webp, image/png, or image/jpeg;base64 URL");
    expect(routeSource).not.toContain("data:image/[a-z0-9.+-]+;base64");
  });

  it("surfaces birthday API server error messages to clients", async () => {
    const apiSource = await fs.readFile("manager/src/api.ts", "utf8");

    expect(apiSource).toContain("class ApiError extends Error");
    expect(apiSource).toContain("payload.error");
    expect(apiSource).toContain("this.status = status");
  });

  it("serves site upload assets inside the local manager", async () => {
    const indexSource = await fs.readFile("manager/server/index.ts", "utf8");
    const viteSource = await fs.readFile("manager/vite.config.ts", "utf8");

    expect(indexSource).toContain('app.use("/uploads"');
    expect(indexSource).toContain("express.static");
    expect(viteSource).toContain('"/uploads": "http://127.0.0.1:4318"');
  });

  it("provides generic manager image upload and crop APIs for visual editors", async () => {
    const routeSource = await fs.readFile("manager/server/routes/assets.ts", "utf8");
    const filesSource = await fs.readFile("manager/server/files.ts", "utf8");
    const apiSource = await fs.readFile("manager/src/api.ts", "utf8");

    expect(routeSource).toContain("/api/assets/image/upload");
    expect(routeSource).toContain("/api/assets/image/crop");
    expect(filesSource).toContain("saveUploadedAssetImage");
    expect(filesSource).toContain("cropAssetImage");
    expect(apiSource).toContain("uploadAssetImage");
    expect(apiSource).toContain("cropAssetImage");
  });

  it("allows large local image data URLs through the manager JSON parser", async () => {
    const indexSource = await fs.readFile("manager/server/index.ts", "utf8");

    expect(indexSource).toContain('express.json({ limit: "80mb" })');
    expect(indexSource).not.toContain('express.json({ limit: "10mb" })');
  });

  it("exposes image host configuration and hosted original upload helpers", async () => {
    const routeSource = await fs.readFile("manager/server/routes/assets.ts", "utf8");
    const hostSource = await fs.readFile("manager/server/imageHost.ts", "utf8");
    const apiSource = await fs.readFile("manager/src/api.ts", "utf8");

    expect(routeSource).toContain("/api/image-host/status");
    expect(hostSource).toContain("IMAGE_HOST_PROVIDER");
    expect(hostSource).toContain("uploadOriginalToImageHost");
    expect(apiSource).toContain("getImageHostStatus");
  });

  it("provides a manager-only cloud music fetch endpoint for local static track caching", async () => {
    const indexSource = await fs.readFile("manager/server/index.ts", "utf8");
    const routeSource = await fs.readFile("manager/server/routes/music.ts", "utf8");
    const apiSource = await fs.readFile("manager/src/api.ts", "utf8");

    expect(indexSource).toContain("registerMusicRoutes");
    expect(routeSource).toContain("/api/music-cloud/track");
    expect(routeSource).toContain("MUSIC_CLOUD_API_BASE_URL");
    expect(routeSource).toContain("hydrateCloudTrackLyrics");
    expect(apiSource).toContain("fetchCloudMusicTrack");
  });

  it("exposes practical workflow actions for static preview and deploy", async () => {
    const routeSource = await fs.readFile("manager/server/routes/system.ts", "utf8");
    const apiSource = await fs.readFile("manager/src/api.ts", "utf8");
    const dashboardSource = await fs.readFile("manager/src/pages/Dashboard.tsx", "utf8");

    expect(routeSource).toContain("/api/system/static-preview");
    expect(routeSource).toContain("/api/system/deploy");
    expect(routeSource).toContain("127.0.0.1:4321");
    expect(routeSource).toContain("python3 -m http.server 4321 --bind 127.0.0.1 --directory dist");
    expect(routeSource).toContain("git push");
    expect(routeSource).toContain("':!.tmp'");
    expect(apiSource).toContain("runStaticPreview");
    expect(apiSource).toContain("runDeploy");
    expect(dashboardSource).toContain("生成静态预览");
    expect(dashboardSource).toContain("推送上线");
    expect(dashboardSource).toContain("previewUrl");
    expect(dashboardSource).not.toContain("验证公开内容");
    expect(dashboardSource).not.toContain("查看 Git 状态");
  });
});
