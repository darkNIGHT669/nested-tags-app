# Nested Tags Tree – Frontend

Next.js 14 (App Router) + TypeScript + Tailwind CSS frontend.

## Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local if your backend runs on a different port
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **TagView component** – recursive, depth-coloured nested tag boxes
- **Collapse/Expand** – click `⌄` / `›` toggle on any node
- **Add Child** – replaces `data` field with a `children` array + new "New Child" node
- **Editable names** – click any tag name in the blue header to rename; press Enter to save
- **Editable data** – type directly in the data input field
- **Export & Save** – exports clean JSON (only `name`, `children`, `data`) and calls the API
- **Persistence** – on load, fetches all saved trees from the backend; shows default example tree if none exist
- **POST / PUT** – new trees use POST; existing loaded trees use PUT on export
