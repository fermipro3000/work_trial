"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CampaignCard } from "@/components/features/CampaignCard";

const statusOptions = ["", "active", "draft", "pending_review"];
const eligibilityOptions = ["", "public", "whitelist", "erc20", "erc721", "role", "multi"];

export default function HomePage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [eligibilityType, setEligibilityType] = useState("");

  const queryKey = useMemo(
    () => ["campaigns", { status, eligibilityType, search }],
    [status, eligibilityType, search]
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (eligibilityType) params.set("eligibilityType", eligibilityType);
      if (search) params.set("q", search);
      return api(`/campaigns?${params.toString()}`);
    },
  });

  const campaigns = data?.campaigns || [];

  return (
    <div className="space-y-12">
      <section className="space-y-8">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            The future of <span className="text-blue-500">NFT Airdrops</span> is here.
          </h1>
          <p className="text-lg text-zinc-400">
            Discover, verify, and claim exclusive NFT rewards from top creators. 
            Filtered, vetted, and decentralized.
          </p>
        </div>

        <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-[1fr_auto_auto]">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Search</label>
            <input
              className="input"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Status</label>
            <select
              className="input min-w-[160px]"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {statusOptions.filter(Boolean).map((opt) => (
                <option key={opt} value={opt}>{opt.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Eligibility</label>
            <select
              className="input min-w-[160px]"
              value={eligibilityType}
              onChange={(e) => setEligibilityType(e.target.value)}
            >
              <option value="">All Types</option>
              {eligibilityOptions.filter(Boolean).map((opt) => (
                <option key={opt} value={opt}>{opt.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Campaigns</h2>
          <span className="text-sm text-zinc-500">
            {isLoading ? "Loading..." : `${campaigns.length} results`}
          </span>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            Error loading campaigns: {error.message}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-64 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
            {campaigns.length === 0 && !isLoading && (
              <div className="col-span-full py-20 text-center text-zinc-500">
                No campaigns found matching your criteria.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
