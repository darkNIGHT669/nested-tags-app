from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
import json
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/nested_tags_db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class TagTree(Base):
    __tablename__ = "tag_trees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    tree_data = Column(Text, nullable=False)  # JSON stored as text
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


Base.metadata.create_all(bind=engine)


# ─── Pydantic schemas ─────────────────────────────────────────────────────────

class TagNode(BaseModel):
    name: str
    data: Optional[str] = None
    children: Optional[List["TagNode"]] = None

    class Config:
        model_config = {"arbitrary_types_allowed": True}


TagNode.model_rebuild()


class TreeCreate(BaseModel):
    name: str
    tree_data: TagNode


class TreeUpdate(BaseModel):
    name: Optional[str] = None
    tree_data: TagNode


class TreeResponse(BaseModel):
    id: int
    name: str
    tree_data: Any
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── DB dependency ─────────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="Nested Tags Tree API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Nested Tags Tree API", "status": "running"}


@app.get("/trees", response_model=List[TreeResponse])
def get_all_trees(db: Session = Depends(get_db)):
    trees = db.query(TagTree).order_by(TagTree.created_at.desc()).all()
    result = []
    for tree in trees:
        result.append(TreeResponse(
            id=tree.id,
            name=tree.name,
            tree_data=json.loads(tree.tree_data),
            created_at=tree.created_at,
            updated_at=tree.updated_at,
        ))
    return result


@app.get("/trees/{tree_id}", response_model=TreeResponse)
def get_tree(tree_id: int, db: Session = Depends(get_db)):
    tree = db.query(TagTree).filter(TagTree.id == tree_id).first()
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    return TreeResponse(
        id=tree.id,
        name=tree.name,
        tree_data=json.loads(tree.tree_data),
        created_at=tree.created_at,
        updated_at=tree.updated_at,
    )


@app.post("/trees", response_model=TreeResponse, status_code=201)
def create_tree(payload: TreeCreate, db: Session = Depends(get_db)):
    tree = TagTree(
        name=payload.name,
        tree_data=json.dumps(payload.tree_data.model_dump(exclude_none=True)),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(tree)
    db.commit()
    db.refresh(tree)
    return TreeResponse(
        id=tree.id,
        name=tree.name,
        tree_data=json.loads(tree.tree_data),
        created_at=tree.created_at,
        updated_at=tree.updated_at,
    )


@app.put("/trees/{tree_id}", response_model=TreeResponse)
def update_tree(tree_id: int, payload: TreeUpdate, db: Session = Depends(get_db)):
    tree = db.query(TagTree).filter(TagTree.id == tree_id).first()
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    if payload.name is not None:
        tree.name = payload.name
    tree.tree_data = json.dumps(payload.tree_data.model_dump(exclude_none=True))
    tree.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(tree)
    return TreeResponse(
        id=tree.id,
        name=tree.name,
        tree_data=json.loads(tree.tree_data),
        created_at=tree.created_at,
        updated_at=tree.updated_at,
    )


@app.delete("/trees/{tree_id}", status_code=204)
def delete_tree(tree_id: int, db: Session = Depends(get_db)):
    tree = db.query(TagTree).filter(TagTree.id == tree_id).first()
    if not tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    db.delete(tree)
    db.commit()
