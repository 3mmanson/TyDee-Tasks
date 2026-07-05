import React from 'react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import SortableTaskItem from './SortableTaskItem';

const TaskList = ({ tasks, onDelete, onEdit, onToggleStatus, onReorder }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);
    const newOrder = arrayMove(tasks, oldIndex, newIndex);
    onReorder?.(newOrder);
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-20">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>No tasks found</h3>
        <p className="max-w-xs mx-auto mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          Get organized! Create your first task to start tracking your progress.
        </p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tasks.map(task => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onDelete={onDelete}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default TaskList;
