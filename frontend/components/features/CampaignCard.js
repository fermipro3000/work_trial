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
  active: "bg-emerald-500/10 text-emerald-400",
  draft: "bg-zinc-500/10 text-zinc-400",
  pending_review: "bg-amber-500/10 text-amber-400",
  cancelled: "bg-rose-500/10 text-rose-400",
};

export function CampaignCard({ campaign }) {
  const badge = BADGES[campaign.eligibilityType] || campaign.eligibilityType;
  const statusClass = STATUS_CLASSES[campaign.status] || "bg-white/10 text-white";
  const total = campaign.totalSupply || 0;
  const remaining = campaign.remainingSupply ?? 0;
  const progress = total ? Math.min(100, Math.round(((total - remaining) / total) * 100)) : 0;

  return (
    <Link 
      href={`/campaign/${campaign.id}`} 
      className="card block overflow-hidden hover:-translate-y-1 hover:border-blue-500/50 hover:bg-white/10"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold leading-tight">{campaign.name}</h3>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
            {campaign.status.replace("_", " ")}
          </span>
        </div>
        
        <p className="text-sm text-zinc-400 line-clamp-2 min-h-[2.5rem]">
          {campaign.description || "No description provided."}
        </p>
        
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
            {badge}
          </span>
          {campaign.nftContractAddress && (
            <span className="rounded-lg bg-white/5 px-3 py-1 text-xs text-zinc-500">
              {campaign.nftContractAddress.slice(0, 6)}...
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Progress</span>
            <span className="font-semibold">{remaining} / {total} left</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div 
              className="h-full bg-blue-500 transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
