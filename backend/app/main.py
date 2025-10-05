from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from app.routers import lists, items

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Listify API",
    description="API para gestionar listas genéricas con items",
    version="1.0.0"
)

# Configurar CORS para permitir requests desde el frontend
origins = [
    "http://localhost:4200",  # Angular development server
    "http://localhost:3000",  # Alternativa
    "http://localhost",  # Frontend en Docker local
    "https://listify-frontend-2dwgatolca-uc.a.run.app",  # Cloud Run frontend
    "https://listify.space",  # Dominio principal
    "https://www.listify.space",  # Dominio con www
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Listify API",
        "version": "1.0.0",
        "endpoints": {
            "lists": "/api/lists",
            "items": "/api/items",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

# Incluir los routers
app.include_router(lists.router, prefix="/api/lists", tags=["Lists"])
app.include_router(items.router, prefix="/api/items", tags=["Items"])