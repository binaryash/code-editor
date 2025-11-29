"""File for database connection."""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# Default to a standard local Postgres URL if the env var isn't set
# Format: postgresql://user:password@host:port/database_name
DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine without SQLite-specific args
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
