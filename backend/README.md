# Nested Tags Tree – Backend

FastAPI + PostgreSQL backend for the Nested Tags Tree application.

## Setup

### 1. Create a PostgreSQL database

```bash
createdb nested_tags_db
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and set your DATABASE_URL
```

### 3. Install dependencies

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Run the server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/trees` | Fetch all saved trees |
| GET | `/trees/{id}` | Fetch a single tree |
| POST | `/trees` | Create a new tree |
| PUT | `/trees/{id}` | Update an existing tree |
| DELETE | `/trees/{id}` | Delete a tree |

Interactive docs available at `http://localhost:8000/docs`.

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

Each node has `name` and either `children` (array) **or** `data` (string), never both.
