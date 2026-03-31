def planner_prompt(task: str) -> str:
    return f"""You are a Planner Agent and you are given a user prompt: {task}. Convert the user prompt into a Complete Engineering Project Plan."""