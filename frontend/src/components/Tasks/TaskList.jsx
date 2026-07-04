import React from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onDelete, onEdit, onToggleStatus }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
        <p className="text-gray-500 max-w-xs mx-auto mt-2">
          Get organized! Create your first task to start tracking your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDelete}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};

export default TaskList;
