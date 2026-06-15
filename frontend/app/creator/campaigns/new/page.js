"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    totalSupply: 100,
    eligibilityType: "public",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/campaigns", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push("/creator/campaigns");
    } catch (err) {
      alert(`Failed to create: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-bold">Create Campaign</h1>
        <p className="text-zinc-500 mt-2">Set up your airdrop details and eligibility rules.</p>
      </header>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Campaign Name</label>
          <input
            required
            className="input"
            placeholder="e.g. Genesis NFT Airdrop"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400">Description</label>
          <textarea
            required
            className="input min-h-[120px] py-3"
            placeholder="Tell your community about this airdrop..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Total Supply</label>
            <input
              required
              type="number"
              className="input"
              value={form.totalSupply}
              onChange={(e) => setForm({ ...form, totalSupply: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Eligibility Type</label>
            <select
              className="input"
              value={form.eligibilityType}
              onChange={(e) => setForm({ ...form, eligibilityType: e.target.value })}
            >
              <option value="public">Public</option>
              <option value="whitelist">Whitelist (Merkle)</option>
              <option value="erc20">ERC-20 Holders</option>
              <option value="erc721">ERC-721 Holders</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="btn-ghost flex-1"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
}
