"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import Column from "../components/Column";
import { Task, ColumnType } from "../types";
import "../globals.css";

export default function BoardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const sensors = useSensors(useSensor(PointerSensor));

  // ===== Load board from localStorage
  useEffect(() => {
    const signedInEmail = localStorage.getItem("signedIn");
    if (!signedInEmail) { router.replace("/auth"); return; }
    setEmail(signedInEmail);

    const savedBoard = localStorage.getItem(`board_${signedInEmail}`);
    if (savedBoard) {
      const data = JSON.parse(savedBoard);
      setColumns(data.columns || []);
      setTasks(data.tasks || []);
    }
    setMounted(true);
  }, [router]);

  const saveBoard = (updatedColumns: ColumnType[], updatedTasks: Task[]) => {
    if (!email) return;
    localStorage.setItem(`board_${email}`, JSON.stringify({ columns: updatedColumns, tasks: updatedTasks }));
  };

  // ===== Drag & Drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    if (columns.some((c) => c.id === active.id)) {
      const oldIndex = columns.findIndex((c) => c.id === active.id);
      const newIndex = columns.findIndex((c) => c.id === over.id);
      if (oldIndex !== newIndex) { const newColumns = arrayMove(columns, oldIndex, newIndex); setColumns(newColumns); saveBoard(newColumns, tasks); }
      return;
    }

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask) {
      const updatedTasks = tasks.map((t) => t.id === active.id ? { ...t, column: overTask.column } : t);
      const oldIndex = updatedTasks.findIndex((t) => t.id === active.id);
      const newIndex = updatedTasks.findIndex((t) => t.id === over.id);
      setTasks(arrayMove(updatedTasks, oldIndex, newIndex));
      saveBoard(columns, arrayMove(updatedTasks, oldIndex, newIndex));
      return;
    }

    const overColumn = columns.find((c) => c.id === over.id);
    if (overColumn) {
      const newTasks = tasks.map((t) => t.id === active.id ? { ...t, column: overColumn.id } : t);
      setTasks(newTasks);
      saveBoard(columns, newTasks);
    }
  }

  // ===== Cards
  const handleAddCard = (columnId: string) => {
    if (!email) return;
    const newTask: Task = { id: Date.now().toString(), content: "", column: columnId, color: "#ffffff", user: email };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveBoard(columns, updatedTasks);
  };

  const handleDeleteCard = (taskId: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(updatedTasks);
    saveBoard(columns, updatedTasks);
  };

  const handleUpdateCard = (taskId: string, content: string, color?: string) => {
    const updatedTasks = tasks.map((t) => t.id === taskId ? { ...t, content, color: color ?? t.color } : t);
    setTasks(updatedTasks);
    saveBoard(columns, updatedTasks);
  };

  // ===== Columns
  const handleAddColumn = () => {
    if (!email) return;
    const newTitle = prompt("Enter column name");
    if (!newTitle) return;
    const newColor = prompt("Pick column color (hex)", "#888888") || "#888888";
    const newColumn: ColumnType = { id: Date.now().toString(), title: newTitle, color: newColor };
    const updatedColumns = [...columns, newColumn];
    setColumns(updatedColumns);
    saveBoard(updatedColumns, tasks);
  };

  const handleDeleteColumn = (columnId: string) => {
    const updatedColumns = columns.filter((c) => c.id !== columnId);
    const updatedTasks = tasks.filter((t) => t.column !== columnId);
    setColumns(updatedColumns);
    setTasks(updatedTasks);
    saveBoard(updatedColumns, updatedTasks);
  };

  const handleUpdateColumn = (columnId: string, newTitle: string, newColor: string) => {
    const updatedColumns = columns.map((c) => c.id === columnId ? { ...c, title: newTitle, color: newColor } : c);
    setColumns(updatedColumns);
    saveBoard(updatedColumns, tasks);
  };

  const handleSignOut = () => { localStorage.removeItem("signedIn"); router.push("/auth"); };

  if (!mounted) return null;

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      <header className="h-16 bg-gray-800 flex items-center justify-between px-8 border-b border-gray-700 shadow-sm">
        <h1 className="text-xl font-semibold text-white">Cupcakes Factory <span className="ml-2 font-normal">Kanban</span></h1>
        <button onClick={handleSignOut} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md">Sign Out</button>
      </header>
      <div className="flex">
        <aside className="w-64 bg-gray-800 min-h-screen p-6 border-r border-gray-700 space-y-6">
          <button onClick={handleAddColumn} className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded w-full">+ Add Column</button>
          <select onChange={(e) => { handleDeleteColumn(e.target.value); e.target.value = ""; }} className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded w-full" defaultValue="">
            <option value="" disabled>- Delete Column</option>
            {columns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </aside>
        <main className="flex-1 p-6 overflow-x-auto h-[calc(100vh-64px)]">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-6 items-start">
                {columns.map((column) => (
                  <Column
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    color={column.color}
                    tasks={tasks.filter((t) => t.column === column.id)}
                    onAddCard={handleAddCard}
                    onDeleteCard={handleDeleteCard} // ✅ matches type
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