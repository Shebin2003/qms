import os
import json
from typing import TypedDict, Annotated, List, Optional, Dict, Any
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.messages import BaseMessage, SystemMessage, ToolMessage, HumanMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from datetime import datetime, time
# --- LLM Initialization ---
# Ensure your GROQ_API_KEY is set as an environment variable
llm = ChatGroq(
    temperature=0,
    model_name="gemma2-9b-it",
    api_key=os.getenv("GROQ_API_KEY")
)

# --- Tool Definition for Extracting Updates ---
class UpdateQMSEventArgs(BaseModel):
    """Defines all possible fields that can be updated in a QMS event."""
    # Using the fields from your JSON object
    title: Optional[str] = Field(default=None, description="The main title of the event.")
    description: Optional[str] = Field(default=None, description="A detailed description of the event.")
    status: Optional[str] = Field(default=None, description="The current status of the event. Must be one of: REQUESTED, UNDER_INVESTIGATION, PENDING_APPROVAL, CLOSED.")
    severity: Optional[str] = Field(default=None, description="The severity of the event. Must be one of: CRITICAL, MAJOR, MINOR.")
    created_by: Optional[str] = Field(default=None, description="The person who created or is responsible for the event.")
    department: Optional[str] = Field(default=None, description="The department associated with the event.")
    site: Optional[str] = Field(default=None, description="The site or location of the event.")
    root_cause: Optional[str] = Field(default=None, description="The root cause of the issue.")
    corrective_action: Optional[str] = Field(default=None, description="The corrective actions planned.")
    preventive_action: Optional[str] = Field(default=None, description="The preventive actions planned.")
    effectiveness_check: Optional[str] = Field(default=None, description="The plan to check the effectiveness of actions.")
    verification_plan: Optional[str] = Field(default=None, description="The plan to verify the actions.")
    quality_approver: Optional[str] = Field(default=None, description="Name of the QA approver.")
    verification_summary: Optional[str] = Field(default=None, description="Summary of verification activities.")
    closure_justification: Optional[str] = Field(default=None, description="The final justification for closing the event.")
    deviation_category: Optional[str] = Field(default=None, description="The category of the deviation, e.g., 'Equipment Malfunction'.")
    immediate_action: Optional[str] = Field(default=None, description="The immediate actions taken to contain the issue.")
    batch_Number: Optional[str] = Field(default=None, description="The affected batch or lot number.")
    product_impact_assessment: Optional[str] = Field(default=None, description="An assessment of the impact on the product.")
    regulatory_impact_assessment: Optional[str] = Field(default=None, description="An assessment of the impact on regulatory filings.")
    linked_capa_id: Optional[int] = Field(default=None, description="The ID of any linked CAPA event.")
    lastModified_at: Optional[datetime] = Field(default=None, description="The timestamp of the last modification.")
    lastModified_by: Optional[str] = Field(default=None, description="The user who made the last modification.")


@tool("update_qms_event", args_schema=UpdateQMSEventArgs)
def update_qms_event(**kwargs) -> Dict[str, Any]:
    """
    Extracts the fields to be updated from the user's command.
    Only include fields the user explicitly mentioned to change.
    """
    # This tool now simply returns the updates it extracted.
    updates = {k: v for k, v in kwargs.items() if v is not None}
    return updates


# --- Graph Setup ---
tools = [update_qms_event]
llm_with_tools = llm.bind_tools(tools)

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], lambda x, y: x + y]
    # The event object we are modifying
    current_event: Dict[str, Any]

def agent_node(state: AgentState):
    """Calls the LLM to determine the updates needed for the JSON object."""
    # UPDATED: The system prompt now ONLY contains instructions and the schema.
    # The hardcoded CONTEXT and USER'S QUERY have been removed.
    current_time_str = datetime.now().isoformat()
    system_prompt_content = f"""You are a specialized QMS assistant. Your ONLY job is to help a user modify a JSON object representing a QMS event by extracting their requested changes.

    Analyze the user's request and call the `update_qms_event` tool with the specific fields to change.

    **Instructions:**
    - Only include the fields the user explicitly mentions. Do not make up information.
    - Return ONLY the tool call. Do not add any other text or explanation.

    **Allowed Values:**
    - The `status` field must be one of: REQUESTED, UNDER_INVESTIGATION, PENDING_APPROVAL, CLOSED.
    - The `severity` field must be one of: CRITICAL, MAJOR, MINOR.

     **Instructions:**
    - Only include the fields the user explicitly mentions.
    - When the user provides a relative date like 'today' or 'yesterday', calculate the absolute date based on the current time.
    - The current time is: {current_time_str}
    - Return ONLY the tool call. Do not add any other text or explanation.

    """
    
    system_prompt = SystemMessage(content=system_prompt_content)
    
    # The message history is now a clean sequence of instructions, current data, and the user's request.
    current_state_str = json.dumps(state['current_event'], indent=2)
    messages_with_prompt = [
        system_prompt,
        HumanMessage(content=f"Here is the current event data:\n```json\n{current_state_str}\n```"),
        *state["messages"]
    ]
    
    response = llm_with_tools.invoke(messages_with_prompt)
    return {"messages": [response]}

def tool_node(state: AgentState):
    """Executes the tool call and returns the results."""
    tool_messages = []
    tool_calls = state["messages"][-1].tool_calls
    for tool_call in tool_calls:
        tool_output = update_qms_event.invoke(tool_call["args"])
        tool_messages.append(
            ToolMessage(content=json.dumps(tool_output), tool_call_id=tool_call["id"])
        )
    return {"messages": tool_messages}

def update_state_node(state: AgentState):
    """NEW: A new node to apply the extracted updates to the event object in the state."""
    tool_message = state["messages"][-1]
    updates = json.loads(tool_message.content)
    
    # Update the current_event dictionary with the new values
    state["current_event"].update(updates)
    return {"current_event": state["current_event"]}

# --- Workflow Definition ---
workflow = StateGraph(AgentState)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)
workflow.add_node("update_state", update_state_node) # Add the new node

workflow.set_entry_point("agent")
workflow.add_conditional_edges(
    "agent",
    lambda state: "tools" if state["messages"][-1].tool_calls else END
)
workflow.add_edge("tools", "update_state")
workflow.add_edge("update_state", END)

graph = workflow.compile()

