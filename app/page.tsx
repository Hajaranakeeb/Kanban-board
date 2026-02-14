"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import Column from "./components/Column";
import "./globals.css";

export type Task = {
  id: string;
  content: string;
  column: string;
  color?: string;
};

export type ColumnType = {
  id: string;
  title: string;
  color: string;
};

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const defaultColumns: ColumnType[] = [
    { id: "todo", title: "Stuck", color: "#E2445C" },
    { id: "progress", title: "Not started", color: "#579BFC" },
    { id: "working", title: "Working on it", color: "#FDAB3D" },
    { id: "done", title: "Done", color: "#00C875" },
    { id: "test", title: "Test", color: "#A25DDC" },
  ];

  const defaultTasks: Task[] = [
    { id: "1", content: "Vanilla Cupcake", column: "todo", color: "#f59e0b" },
    { id: "2", content: "Caramel Cupcake", column: "progress", color: "#10b981" },
    { id: "3", content: "Chocolate Cupcake", column: "working", color: "#3b82f6" },
    { id: "4", content: "Velvet Cupcake", column: "working", color: "#8b5cf6" },
    { id: "5", content: "Caramel Cupcake", column: "done", color: "#ef4444" },
    { id: "6", content: "Coffee Cupcake", column: "done", color: "#f97316" },
  ];

  const [columns, setColumns] = useState<ColumnType[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kanban-board");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.columns || defaultColumns;
      }
    }
    return defaultColumns;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kanban-board");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.tasks || defaultTasks;
      }
    }
    return defaultTasks;
  });

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => setMounted(true), []);

  /* AUTO SAVE BOARD */
  useEffect(() => {
    const boardData = { columns, tasks };
    localStorage.setItem("kanban-board", JSON.stringify(boardData));
  }, [columns, tasks]);

  const signedIn = pathname !== "/auth";

  /* ================= DRAG ================= */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    if (columns.some((c) => c.id === active.id)) {
      const oldIndex = columns.findIndex((c) => c.id === active.id);
      const newIndex = columns.findIndex((c) => c.id === over.id);
      if (oldIndex !== newIndex)
        setColumns(arrayMove(columns, oldIndex, newIndex));
      return;
    }

    const activeTask = tasks.find((t) => t.id === active.id);
    const overTask = tasks.find((t) => t.id === over.id);
    if (!activeTask) return;

    if (overTask) {
      const updatedTasks = tasks.map((t) =>
        t.id === active.id ? { ...t, column: overTask.column } : t
      );
      const oldIndex = updatedTasks.findIndex((t) => t.id === active.id);
      const newIndex = updatedTasks.findIndex((t) => t.id === over.id);
      setTasks(arrayMove(updatedTasks, oldIndex, newIndex));
      return;
    }

    const overColumn = columns.find((c) => c.id === over.id);
    if (overColumn)
      setTasks((prev) =>
        prev.map((t) =>
          t.id === active.id ? { ...t, column: overColumn.id } : t
        )
      );
  }

  /* ================= CARDS ================= */
  function handleAddCard(columnId: string) {
    const newTask: Task = {
      id: Date.now().toString(),
      content: "",
      column: columnId,
      color: "#ffffff",
    };
    setTasks((prev) => [...prev, newTask]);
  }

  function handleDeleteCard(columnId: string, taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  function handleUpdateCard(
    columnId: string,
    taskId: string,
    content: string,
    color?: string
  ) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, content, color: color ?? t.color } : t
      )
    );
  }

  /* ================= COLUMNS ================= */
  function handleAddColumn() {
    const newId = Date.now().toString();
    const newTitle = prompt("Enter column name");
    if (!newTitle) return;
    const newColor =
      prompt("Pick column color (hex)", "#888888") || "#888888";

    const newColumn: ColumnType = {
      id: newId,
      title: newTitle,
      color: newColor,
    };

    setColumns((prev) => [...prev, newColumn]);
  }

  function handleDeleteLastColumn() {
    if (columns.length === 0) return;
    const lastColumn = columns[columns.length - 1];
    setColumns((prev) => prev.slice(0, -1));
    setTasks((prev) =>
      prev.filter((t) => t.column !== lastColumn.id)
    );
  }

  function handleUpdateColumn(
    columnId: string,
    newTitle: string,
    newColor: string
  ) {
    setColumns((prev) =>
      prev.map((c) =>
        c.id === columnId ? { ...c, title: newTitle, color: newColor } : c
      )
    );
  }

  function handleSignOut() {
    router.push("/auth");
  }

  /* ================= RENDER ================= */
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      <header className="h-16 bg-gray-800 flex items-center justify-between px-8 border-b border-gray-700 shadow-sm">
        <h1 className="text-xl font-semibold text-white">
          Cupcakes Factory
          <span className="ml-2 font-normal">Kanban</span>
        </h1>

        {signedIn ? (
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Sign In
          </button>
        )}
      </header>

      <div className="flex">
        <aside className="w-64 bg-gray-800 min-h-screen p-6 border-r border-gray-700 space-y-6">
          <div>
            <p className="text-white text-sm mb-2">Kanban Column</p>
            <select className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600">
              <option>Delivered</option>
              <option>In Progress</option>
            </select>
          </div>

          <div>
            <p className="text-white text-sm mb-2">Assignee Column</p>
            <select className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600">
              <option>Person</option>
              <option>Another Person</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={handleAddColumn}
              className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded"
            >
              + Add Column
            </button>
            <button
              onClick={handleDeleteLastColumn}
              className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded"
            >
              - Delete Last Column
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-x-auto h-[calc(100vh-64px)]">
          {mounted && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={columns.map((c) => c.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex gap-6 items-start">
                  {columns.map((column) => (
                    <Column
                      key={column.id}
                      id={column.id}
                      title={column.title}
                      color={column.color}
                      tasks={tasks.filter(
                        (t) => t.column === column.id
                      )}
                      onAddCard={handleAddCard}
                      onDeleteCard={handleDeleteCard}
                      onUpdateCard={handleUpdateCard}
                      onUpdateColumn={handleUpdateColumn}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </main>
      </div>
    </div>
  );
}