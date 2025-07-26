from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
import models 
import schemas 

def update_deviation_event(db: Session, event_id: int, data: schemas.DeviationUpdate):
    db_event = db.query(models.Event).filter(models.Event.event_id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    db_deviation = db.query(models.Deviation).filter(models.Deviation.event_id == event_id).first()
    if not db_deviation:
        raise HTTPException(status_code=404, detail=f"Deviation associated with event ID {event_id} not found")

    event_update_data = data.event.model_dump(exclude_unset=True)
    deviation_update_data = data.deviation.model_dump(exclude_unset=True)

    event_update_data['lastModified_at'] = datetime.now()

    for key, value in event_update_data.items():
        setattr(db_event, key, value)
        
    for key, value in deviation_update_data.items():
        setattr(db_deviation, key, value)

    db.commit()
    db.refresh(db_event)
    db.refresh(db_deviation)

    return {"event": db_event, "deviation": db_deviation}

def update_capa_event(db: Session, event_id: int, data: schemas.CapaUpdate):
    db_event = db.query(models.Event).filter(models.Event.event_id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    db_capa = db.query(models.Capa).filter(models.Capa.event_id == event_id).first()
    if not db_capa:
        raise HTTPException(status_code=404, detail=f"Deviation associated with event ID {event_id} not found")

    event_update_data = data.event.model_dump(exclude_unset=True)
    capa_update_data = data.capa.model_dump(exclude_unset=True)
  
    event_update_data['lastModified_at'] = datetime.now()

    for key, value in event_update_data.items():
        setattr(db_event, key, value)
        
    for key, value in capa_update_data.items():
        setattr(db_capa, key, value)
    db.commit()
    db.refresh(db_event)
    db.refresh(db_capa)

    return {"event": db_event, "deviation": db_capa}
