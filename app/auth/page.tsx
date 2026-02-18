"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const backendURL = "http://localhost:4000"; // your backend URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (isSignUp) {
        // ===== SIGN UP =====
        const res = await fetch(`${backendURL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail, password }),
        });

        const data = await res.json();

        if (data.exists) {
          setMessage("Account already exists. Please sign in.");
          return;
        }

        // Initialize empty board for this user
        await fetch(`${backendURL}/board`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: normalizedEmail, columns: [], tasks: [] }),
        });

        localStorage.setItem("signedIn", normalizedEmail);
        router.push("/board");

      } else {
        // ===== SIGN IN =====
        const res = await fetch(`${backendURL}/users?email=${normalizedEmail}`);
        const data = await res.json();
        const user = data.user;

        if (!user) {
          setMessage("No account found for this email.");
          return;
        }

        if (user.password !== password) {
          setMessage("Wrong password.");
          return;
        }

        localStorage.setItem("signedIn", normalizedEmail);
        router.push("/board");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1f2235] text-white">
      <div className="bg-[#2a2d45] p-8 rounded-xl w-96">
        <h2 className="text-2xl mb-6 text-center">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>

        {message && (
          <p className="text-red-500 text-sm mb-2 text-center">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="p-2 rounded bg-[#3b3f5c] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded bg-[#3b3f5c] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-[#4c5072] hover:bg-[#5d6290] p-2 rounded-lg"
          >
            {isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p
          className="mt-4 text-center text-sm cursor-pointer hover:underline"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage("");
          }}
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </p>
      </div>
    </div>
  );
}