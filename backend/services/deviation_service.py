import models
class DeviationService:
    def __init__(self,  db):
        self.db = db

    def create_event(self, event_data: dict):
        event = models.Event(**event_data)
        self.db.add(event)
        self.db.flush()  # allows event.id to be generated
        return event
        
    def create_deviation(self, deviation_data):
        new_deviation = models.Deviation(**deviation_data)
        self.db.add(new_deviation)
        self.db.commit()
        self.db.refresh(new_deviation)
        return new_deviation
    
    def create_full_record(self, event_data: dict, deviation_data: dict):
        event = self.create_event(event_data)
        # Inject generated event ID into deviation_data
        deviation_data['event_id'] = event.event_id
        deviation = self.create_deviation(deviation_data) 
        return {
            "event_id": event.event_id,
            "deviation_id": deviation.deviation_id
        }