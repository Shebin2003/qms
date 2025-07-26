from models import Event, Capa, Deviation
from sqlalchemy.orm import Session
from fastapi import HTTPException
from schemas import EventSchema

class ListItems:
    def __init__(self, db: Session):
        self.db = db

    def getAllData(self):
        events = self.db.query(Event).all()

        severity_order = {"CRITICAL": 0, "MAJOR": 1, "MINOR": 2}
        
        sorted_events = sorted(
            events, 
            key=lambda event: (
                event.status == 'CLOSED',                
                severity_order.get(event.severity, 99)   
            )
        )
        
        return {
            "events": sorted_events
        }

    def getData(self, data: dict):
        event_id = data.get("event_id")
        event_type = data.get("event_type")
        event = self.db.query(Event).filter(Event.event_id == event_id).first()
        if not event:
            print("hello")
            raise HTTPException(status_code=404, detail="Event not found")
        if event_type == "CAPA":
            capa = self.db.query(Capa).filter(Capa.event_id == event_id, Capa.event_id == event_id).first()
            if not capa:
                raise HTTPException(status_code=404, detail="CAPA not found for given event")
            return {
                "event": event,
                "capa": capa
            }

        elif event_type == "DEVIATION":
            print(event_id, event_type)
            deviation = self.db.query(Deviation).filter(Deviation.event_id == event_id, Deviation.event_id == event_id).first()
            if not deviation:
                raise HTTPException(status_code=404, detail="Deviation not found for given event")
            print(event,deviation,"hi")
            return {
                "event": event,
                "deviation": deviation
            }

        else:
            raise HTTPException(status_code=400, detail="error: Invalid event type provided")

    