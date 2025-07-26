# agent_main.py (Updated)
import os
import json
from typing import TypedDict, Annotated, List, Dict, Any
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.messages import BaseMessage, SystemMessage, ToolMessage, HumanMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_groq import ChatGroq
from datetime import datetime
import database 
import models
from typing import TypedDict, Annotated, List, Dict, Any, Optional

# --- LLM Initialization ---
llm = ChatGroq(
    temperature=0,
    model_name="gemma2-9b-it",
    api_key=os.getenv("GROQ_API_KEY")
)

# --- Helper Function ---
def model_to_dict(obj):
    """Converts a SQLAlchemy model instance to a dictionary, handling datetimes."""
    if not obj: return {}
    d = {c.name: getattr(obj, c.name) for c in obj.__table__.columns}
    for k, v in d.items():
        if isinstance(v, datetime):
            d[k] = v.isoformat()
    return d
# --- Pydantic model for the summary tool's arguments ---
class SummaryArgs(BaseModel):
    event_id: int = Field(description="The ID of the QMS event to summarize.")

# --- 'summary' tool
@tool("summary", args_schema=SummaryArgs)
def summary(event_id: int) -> str:
    """Provides a concise summary of the QMS event with the given ID."""
    db = next(database.get_db())
    event_record = db.query(models.Event).filter(models.Event.event_id == event_id).first()
    if not event_record:
        return f"Error: No event found with ID {event_id}."

    def model_to_dict(obj):
        if not obj: return {}
        return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

    combined_data = model_to_dict(event_record)

    if event_record.event_type == "DEVIATION":
        deviation_record = db.query(models.Deviation).filter(models.Deviation.event_id == event_id).first()
        combined_data.update(model_to_dict(deviation_record))
    elif event_record.event_type == "CAPA":
        capa_record = db.query(models.Capa).filter(models.Capa.event_id == event_id).first()
        combined_data.update(model_to_dict(capa_record))

    data_for_llm = {k: (v.isoformat() if isinstance(v, datetime) else v) for k, v in combined_data.items()}
    
    summary_prompt = f"""
    Based on the following QMS event data, provide a concise, professional summary.
    Focus on the title, status, severity, root cause, and any actions.
    Data:
    ```json
    {json.dumps(data_for_llm, indent=2)}
    ```
    """
    summary_response = llm.invoke(summary_prompt)
    return summary_response.content

class SearchEventsArgs(BaseModel):
    """Arguments for searching QMS events with multiple optional criteria."""
    status: Optional[str] = Field(default=None, description="Filter by status. E.g., 'REQUESTED', 'CLOSED'.")
    severity: Optional[str] = Field(default=None, description="Filter by severity. E.g., 'CRITICAL', 'MAJOR'.")
    event_type: Optional[str] = Field(default=None, description="Filter by event type. E.g., 'DEVIATION', 'CAPA'.")
    created_by: Optional[str] = Field(default=None, description="Filter by the user who created the event.")
    site : Optional[str] = Field(default=None, description="Filter by site.")

@tool("search_events", args_schema=SearchEventsArgs)
def search_events(status: str = None, severity: str = None, event_type: str = None, created_by: str = None, department: str = None,site:str = None) -> List[Dict[str, Any]]:
    """Searches for QMS events based on a flexible set of criteria."""
    db = next(database.get_db())
    query = db.query(models.Event)

    if status:
        query = query.filter(models.Event.status == status)
    if severity:
        query = query.filter(models.Event.severity == severity)
    if event_type:
        query = query.filter(models.Event.event_type == event_type)
    if created_by:
        query = query.filter(models.Event.created_by == created_by)
    if site:
        query = query.filter(models.Event.site == site)
    event_records = query.all()
    
    if not event_records:
        return []
    
    return [model_to_dict(event) for event in event_records]

class OpenEventArgs(BaseModel):
    event_id: int = Field(description="The ID of the event to open for editing.")

@tool("open_event_for_editing", args_schema=OpenEventArgs)
def open_event_for_editing(event_id: int) -> Dict[str, Any]:
    """Opens a specific QMS event to prepare it for editing by fetching its essential details."""
    db = next(database.get_db())
    event = db.query(models.Event).filter(models.Event.event_id == event_id).first()
    if not event:
        return {"error": f"Event with ID {event_id} not found."}
    print(event.event_id,event.event_type.value)
    return {
        "event_id": event.event_id,
        "event_type": event.event_type.value
    }

# --- Graph Setup ---
tools = [summary, search_events, open_event_for_editing]
llm_with_tools = llm.bind_tools(tools)
tool_node = ToolNode(tools)

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], lambda x, y: x + y]

def agent_node(state: AgentState):
    """Calls the LLM to determine which tool to use."""
    
    # ### UPDATED ### New system prompt with instructions for the new tool
    system_prompt_content = f"""You are a specialized QMS assistant. You have tools to summarize an event, search for events, or open an event for editing.

        You have the following tools available:
        1. `summary`: Use this tool if the user asks for a "summary", "overview", or "details" of a SINGLE event. You MUST extract the event ID.
        2. `search_events`: Use this tool if the user asks to "find", "show", or "list" events based on one or more criteria like status, severity, type, or creator.
        3. `open_event_for_editing`: Use this tool if the user explicitly asks to "open" or "edit" an event. This tool fetches the necessary data to prepare an event for an editing interface.

        Example 1: If the user says "summarize event 13", call the `summary` tool with `event_id=13`.
        Example 2: If the user says "show me all critical deviations created by shebin", call `search_events` with `severity='CRITICAL'`, `event_type='DEVIATION'`, and `created_by='shebin'`.
        Example 3: If the user says "I need to edit event 13" or "open event 13", call `open_event_for_editing` with `event_id=13`.
        Example 4: If the user says "show all events in bengaluru", call `search_events` with `site`='bengaluru'`.
        """
    
    system_prompt = SystemMessage(content=system_prompt_content)
    
    # MODIFIED: agent_node is simplified and no longer sends current_event context.
    messages_with_prompt = [system_prompt] + state["messages"]
    
    response = llm_with_tools.invoke(messages_with_prompt)
    return {"messages": [response]}


def should_continue(state: AgentState) -> str:
    if state['messages'][-1].tool_calls:
        return "tools"
    return END

# --- Workflow Definition ---
workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)
workflow.set_entry_point("agent")
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {"tools": "tools", END: END}
)
workflow.add_edge("tools", END)
graph = workflow.compile()