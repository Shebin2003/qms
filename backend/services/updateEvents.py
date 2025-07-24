from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
import models # Your SQLAlchemy models file
import schemas # Your Pydantic schemas file

def update_deviation_event(db: Session, event_id: int, data: schemas.DeviationUpdate):
    # Step 1: Find the existing event in the database
    db_event = db.query(models.Event).filter(models.Event.event_id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Step 2: Find the associated deviation record
    db_deviation = db.query(models.Deviation).filter(models.Deviation.event_id == event_id).first()
    if not db_deviation:
        raise HTTPException(status_code=404, detail=f"Deviation associated with event ID {event_id} not found")

    # Step 3: Get the update data from the Pydantic models
    event_update_data = data.event.model_dump(exclude_unset=True)
    deviation_update_data = data.deviation.model_dump(exclude_unset=True)
    
    # Automatically update the modification timestamp and user
    event_update_data['lastModified_at'] = datetime.now()
    # In a real app, you'd get the user from the auth token
    # event_update_data['lastModified_by'] = current_user.username 

    # Step 4: Update the fields in the database objects
    for key, value in event_update_data.items():
        setattr(db_event, key, value)
        
    for key, value in deviation_update_data.items():
        setattr(db_deviation, key, value)

    # Step 5: Commit the changes to the database
    db.commit()
    db.refresh(db_event)
    db.refresh(db_deviation)

    return {"event": db_event, "deviation": db_deviation}

def update_capa_event(db: Session, event_id: int, data: schemas.CapaUpdate):
    # Step 1: Find the existing event in the database
    db_event = db.query(models.Event).filter(models.Event.event_id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Step 2: Find the associated deviation record
    db_capa = db.query(models.Capa).filter(models.Capa.event_id == event_id).first()
    if not db_capa:
        raise HTTPException(status_code=404, detail=f"Deviation associated with event ID {event_id} not found")

    # Step 3: Get the update data from the Pydantic models
    event_update_data = data.event.model_dump(exclude_unset=True)
    capa_update_data = data.capa.model_dump(exclude_unset=True)
    
    # Automatically update the modification timestamp and user
    event_update_data['lastModified_at'] = datetime.now()
    # In a real app, you'd get the user from the auth token
    # event_update_data['lastModified_by'] = current_user.username 

    # Step 4: Update the fields in the database objects
    for key, value in event_update_data.items():
        setattr(db_event, key, value)
        
    for key, value in capa_update_data.items():
        setattr(db_capa, key, value)

    # Step 5: Commit the changes to the database
    db.commit()
    db.refresh(db_event)
    db.refresh(db_capa)

    return {"event": db_event, "deviation": db_capa}
