# AGENTS.md

## Quick Commands

```bash
npm run docs          # Dev server (http://localhost:8080), uses -d content
npm run check         # tsc --noEmit && prettier --check (must pass both)
npm run format        # prettier --write
npm run test          # tsx --test (quartz/**/*.test.ts)
```

## Content & Structure

- **Content source**: `content/` directory (NOT `docs/`)
- **Output**: `public/` (gitignored)
- **Config**: `quartz.config.yaml` (NOT `quartz.config.default.yaml`, that's upstream reference)
- **Custom styles**: `quartz/styles/custom.scss` - all site-specific CSS overrides live here
- **Folder naming**: `01works/`, `02events/`, `03researches/`, `04projects/`, `05publications/`, `06experiences/` - sequence prefixes control sort order; explorer `mapFn` strips them from sidebar display

## Plugin Patch System (CRITICAL)

`.quartz/` is gitignored. Plugins install from `quartz.lock.json` to `.quartz/plugins/`. Custom overrides live in `patches/` and must be applied after every `npx quartz plugin install`:

```bash
cp patches/folder-page_PageList.tsx .quartz/plugins/folder-page/src/components/PageList.tsx
cp patches/folder-page_FolderContent.tsx .quartz/plugins/folder-page/src/components/FolderContent.tsx
cp patches/explorer_Explorer.tsx .quartz/plugins/explorer/src/components/Explorer.tsx
cp patches/explorer_explorer.inline.ts .quartz/plugins/explorer/src/components/scripts/explorer.inline.ts
cp patches/tag-page_PageList.tsx .quartz/plugins/tag-page/src/components/PageList.tsx
cp patches/tag-page_TagContent.tsx .quartz/plugins/tag-page/src/components/TagContent.tsx

cd .quartz/plugins/folder-page && npm install && npm run build && cd ../../..
cd .quartz/plugins/explorer && npm install && npm run build && cd ../../..
cd .quartz/plugins/tag-page && npm install && npm run build && cd ../../..
```

### What the patches do

- **explorer_Explorer.tsx**: `mapFn` strips `01`/`02` prefixes from folder display names; `sortFn` sorts folders by `slugSegment` (ascending, preserves sequence order), files by year (descending)
- **explorer_explorer.inline.ts**: Full file tree rendering with bilingual title splitting (`splitBilingualTitle` / `createBilingualTitle`) - splits titles containing `/` into Chinese (`.title-zh`) and English (`.title-en`) spans
- **folder-page_FolderContent.tsx / PageList.tsx**: Custom sort by filename year prefix, folder-first ordering
- **tag-page_PageList.tsx / TagContent.tsx**: Tag page layout with custom sorting

### Gotcha: explorer.scss is NOT tracked

Styles added to `.quartz/plugins/explorer/src/components/styles/explorer.scss` will NOT sync to CI/CD. All explorer-specific CSS must go in `quartz/styles/custom.scss` instead.

## Deployment

- **Trigger**: Push to `main` branch
- **Workflow**: `.github/workflows/deploy-pages.yaml`
- **CI steps**: `npm ci` -> `npx quartz plugin install` -> apply patches -> rebuild plugins -> `npx quartz build` -> deploy to GitHub Pages
- **Plugin cache**: CI caches `.quartz/plugins` by `quartz.lock.json` hash; patches are re-applied and plugins rebuilt every time

## Custom Styling (quartz/styles/custom.scss)

All site-specific visual overrides:
- White background (light mode), transparent center/article
- Hidden content-meta (date/reading time)
- Green highlight (`mark` = `#00ff66`)
- Tag links: yellow background (`#fff236`) + purple text (`#7a43b5`)
- Breadcrumbs: purple (`#7a43b5`)
- Sidebar: black/gray text, purple on hover/active
- Page title: black, purple on hover
- Bilingual title layout: flex column, zh 0.95rem/600, en 0.8rem/400
- Images: zero margin, zero gap, no border-radius, `line-height: 0` on parent `<p>` to eliminate whitespace

## Code Style

- **Prettier**: no semicolons, 100 char width, trailing commas
- **TypeScript**: strict, `noUnusedLocals`, `noUnusedParameters`
- **JSX**: Preact (`jsxImportSource: "preact"`)
- **Node.js >= 22** required

## Local Dev Server

Use `screen` to keep the dev server alive across shell sessions:

```bash
screen -dmS quartz bash -c 'npm run docs > /tmp/quartz-dev.log 2>&1'
# Check: lsof -i:8080
# Kill: screen -S quartz -X quit; lsof -ti:8080 | xargs kill -9
```
