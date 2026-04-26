from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, schemas
from database import engine, SessionLocal

# Cream baza de date (daca nu exista deja)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

# Adaugam "biletul de voie" pentru React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite oricarei interfete sa se conecteze (pentru faza de test)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Functie care ne deschide o conexiune cu baza de date pentru fiecare cerere
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. RUTA PENTRU CREAREA UNUI UTILIZATOR (POST)
@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Simulam o criptare a parolei (la un proiect real se folosesc biblioteci precum bcrypt)
    fake_hashed_password = user.password + "notreallyhashed"
    
    # Cream modelul pentru baza de date
    db_user = models.User(
        name=user.name, 
        email=user.email, 
        hashed_password=fake_hashed_password, 
        role=user.role
    )
    
    # Il salvam in baza de date
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 2. RUTA PENTRU CITIREA TUTUROR UTILIZATORILOR (GET)
@app.get("/users/", response_model=list[schemas.UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

from fastapi import HTTPException # Adauga acest import la inceputul fisierului, langa FastAPI!

# ... restul codului tau ...

# 3. RUTA PENTRU STERGEREA UNUI UTILIZATOR (DELETE)
@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    # Cautam utilizatorul in baza de date dupa ID
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    
    # Daca nu exista, dam o eroare
    if db_user is None:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost gasit")
    
    # Daca exista, il stergem si salvam modificarea
    db.delete(db_user)
    db.commit()
    return {"message": "Utilizator șters cu succes!"}

# 4. RUTA PENTRU AUTENTIFICARE (LOGIN)
@app.post("/login/")
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    # 1. Căutăm utilizatorul în baza de date după email
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    # Reconstituim parola așa cum am "criptat-o" la înregistrare
    fake_hashed_password = user.password + "notreallyhashed"
    
    # 2. Verificăm dacă email-ul există și dacă parola se potrivește
    if not db_user or db_user.hashed_password != fake_hashed_password:
        raise HTTPException(status_code=400, detail="Email sau parolă incorecte!")
    
    # 3. Dacă totul e ok, returnăm datele utilizatorului (pentru a-l lăsa în aplicație)
    return db_user

# ==========================================
# MODULUL 2: PONTAJ (TIME TRACKING)
# ==========================================

# 5. RUTA PENTRU ADAUGAREA UNUI PONTAJ NOU (POST)
@app.post("/time_logs/", response_model=schemas.TimeLogResponse)
def create_time_log(log: schemas.TimeLogCreate, db: Session = Depends(get_db)):
    db_log = models.TimeLog(
        user_id=log.user_id,
        date=log.date,
        hours=log.hours,
        description=log.description
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# 6. RUTA PENTRU CITIREA TUTUROR PONTAJELOR (GET)
@app.get("/time_logs/", response_model=list[schemas.TimeLogResponse])
def read_time_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Pentru simplitate la acest proiect, aducem toate pontajele
    logs = db.query(models.TimeLog).offset(skip).limit(limit).all()
    return logs

# 7. RUTA PENTRU EDITAREA UNUI PONTAJ (PUT)
@app.put("/time_logs/{log_id}", response_model=schemas.TimeLogResponse)
def update_time_log(log_id: int, log: schemas.TimeLogCreate, db: Session = Depends(get_db)):
    # Cautam pontajul in baza de date
    db_log = db.query(models.TimeLog).filter(models.TimeLog.id == log_id).first()
    
    if not db_log:
        raise HTTPException(status_code=404, detail="Pontajul nu a fost gasit!")
    
    # Actualizam datele
    db_log.date = log.date
    db_log.hours = log.hours
    db_log.description = log.description
    
    db.commit()
    db.refresh(db_log)
    return db_log

# ==========================================
# MODULUL 3: CLIENTI SI PROIECTE
# ==========================================

# Rute pentru CLIENTI
@app.post("/clients/", response_model=schemas.ClientResponse)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    db_client = models.Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@app.get("/clients/", response_model=list[schemas.ClientResponse])
def read_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Client).offset(skip).limit(limit).all()

# Rute pentru PROIECTE
@app.post("/projects/", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects/", response_model=list[schemas.ProjectResponse])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Project).offset(skip).limit(limit).all()

# Ruta de UPDATE status proiect (pentru Kanban Board-ul din React)
@app.put("/projects/{project_id}/status", response_model=schemas.ProjectResponse)
def update_project_status(project_id: int, status: str, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Proiectul nu a fost gasit!")
    
    db_project.status = status
    db.commit()
    db.refresh(db_project)
    return db_project

# 8. RUTA PENTRU STERGEREA UNUI PONTAJ (DELETE)
@app.delete("/time_logs/{log_id}")
def delete_time_log(log_id: int, db: Session = Depends(get_db)):
    db_log = db.query(models.TimeLog).filter(models.TimeLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Pontajul nu a fost gasit!")
    
    db.delete(db_log)
    db.commit()
    return {"message": "Pontaj șters cu succes!"}

# ==========================================
# MODULUL 4: FINANCIAR SI TRANZACTII
# ==========================================

@app.post("/transactions/", response_model=schemas.TransactionResponse)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = models.Transaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/transactions/", response_model=list[schemas.TransactionResponse])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Transaction).offset(skip).limit(limit).all()

from database import engine # Ne asiguram ca avem "motorul" bazei de date

# RUTA SECRETA PENTRU REPARATIA BAZEI DE DATE
@app.get("/repara-db")
def repara_baza_de_date():
    # 1. Aruncam DOAR tabelul stricat de tranzactii
    models.Transaction.__table__.drop(engine)
    # 2. Il cream la loc perfect, cu toate coloanele din models.py
    models.Base.metadata.create_all(bind=engine)
    return {"mesaj": "Tabelul de tranzactii a fost reparat cu succes! Poti testa acum."}