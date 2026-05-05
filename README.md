# Nested Tags Tree — Full Stack App

AIMonk Full Stack Coding Assignment · Next.js + FastAPI + PostgreSQL

---

## Project Structure

```
nested-tags-app/
├── backend/
│   ├── main.py             # FastAPI app (models, routes)
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx    # Root page — loads trees, renders editors
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── TagView.tsx     # Recursive tag component
    │   │   └── TreeEditor.tsx  # Tree wrapper with export/save
    │   ├── lib/
    │   │   ├── api.ts          # API client
    │   │   └── treeUtils.ts    # Tree helpers (toUI, toPlain, etc.)
    │   └── types/
    │       └── tree.ts         # TypeScript types
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── README.md
```
🚀 Live Links

Frontend (Live Demo): https://nested-tags-app-one.vercel.app
Backend (API Docs): https://nested-tags-app-3awc.onrender.com

---

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Create DB
createdb nested_tags_db

cp .env.example .env
# Edit DATABASE_URL in .env if needed

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs → http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

App → http://localhost:3000

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/trees` | Get all saved trees |
| `GET` | `/trees/{id}` | Get single tree |
| `POST` | `/trees` | Create new tree |
| `PUT` | `/trees/{id}` | Update existing tree |
| `DELETE` | `/trees/{id}` | Delete tree |

---

## Data Structure

```json
{
  "name": "root",
  "children": [
    {
      "name": "child1",
      "children": [
        { "name": "child1-child1", "data": "c1-c1 Hello" },
        { "name": "child1-child2", "data": "c1-c2 JS" }
      ]
    },
    { "name": "child2", "data": "c2 World" }
  ]
}
```

Rules: each node has `name` + either `children` OR `data`, never both.

---

## Features Implemented

### Core
- [x] `TagView` recursive component with depth-coloured blue headers
- [x] Collapse / Expand toggle (`⌄` / `›`)
- [x] `Add Child` button — replaces `data` with `children` array
- [x] `data` string rendered as editable text input
- [x] Export button — outputs clean JSON and calls `POST`/`PUT`
- [x] `GET` on load — displays all saved trees

### Bonus
- [x] Editable tag names — click name to toggle input, Enter to save

### Extra
- [x] Delete tree
- [x] Add New Tree button (multiple independent trees)
- [x] Offline/degraded mode — shows demo tree if backend is unreachable
