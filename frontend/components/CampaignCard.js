import Link from "next/link";

const BADGES = {
  public: "Public",
  whitelist: "Whitelist",
  erc20: "Token Holders",
  erc721: "NFT Holders",
  role: "Guild",
  multi: "Multi",
};

const STATUS_CLASSES = {
  active: "bg-emerald-500/10 text-emerald-200",
  draft: "bg-slate-500/10 text-slate-200",
  pending_review: "bg-amber-500/10 text-amber-200",
  cancelled: "bg-rose-500/10 text-rose-200",
};

export function CampaignCard({ campaign }) {
  const badge = BADGES[campaign.eligibilityType] || campaign.eligibilityType;
  const statusClass = STATUS_CLASSES[campaign.status] || "bg-white/10 text-white";
  const total = campaign.totalSupply || 0;
  const remaining = campaign.remainingSupply ?? 0;
  const progress = total ? Math.min(100, Math.round(((total - remaining) / total) * 100)) : 0;

  return (
    <Link href={`/campaign/${campaign.id}`} className="card block overflow-hidden border-white/10 transition hover:-translate-y-1 hover:border-brand-500/60 hover:bg-white/5">
      <div className="relative overflow-hidden rounded-xl bg-slate-950/60">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70" />
        <div className="relative p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold leading-tight">{campaign.name}</h3>
            <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] ${statusClass}`}>
              {campaign.status.replace("_", " ")}
            </span>
          </div>
          <p className="mb-4 min-h-[3rem] text-sm text-[var(--muted)] line-clamp-3">
            {campaign.description || "No description available."}
          </p>
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-brand-500/15 px-3 py-1 text-brand-200">{badge}</span>
            {campaign.nftContractAddress ? (
              <span className="rounded-full bg-white/5 px-3 py-1">{campaign.nftContractAddress.slice(0, 8)}…</span>
            ) : null}
          </div>
          <div className="space-y-2 text-sm text-[var(--muted)]">
            <div className="flex items-center justify-between">
              <span>Supply</span>
              <span className="font-semibold text-white">{remaining} / {total}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
