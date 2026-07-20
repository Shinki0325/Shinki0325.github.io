export type CharacterArchiveView = "birthday" | "height";

export const resolveCharacterArchiveView = (
  search: string,
  stored: string | null,
): CharacterArchiveView => {
  const requested = new URLSearchParams(search).get("archive");
  if (requested === "birthday" || requested === "height") return requested;
  return stored === "height" ? "height" : "birthday";
};
