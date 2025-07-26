from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from services.deviation_service import DeviationService
from services.capa_service import CAPAService
from database import get_db
from services.list_items import ListItems
from services.update_events import update_deviation_event,update_capa_event
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langchain_core.runnables import RunnableConfig
from langchain_core.prompts import ChatPromptTemplate
import json
import agent
import schemas
import agent_main

router = APIRouter()

@router.post("/deviation")
def add_deviation(request: schemas.DeviationRequest, db: Session = Depends(get_db)):
    service = DeviationService(db)
    result = service.create_full_record(
        event_data=request.event.model_dump(),
        deviation_data=request.deviation.model_dump()
    )
    return result

@router.post("/capa")
def add_capa(request: schemas.CapaRequest, db: Session = Depends(get_db)):
    service = CAPAService(db)
    result = service.create_full_record(
        event_data=request.event.model_dump(),
        capa_data=request.capa.model_dump()
    )
    return result

# For getting details based on id
@router.post("/event/")
def get_event_details(data: dict, db: Session = Depends(get_db)):
    service = ListItems(db)
    return service.getData(data)


# For getting all events so far
@router.get("/event/")
def get_event_details(db: Session = Depends(get_db)):
    service = ListItems(db)
    return service.getAllData()
    
@router.put("/deviation")
def update_full_deviation_event(data: schemas.DeviationUpdate, db: Session = Depends(get_db)):
    """
    Update the details for a specific Deviation event and its associated record.
    """
    event_id = data.event.event_id
    updated_records = update_deviation_event(db=db, event_id=event_id, data=data)
    return updated_records

@router.put("/capa")
def update_full_deviation_event(data: schemas.CapaUpdate, db: Session = Depends(get_db)):
    """
    Update the details for a specific Deviation event and its associated record.
    """
    event_id = data.event.event_id
    updated_records = update_capa_event(db=db, event_id=event_id, data=data)
    return updated_records

@router.post("/deviation_chat/", tags=["Chat"])
def chat_with_agent(
    request: schemas.ChatRequest, db: Session = Depends(get_db)
):
    """
    Handles conversational interaction with the QMS AI agent to update an event object.
    """
    try:
        config = RunnableConfig(configurable={"thread_id": request.thread_id})
        initial_state = {
            "messages": [HumanMessage(content=request.message)],
            "current_event": request.data
        }
        
        result = agent.graph.invoke(initial_state, config=config)

        if result and "current_event" in result:
            return {
                "type": "updated_event",
                "payload": result["current_event"],
                "message": "I've updated the event form based on your request."
            }

        last_message = result.get("messages", [])[-1]

        if isinstance(last_message, ToolMessage) and last_message.name == "suggest_next_steps":
            suggestion_content = last_message.content
            return {
                "type": "suggestion",
                "payload": {"suggestion_text": suggestion_content},
                "message": "Here are some suggested next steps:"
            }

        if "current_event" in result and result["current_event"] != request.data:
            return {
                "type": "updated_event",
                "payload": result["current_event"],
                "message": "I've updated the event form based on your request."
            }
        
        if isinstance(last_message, AIMessage):
            return {"type": "message", "message": last_message.content}

        return {"type": "message", "message": "I'm not sure how to handle that."}

    except Exception as e:
        print(f"An error occurred in /chat: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred in the agent.")
    
@router.post("/listAI/", tags=["Chat"])
def chat_with_agent_main(
    request: schemas.ChatRequest2, db: Session = Depends(get_db)
):
    """
    Handles conversational interaction with the QMS AI agent.
    """
    try:
        config = RunnableConfig(configurable={"thread_id": request.thread_id})
        initial_state = {
            "messages": [HumanMessage(content=request.message)],
        }
        
        result = agent_main.graph.invoke(initial_state, config=config)

        last_message = result.get("messages", [])[-1]

        if isinstance(last_message, ToolMessage) and last_message.name == "summary":
            summary_content = last_message.content
            return {
                "type": "summary",
                "payload": {"summary_text": summary_content},
                "message": "Here is the summary you requested."
            }
        
        elif isinstance(last_message, ToolMessage) and last_message.name == "search_events":
            events_list = json.loads(last_message.content)
            return {
                "type": "event_list",
                "payload": {"events": events_list},
                "message": f"Found {len(events_list)} events."
            }
        
        elif isinstance(last_message, ToolMessage) and last_message.name == "open_event_for_editing":
            event_data = json.loads(last_message.content)
            if "error" in event_data:
                return {"type": "error", "message": event_data["error"]}
            return {
                "type": "edit_event",
                "payload": event_data, # Contains {"event_id": ..., "event_type": ...}
                "message": f"Preparing event {event_data.get('event_id')} for editing."
            }
        
        if isinstance(last_message, AIMessage):
            return {"type": "message", "message": last_message.content}

        return {"type": "error", "message": "Could not process the request."}

    except Exception as e:
        print(f"An error occurred in /chat: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred in the agent.")