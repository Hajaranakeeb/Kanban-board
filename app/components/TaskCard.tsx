"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Task } from "../types";

interface TaskCardProps {
  task: Task;
  columnId: string;
  onDeleteCard: (columnId: string, taskId: string) => void;
}

export default function TaskCard({ task, columnId, onDeleteCard }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const [showDelete, setShowDelete] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
    backgroundColor: "#000000",
    color: "white",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 rounded-md shadow cursor-pointer"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <p>{task.content || "New Card"}</p>

      {/* DELETE BUTTON */}
      {showDelete && (
        <button
          onClick={() => onDeleteCard(columnId, task.id)}
          className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
        >
          Delete
        </button>
      )}
    </div>
  );
}