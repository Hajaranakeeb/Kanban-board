"use client";

import "./globals.css";
import { NhostProvider, NhostClient } from "@nhost/nextjs";

// ✅ Correct Nhost client for your project
const nhost = new NhostClient({
  subdomain: "wsqqricwmbconuxefled",
  region: "us-west-2",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100">
        <NhostProvider nhost={nhost}>
          {children}
        </NhostProvider>
      </body>
    </html>
  );
}