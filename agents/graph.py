from langchain_groq import ChatGroq
from dotenv import load_dotenv
from pydantic import BaseModel
from langgraph.graph import StateGraph
from langgraph.constants import END

from states import *
from prompts import *

load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile")

def planner_agent(state : dict) -> dict:
    user_prompt = state["user_prompt"]
    response = llm.with_structured_output(Plan).invoke(planner_prompt(user_prompt))
    return {"plan" : response}

def architect_agent(state : dict) -> dict:
    plan = state["plan"]
    response = llm.with_structured_output(TaskPlan).invoke(architect_prompt(plan))
    if response is None:
        raise ValueError("Architect agent failed to generate a task plan.")
        
    response.plan = plan
    return {"task_plan" : response}

def coder_agent(state : dict) -> dict:
    steps = state["task_plan"].implementation_steps
    current_step_idx = 0
    current_task = steps[current_step_idx]
    user_prompt = (
        f"Task : {current_task.task_description}\n"
    )
    system_prompt = coder_system_prompt()
    response = llm.invoke(system_prompt + user_prompt)
    return {"code_output" : response.content}

graph = StateGraph(dict)
graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_node("coder", coder_agent)
graph.add_edge("planner","architect")
graph.add_edge("architect","coder")
graph.set_entry_point("planner")

agent = graph.compile()

user_prompt = "Build a Simple Calculator web app"

result = agent.invoke({"user_prompt" : user_prompt})

print(result)