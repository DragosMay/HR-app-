from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Aici definim numele fisierului bazei de date (va aparea in folderul tau)
SQLALCHEMY_DATABASE_URL = "sqlite:///./it_business.db"

# Crearea "motorului" care discuta cu SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# O sesiune este practic o "conversatie" activa cu baza de date
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clasa de baza de la care vor mosteni toate tabelele noastre
Base = declarative_base()