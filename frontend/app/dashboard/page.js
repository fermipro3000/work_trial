"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWalletStore } from "@/lib/store";
import { CampaignCard } from "@/components/features/CampaignCard";

export default function DashboardPage() {
  const { address } = useWalletStore();

  const { data: eligible, isLoading: loadingEligible } = useQuery({
    queryKey: ["eligible-campaigns", address],
    queryFn: () => api("/users/me/eligible"),
    enabled: !!address,
  });

  const { data: claims, isLoading: loadingClaims } = useQuery({
    queryKey: ["my-claims", address],
    queryFn: () => api("/users/me/claims"),
    enabled: !!address,
  });

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <p className="text-zinc-500">Connect your wallet to view your eligible campaigns and claim history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-bold">Welcome back</h1>
        <p className="text-zinc-500 mt-2">{address}</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Eligible for You</h2>
        {loadingEligible ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((i) => <div key={i} className="card h-64 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eligible?.campaigns?.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
            {eligible?.campaigns?.length === 0 && (
              <p className="text-zinc-500">No new eligible campaigns found.</p>
            )}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Claim History</h2>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Campaign</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {claims?.map((claim) => (
                <tr key={claim.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{claim.campaignName}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase text-emerald-400">
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!claims || claims.length === 0) && !loadingClaims && (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-zinc-500">
                    You haven't claimed any NFTs yet.
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
