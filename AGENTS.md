# Blog Project Agent Rules

`D:\blog` is the official Astro blog project. Treat it as the production source for blog code, content, configuration, assets, and publishing workflow.

`D:\blog-kb` is the shared multi-agent knowledge base and handoff center. Before starting any task for this blog, every agent must read:

- `D:\blog-kb\README.md`
- `D:\blog-kb\MANIFEST.md`
- `D:\blog-kb\STATUS.md`
- `D:\blog-kb\AGENT-HANDBOOK.md`
- `D:\blog-kb\CHANGELOG.md`

Default rule: do not directly modify `D:\blog` unless you are the Blog Manager Agent or the user explicitly authorizes direct edits for the current task.

If a blog change is needed and you are not authorized to edit `D:\blog` directly, prepare a handoff in `D:\blog-kb\outbox` for the Blog Manager Agent. Include the requested change, relevant files, context, risks, and suggested verification steps.

Before any direct edit in `D:\blog`, check `git status` and avoid overwriting existing user or agent work.
