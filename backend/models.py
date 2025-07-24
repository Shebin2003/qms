from sqlalchemy import Column, Integer, String, DateTime, Time, Enum as SQLAlchemyEnum
from sqlalchemy.sql import func
import enum
from database import Base

# --- ENUMS ---

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

# --- Models ---

class Event(Base):
    __tablename__ = "event"

    event_id = Column(Integer, primary_key=True, index=True)
    event_type = Column(SQLAlchemyEnum(EventTypeEnum), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(SQLAlchemyEnum(EventStatusEnum), nullable=False)
    severity = Column(SQLAlchemyEnum(SeverityEnum), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String, nullable=False) 
    lastModified_at = Column(DateTime(timezone=True))
    lastModified_by = Column(String, nullable=False,onupdate=func.now()) 
    department = Column(String, nullable=False) 
    site = Column(String, nullable=True)

class Deviation(Base):
    __tablename__ = "deviation"

    deviation_id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, nullable=False)  # Foreign key to Event table
    root_cause = Column(String, nullable=False)
    deviation_category = Column(String, nullable=False)
    immediate_action = Column(String, nullable=False)
    batch_Number = Column(String, nullable=False)
    product_impact_assessment = Column(String, nullable=True)
    regulatory_impact_assessment = Column(String, nullable=True)
    linked_capa_id = Column(Integer, nullable=True)  # Foreign key to CAPA table

class Capa(Base):
    __tablename__ = "capa"

    capa_id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, nullable=False)  # Foreign key to Event table
    root_cause = Column(String, nullable=False)
    corrective_action = Column(String, nullable=False)
    preventive_action = Column(String, nullable=False)
    effectiveness_check = Column(String, nullable=False)
    closure_justification = Column(String, nullable=True)
    verification_plan = Column(String, nullable=True)
    verification_summary = Column(String, nullable=True)
    quality_approver = Column(String, nullable=True)
    