"use client";

import Sidebar from "./sidebar";
//import Topbar from "@/components/dash/Topbar";

export default function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        {/**<Topbar /> */}
        <main className="p-6 overflow-y-auto">
          <div
            className="min-h-screen flex flex-col"
            style={{
              background: "linear-gradient(180deg, #251a4e 0%, #100929 100%)",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
