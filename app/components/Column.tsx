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
  onDeleteCard: (taskId: string) => void;
  onUpdateCard: (taskId: string, content: string, color?: string) => void;
  onUpdateColumn: (columnId: string, newTitle: string, newColor: string) => void;
}

function TaskItem({
  task,
  onUpdateCard,
}: {
  task: Task;
  onUpdateCard: (taskId: string, content: string, color?: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const [editing, setEditing] = useState(task.content === "");
  const [value, setValue] = useState(task.content);

  const handleBlur = () => {
    setEditing(false);
    onUpdateCard(task.id, value);
  };

  const getTextColor = (bg: string) => {
    const color = bg.replace("#", "");
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    return (r*0.299 + g*0.587 + b*0.114) > 186 ? "#000000" : "#ffffff";
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        backgroundColor: task.color || "#ffffff",
        color: getTextColor(task.color || "#ffffff"),
      }}
      className="p-3 rounded-md shadow"
    >
      {editing ? (
        <textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          className="w-full p-2 rounded resize-none border border-gray-400 focus:outline-none"
          style={{
            backgroundColor: task.color || "#ffffff",
            color: getTextColor(task.color || "#ffffff"),
          }}
        />
      ) : (
        <p onClick={() => setEditing(true)} className="cursor-text">
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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [colorValue, setColorValue] = useState(color);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  const handleTitleBlur = () => {
    setEditingTitle(false);
    onUpdateColumn(id, titleValue, colorValue);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        backgroundColor: colorValue,
        color: "#fff",
      }}
      className="w-64 rounded-lg flex flex-col"
    >
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
              onChange={(e) => {
                setColorValue(e.target.value);
                onUpdateColumn(id, titleValue, e.target.value);
              }}
              className="w-full h-8 cursor-pointer"
            />
          </>
        ) : (
          <h2 className="font-bold mb-2" onClick={() => setEditingTitle(true)}>
            {titleValue}
          </h2>
        )}
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 p-4">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onUpdateCard={onUpdateCard} />
          ))}

          {tasks.length > 0 && (
            <div className="flex flex-col gap-1">
              <button
                className="text-white/80 hover:text-white cursor-pointer text-sm bg-gray-700 px-3 py-2 rounded text-center"
                onClick={() => setShowDeleteMenu((prev) => !prev)}
              >
                Delete task
              </button>

              {showDeleteMenu &&
                tasks.map((task) => (
                  <button
                    key={task.id}
                    className="text-white hover:text-red-400 cursor-pointer text-sm bg-gray-800 px-2 py-1 rounded text-left"
                    onClick={() => {
                      onDeleteCard(task.id);
                      setShowDeleteMenu(false);
                    }}
                  >
                    {task.content || "New Card"}
                  </button>
                ))}
            </div>
          )}

          <div
            onClick={() => onAddCard(id)}
            className="text-white/80 hover:text-white cursor-pointer text-sm bg-gray-700 px-3 py-2 rounded text-center mt-1"
          >
            + New task
          </div>
        </div>
      </SortableContext>
    </div>
  );
}