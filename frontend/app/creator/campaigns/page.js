"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWalletStore } from "@/lib/store";
import Link from "next/link";

export default function CreatorCampaignsPage() {
  const { address } = useWalletStore();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["creator-campaigns", address],
    queryFn: () => api("/campaigns?creator=true"),
    enabled: !!address,
  });

  if (!address) return <div className="py-20 text-center">Please connect your wallet to manage campaigns.</div>;

  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">My Campaigns</h1>
          <p className="text-zinc-500 mt-2">Manage your airdrop campaigns and view analytics.</p>
        </div>
        <Link href="/creator/campaigns/new" className="btn-primary">
          Create New
        </Link>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns?.campaigns?.map((c) => (
          <div key={c.id} className="card group relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                  {c.status}
                </span>
                <Link href={`/creator/campaigns/${c.id}/edit`} className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Edit Details
                </Link>
              </div>
              <h3 className="text-xl font-bold">{c.name}</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Claims</span>
                <span className="font-medium">{c.totalSupply - c.remainingSupply} / {c.totalSupply}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${((c.totalSupply - c.remainingSupply) / c.totalSupply) * 100}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
        {campaigns?.campaigns?.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-zinc-500">
            You haven't created any campaigns yet.
          </div>
        )}
      </div>
    </div>
  );
}
