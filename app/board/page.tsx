"use client";

import { useEffect, useState } from "react";
import { useNhostClient, useUserId } from "@nhost/nextjs";
import { useRouter } from "next/navigation";
import Column from "../components/Column";

export default function BoardPage() {
  const router = useRouter();
  const userId = useUserId();
  const nhost = useNhostClient();
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      router.push("/auth");
      return;
    }

    const fetchBoards = async () => {
      setLoading(true);
      try {
        const query = `
          query GetBoards($userId: uuid!) {
            boards(where: { user: { _eq: $userId } }) {
              id
              title
              color
              columns {
                id
                title
                color
                tasks {
                  id
                  content
                  color
                }
              }
            }
          }
        `;
        const response = await nhost.graphql.request(query, { userId });
        if (response.error) throw response.error;
        setBoards(response.data?.boards || []);
      } catch (err) {
        console.error("Error fetching board:", err);
        setBoards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [userId, router, nhost]);

  if (loading) return <div className="p-4">Loading boards...</div>;

  return (
    <div className="p-4 flex flex-col gap-6">
      {boards.map((board: any) => (
        <div
          key={board.id}
          className="border rounded-lg p-4"
          style={{ backgroundColor: board.color }}
        >
          <h2 className="text-xl font-bold mb-4">{board.title}</h2>
          <div className="flex gap-4 overflow-x-auto">
            {board.columns.map((column: any) => (
              <Column key={column.id} column={column} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}