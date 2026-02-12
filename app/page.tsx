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

// Types
export type Task = { id: string; content: string; column: string };
export type ColumnType = { id: string; title: string; color: string };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 👇 Automatically detect if user is on auth page
  const signedIn = pathname !== "/auth";

  const [columns, setColumns] = useState<ColumnType[]>([
    { id: "todo", title: "Stuck", color: "#E2445C" },
    { id: "progress", title: "Not started", color: "#579BFC" },
    { id: "working", title: "Working on it", color: "#FDAB3D" },
    { id: "done", title: "Done", color: "#00C875" },
    { id: "test", title: "Test", color: "#A25DDC" },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", content: "Vanilla Cupcake", column: "todo" },
    { id: "2", content: "Caramel Cupcake", column: "progress" },
    { id: "3", content: "Chocolate Cupcake", column: "working" },
    { id: "4", content: "Velvet Cupcake", column: "working" },
    { id: "5", content: "Caramel Cupcake", column: "done" },
    { id: "6", content: "Coffee Cupcake", column: "done" },
  ]);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeColumn = columns.find((c) => c.id === active.id);
    const overColumn = columns.find((c) => c.id === over.id);

    if (activeColumn && overColumn) {
      setColumns(
        arrayMove(columns, columns.indexOf(activeColumn), columns.indexOf(overColumn))
      );
      return;
    }

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t.id === over.id);
    const overColumnContainer = columns.find((c) => c.id === (over?.id as string));

    if (overTask) {
      if (activeTask.column === overTask.column) {
        const columnTasks = tasks.filter((t) => t.column === activeTask.column);
        const reordered = arrayMove(
          columnTasks,
          columnTasks.findIndex((t) => t.id === active.id),
          columnTasks.findIndex((t) => t.id === over.id)
        );
        setTasks((prev) =>
          prev.map((t) =>
            t.column === activeTask.column
              ? reordered.find((r) => r.id === t.id) || t
              : t
          )
        );
      } else {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === active.id ? { ...t, column: overTask.column } : t
          )
        );
      }
    } else if (overColumnContainer) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === active.id ? { ...t, column: overColumnContainer.id } : t
        )
      );
    }
  }

  function handleSignOut() {
    router.push("/auth");
  }

  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100">
        <header className="h-16 bg-gray-800 flex items-center justify-between px-8 border-b border-gray-700 shadow-sm">
          <h1 className="text-xl font-semibold text-white">
            Cupcakes Factory
            <span className="text-white font-normal ml-2">Kanban</span>
          </h1>

          {signedIn ? (
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-500 text-white font-medium px-4 py-2 rounded-md shadow"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-md shadow"
            >
              Sign In
            </button>
          )}
        </header>

        <div className="flex">
          {/* Sidebar */}
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
          </aside>

          {/* Kanban Board */}
          <main className="flex-1 p-6 overflow-x-auto h-[calc(100vh-64px)] bg-gray-900">
            {pathname === "/auth" ? (
              children
            ) : (
              mounted && (
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
                          tasks={tasks.filter((t) => t.column === column.id)}
                          color={column.color}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )
            )}
          </main>
        </div>
      </body>
    </html>
  );
}