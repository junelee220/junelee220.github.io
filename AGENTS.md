# AGENTS.md

## Project Overview

Quartz v5 fork for `junelee220.github.io`. Static site generator deploying a digital garden to GitHub Pages.

## Quick Commands

```bash
npm run docs          # Local dev server (http://localhost:8080)
npm run check         # Type check + Prettier check (must pass both)
npm run format        # Auto-format with Prettier
npm run test          # Run tests (node:test)
```

## Build Pipeline

```bash
npx quartz build --serve -d content   # Dev server with watch
npx quartz build -d content           # Production build → public/
npx quartz plugin install             # Install plugins from lockfile
```

**Critical**: `prebuild` hook automatically runs `install-plugins` before builds.

## Content & Structure

- **Content source**: `docs/` directory (markdown files)
- **Output**: `public/` (gitignored)
- **Config**: `quartz.config.yaml` (site config, plugins, layout)
- **Plugins**: `quartz.lock.json` (pinned versions)
- **Patches**: `patches/` directory (custom plugin overrides)

## Plugin System

Plugins are Git repos installed to `.quartz/plugins/` (gitignored).

### Custom Plugins (from github:junelee220/)

- `folder-page` - Folder index pages
- `tag-page` - Tag index pages
- `explorer` - File tree navigation (left sidebar)

### Applying Patches (IMPORTANT)

After `npx quartz plugin install`, patches must be applied manually:

```bash
cp patches/folder-page_PageList.tsx .quartz/plugins/folder-page/src/components/PageList.tsx
cp patches/folder-page_FolderContent.tsx .quartz/plugins/folder-page/src/components/FolderContent.tsx
cp patches/explorer_Explorer.tsx .quartz/plugins/explorer/src/components/Explorer.tsx
cp patches/explorer_explorer.inline.ts .quartz/plugins/explorer/src/components/scripts/explorer.inline.ts
cp patches/tag-page_PageList.tsx .quartz/plugins/tag-page/src/components/PageList.tsx
cp patches/tag-page_TagContent.tsx .quartz/plugins/tag-page/src/components/TagContent.tsx

# Then rebuild each patched plugin:
cd .quartz/plugins/folder-page && npm install && npm run build && cd ../../..
cd .quartz/plugins/explorer && npm install && npm run build && cd ../../..
cd .quartz/plugins/tag-page && npm install && npm run build && cd ../../..
```

## Testing

- Framework: `node:test` (run via `tsx --test`)
- Test files: `quartz/**/*.test.ts`
- Run single test: `npx tsx --test quartz/util/path.test.ts`

## Code Style

- **Formatter**: Prettier (no semicolons, 100 char width, trailing commas)
- **TypeScript**: strict mode, `noUnusedLocals`, `noUnusedParameters`
- **JSX**: Preact (`jsxImportSource: "preact"`)

## Deployment

- **Trigger**: Push to `main` branch
- **Workflow**: `.github/workflows/deploy-pages.yaml`
- **Output**: GitHub Pages at `junelee220.github.io`

## Gotchas

1. **Node.js >= 22 required** (enforced in bootstrap-cli.mjs)
2. **Patches must be applied after plugin install** - deploy workflow does this, but local dev may need manual steps
3. **`.quartz/` is gitignored** - contains installed plugins, must reinstall after clone
4. **Plugin npm install required** - after patching, run `npm install && npm run build` in each plugin directory
5. **`quartz.config.yaml` vs `quartz.config.default.yaml`** - default is upstream reference, actual config is the former
