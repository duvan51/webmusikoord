"use client";

import Sidebar from "./sidebar";
//import Topbar from "@/components/dash/Topbar";

export default function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--background-end)] transition-colors duration-500">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <main className="p-4 md:p-8 h-full">
          <div className="glass-card rounded-[2.5rem] min-h-[calc(100vh-4rem)] p-6 md:p-10 shadow-2xl overflow-hidden relative">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full -ml-48 -mb-48"></div>

            <div className="relative z-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
