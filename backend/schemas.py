from pydantic import BaseModel

# Ce date primim cand cream un utilizator nou (ex: din React)
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str  # Ex: "Admin", "Angajat"
    admin_code: str | None = None  # NOU: Câmpul secret pentru admini (poate fi gol)

# Ce date trimitem inapoi (Ascundem parola din motive de securitate!)
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

# Datele primite de la React cand cineva ponteaza ore
class TimeLogCreate(BaseModel):
    user_id: int
    date: str
    hours: float
    description: str

# Datele pe care le trimitem inapoi catre React
class TimeLogResponse(BaseModel):
    id: int
    user_id: int
    date: str
    hours: float
    description: str

    class Config:
        from_attributes = True

# --- SCHEME PENTRU CLIENTI ---
class ClientCreate(BaseModel):
    name: str
    contact_email: str
    industry: str

class ClientResponse(BaseModel):
    id: int
    name: str
    contact_email: str
    industry: str

    class Config:
        from_attributes = True

# --- SCHEME PENTRU PROIECTE ---
class ProjectCreate(BaseModel):
    client_id: int
    name: str
    budget: float
    status: str

class ProjectResponse(BaseModel):
    id: int
    client_id: int
    name: str
    budget: float
    status: str

    class Config:
        from_attributes = True

# --- SCHEME PENTRU FINANCIAR (TRANZACTII) ---
class TransactionCreate(BaseModel):
    project_id: int
    type: str
    amount: float
    date: str
    description: str

class TransactionResponse(BaseModel):
    id: int
    project_id: int
    type: str
    amount: float
    date: str
    description: str

    class Config:
        from_attributes = True