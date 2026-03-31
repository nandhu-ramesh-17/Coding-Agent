from pydantic import BaseModel, Field, ConfigDict

class File(BaseModel):
    path : str = Field(description="Path to file to be created or modified")
    purpose : str = Field(description="Purpose of the file, what it should contain and how it should be used. eg : 'main application logic', 'helper functions for data processing', 'unit tests for the application' etc.")

class Plan(BaseModel):
    name: str = Field(description="The name of app to be built")
    description: str = Field(description="A detailed description of the app to be built, its features and functionalities.")
    techstack: str = Field(description="List of technologies to be used in the project. eg : 'Python', 'FastAPI', 'PostgreSQL', 'Docker' etc.")
    features : list[str] = Field(description="List of features to be implemented in the app. eg : 'User authentication', 'Data visualization dashboard', 'REST API endpoints' etc.")        
    files : list[File] = Field(description="List of files to be created or modified to complete the project. Each with path and purpose.")

class ImplementationTask(BaseModel):
    filepath: str = Field(description="The path to the file to be modified")
    task_description: str = Field(description="A detailed description of the task to be performed on the file, e.g. 'add user authentication', 'implement data processing logic', etc.")

class TaskPlan(BaseModel):
    implementation_steps: list[ImplementationTask] = Field(description="A list of steps to be taken to implement the task")
    model_config = ConfigDict(extra="allow")