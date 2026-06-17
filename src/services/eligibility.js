const {
  isBlacklisted,
  getClaimedTotal,
  getWhitelistEntry,
  upsertEligibilityCache,
} = require("../db/repository");
const { verifyProof } = require("./merkle");
const { ethers } = require("ethers");
const { config } = require("../config");

const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

// In-memory cache for eligibility results to boost performance
// Maps "userId:campaignId:wallet" or "null:campaignId:wallet" to { result, expires }
const eligibilityResultCache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

async function checkEligibility(userId, wallet, campaign) {
  const cacheKey = `${userId || "null"}:${campaign.id}:${wallet.toLowerCase()}`;
  const cached = eligibilityResultCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.result;
  }

  const reasons = [];
  let eligible = true;

  if (await isBlacklisted(wallet)) {
    const result = { eligible: false, reasons: ["Wallet is blacklisted"] };
    eligibilityResultCache.set(cacheKey, { result, expires: Date.now() + CACHE_TTL });
    return result;
  }

  const claimed = await getClaimedTotal(campaign.id, wallet);
  if (claimed >= campaign.max_claims_per_wallet) {
    const result = {
      eligible: false,
      reasons: ["Already claimed maximum for this campaign"],
    };
    eligibilityResultCache.set(cacheKey, { result, expires: Date.now() + CACHE_TTL });
    return result;
  }

  if (campaign.status !== "active") {
    const result = { eligible: false, reasons: [`Campaign status: ${campaign.status}`] };
    eligibilityResultCache.set(cacheKey, { result, expires: Date.now() + CACHE_TTL });
    return result;
  }

  const now = new Date();
  if (campaign.start_time && new Date(campaign.start_time) > now) {
    reasons.push("Campaign has not started");
    eligible = false;
  }
  if (campaign.end_time && new Date(campaign.end_time) < now) {
    reasons.push("Campaign has ended");
    eligible = false;
  }
  if (campaign.remaining_supply <= 0) {
    reasons.push("No supply remaining");
    eligible = false;
  }

  const type = campaign.eligibility_type;
  const cfg = campaign.eligibility_config || {};

  if (type === "public") {
    /* passes */
  } else if (type === "whitelist") {
    const entry = await getWhitelistEntry(campaign.id, wallet);
    if (!entry) {
      reasons.push("Not on whitelist");
      eligible = false;
    } else if (campaign.merkle_root) {
      const ok = verifyProof(
        wallet,
        entry.allocation,
        entry.merkle_proof || [],
        campaign.merkle_root
      );
      if (!ok) {
        reasons.push("Invalid Merkle proof");
        eligible = false;
      }
    }
  } else if (type === "erc20") {
    try {
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      const contract = new ethers.Contract(
        cfg.contractAddress,
        ERC20_ABI,
        provider
      );
      const balance = await contract.balanceOf(wallet);
      const min = BigInt(cfg.minBalance || 0);
      if (balance < min) {
        reasons.push(`ERC-20 balance below minimum (${cfg.minBalance})`);
        eligible = false;
      }
    } catch {
      reasons.push("Could not verify ERC-20 balance");
      eligible = false;
    }
  } else if (type === "erc721") {
    reasons.push(
      "NFT holding check: configure RPC and contract in eligibility_config"
    );
    if (!cfg.contractAddress) eligible = false;
  } else if (type === "multi") {
    if (cfg.requireAll) {
      reasons.push("Multi-condition: verify task completions in dashboard");
    }
  }

  const result = { eligible, reasons };
  eligibilityResultCache.set(cacheKey, { result, expires: Date.now() + CACHE_TTL });

  if (userId) {
    // Also update the persistence layer cache if needed
    await upsertEligibilityCache(userId, campaign.id, eligible, reasons).catch(err => {
        console.error("Failed to update persistent eligibility cache:", err);
    });
  }

  return result;
}

module.exports = { checkEligibility };
