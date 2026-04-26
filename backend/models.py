from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base

# Tabelul pentru modulul HR & Securitate (Angajati/Admini)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # Ex: "Admin", "Manager", "Angajat"

class TimeLog(Base):
    __tablename__ = "time_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # Se leaga de un angajat existent
    date = Column(String) # Ex: "2023-11-20"
    hours = Column(Float) # Poate fi 4.5 ore
    description = Column(String) # Ce a facut (ex: "Scris cod pentru backend")

# Tabelul pentru Proiecte IT
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id")) # Fiecare proiect apartine unui client
    name = Column(String, index=True)
    budget = Column(Float)
    status = Column(String) # Ex: "Planificare", "In Lucru", "Finalizat"

# Tabelul pentru Modulul Financiar (Tranzacții)
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id")) # De la ce proiect vin/pleacă banii
    type = Column(String) # Poate fi "Incasare" sau "Cheltuiala"
    amount = Column(Float)
    date = Column(String)
    description = Column(String)

# Tabelul pentru Clienți (Beneficiari)
class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact_email = Column(String)
    industry = Column(String) # Ex: "Banking", "Retail", "Healthcare"


