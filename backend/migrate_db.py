"""
Script para migrar la base de datos de producción
ADVERTENCIA: Esto eliminará todas las listas existentes que no tengan user_id
"""
from sqlalchemy import create_engine, text
import os

# URL de la base de datos de producción
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://listify_user:listify_pass_prod@/listify_db?host=/cloudsql/listify-474200:us-central1:listify-postgres"
)

def migrate_production_db():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Iniciar transacción
        trans = conn.begin()
        
        try:
            print("Iniciando migración...")
            
            # 1. Crear tabla users si no existe
            print("1. Creando tabla users...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR NOT NULL,
                    email VARCHAR NOT NULL UNIQUE,
                    hashed_password VARCHAR NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE
                );
                CREATE INDEX IF NOT EXISTS ix_users_id ON users(id);
                CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
            """))
            
            # 2. Verificar si la columna user_id ya existe en lists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='lists' AND column_name='user_id';
            """))
            
            if result.fetchone() is None:
                print("2. Agregando columna user_id a tabla lists...")
                
                # Eliminar todas las listas existentes (o puedes asignarlas a un usuario por defecto)
                print("   ADVERTENCIA: Eliminando listas existentes sin usuario...")
                conn.execute(text("DELETE FROM items"))
                conn.execute(text("DELETE FROM lists"))
                
                # Agregar columna user_id
                conn.execute(text("""
                    ALTER TABLE lists 
                    ADD COLUMN user_id INTEGER NOT NULL 
                    REFERENCES users(id) ON DELETE CASCADE;
                """))
            else:
                print("2. La columna user_id ya existe en lists")
            
            # Commit de la transacción
            trans.commit()
            print("\nMigración completada exitosamente!")
            
        except Exception as e:
            trans.rollback()
            print(f"\nError durante la migración: {e}")
            raise

if __name__ == "__main__":
    print("=" * 50)
    print("MIGRACIÓN DE BASE DE DATOS DE PRODUCCIÓN")
    print("=" * 50)
    print("\nADVERTENCIA: Este script eliminará todas las listas existentes.")
    respuesta = input("¿Estás seguro de continuar? (escribe 'SI' para confirmar): ")
    
    if respuesta == "SI":
        migrate_production_db()
    else:
        print("Migración cancelada.")