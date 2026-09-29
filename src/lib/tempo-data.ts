export type EvidenceTag = "Bullish" | "Bearish" | "FUD";
export type AssetCategory = "crypto" | "forex";

export type Evidence = {
  source: string;
  text: string;
  tag: EvidenceTag;
};

export type Asset = {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change: number;
  sparkline: number[];
  volume: number;
  vibe: number;
  liquidations: number;
  volatility: number;
  socialVelocity: number;
  explanation: string;
  evidence: Evidence[];
};

type AssetSeed = readonly [symbol: string, name: string, price: number, change: number];

const CRYPTO_SEEDS: AssetSeed[] = [
  ["BTC", "Bitcoin", 94820.45, 2.84], ["ETH", "Ethereum", 3128.9, -6.42],
  ["USDT", "Tether", 1, 0.02], ["XRP", "XRP", 2.41, 4.12],
  ["BNB", "BNB", 682.14, 1.73], ["SOL", "Solana", 212.37, 4.91],
  ["USDC", "USD Coin", 1, -0.01], ["DOGE", "Dogecoin", 0.1842, 5.36],
  ["ADA", "Cardano", 0.7421, -1.83], ["TRX", "TRON", 0.2384, 0.76],
  ["AVAX", "Avalanche", 38.72, 3.21], ["LINK", "Chainlink", 18.46, 2.19],
  ["SUI", "Sui", 3.74, 6.82], ["XLM", "Stellar", 0.426, -0.92],
  ["TON", "Toncoin", 5.28, 1.42], ["SHIB", "Shiba Inu", 0.0000214, 3.48],
  ["HBAR", "Hedera", 0.284, 2.71], ["DOT", "Polkadot", 7.13, -2.24],
  ["BCH", "Bitcoin Cash", 482.68, 1.92], ["UNI", "Uniswap", 11.24, -1.14],
  ["LTC", "Litecoin", 104.32, 0.87], ["PEPE", "Pepe", 0.0000128, 8.14],
  ["NEAR", "NEAR Protocol", 5.86, 3.78], ["APT", "Aptos", 10.42, -0.66],
  ["ICP", "Internet Computer", 12.64, 1.26], ["AAVE", "Aave", 342.18, 4.56],
  ["ETC", "Ethereum Classic", 28.44, -1.37], ["POL", "POL (ex-MATIC)", 0.512, 2.04],
  ["CRO", "Cronos", 0.132, 0.54], ["RENDER", "Render", 8.72, 5.18],
  ["VET", "VeChain", 0.0472, -0.84], ["FIL", "Filecoin", 5.94, 2.23],
  ["ATOM", "Cosmos", 7.84, -1.56], ["ARB", "Arbitrum", 0.918, 3.11],
  ["ALGO", "Algorand", 0.284, 1.68], ["OP", "Optimism", 2.14, -2.08],
  ["KAS", "Kaspa", 0.164, 4.07], ["MKR", "Maker", 1842.6, 0.93],
  ["INJ", "Injective", 26.42, 5.73], ["STX", "Stacks", 1.92, 2.88],
  ["IMX", "Immutable", 1.74, -0.47], ["GRT", "The Graph", 0.238, 1.34],
  ["THETA", "Theta Network", 2.16, -1.09], ["RUNE", "THORChain", 4.82, 3.62],
  ["FET", "Artificial Superintelligence Alliance", 1.58, 6.14], ["BONK", "Bonk", 0.000027, 7.42],
  ["JUP", "Jupiter", 1.06, 2.52], ["LDO", "Lido DAO", 1.94, -2.73],
  ["TIA", "Celestia", 5.46, 4.28], ["SEI", "Sei", 0.482, 3.94],
];

