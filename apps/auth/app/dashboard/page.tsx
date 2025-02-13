"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signup");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const routeStatus = {
    "/auth/signup": "Sign Out",
    "/profile": "Profile"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-2 mt-4">
            {Object.entries(routeStatus).map(([route, text]) => (
              <button
                key={route}
                onClick={() => {
                  router.push(route);
                  session?.user?.email;
                }}
                variant="outline"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="space-y-4">
            {session?.user?.email && (
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1">{session?.user?.email}</p>
              </div>
            )}
            {session?.user?.role && (
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="mt-1">{session?.user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}