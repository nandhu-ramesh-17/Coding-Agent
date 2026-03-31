from langchain_groq import ChatGroq
from dotenv import load_dotenv
from pydantic import BaseModel
from langgraph.graph import StateGraph
from langgraph.constants import END

from states import *
from prompts import *

load_dotenv()

llm = ChatGroq(model="openai/gpt-oss-120b")

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

graph = StateGraph(dict)
graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_edge("planner","architect")
graph.set_entry_point("planner")

agent = graph.compile()

user_prompt = "Build a Simple Calculator web app"

result = agent.invoke({"user_prompt" : user_prompt})

print(result)