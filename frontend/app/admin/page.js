"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWalletStore } from "@/lib/store";

export default function AdminPage() {
  const { address } = useWalletStore();
  const queryClient = useQueryClient();

  const { data: pending, isLoading } = useQuery({
    queryKey: ["admin-pending"],
    queryFn: () => api("/admin/pending"),
    enabled: !!address,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, comment }) => 
      api(`/admin/campaigns/${id}/review`, {
        method: "POST",
        body: JSON.stringify({ status, comment }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-pending"]);
      alert("Review submitted successfully");
    },
  });

  if (!address) return <div className="py-20 text-center">Please connect your admin wallet.</div>;

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-bold">Admin Panel</h1>
        <p className="text-zinc-500 mt-2">Manage and review campaign submissions.</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Pending Reviews</h2>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Campaign</th>
                <th className="px-6 py-4 font-medium">Creator</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pending?.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-zinc-500">{c.creatorAddress?.slice(0, 8)}...</td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-blue-500/10 px-2 py-1 text-xs text-blue-400">
                      {c.eligibilityType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => reviewMutation.mutate({ id: c.id, status: 'active', comment: 'Approved' })}
                      className="text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => reviewMutation.mutate({ id: c.id, status: 'draft', comment: 'Rejected' })}
                      className="text-rose-400 hover:text-rose-300 font-medium"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {(!pending || pending.length === 0) && !isLoading && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-zinc-500">
                    No pending campaigns to review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