const FOREX_SEEDS: AssetSeed[] = [
  ["EUR/USD", "Euro / US Dollar", 1.0862, -0.34], ["USD/JPY", "US Dollar / Japanese Yen", 157.84, 1.12],
  ["GBP/USD", "British Pound / US Dollar", 1.2714, 0.41], ["AUD/USD", "Australian Dollar / US Dollar", 0.6548, -0.28],
  ["USD/CAD", "US Dollar / Canadian Dollar", 1.3718, 0.22], ["NZD/USD", "New Zealand Dollar / US Dollar", 0.6084, -0.46],
  ["EUR/GBP", "Euro / British Pound", 0.8542, -0.18], ["EUR/JPY", "Euro / Japanese Yen", 171.44, 0.78],
  ["GBP/JPY", "British Pound / Japanese Yen", 200.74, 1.08], ["AUD/JPY", "Australian Dollar / Japanese Yen", 103.36, 0.64],
  ["EUR/AUD", "Euro / Australian Dollar", 1.6588, -0.12], ["GBP/AUD", "British Pound / Australian Dollar", 1.9416, 0.36],
  ["AUD/NZD", "Australian Dollar / New Zealand Dollar", 1.0762, 0.19], ["USD/CHF", "US Dollar / Swiss Franc", 0.8974, 0.31],
  ["EUR/CHF", "Euro / Swiss Franc", 0.9748, -0.08], ["GBP/CHF", "British Pound / Swiss Franc", 1.1408, 0.47],
  ["CAD/JPY", "Canadian Dollar / Japanese Yen", 115.06, 0.52], ["NZD/JPY", "New Zealand Dollar / Japanese Yen", 96.04, 0.43],
  ["CHF/JPY", "Swiss Franc / Japanese Yen", 175.84, 0.67], ["EUR/CAD", "Euro / Canadian Dollar", 1.4896, -0.16],
  ["GBP/CAD", "British Pound / Canadian Dollar", 1.7438, 0.29], ["AUD/CAD", "Australian Dollar / Canadian Dollar", 0.8982, -0.21],
  ["NZD/CAD", "New Zealand Dollar / Canadian Dollar", 0.8346, -0.35], ["CAD/CHF", "Canadian Dollar / Swiss Franc", 0.6542, 0.11],
  ["NZD/CHF", "New Zealand Dollar / Swiss Franc", 0.5461, -0.26], ["AUD/CHF", "Australian Dollar / Swiss Franc", 0.5874, -0.09],
  ["EUR/NZD", "Euro / New Zealand Dollar", 1.7856, 0.24], ["GBP/NZD", "British Pound / New Zealand Dollar", 2.0874, 0.58],
  ["USD/SGD", "US Dollar / Singapore Dollar", 1.3482, 0.14], ["EUR/SGD", "Euro / Singapore Dollar", 1.4644, -0.11],
  ["GBP/SGD", "British Pound / Singapore Dollar", 1.7142, 0.33], ["USD/HKD", "US Dollar / Hong Kong Dollar", 7.8128, 0.03],
  ["USD/CNH", "US Dollar / Offshore Yuan", 7.2642, 0.27], ["USD/MXN", "US Dollar / Mexican Peso", 17.842, -0.64],
  ["USD/ZAR", "US Dollar / South African Rand", 18.264, -0.42], ["USD/TRY", "US Dollar / Turkish Lira", 34.218, 0.38],
  ["USD/SEK", "US Dollar / Swedish Krona", 10.482, -0.17], ["USD/NOK", "US Dollar / Norwegian Krone", 10.684, -0.22],
  ["EUR/SEK", "Euro / Swedish Krona", 11.386, -0.48], ["EUR/NOK", "Euro / Norwegian Krone", 11.604, -0.39],
  ["GBP/NOK", "British Pound / Norwegian Krone", 13.582, 0.09], ["GBP/SEK", "British Pound / Swedish Krona", 13.326, 0.16],
  ["EUR/PLN", "Euro / Polish Zloty", 4.286, -0.13], ["USD/PLN", "US Dollar / Polish Zloty", 3.946, 0.21],
  ["USD/BRL", "US Dollar / Brazilian Real", 5.482, -0.31], ["USD/INR", "US Dollar / Indian Rupee", 83.54, 0.08],
  ["USD/KRW", "US Dollar / South Korean Won", 1378.4, 0.44], ["USD/THB", "US Dollar / Thai Baht", 36.72, 0.18],
  ["USD/AED", "US Dollar / UAE Dirham", 3.6725, 0.01], ["USD/SAR", "US Dollar / Saudi Riyal", 3.7512, 0.01],
];

