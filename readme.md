# DicoVisu 📖

**A community-driven visual dictionary platform for low-resource languages.**

DicoVisu is a proof-of-concept web application that allows native speakers to build and contribute to community dictionaries — with the long-term goal of preserving endangered and low-resource languages through collaborative, community-owned documentation.

The initial focus is on **Bantu languages in the Kikongo Language Cluster (KLC)**, a group of closely related languages spoken across the Congo Basin region (DRC, Republic of Congo, Angola, Gabon) with limited digital resources and almost no NLP tooling.

---

## 🎯 Vision

Most low-resource languages lack structured digital documentation. DicoVisu explores what a community-built, audio-supported dictionary platform could look like — where native speakers are the primary contributors, not linguists or institutions.

The full vision includes:
- Native speaker contributions (words, definitions, example sentences, audio)
- A reviewer/moderator layer to validate entries before publication
- Visual and audio support for each entry
- Multi-dialect handling within a language cluster
- Morphological awareness for agglutinative languages like Kikongo

**Current version:** proof of concept — core dictionary, search, audio, and word relationship features are implemented. Community contribution and review workflows are not yet fully built out.

---

## ✨ Features (v1)

- Browse and search dictionary entries with lemmatization support
- Audio playback per word — recorded or uploaded by native speakers
- Word detail pages with definitions, example sentences and usage
- Typed word relationships — singular, plural, synonym, antonym, variant, derived forms
- Cross-language word linking and translation mapping
- Bulk word import via JSON
- Dictionary statistics page
- JWT-based authentication with token refresh

### Linguistic engine
DicoVisu includes a **Kikongo Language Cluster lemmatizer** — a morphological analyzer built specifically for the agglutinative structure of Bantu languages. It handles:
- Agglutinative verb structures (subject prefix + object marker + verb stem)
- Resultative and perfect tense patterns
- h/v phonological alternation
- Nominal class prefix stripping

This means search results are morphologically aware — searching for an inflected verb form finds the correct root entry.

---

## 🛠 Stack

| Layer | Technology |
|---|---|
| Backend | Node.js · Express · MongoDB |
| Frontend | React · Vite · Chakra UI · Zustand |
| Auth | JWT (access token + refresh token via HTTP-only cookie) |
| Audio | Filesystem storage · Multer · Web Audio API |
| Hosting | Raspberry Pi (self-hosted) · Docker |

---

## 🚀 Getting started

```bash
git clone https://github.com/TinoCoda/dicovisu.git
cd dicovisu
cp .env.example .env   # fill in your MongoDB URI and JWT secrets
npm run build          # install dependencies and build frontend
npm start              # start in production mode
```

For development:
```bash
npm run dev        # backend with hot reload
npm run dev:ui     # frontend Vite dev server
```

### Required environment variables

```env
MONGO_URI=mongodb://localhost:27017/dicovisu
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
PORT=5000
NODE_ENV=development
```

---

## 🗺 Roadmap

- [ ] Community contribution workflow — submission, review, approval
- [ ] Reviewer/moderator layer for entry validation
- [ ] Morphological submodule system — store word roots + prefixes/suffixes separately, generate inflected forms dynamically
- [ ] Multi-dialect tagging within language clusters
- [ ] Public API for external NLP integrations
- [ ] Mobile-optimized interface for field contributors
- [ ] Export to standard lexicographic formats (FLEx, ELAN)
- [ ] Cloudflare R2 migration for scalable audio storage

---

## 🌍 Why this matters

The Kikongo Language Cluster (KLC) is a group of genetically related Bantu languages spoken across the Congo Basin (DRC, Republic of Congo, Angola, Gabon, Cabinda). It is structured around two major Guthrie groups:

- **B40 group** (northwestern KLC, south-central Gabon and Congo) — including ishira/gisir (B41), isangu /Sangu(B42), yipunu/Punu (B43), Yilumbu/Lumbu (B44), Gisira/Sira (B45), and Givarama/Barama (B402)
- **H10 group** (central-southern core, historic Kongo Kingdom territory) — including Kilaadi/Lari (H13), Civili (H12), Kiyombe (H16c), Kisikongo (H16a), and Kizombo (H16i)

All of these languages are spoken by millions of people across Central and West-Central Africa yet remain largely absent from digital tools, NLP datasets, and language learning platforms.

Bantu languages are highly agglutinative — a single verb can encode subject, object, tense and aspect in one word. Standard dictionary tools are not built for this. DicoVisu is an attempt to build something that is.

---

## 📬 Contact

Built by [TinoCoda](https://github.com/TinoCoda)