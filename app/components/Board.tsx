"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

import Column from "../components/Column";
import "../globals.css";

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

export default function BoardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const sensors = useSensors(useSensor(PointerSensor));

  // Load the user's board
  useEffect(() => {
    const signedInEmail = localStorage.getItem("signedIn");
    if (!signedInEmail) {
      router.replace("/auth");
      return;
    }
    setEmail(signedInEmail);

    const savedBoard = JSON.parse(
      localStorage.getItem(`kanban-board-${signedInEmail}`) || "null"
    );

    if (savedBoard) {
      setColumns(savedBoard.columns);
      setTasks(savedBoard.tasks);
    } else {
      // New account → start fresh
      setColumns([]);
      setTasks([]);
    }

    setMounted(true);
  }, [router]);

  // Save board per user
  useEffect(() => {
    if (!mounted || !email) return;
    localStorage.setItem(
      `kanban-board-${email}`,
      JSON.stringify({ columns, tasks })
    );
  }, [columns, tasks, mounted, email]);

  if (!mounted) return null;

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

  function handleDeleteColumn(columnId: string) {
    setColumns((prev) => prev.filter((c) => c.id !== columnId));
    setTasks((prev) => prev.filter((t) => t.column !== columnId));
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
    localStorage.removeItem("signedIn");
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

        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md"
        >
          Sign Out
        </button>
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
            {/* Delete Column dropdown */}
            <select
              onChange={(e) => handleDeleteColumn(e.target.value)}
              className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded w-full"
              defaultValue=""
            >
              <option value="" disabled>
                - Delete Column
              </option>
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-x-auto h-[calc(100vh-64px)]">
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
                    tasks={tasks.filter((t) => t.column === column.id)}
                    onAddCard={handleAddCard}
                    onDeleteCard={handleDeleteCard}
                    onUpdateCard={handleUpdateCard}
                    onUpdateColumn={handleUpdateColumn}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </main>
      </div>
    </div>
  );
}