function hashText(text: string) {
  return [...text].reduce((total, character) => total + character.charCodeAt(0), 0);
}

function createSparkline(price: number, change: number, seed: number) {
  return Array.from({ length: 20 }, (_, index) => {
    const progress = index / 19;
    const wave = Math.sin((index + seed) * 0.82) * 0.004 + Math.cos((index + seed) * 0.37) * 0.002;
    return Number((price * (1 - change / 100 + (change / 100) * progress + wave)).toPrecision(7));
  });
}

function createAsset(seed: AssetSeed, category: AssetCategory, index: number): Asset {
  const [symbol, name, price, change] = seed;
  const hash = hashText(symbol);
  const vibe = Math.max(12, Math.min(91, Math.round(54 + change * 5 + ((hash % 17) - 8))));
  const positive = change >= 0;
  const categoryText = category === "crypto" ? "digital-asset" : "currency";

  return {
    id: `${category}-${symbol.toLowerCase().replaceAll("/", "-")}`,
    symbol,
    name,
    category,
    price,
    change,
    sparkline: createSparkline(price, change, hash),
    volume: category === "crypto" ? (index + 2) * 780_000_000 : (52 - index) * 11_800_000_000,
    vibe,
    liquidations: Math.max(4, Math.min(94, 28 + Math.abs(change) * 7 + (hash % 19))),
    volatility: Math.max(8, Math.min(92, 24 + Math.abs(change) * 6 + (hash % 13))),
    socialVelocity: Math.max(9, Math.min(96, 32 + Math.abs(change) * 8 + (hash % 23))),
    explanation: positive
      ? `${name} is drawing steady bids as momentum firms. The ${categoryText} tape is constructive, though positioning remains measured rather than euphoric.`
      : `${name} is trading defensively as sellers control the short-term tape. Attention is elevated, but the move still reads as repricing rather than capitulation.`,
    evidence: [
      { source: "Market wire", text: positive ? "Buy-side activity is building above the session mean." : "Offers continue to cap intraday recovery attempts.", tag: positive ? "Bullish" : "Bearish" },
      { source: "Flow desk", text: `Momentum and volume signals are ${Math.abs(change) > 3 ? "running hot" : "near their weekly range"}.`, tag: Math.abs(change) > 3 ? "FUD" : positive ? "Bullish" : "Bearish" },
      { source: "TEMPO pulse", text: `Conversation velocity ranks ${vibe >= 60 ? "above" : "below"} the cross-market median.`, tag: vibe >= 60 ? "Bullish" : "FUD" },
    ],
  };
}

export const CRYPTO_ASSETS = CRYPTO_SEEDS.map((seed, index) => createAsset(seed, "crypto", index));
export const FOREX_ASSETS = FOREX_SEEDS.map((seed, index) => createAsset(seed, "forex", index));
export const ASSETS: Asset[] = [...CRYPTO_ASSETS, ...FOREX_ASSETS];

export const DEFAULT_WATCHLIST_IDS = ["crypto-btc", "crypto-eth", "crypto-sol", "crypto-xrp", "forex-eur-usd", "forex-usd-jpy"];

export function vibeLabel(vibe: number): { label: string; tone: "ice" | "panic" } {
  if (vibe >= 75) return { label: "Silent Accumulation", tone: "ice" };
  if (vibe >= 60) return { label: "Steady Conviction", tone: "ice" };
  if (vibe >= 45) return { label: "Calm Drift", tone: "ice" };
  if (vibe >= 30) return { label: "Rising Fear", tone: "panic" };
  return { label: "Severe Panic", tone: "panic" };
}
