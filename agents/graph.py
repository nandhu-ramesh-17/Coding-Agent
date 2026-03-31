from langchain_groq import ChatGroq
from dotenv import load_dotenv
from pydantic import BaseModel
from states import *
from prompts import *

load_dotenv()

llm = ChatGroq(model="openai/gpt-oss-120b")

user_prompt = "Build a Simple Calculator web app"

prompt = planner_prompt(user_prompt)

response = llm.with_structured_output(Plan).invoke(prompt)

print(response)