"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import { Task } from "../types";

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  onAddPulse?: (columnId: string) => void;
}

export default function Column({ id, title, tasks, color, onAddPulse }: ColumnProps) {
  return (
    <div
      className="w-64 rounded-lg shadow-md flex flex-col"
      style={{ backgroundColor: color }}
    >
      {/* Column Title */}
      <h2 className="font-bold p-4 text-white">{title}</h2>

      {/* Tasks */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>

      {/* Add Pulse Button */}
      <button
        className="mt-auto p-2 m-4 text-sm text-white rounded bg-white/10 hover:bg-white/20"
        onClick={() => onAddPulse && onAddPulse(id)}
      >
        + Add Pulse
      </button>
    </div>
  );
}