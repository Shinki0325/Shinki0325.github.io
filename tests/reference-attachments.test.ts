import { describe, expect, it } from "vitest";
import { buildReferenceAttachments } from "../src/lib/reference-attachments";

describe("buildReferenceAttachments", () => {
  it("marks text attachments as downloadable utf-8 text assets", () => {
    const attachments = buildReferenceAttachments("测试资料", [
      "/uploads/example.txt",
      "/uploads/example.html",
      "/uploads/example.png"
    ]);

    expect(attachments[0]).toMatchObject({
      href: "/uploads/example.txt",
      label: "文字摘录（下载）",
      download: true,
      isImage: false
    });
    expect(attachments[1]).toMatchObject({
      href: "/uploads/example.html",
      label: "归档网页",
      download: false,
      isImage: false
    });
    expect(attachments[2]).toMatchObject({
      href: "/uploads/example.png",
      label: "页面截图",
      download: false,
      isImage: true,
      alt: "测试资料 页面截图"
    });
  });

  it("numbers repeated attachment kinds consistently", () => {
    const attachments = buildReferenceAttachments("测试资料", [
      "/uploads/one.txt",
      "/uploads/two.txt",
      "/uploads/one.png",
      "/uploads/two.png"
    ]);

    expect(attachments.map((attachment) => attachment.label)).toEqual([
      "文字摘录（下载）",
      "文字摘录（下载） 2",
      "页面截图",
      "页面截图 2"
    ]);
  });
});
