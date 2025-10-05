from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.database import engine
from app.models import Base
from app.routers import lists, items, auth  # Importar auth

Base.metadata.create_all(bind=engine)

class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        if response.status_code in (301, 302, 307, 308):
            location = response.headers.get("location", "")
            if location.startswith("http://"):
                response.headers["location"] = location.replace("http://", "https://", 1)
        
        return response

app = FastAPI(
    title="Listify API",
    description="API para gestionar listas genéricas con items",
    version="2.0.0"  # Actualizar versión
)

app.add_middleware(HTTPSRedirectMiddleware)

origins = [
    "http://localhost:4200",
    "http://localhost:3000",
    "http://localhost",
    "https://listify-frontend-832490400305.us-central1.run.app",
    "https://listify.space",
    "https://www.listify.space",
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
        "version": "2.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "lists": "/api/lists",
            "items": "/api/items",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

# Incluir routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])  # NUEVO
app.include_router(lists.router, prefix="/api/lists", tags=["Lists"])
app.include_router(items.router, prefix="/api/items", tags=["Items"])