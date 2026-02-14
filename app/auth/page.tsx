"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailKey = `user-${email.trim().toLowerCase()}`;
    const savedUser = JSON.parse(localStorage.getItem(emailKey) || "null");

    if (isSignUp) {
      if (savedUser) {
        setMessage("Account already exists. Please sign in.");
        return;
      }
      // Save new user
      localStorage.setItem(emailKey, JSON.stringify({ email, password }));
      localStorage.setItem("signedIn", email); // track signed-in email
      router.push("/board");
    } else {
      if (!savedUser) {
        setMessage("No account found for this email.");
        return;
      }
      if (savedUser.password !== password) {
        setMessage("Wrong password.");
        return;
      }
      localStorage.setItem("signedIn", email); // track signed-in email
      router.push("/board");
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