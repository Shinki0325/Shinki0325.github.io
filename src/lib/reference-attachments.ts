const isImageAttachment = (path: string) => /\.(png|jpe?g|webp|gif|avif)$/i.test(path);
const isTextAttachment = (path: string) => /\.txt$/i.test(path);

const attachmentLabelBase = (path: string) => {
  if (/\.html?$/i.test(path)) {
    return "归档网页";
  }

  if (isTextAttachment(path)) {
    return "文字摘录（下载）";
  }

  if (isImageAttachment(path)) {
    return "页面截图";
  }

  if (/\.json$/i.test(path)) {
    return "归档信息";
  }

  return "资料附件";
};

export const buildReferenceAttachments = (title: string, paths: string[] = []) => {
  const attachmentCounters = new Map<string, number>();

  return paths.map((path) => {
    const baseLabel = attachmentLabelBase(path);
    const count = (attachmentCounters.get(baseLabel) ?? 0) + 1;
    attachmentCounters.set(baseLabel, count);

    return {
      href: path,
      isImage: isImageAttachment(path),
      isText: isTextAttachment(path),
      download: isTextAttachment(path),
      label: count === 1 ? baseLabel : `${baseLabel} ${count}`,
      alt:
        baseLabel === "页面截图" && count === 1
          ? `${title} 页面截图`
          : `${title} 页面截图 ${count}`
    };
  });
};
