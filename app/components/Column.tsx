"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Task } from "../types"; // <- use the shared types.ts

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  onAddCard: (columnId: string) => void;
  onDeleteCard: (columnId: string, taskId: string) => void;
  onUpdateCard: (columnId: string, taskId: string, content: string, color?: string) => void;
  onUpdateColumn: (columnId: string, newTitle: string, newColor: string) => void;
}

/* ================= CARD ================= */
function SortableItem({
  task,
  columnId,
  onUpdateCard,
}: {
  task: Task;
  columnId: string;
  onUpdateCard: (columnId: string, taskId: string, content: string, color?: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [editing, setEditing] = useState(task.content === "");
  const [value, setValue] = useState(task.content);

  function handleBlur() {
    setEditing(false);
    onUpdateCard(columnId, task.id, value, "#000000"); // force black background for card
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: "#000000", color: "white" }}
      {...attributes}
      {...listeners}
      className="p-3 rounded-md shadow cursor-pointer"
    >
      {editing ? (
        <textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          className="w-full p-2 rounded resize-none bg-black text-white"
        />
      ) : (
        <p onClick={() => setEditing(true)}>{task.content || "New Card"}</p>
      )}
    </div>
  );
}

/* ================= COLUMN ================= */
export default function Column({
  id,
  title,
  tasks,
  color,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  onUpdateColumn,
}: ColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [colorValue, setColorValue] = useState(color);

  function handleTitleBlur() {
    setEditingTitle(false);
    onUpdateColumn(id, titleValue, colorValue);
  }

  function handleColorChange(newColor: string) {
    setColorValue(newColor);
    onUpdateColumn(id, titleValue, newColor);
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: colorValue, color: "white" }}
      className="w-64 rounded-lg flex flex-col"
    >
      {/* HEADER */}
      <div className="p-4 cursor-grab" {...attributes} {...listeners}>
        {editingTitle ? (
          <>
            <input
              autoFocus
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              className="w-full p-1 rounded mb-2 bg-gray-700 text-white"
            />
            <input
              type="color"
              value={colorValue}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full h-8 cursor-pointer"
            />
          </>
        ) : (
          <h2 className="font-bold mb-2" onClick={() => setEditingTitle(true)}>
            {titleValue}
          </h2>
        )}
      </div>

      {/* TASKS */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 p-4">
          {tasks.map((task) => (
            <SortableItem key={task.id} task={task} columnId={id} onUpdateCard={onUpdateCard} />
          ))}

          {/* DELETE LAST CARD BUTTON */}
          {tasks.length > 0 && (
            <div
              onClick={() => {
                const lastTask = tasks[tasks.length - 1];
                onDeleteCard(id, lastTask.id);
              }}
              className="text-white/80 hover:text-white cursor-pointer text-sm bg-gray-700 px-3 py-2 rounded text-center"
            >
              Delete Last Card
            </div>
          )}

          {/* ADD NEW CARD */}
          <div
            onClick={() => onAddCard(id)}
            className="text-white/80 hover:text-white cursor-pointer text-sm bg-gray-700 px-3 py-2 rounded text-center mt-1"
          >
            + New Card
          </div>
        </div>
      </SortableContext>
    </div>
  );
}