import React from 'react';
import PropTypes from 'prop-types';

const TaskList = ({ tasks, onRemove, onCompleted }) => {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onCompleted(task.id)}
          />
          <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.text}</span>
          <button onClick={() => onRemove(task.id)}>Remove</button>
        </li>
      ))}
    </ul>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
    }).isRequired
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
};

export default TaskList;
