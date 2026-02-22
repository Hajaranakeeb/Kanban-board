"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AppPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    // Example: store signed-in status
    localStorage.setItem("signedIn", "true");

    router.push("/board");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#8cadd3] text-white">
      <div className="bg-[#f0c7e3] p-8 rounded-xl w-96">
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
            className="p-2 rounded bg-[#cf9bcc] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded bg-[#c788c3] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-[#f3ebbe] hover:bg-[#296ea6] p-2 rounded-lg text-black"
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