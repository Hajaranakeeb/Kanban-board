"use client";

import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = () => {
    router.push("/auth");
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-[#3b3f5c] hover:bg-[#4c5072] px-4 py-2 rounded-lg"
    >
      Sign Out
    </button>
  );
}