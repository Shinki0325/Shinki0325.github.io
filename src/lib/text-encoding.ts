const UTF8_BOM = "\uFEFF";

export const ensureUtf8Bom = (value: string) =>
  value.startsWith(UTF8_BOM) ? value : `${UTF8_BOM}${value}`;

export const stripUtf8Bom = (value: string) =>
  value.startsWith(UTF8_BOM) ? value.slice(UTF8_BOM.length) : value;
