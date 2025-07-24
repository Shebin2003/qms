from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
import database
from routes.event_routes import router as event_routes

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="AI-First CRM Backend")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(event_routes)

@app.get("/")
def read_root():
    return {"message": "Welcome to the QMS Backend!"}

