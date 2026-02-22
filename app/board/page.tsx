"use client";

import { useEffect, useState, useRef } from "react";
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
import { Task, ColumnType } from "../types";
import "../globals.css";

export default function BoardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("");
  const [showColumnForm, setShowColumnForm] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const signedInEmail = localStorage.getItem("signedIn");
    if (!signedInEmail) {
      router.replace("/auth");
      return;
    }
    setEmail(signedInEmail);

    const savedBoard = localStorage.getItem(`board_${signedInEmail}`);
    if (savedBoard) {
      const data = JSON.parse(savedBoard);
      setColumns(data.columns || []);
      setTasks(data.tasks || []);
    }

    setMounted(true);
  }, [router]);

  // Close form when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showColumnForm &&
        formRef.current &&
        !formRef.current.contains(event.target as Node)
      ) {
        setShowColumnForm(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnForm]);

  const saveBoard = (updatedColumns: ColumnType[], updatedTasks: Task[]) => {
    if (!email) return;
    localStorage.setItem(
      `board_${email}`,
      JSON.stringify({ columns: updatedColumns, tasks: updatedTasks })
    );
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    if (columns.some((c) => c.id === active.id)) {
      const oldIndex = columns.findIndex((c) => c.id === active.id);
      const newIndex = columns.findIndex((c) => c.id === over.id);

      if (oldIndex !== newIndex) {
        const newColumns = arrayMove(columns, oldIndex, newIndex);
        setColumns(newColumns);
        saveBoard(newColumns, tasks);
      }
      return;
    }

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask) {
      const updatedTasks = tasks.map((t) =>
        t.id === active.id ? { ...t, column: overTask.column } : t
      );

      const oldIndex = updatedTasks.findIndex((t) => t.id === active.id);
      const newIndex = updatedTasks.findIndex((t) => t.id === over.id);

      const newTasks = arrayMove(updatedTasks, oldIndex, newIndex);
      setTasks(newTasks);
      saveBoard(columns, newTasks);
      return;
    }

    const overColumn = columns.find((c) => c.id === over.id);
    if (overColumn) {
      const newTasks = tasks.map((t) =>
        t.id === active.id ? { ...t, column: overColumn.id } : t
      );
      setTasks(newTasks);
      saveBoard(columns, newTasks);
    }
  }

  const handleAddCard = (columnId: string) => {
    if (!email) return;

    const newTask: Task = {
      id: Date.now().toString(),
      content: "",
      column: columnId,
      color: "#ffffff",
      user: email,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveBoard(columns, updatedTasks);
  };

  const handleDeleteCard = (taskId: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(updatedTasks);
    saveBoard(columns, updatedTasks);
  };

  const handleUpdateCard = (
    taskId: string,
    content: string,
    color?: string
  ) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, content, color: color ?? t.color } : t
    );
    setTasks(updatedTasks);
    saveBoard(columns, updatedTasks);
  };

  const handleAddColumn = () => {
    if (!email) return;
    if (!newColumnTitle.trim() || !newColumnColor) return;

    const newColumn: ColumnType = {
      id: Date.now().toString(),
      title: newColumnTitle,
      color: newColumnColor,
    };

    const updatedColumns = [...columns, newColumn];
    setColumns(updatedColumns);
    saveBoard(updatedColumns, tasks);

    setNewColumnTitle("");
    setNewColumnColor("");
    setShowColumnForm(false);
  };

  const handleDeleteColumn = (columnId: string) => {
    const updatedColumns = columns.filter((c) => c.id !== columnId);
    const updatedTasks = tasks.filter((t) => t.column !== columnId);

    setColumns(updatedColumns);
    setTasks(updatedTasks);
    saveBoard(updatedColumns, updatedTasks);
  };

  const handleUpdateColumn = (
    columnId: string,
    newTitle: string,
    newColor: string
  ) => {
    const updatedColumns = columns.map((c) =>
      c.id === columnId
        ? { ...c, title: newTitle, color: newColor }
        : c
    );

    setColumns(updatedColumns);
    saveBoard(updatedColumns, tasks);
  };

  const handleSignOut = () => {
    localStorage.removeItem("signedIn");
    router.push("/auth");
  };

  if (!mounted) return null;

  return (
    <div className="bg-sky-300 text-black min-h-screen">

      <header className="relative h-16 bg-pink-300 flex items-center justify-center px-8 border-b border-black shadow-sm">
        <h1 className="text-xl font-semibold text-black">
          To Do
        </h1>

        <button
          onClick={handleSignOut}
          className="absolute right-8 bg-sky-200 hover:bg-sky-300 text-black px-4 py-2 rounded-md border border-black"
        >
          Sign Out
        </button>
      </header>

      <div className="flex">

        <aside className="w-64 bg-yellow-200 min-h-screen p-6 border-r border-black flex flex-col">

          <div className="mb-6 p-3 bg-pink-100 rounded shadow text-center text-black font-semibold">
            🌸 The perfect planner for the perfect schedule 🌸
          </div>

          <button
            onClick={() => setShowColumnForm(true)}
            className="bg-pink-300 hover:bg-blue-300 text-black px-3 py-2 rounded w-full border border-black mb-6"
          >
            + Add Column
          </button>

          {showColumnForm && (
            <div
              ref={formRef}
              className="mb-8 p-3 bg-white rounded border border-black shadow space-y-3"
            >
              <div className="text-sm font-semibold">
                Name your column
              </div>

              <input
                type="text"
                placeholder="Choose a name"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                className="w-full p-2 rounded border border-black"
              />

              <div className="text-sm font-semibold">
                Color your column
              </div>

              <input
                type="color"
                value={newColumnColor || "#888888"}
                onChange={(e) => setNewColumnColor(e.target.value)}
                className="w-full h-10 rounded border border-black"
              />

              <button
                onClick={handleAddColumn}
                className="bg-sky-300 hover:bg-pink-300 px-3 py-2 rounded w-full border border-black"
              >
                Create Column
              </button>
            </div>
          )}

          <select
            onChange={(e) => {
              if (e.target.value) handleDeleteColumn(e.target.value);
              e.target.value = "";
            }}
            className="bg-blue-300 hover:bg-pink-300 text-black px-3 py-2 rounded w-full border border-black mt-6"
            defaultValue=""
          >
            <option value="" disabled>- Delete Column</option>
            {columns.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

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