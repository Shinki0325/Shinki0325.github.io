# Add Sixth Non-Home Background

## Goal

Add `https://pic.imgdd.cc/i/033sANQbp4eAi1Iw97zRwt.png` as the sixth image in the non-home background rotation while preserving the existing local-asset performance strategy.

## Asset Pipeline

- Append the source URL to `scripts/acquire-nonhome-backgrounds.mjs` so provenance and regeneration remain explicit.
- Generate `public/uploads/backgrounds/nonhome/background-06.webp` with the existing Sharp pipeline: automatic orientation, fit inside `1920x1080`, no enlargement, and effort 6.
- Use a source-specific WebP quality of 59 for the new image. The verified candidate is `1529x1080` and approximately 248 KB; quality 80 would be approximately 369 KB and would violate the existing per-file limit.
- Keep every file below 250 KB. Scale the aggregate budget proportionally from 900 KB for five images to 1.08 MB for six images; the projected six-image total is approximately 947 KB.
- Preserve quality 80 and the existing bytes of backgrounds 01-05.

## Configuration And Runtime

- Append `/uploads/backgrounds/nonhome/background-06.webp` to `backgroundImages` in `src/config/pages/home.json`.
- Preserve the existing five-image order and place the new image last.
- Do not change random initial selection, 55-second next-image preload, 60-second rotation, session continuity, ClientRouter cleanup, crossfade, veil, or homepage video behavior.
- Do not reference `pic.imgdd.cc` from the public runtime configuration.

## Tests And Verification

- Update asset tests to expect six unique ordered local WebPs and retain size, dimensions, format, provenance, and the proportionally scaled aggregate-size check.
- Update Playwright's configured background list to include the sixth local path while retaining the one-current/one-next request contract.
- Run focused background tests, then the required release gates: `pnpm test`, `pnpm check`, `pnpm build`, and `pnpm validate:public`.
- Run `git diff --check` on the scoped changes and report test counts and key failures only.

## Risks

- Future Sharp changes could alter the new asset's byte size; the acquisition script and tests must fail if it reaches 250 KB or the six-image set reaches 1.08 MB.
- Regenerating the complete set must not introduce unintended byte changes to the existing five backgrounds; verification will compare their worktree state before accepting the result.
