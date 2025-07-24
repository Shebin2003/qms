from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, time
import enum


class EventTypeEnum(str, enum.Enum):
    DEVIATION  = "DEVIATION"
    CAPA  = "CAPA"
    #CHANGE_CONTROL = "CHANGE_CONTROL"
    #AUDIT = "AUDIT"
    #NONCONFORMANCES = "NONCONFORMANCES"
    #COMPLAINTS = "COMPLAINTS"

class EventStatusEnum(str,enum.Enum):
    REQUESTED  = "REQUESTED"
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
    PENDING_APPROVAL= "PENDING_APPROVAL"
    CLOSED= "CLOSED"

class SeverityEnum(str, enum.Enum):
    CRITICAL = "CRITICAL"
    MAJOR = "MAJOR"
    MINOR = "MINOR"

# --- Schemas ---


class Event(BaseModel):
    event_type: EventTypeEnum = EventTypeEnum.DEVIATION
    title: str = Field(..., description="Title of the event")
    description: Optional[str] = Field(None, description="Description of the event")
    status: EventStatusEnum = EventStatusEnum.REQUESTED
    severity: SeverityEnum = SeverityEnum.MINOR
    created_at: datetime 
    created_by: str
    lastModified_at: datetime 
    lastModified_by: Optional[str]
    department:str
    site: Optional[str]

class EventUpdate(BaseModel):
    event_id: int 
    event_type: EventTypeEnum = EventTypeEnum.DEVIATION
    title: str = Field(..., description="Title of the event")
    description: Optional[str] = Field(None, description="Description of the event")
    status: EventStatusEnum = EventStatusEnum.REQUESTED
    severity: SeverityEnum = SeverityEnum.MINOR
    created_at: datetime 
    created_by: str
    lastModified_at: datetime 
    lastModified_by: Optional[str]
    department:str
    site: Optional[str]

class Deviation(BaseModel):
    root_cause: str = Field(..., description="Root cause of the deviation")
    deviation_category: str = Field(..., description="Category of the deviation")
    immediate_action: str = Field(..., description="Immediate action taken for the deviation")
    batch_Number: str = Field(..., desciption= "The batch which was affected by the deviation")
    product_impact_assessment: Optional[str]
    regulatory_impact_assessment: Optional[str]
    linked_capa_id: Optional[int] = Field(None, description="Linked CAPA ID if applicable")

class Capa(BaseModel):
    root_cause: str = Field(..., description="Root cause of the CAPA")
    corrective_action: str = Field(..., description="Corrective action taken")
    preventive_action: str = Field(..., description="Preventive action taken")
    effectiveness_check: str = Field(..., description="Effectiveness check of the CAPA")
    closure_justification: Optional[str]
    verification_plan: Optional[str] = Field(None, description="The plan for how to verify the actions were effective")
    verification_summary: Optional[str] = Field(None, description="The results of the effectiveness check")
    quality_approver: Optional[str]

class DeviationRequest(BaseModel):
    event: Event
    deviation: Deviation

class CapaRequest(BaseModel):
    event:Event
    capa:Capa

class EventSchema(Event):
    event_id: int = Field(..., description="Unique identifier for the event")

class DeviationUpdate(BaseModel):
    event: EventUpdate
    deviation: Deviation

class CapaUpdate(BaseModel):
    event: EventUpdate
    capa:Capa

class ChatRequest(BaseModel):
    message: str
    thread_id: str # To maintain conversation state
    data:object

class ChatRequest2(BaseModel):
    message: str
    thread_id: str # To maintain conversation state