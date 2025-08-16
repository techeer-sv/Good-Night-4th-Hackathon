"use client";
import Providers from "../_providers";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useToast } from "@/components/ToastProvider";

function EventsSandbox() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.events.list(),
    queryFn: () => apiFetch("/api/events"),
  });
  if (isLoading) return <div>Loading events…</div>;
  if (error) return <div className="text-red-600">Error loading events</div>;
  return <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>;
}

function ToastTestSection() {
  const { addToast } = useToast();

  const testToasts = [
    { label: 'Success Toast', type: 'success' as const, message: 'Operation completed successfully!' },
    { label: 'Error Toast', type: 'error' as const, message: 'Something went wrong.' },
    { label: 'Warning Toast', type: 'warning' as const, message: 'Please check your input.' },
    { label: 'Info Toast', type: 'info' as const, message: 'Here is some information.' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-md font-medium">Toast System Test</h2>
      <div className="grid grid-cols-2 gap-2">
        {testToasts.map((toast) => (
          <button
            key={toast.label}
            onClick={() => addToast(toast.message, toast.type)}
            className={`px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              toast.type === 'success' ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500' :
              toast.type === 'error' ? 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500' :
              toast.type === 'warning' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:ring-yellow-500' :
              'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500'
            }`}
          >
            {toast.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Providers>
      <div className="p-4 space-y-6">
        <h1 className="text-lg font-semibold">Sandbox</h1>
        
        <ToastTestSection />
        
        <div>
          <h2 className="text-md font-medium mb-2">React Query Test</h2>
          <EventsSandbox />
        </div>
      </div>
    </Providers>
  );
}
