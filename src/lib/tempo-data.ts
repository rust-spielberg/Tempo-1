export type EvidenceTag = "Bullish" | "Bearish" | "FUD";

export type Evidence = {
  source: string;
  text: string;
  tag: EvidenceTag;
};

export type Asset = {
  id: string;
  symbol: string;
  name: string;
  category: "Crypto" | "Tech Stocks" | "Index";
  price: number;
  change: number;
  volume: number;
  vibe: number;
  liquidations: number;
  volatility: number;
  socialVelocity: number;
  explanation: string;
  evidence: Evidence[];
};

export const ASSETS: Asset[] = [
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    category: "Crypto",
    price: 94820.45,
    change: 2.84,
    volume: 48_200_000_000,
    vibe: 78,
    liquidations: 24,
    volatility: 38,
    socialVelocity: 71,
    explanation:
      "Spot demand is absorbing every dip without forcing leverage, so the tape feels unusually quiet for this price level. Traders are adding size instead of shouting about it — the classic signature of silent accumulation.",
    evidence: [
      { source: "Reuters", text: "Spot ETF inflows post a fourth consecutive positive week.", tag: "Bullish" },
      { source: "@chainwatch", text: "Exchange balances keep draining into cold storage.", tag: "Bullish" },
      { source: "Desk note", text: "Funding rates flat — no crowded long to punish.", tag: "Bullish" },
      { source: "r/finance", text: "Still calling it a bull trap before the halving unwind.", tag: "FUD" },
    ],
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    category: "Crypto",
    price: 3128.9,
    change: -6.42,
    volume: 21_600_000_000,
    vibe: 22,
    liquidations: 81,
    volatility: 76,
    socialVelocity: 88,
    explanation:
      "A cascade of leveraged longs unwound in under an hour, and every bounce is being sold into by desks cutting risk. Social channels have flipped from roadmap talk to exit talk, which is what severe panic sounds like.",
    evidence: [
      { source: "Bloomberg", text: "Perp liquidations top $410M in a single session.", tag: "Bearish" },
      { source: "@deskflow", text: "Market makers pulling bids below the weekly low.", tag: "Bearish" },
      { source: "X / crypto", text: "Rumours of a large validator unstake queue.", tag: "FUD" },
      { source: "Analyst", text: "Fee revenue still trending up despite the flush.", tag: "Bullish" },
    ],
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    category: "Crypto",
    price: 212.37,
    change: 4.91,
    volume: 6_400_000_000,
    vibe: 84,
    liquidations: 18,
    volatility: 52,
    socialVelocity: 93,
    explanation:
      "Throughput headlines and a fresh wave of app launches are pulling in speculative flow faster than sellers can supply it. The mood is euphoric but coherent — momentum with a story attached.",
    evidence: [
      { source: "The Block", text: "Daily active addresses hit an all-time high.", tag: "Bullish" },
      { source: "@onchainlens", text: "Two new consumer apps cross 100k wallets in a week.", tag: "Bullish" },
      { source: "Trader chat", text: "Outage risk is still the tail nobody prices.", tag: "FUD" },
      { source: "Desk note", text: "Perp open interest crowding on the long side.", tag: "Bearish" },
    ],
  },
  {
    id: "nvda",
    symbol: "NVDA",
    name: "Nvidia",
    category: "Tech Stocks",
    price: 1284.16,
    change: 1.12,
    volume: 34_900_000_000,
    vibe: 64,
    liquidations: 12,
    volatility: 44,
    socialVelocity: 58,
    explanation:
      "Guidance keeps clearing an already brutal bar, so positioning is confident rather than frantic. Options flow leans protective, which caps the euphoria without breaking the trend.",
    evidence: [
      { source: "CNBC", text: "Hyperscaler capex guidance revised upward again.", tag: "Bullish" },
      { source: "Sell-side", text: "Supply constraints ease into next quarter.", tag: "Bullish" },
      { source: "@macroquant", text: "Concentration risk in index weighting is extreme.", tag: "Bearish" },
    ],
  },
  {
    id: "tsla",
    symbol: "TSLA",
    name: "Tesla",
    category: "Tech Stocks",
    price: 268.44,
    change: -3.27,
    volume: 18_100_000_000,
    vibe: 34,
    liquidations: 46,
    volatility: 68,
    socialVelocity: 82,
    explanation:
      "Delivery scepticism has become the base case, and every rally is met with supply from holders looking for an exit. Sentiment is fearful but not yet capitulating — volatility stays elevated.",
    evidence: [
      { source: "Reuters", text: "Regional delivery estimates trimmed by two brokers.", tag: "Bearish" },
      { source: "@evdata", text: "Discounting widens across two major markets.", tag: "Bearish" },
      { source: "Forum", text: "Energy storage margin story is still underrated.", tag: "Bullish" },
      { source: "X", text: "Recall chatter spreading without confirmation.", tag: "FUD" },
    ],
  },
  {
    id: "spx",
    symbol: "SPX",
    name: "S&P 500",
    category: "Index",
    price: 5942.18,
    change: 0.38,
    volume: 92_000_000_000,
    vibe: 57,
    liquidations: 9,
    volatility: 26,
    socialVelocity: 41,
    explanation:
      "Breadth is narrow but stable, and implied volatility keeps bleeding lower as macro prints land in line. The market is calm in a way that reads as complacency rather than conviction.",
    evidence: [
      { source: "WSJ", text: "Inflation print lands in line with consensus.", tag: "Bullish" },
      { source: "Desk note", text: "Vol sellers dominate the front of the curve.", tag: "Bullish" },
      { source: "@breadthbot", text: "Only 38% of members above their 50-day average.", tag: "Bearish" },
    ],
  },
];

export function vibeLabel(vibe: number): { label: string; tone: "ice" | "panic" } {
  if (vibe >= 75) return { label: "Silent Euphoria", tone: "ice" };
  if (vibe >= 60) return { label: "Silent Accumulation", tone: "ice" };
  if (vibe >= 45) return { label: "Calm Drift", tone: "ice" };
  if (vibe >= 30) return { label: "Rising Fear", tone: "panic" };
  return { label: "Severe Panic", tone: "panic" };
}
