"use client";

import { useState } from "react";
import { useNhostClient } from "@nhost/nextjs";

export default function Column({ column }: any) {
  const nhost = useNhostClient();
  const [tasks, setTasks] = useState(column.tasks || []);
  const [newTask, setNewTask] = useState("");

  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      const mutation = `
        mutation AddTask($content: String!, $columnId: uuid!) {
          insert_tasks_one(object: { content: $content, column: $columnId }) {
            id
            content
            color
          }
        }
      `;
      const response = await nhost.graphql.request(mutation, {
        content: newTask,
        columnId: column.id,
      });
      if (response.error) throw response.error;
      const newTaskData = response.data?.insert_tasks_one;
      if (newTaskData) setTasks([...tasks, newTaskData]);
      setNewTask("");
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg min-w-62.5 shrink-0">
      <h3 className="font-semibold mb-2" style={{ color: column.color }}>
        {column.title}
      </h3>

      <div className="flex flex-col gap-2 mb-2">
        {tasks.map((task: any) => (
          <div key={task.id} className="p-2 rounded bg-gray-600">
            {task.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 p-1 rounded bg-gray-600 outline-none"
          placeholder="Add task"
        />
        <button
          onClick={addTask}
          className="bg-gray-500 hover:bg-gray-400 p-1 rounded"
        >
          +
        </button>
      </div>
    </div>
  );
}