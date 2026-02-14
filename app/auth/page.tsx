"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const storedUserRaw = localStorage.getItem("user");
    const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

    if (isSignUp) {
      // Signing up
      if (!email || !password) {
        setError("Please enter email and password.");
        return;
      }

      if (storedUser && storedUser.email === email) {
        setError("Email already exists. Please sign in.");
        return;
      }

      // Save new user
      localStorage.setItem("user", JSON.stringify({ email, password }));
      localStorage.setItem("signedIn", "true");
      router.push("/board");
    } else {
      // Signing in
      if (!storedUser) {
        setError("No account found. Please sign up first.");
        return;
      }

      if (storedUser.email !== email) {
        setError("No account found with this email.");
        return;
      }

      if (storedUser.password !== password) {
        setError("Wrong password.");
        return;
      }

      // Correct credentials
      localStorage.setItem("signedIn", "true");
      router.push("/board");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1f2235] text-white">
      <div className="bg-[#2a2d45] p-8 rounded-xl w-96">
        <h2 className="text-2xl mb-6 text-center">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    setError(null); // clear error when user types
  }}
  className="p-2 rounded bg-[#3b3f5c] outline-none"
  required
/>

<input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => {
    setPassword(e.target.value);
    setError(null); // clear error when user types
  }}
  className="p-2 rounded bg-[#3b3f5c] outline-none"
  required
/>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-[#4c5072] hover:bg-[#5d6290] p-2 rounded-lg"
          >
            {isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Toggle link */}
        <p
          className="mt-4 text-center text-sm cursor-pointer hover:underline"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
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