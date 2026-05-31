# The Guano Guild — website

A static, two-mode site published to GitHub Pages.

- **Story mode** (default, `#story`): a designed reading experience with drop-cap
  typography. Serves the **first-iteration chapters straight from the vault** (folder
  `04-chapters`, in filename order; the `_`-prefixed template is skipped) — see
  `storyChapters()` in `assets/app.js`.
- **Experiment mode** (`#experiment`): how the project was made (the *Makers gonna Make —
  Episode 14* origin, The Melting Pot, Edinburgh, 30 May 2026 —
  [lu.ma](https://luma.com/dlgjqfrg)), plus the live Obsidian
  vault as:
  - an interactive **network graph** (`#experiment/graph`) — nodes = notes, edges =
    `[[wikilinks]]`, coloured by folder, click a node to read it;
  - browsable **notes** (`#experiment/notes`) — rendered (marked.js) with working
    wikilinks, plus a *view raw* toggle and search.

## How it builds
`tools/build_site.py` scans the vault (everything except `.git .archive .obsidian .github
site tools`) and writes **`site/data.js`** = `window.GUANOMON_DATA = {notes, edges,
generated}`. No build framework; the page renders client-side (marked + vis-network via CDN).

`.github/workflows/pages.yml` regenerates `data.js` and deploys `site/` on every push to
`main`. A snapshot `data.js` is also committed so the site works on a plain branch deploy
and for local preview (`open site/index.html`).

## To finish later
- ~~Paste the lu.ma event details into `#sub-about`.~~ **Done 2026-05-31:** [lu.ma](https://luma.com/dlgjqfrg).
- Add real prose into Story mode (replace the placeholder chapter blocks / wire chapters to
  markdown when written).
- Optional: swap to [Quartz](https://quartz.jzhao.xyz) if you later want backlinks/search/
  full-text for the Experiment vault for free (it owns the whole site, so Story mode would
  need rethinking).

## Enabling Pages
Repo → Settings → Pages → Build and deployment → **Source: GitHub Actions**. Then the
workflow publishes to `https://jonminton.github.io/guanomon/`.
