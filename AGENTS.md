# AGENTS.md

## Quick Commands

```bash
npm run docs             # Dev server (http://localhost:8080), uses -d content
npm run check            # tsc --noEmit && npx prettier . --check (must pass both)
npm run format           # npx prettier . --write
npm run test             # tsx --test (discovers quartz/**/*.test.ts)
npm run install-plugins  # npx tsx ./quartz/plugins/loader/install-plugins.ts (installs from quartz.lock.json)
```

## Browser Editor (editor.html)

Standalone HTML content editor — no Node.js, no server, no build step. Double-click to open in Chrome/Edge.

- **File I/O**: File System Access API (`showDirectoryPicker`). User selects the **project root** (must contain `content/` and `.git/`). Directory handle persisted in IndexedDB across sessions.
- **Git operations**: `isomorphic-git` (CDN-loaded) does add/commit/push in-browser. A custom fs adapter wraps File System Access API handles into the `fs.promises` interface isomorphic-git expects.
- **Git push auth**: GitHub Personal Access Token (Fine-grained recommended, repo Contents scope only). Token input has opt-in "remember" checkbox (default off, plaintext in localStorage when on). Clipboard fallback always available.
- **CORS proxy**: Push needs a CORS proxy (GitHub doesn't send CORS headers). Default: `https://cors.isomorphic-git.org` (public, third-party). Self-hostable via `npx cors-proxy-server` for better security. Proxy URL configurable in the Git modal, persisted in localStorage.
- **Quartz preview**: Opens `http://localhost:8080/...` — requires `npm run docs` running separately.
- **Browser support**: Chrome/Edge only (File System Access API). Safari/Firefox show an unsupported message.

## First-Time Setup (CRITICAL)

`.quartz/` is gitignored. A fresh clone CANNOT build or serve until plugins are installed and patched:

```bash
npx quartz plugin install          # installs from quartz.lock.json → .quartz/plugins/
# Then apply patches (see Plugin Patch System below)
```

`npx quartz build` (and therefore `npm run docs`) does **not** auto-install plugins. If `.quartz/plugins/` is missing, the build fails.

## Content & Structure

- **Content source**: `content/` directory (NOT `docs/` — `docs/` is upstream Quartz demo content)
- **Output**: `public/` (gitignored)
- **Config**: `quartz.config.yaml` (NOT `quartz.config.default.yaml`, that's upstream reference)
- **Custom styles**: `quartz/styles/custom.scss` — all site-specific CSS overrides live here
- **Homepage**: `content/index.md`
- **Folder naming**: `01works/`, `02events/`, `03researches/`, `04projects/`, `05publications/`, `06experiences/` — sequence prefixes control sort order; explorer `mapFn` strips them from sidebar display
- **File naming convention**: Files use 2-digit year prefixes (`13武汉地铁传说.md` = 2013, `25顺流而下.md` = 2025). Ranges like `17-21` use the end year (21→2021) for sorting. This convention is enforced by patch sort functions — breaking it breaks sort order.

## Plugin Patch System (CRITICAL)

`.quartz/` is gitignored. Plugins install from `quartz.lock.json` to `.quartz/plugins/`. Three plugins (`explorer`, `folder-page`, `tag-page`) are from `github:junelee220/` forks, NOT `github:quartz-community/`. Custom overrides live in `patches/` and must be applied after every `npx quartz plugin install`:

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

- **explorer_Explorer.tsx**: `mapFn` strips `01`/`02`/etc. prefixes from folder display names; `sortFn` sorts folders by `slugSegment` (ascending, preserves sequence order), files by year prefix (descending); `filterFn` hides the `tags` folder
- **explorer_explorer.inline.ts**: Full file tree rendering with bilingual title splitting (`splitBilingualTitle` / `createBilingualTitle`) — splits titles containing `/` into Chinese (`.title-zh`) and English (`.title-en`) spans
- **folder-page_FolderContent.tsx / PageList.tsx**: `byFileNameYearFolderFirst` sort — folder-first ordering, then by filename year prefix (descending); used as default sort for folder pages
- **tag-page_PageList.tsx / TagContent.tsx**: Same `byFileNameYearFolderFirst` sort applied to tag pages

### Gotcha: explorer.scss is NOT tracked

Styles added to `.quartz/plugins/explorer/src/components/styles/explorer.scss` will NOT sync to CI/CD. All explorer-specific CSS must go in `quartz/styles/custom.scss` instead.

## Deployment

- **Trigger**: Push to `main` branch
- **Active workflow**: `.github/workflows/deploy-pages.yaml` only
- **CI steps**: `npm ci` → `npx quartz plugin install` → apply patches → rebuild 3 patched plugins → `npx quartz build` → deploy to GitHub Pages
- **Plugin cache**: CI caches `.quartz/plugins` by `quartz.lock.json` hash; patches are re-applied and plugins rebuilt every time

### Upstream CI workflows are DEAD on this fork

`ci.yaml`, `deploy-v5.yaml`, `docker-build-push.yaml`, `build-preview.yaml`, `deploy-preview.yaml` all have `if: ${{ github.repository == 'jackyzha0/quartz' }}` guards — they will **never** run on this fork. Do not rely on them for testing or deployment. There is no CI type-check or test gate on push to `main`; run `npm run check` locally before pushing.

### Dockerfile does NOT apply patches

The `Dockerfile` runs `npx quartz plugin install` but never applies patches or rebuilds patched plugins. It is broken for local use on this fork without manual patch application.

## Custom Styling (quartz/styles/custom.scss)

All site-specific visual overrides in one file:
- White background (light mode only), transparent center/article, no box-shadow
- Hidden `.content-meta` (date/reading time)
- Green highlight (`mark` = `#00ff66`)
- Tag links: yellow bg (`#fff236`) + purple text (`#7a43b5`)
- Breadcrumbs: purple (`#7a43b5`)
- Sidebar/explorer: black/gray text, purple (`#7a43b5`) on hover/active
- Page title: black, purple on hover
- Bilingual title layout: flex column, zh 0.95rem/600, en 0.8rem/400
- Images: zero margin, zero gap, no border-radius, `line-height: 0` on parent `<p>` to eliminate whitespace

## Code Style

- **Prettier**: no semicolons, 100 char width, trailing commas, 2-space indent (`.prettierrc`)
- **TypeScript**: strict, `noUnusedLocals`, `noUnusedParameters` (`tsconfig.json`)
- **JSX**: Preact (`jsxImportSource: "preact"`)
- **Node.js >= 22** required (`.node-version` = v22.16.0, `.npmrc` has `engine-strict=true` — npm install hard-fails if version doesn't match)
- **tsconfig excludes** `.quartz/**/src/**` — plugin source is not type-checked by `npm run check`

## Local Dev Server

Use `screen` to keep the dev server alive across shell sessions:

```bash
screen -dmS quartz bash -c 'npm run docs > /tmp/quartz-dev.log 2>&1'
# Check: lsof -i:8080
# Kill: screen -S quartz -X quit; lsof -ti:8080 | xargs kill -9
```
