"use client";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Task } from "../types";

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

function TaskItem({
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

  const [editing, setEditing] = useState(task.content === "");
  const [value, setValue] = useState(task.content);

  function handleBlur() {
    setEditing(false);
    onUpdateCard(columnId, task.id, value, task.color);
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        backgroundColor: "#000000",
        color: "white",
      }}
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
        <p onClick={() => setEditing(true)}>
          {task.content || "New Card"}
        </p>
      )}
    </div>
  );
}

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
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [colorValue, setColorValue] = useState(color);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

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
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        backgroundColor: colorValue,
        color: "white",
      }}
      className="w-64 rounded-lg flex flex-col"
    >
      {/* COLUMN HEADER */}
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

      {/* CARDS */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 p-4">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              columnId={id}
              onUpdateCard={onUpdateCard}
            />
          ))}

          {/* DELETE CARD MENU */}
          {tasks.length > 0 && (
            <div className="flex flex-col gap-1">
              <button
                className="text-white/80 hover:text-white cursor-pointer text-sm bg-gray-700 px-3 py-2 rounded text-center"
                onClick={() => setShowDeleteMenu(prev => !prev)}
              >
                Delete Card
              </button>

              {showDeleteMenu &&
                tasks.map((task) => (
                  <button
                    key={task.id}
                    className="text-white/80 hover:text-white cursor-pointer text-sm bg-gray-700 px-2 py-1 rounded text-left"
                    onClick={() => {
                      onDeleteCard(id, task.id);
                      setShowDeleteMenu(false);
                    }}
                  >
                    {task.content || "New Card"}
                  </button>
                ))}
            </div>
          )}

          {/* ADD NEW CARD BUTTON */}
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