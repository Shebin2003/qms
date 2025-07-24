import models

class CAPAService:
    def __init__(self,  db):
        self.db = db

    def create_event(self, event_data: dict):
        event = models.Event(**event_data)
        self.db.add(event)
        self.db.flush()  # allows event.id to be generated
        return event
        
    def create_capa(self, capa_data):
        new_capa = models.Capa(**capa_data)
        self.db.add(new_capa)
        self.db.commit()
        self.db.refresh(new_capa)
        return new_capa
    
    def create_full_record(self, event_data: dict, capa_data: dict):
        event = self.create_event(event_data)
        capa_data['event_id'] = event.event_id
        capa = self.create_capa(capa_data) 
        return {
            "event_id": event.event_id,
            "capa_id": capa.capa_id
        }