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

# --- LLM Initialization ---
llm = ChatGroq(
    temperature=0,
    model_name="gemma2-9b-it",
    api_key=os.getenv("GROQ_API_KEY")
)

# --- Pydantic model for the summary tool's arguments ---
class SummaryArgs(BaseModel):
    event_id: int = Field(description="The ID of the QMS event to summarize.")

# --- 'summary' tool with full implementation ---
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


# --- Graph Setup ---
tools = [summary]
llm_with_tools = llm.bind_tools(tools)
tool_node = ToolNode(tools)

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], lambda x, y: x + y]

def agent_node(state: AgentState):
    """Calls the LLM to determine whether to summarize the event."""
    system_prompt_content = f"""You are a specialized QMS assistant. Your primary job is to provide summaries of QMS events.

    You have one tool available:
    1. `summary`: Use this tool if the user asks for a "summary", "overview", "recap", etc. You MUST extract the event ID from the user's message. For example, if the user says "summarize event 123", you must call the tool with event_id=123.
    2. `suggest_next`: Use this tool if the user asks **"what should I do next?"** or "what's the next step?". To use this tool, you MUST look at the `current_event` data, find the `status` and `event_type`, and pass them as arguments.
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