"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWalletStore } from "@/lib/store";
import { useState } from "react";

export default function CampaignDetailPage() {
  const { id } = useParams();
  const { address } = useWalletStore();
  const [isClaiming, setIsClaiming] = useState(false);

  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => api(`/campaigns/${id}`),
  });

  const { data: eligibility } = useQuery({
    queryKey: ["eligibility", id, address],
    queryFn: () => api(`/campaigns/${id}/eligibility`),
    enabled: !!address && !!campaign,
  });

  const handleClaim = async () => {
    if (!address) return alert("Please connect your wallet first");
    setIsClaiming(true);
    try {
      // For now, we simulate or call the API claim confirm
      // In a real app, this might involve a contract transaction
      await api(`/claims/confirm`, {
        method: "POST",
        body: JSON.stringify({ campaignId: id }),
      });
      alert("Claim successful!");
    } catch (err) {
      alert(`Claim failed: ${err.message}`);
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) return <div className="py-20 text-center">Loading campaign...</div>;
  if (error) return <div className="py-20 text-center text-red-400">Error: {error.message}</div>;

  const total = campaign.totalSupply || 0;
  const remaining = campaign.remainingSupply ?? 0;
  const progress = total ? Math.min(100, Math.round(((total - remaining) / total) * 100)) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <div className="aspect-square rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-700 text-6xl font-bold">
            NFT
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 uppercase tracking-wider">
                {campaign.eligibilityType}
              </span>
              <span className="text-zinc-500 text-sm">Created by {campaign.creatorAddress?.slice(0, 8)}...</span>
            </div>
            <h1 className="text-4xl font-extrabold">{campaign.name}</h1>
            <p className="text-zinc-400 leading-relaxed">{campaign.description}</p>
          </div>

          <div className="card space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Availability</span>
              <span className="font-bold">{remaining} / {total} left</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000" 
                style={{ width: `${progress}%` }} 
              />
            </div>

            <div className="pt-4">
              {!address ? (
                <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-zinc-500">
                  Connect your wallet to check eligibility
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border ${eligibility?.isEligible ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-rose-500/20 bg-rose-500/5 text-rose-400'} text-sm flex items-center justify-between`}>
                    <span>{eligibility?.isEligible ? 'You are eligible!' : 'Not eligible'}</span>
                    {!eligibility?.isEligible && <span className="text-xs opacity-70">{eligibility?.reason}</span>}
                  </div>
                  <button
                    onClick={handleClaim}
                    disabled={!eligibility?.isEligible || isClaiming || remaining === 0}
                    className="btn-primary w-full py-4 text-lg"
                  >
                    {isClaiming ? 'Claiming...' : remaining === 0 ? 'Sold Out' : 'Claim NFT'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
