# The Guano Guild — Rashomon Rewrite

*Working subtitle: **The Unit and the Source***

A radical restructuring of the existing story into a multi-perspective (Rashomon)
form, in which each chapter narrates overlapping events from the standpoint of a
different character. The aim is to fix the central structural problem identified
in the earlier iterations — that the story is *technologically determinist*, and
therefore anti-narrative — without abandoning the determinist argument itself.

The technology still wins. What Rashomon adds is **interpretive friction**: the
same events become different *stories* depending on where you stand in the system.

---

## The core problem this rewrite solves

The earlier drafts had one narrator per scene, and every narrator agreed with all
the others about what happened *and what it meant*. The determinist argument ran
uncontested from discovery → industrialisation → the dragon's metabolic decline.
That is why the middle sags: nothing is at stake **interpretively**. Every
character sees the same reality and draws the correct inference from it. That makes
it read as fable, not fiction.

Rashomon introduces disagreement not about facts but about *meaning*. See
[[critique-and-direction]] for the full diagnosis.

---

## Folder layout

```
guanomon/
├── README.md                         ← you are here
├── background.md                     ← project brief / standing instructions
├── 00-context/
│   ├── prior-iterations.md           ← story material carried over from the chat
│   └── critique-and-direction.md     ← the determinism problem + why Rashomon
├── 01-world/                         ← the world and its in-world entities
│   ├── story-bible.md                ← single source of truth: economics, magic, timeline
│   ├── guano.md                      ← the First Novum (energy)
│   ├── the-hum.md                    ← the Second Novum (mass communication)
│   ├── the-guild.md                  ← the institution (not a character)
│   └── above-and-below.md            ← the human/dwarf vertical power axis
├── 02-characters/                    ← the people (accounts/voices)
│   ├── grundrak.md                   ← dwarf empiricist (political thriller)
│   ├── vesser.md                     ← displaced mage (elegy)
│   ├── brask.md                      ← alchemy-native systems-genius; builds the Hum
│   ├── dalla.md                      ← the accidental discoverer (split across two chapters)
│   ├── the-king.md                   ← the deposed sovereign (horror)
│   ├── the-princess.md               ← old money converted to new (bildungsroman)
│   ├── dern.md                       ← the slayer made butcher (war confession)
│   └── the-dragon.md                 ← the source (something that hasn't picked a genre)
├── 03-structure/
│   └── plot-beats.md                 ← account order, genres, rhymes, open questions
├── 04-chapters/
│   └── _chapter-template.md          ← copy this per account as you draft
└── 05-theory/                        ← research-backed craft notes
    ├── genre-theory.md               ← novum, cognitive estrangement, hard/soft magic
    └── discovery-gating.md           ← "why now, not centuries earlier?"
```

> **Note on `the-guild`:** it lives in `01-world/`, not `02-characters/` — the Guild is
> an *institution*, not a person. It supplies a narrating voice, but that voice is an
> institutional artifact (a charter, an aired bulletin), never a human interior.

The numeric prefixes keep the reading order stable and let `00-context` /
`01-world` float to the top of a file listing, which is where you'll be looking
most while drafting.

---

## Suggested codevelopment loop

The earlier process showed a recurring pattern: concept outruns execution. This
folder is built to keep the two coupled, so that developing a character forces a
worldbuilding decision and vice versa.

1. **Anchor in the bible** ([[story-bible]]). Every concrete detail —
   plumbing, the urine-tasting diagnosis, the "Dalla" as a unit — lives here so
   accounts can't silently contradict one another.
2. **Develop a single account** (`02-characters/<name>.md`). Decide what that
   character *sees*, what they're *structurally blind to*, and the genre/register
   their chapter adopts.
3. **Draft the chapter** (`04-chapters/`). Pull from the character file and the
   bible; do not invent new world-facts in the chapter — push them back up into
   the bible first.
4. **Check the rhymes** ([[plot-beats]]). After each chapter, verify
   it still earns its place against the others and that the thematic echoes
   (unit/source, the three modes of submission) survive.
5. Repeat, alternating between content (chapters) and background (bible/characters).

---

## Provenance note

The contents of `00-context/` are reconstructed from the original development
chat. Scene 1 is close to verbatim; later accounts survive mostly as design
summaries rather than finished prose. The canonical published version lives on the
blog and in the local iterations — treat those as authoritative and paste the real
text over the reconstructions where they differ.

The four prior published artefacts (all on `jonminton.github.io/jon-blog`):

- **The Guano Guild** — the linear story Claude + Jon designed but largely didn't
  write. *Published 2026-04-09.* Source: `quarto-blog/jon-blog/posts/fiction/the-guano-guild/index.qmd`
- **The Guano Guild Origin Story** — Jon on how the idea began (Carnivàle, a D&D
  meetup, ~5 years of dormancy). *2026-04-10.* Source: `posts/guano-guild-origin/`
- **The Guano Guild: An Evaluation** — Claude's self-critique of the story; this is
  the external critique that diagnosed the determinism problem and motivated this
  Rashomon rewrite. *2026-04-11.* Source: `posts/guano-guild-evaluation/`
- **Experimenting with Cognitive Centaurs** — Jon on the human/LLM co-writing
  method behind all of the above. *2026-04-12.* Source: `posts/guano-guild-as-cognitive-centaur-experiment/`

The blog repo lives at `../quarto-blog/jon-blog/` relative to this project. The
evaluation post is the most load-bearing for this rewrite — [[critique-and-direction]]
is a distillation of it.
