from langchain_groq import ChatGroq
from dotenv import load_dotenv
from pydantic import BaseModel
from langgraph.graph import StateGraph
from langgraph.constants import END
from langgraph.prebuilt import create_react_agent

from states import *
from prompts import *
from tools import *

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

def coder_agent(state : dict) -> dict:
    coder_state = state.get("coder_state")
    if coder_state is None:
         coder_state = CoderState(task_plan=state["task_plan"], current_step_idx=0)


    steps = coder_state.task_plan.implementation_steps
    if coder_state.current_step_idx >= len(steps):
        return {"coder_state" : coder_state, "status" : "COMPLETED"}
    
    # current_step_idx = 0
    current_task = steps[coder_state.current_step_idx]
    current_path = current_task.file_path
    existing_content = read_file.run(current_path)
    user_prompt = (
        f"Task : {current_task.task_description}\n"
        f"File Path : {current_path}\n"
        f"Existing Content : {existing_content}\n"
        "Use write_file(path, content) to write the full content of the file."
    )
    system_prompt = coder_system_prompt()
    # response = llm.invoke(system_prompt + user_prompt)

    coder_tools = [write_file, read_file, get_current_directory, list_files]
    react_agent = create_react_agent(llm, coder_tools)
    react_agent.invoke({"messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}]})
    # return {"code_output" : response.content}
    coder_state.current_step_idx += 1
    return {"coder_state" : coder_state, "status" : "IN_PROGRESS"}

graph = StateGraph(dict)
graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_node("coder", coder_agent)
graph.add_edge("planner","architect")
graph.add_edge("architect","coder")
graph.add_conditional_edges(
    "coder",
    lambda state: "end" if state.get("status") == "COMPLETED" else "coder",
    {
        "coder": "coder",
        "end": END
    }
)
graph.set_entry_point("planner")

agent = graph.compile()

user_prompt = "I need to build a todo app with fe where i can add and remove tasks."

result = agent.invoke({"user_prompt" : user_prompt})

print(result)