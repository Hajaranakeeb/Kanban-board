"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const signedIn = localStorage.getItem("signedIn");
    if (signedIn) router.replace("/board"); // redirect if already signed in
    setMounted(true);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("signedIn", "true");
    router.push("/board");
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-sky-300 text-black">
      {/* Sidebar */}
      <aside className="w-64 bg-yellow-200 p-6 flex flex-col items-center justify-center border-r border-black">
        <div className="p-4 bg-pink-100 rounded shadow text-center font-semibold text-black">
          🌸 Welcome to your Planner 🌸
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-pink-300 p-8 rounded-xl w-96 shadow-lg">
          <h2 className="text-2xl mb-6 text-center font-semibold text-black">
            {isSignUp ? "Sign Up" : "Sign In"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              className="p-2 rounded border border-black outline-none"
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="p-2 rounded border border-black outline-none"
              required
            />

            <button
              type="submit"
              className="bg-sky-200 hover:bg-sky-300 p-2 rounded-lg border border-black text-black"
            >
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p
            className="mt-4 text-center text-sm cursor-pointer hover:underline text-black"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </p>
        </div>
      </main>
    </div>
  );
}