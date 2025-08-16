"use client";
import Providers from "../_providers";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

function EventsSandbox() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.events.list(),
    queryFn: () => apiFetch("/api/events"),
  });
  if (isLoading) return <div>Loading events…</div>;
  if (error) return <div className="text-red-600">Error loading events</div>;
  return <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>;
}

export default function Page() {
  return (
    <Providers>
      <div className="p-4 space-y-4">
        <h1 className="text-lg font-semibold">Sandbox</h1>
        <EventsSandbox />
      </div>
    </Providers>
  );
}
