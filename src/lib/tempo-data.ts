export type EvidenceTag = "Bullish" | "Bearish" | "FUD";
export type AssetCategory = "crypto" | "forex";
export type SentimentTone = "bullish" | "neutral" | "panic";

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
  volumeAvailable?: boolean;
  provider?: "coingecko" | "frankfurter";
  providerId?: string;
  baseCurrency?: string;
  quoteCurrency?: string;
};

export function assetQuoteCurrency(
  asset: Pick<Asset, "category" | "symbol" | "quoteCurrency">,
): string {
  if (asset.category === "crypto") return "USD";
  return asset.quoteCurrency ?? asset.symbol.split("/")[1]?.trim().toUpperCase() ?? "USD";
}

export function assetPriceFractionDigits(asset: Pick<Asset, "category" | "price" | "symbol" | "quoteCurrency">) {
  return displayPriceFractionDigits(asset, assetQuoteCurrency(asset), asset.price);
}

export function displayPriceFractionDigits(
  asset: Pick<Asset, "category" | "price" | "symbol" | "quoteCurrency">,
  currency: string,
  price: number,
) {
  if (currency === "JPY") return 2;
  if (asset.category === "forex") return 4;
  return price < 1 ? 12 : 2;
}

export function formatAssetPrice(
  asset: Pick<Asset, "category" | "price" | "symbol" | "quoteCurrency">,
): string {
  const currency = assetQuoteCurrency(asset);
  const minimumFractionDigits = asset.category === "forex" ? 2 : undefined;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: assetPriceFractionDigits(asset),
      ...(minimumFractionDigits === undefined ? {} : { minimumFractionDigits }),
    }).format(asset.price);
  } catch {
    return `${currency} ${asset.price.toLocaleString("en-US", {
      maximumFractionDigits: assetPriceFractionDigits(asset),
    })}`;
  }
}

export type AssetSearchResult = {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  provider: "fixture" | "coingecko" | "frankfurter";
  providerId?: string;
  baseCurrency?: string;
  quoteCurrency?: string;
};

export type AssetSearchResponse = {
  results: AssetSearchResult[];
  remoteUnavailable: boolean;
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

let currencyRegistryRequest: Promise<Record<string, string>> | null = null;

async function getCurrencyRegistry() {
  currencyRegistryRequest ??= fetch("https://api.frankfurter.dev/v1/currencies")
    .then(async (response) => {
      if (!response.ok) throw new Error("Currency registry unavailable");
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("Invalid currency registry response");
      }
      return Object.fromEntries(
        Object.entries(payload).filter(
          (entry): entry is [string, string] =>
            /^[A-Z]{3}$/.test(entry[0]) && typeof entry[1] === "string",
        ),
      );
    })
    .catch((error: unknown) => {
      currencyRegistryRequest = null;
      throw error;
    });

  return currencyRegistryRequest;
}

export async function getSupportedCurrencies() {
  return getCurrencyRegistry();
}

export async function fetchExchangeRate(
  baseCurrency: string,
  quoteCurrency: string,
  signal?: AbortSignal,
): Promise<number> {
  if (baseCurrency === quoteCurrency) return 1;
  const url = new URL("https://api.frankfurter.dev/v1/latest");
  url.search = new URLSearchParams({ base: baseCurrency, symbols: quoteCurrency }).toString();
  const response = await fetch(url, signal ? { signal } : undefined);
  if (!response.ok) throw new Error("Currency conversion unavailable");
  const payload: unknown = await response.json();
  const rates = payload && typeof payload === "object"
    ? (payload as { rates?: unknown }).rates
    : null;
  const rate = rates && typeof rates === "object"
    ? (rates as Record<string, unknown>)[quoteCurrency]
    : null;
  if (typeof rate !== "number" || !Number.isFinite(rate)) {
    throw new Error("Currency conversion unavailable");
  }
  return rate;
}

export function searchLocalAssets(query: string, assets: Asset[]): AssetSearchResult[] {
  const normalized = query.trim().toLowerCase();
  return assets
    .filter(
      (asset) =>
        !normalized ||
        asset.symbol.toLowerCase().includes(normalized) ||
        asset.name.toLowerCase().includes(normalized),
    )
    .map((asset) => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      category: asset.category,
      provider: asset.provider ?? "fixture",
      ...(asset.providerId ? { providerId: asset.providerId } : {}),
      ...(asset.baseCurrency ? { baseCurrency: asset.baseCurrency } : {}),
      ...(asset.quoteCurrency ? { quoteCurrency: asset.quoteCurrency } : {}),
    }));
}

async function searchCoinGecko(query: string, signal?: AbortSignal): Promise<AssetSearchResult[]> {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
    signal ? { signal } : undefined,
  );
  if (!response.ok) throw new Error("CoinGecko search unavailable");
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as { coins?: unknown }).coins)) {
    throw new Error("Invalid CoinGecko search response");
  }

  return (payload as { coins: unknown[] }).coins.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const coin = entry as { id?: unknown; name?: unknown; symbol?: unknown };
    if (
      typeof coin.id !== "string" ||
      typeof coin.name !== "string" ||
      typeof coin.symbol !== "string"
    ) {
      return [];
    }
    return [{
      id: `crypto-cg-${coin.id}`,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      category: "crypto" as const,
      provider: "coingecko" as const,
      providerId: coin.id,
    }];
  }).slice(0, 10);
}

async function searchForexPairs(query: string): Promise<AssetSearchResult[]> {
  const currencies = await getCurrencyRegistry();
  const codes = Object.keys(currencies);
  const normalized = query.trim().toLowerCase();
  const compact = query.toUpperCase().replace(/[^A-Z]/g, "");
  const explicitBase = compact.slice(0, 3);
  const explicitQuote = compact.slice(3, 6);

  if (compact.length === 6 && currencies[explicitBase] && currencies[explicitQuote]) {
    return [createForexResult(explicitBase, explicitQuote, currencies)];
  }

  const matchingCodes = codes.filter(
    (code) =>
      code.toLowerCase().includes(normalized) ||
      currencies[code]!.toLowerCase().includes(normalized),
  );
  const pairs = new Map<string, AssetSearchResult>();
  for (const matched of matchingCodes.slice(0, 4)) {
    for (const other of codes) {
      if (other === matched) continue;
      const forward = createForexResult(matched, other, currencies);
      const reverse = createForexResult(other, matched, currencies);
      pairs.set(forward.id, forward);
      pairs.set(reverse.id, reverse);
    }
  }
  return [...pairs.values()].slice(0, 40);
}

function createForexResult(
  baseCurrency: string,
  quoteCurrency: string,
  currencies: Record<string, string>,
): AssetSearchResult {
  return {
    id: `forex-live-${baseCurrency.toLowerCase()}-${quoteCurrency.toLowerCase()}`,
    symbol: `${baseCurrency}/${quoteCurrency}`,
    name: `${currencies[baseCurrency] ?? baseCurrency} / ${currencies[quoteCurrency] ?? quoteCurrency}`,
    category: "forex",
    provider: "frankfurter",
    baseCurrency,
    quoteCurrency,
  };
}

export async function searchAssets(
  query: string,
  localAssets: Asset[] = ASSETS,
  signal?: AbortSignal,
): Promise<AssetSearchResponse> {
  const localResults = searchLocalAssets(query, localAssets);
  if (query.trim().length < 2) return { results: localResults, remoteUnavailable: false };

  const requests = Promise.allSettled([
    searchCoinGecko(query.trim(), signal),
    searchForexPairs(query.trim()),
  ]);
  const [cryptoResponse, forexResponse] = await raceWithAbort(requests, signal);
  if (signal?.aborted) throw new DOMException("Search cancelled", "AbortError");

  const localNames = new Set(localResults.map((asset) => asset.name.toLowerCase()));
  const remoteCrypto =
    cryptoResponse.status === "fulfilled"
      ? cryptoResponse.value.filter(
          (asset) => !localNames.has(asset.name.toLowerCase()),
        )
      : [];
  const remoteForex =
    forexResponse.status === "fulfilled"
      ? forexResponse.value.filter((asset) => !localNames.has(asset.name.toLowerCase()))
      : [];

  return {
    results: [...localResults, ...remoteCrypto, ...remoteForex],
    remoteUnavailable:
      cryptoResponse.status === "rejected" || forexResponse.status === "rejected",
  };
}

function raceWithAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new DOMException("Search cancelled", "AbortError"));
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

function createRemoteAsset(
  result: AssetSearchResult,
  price: number,
  change: number,
  volume?: number,
): Asset {
  const seed = hashText(result.id);
  const vibe = Math.max(8, Math.min(92, Math.round(50 + change * 4)));
  const positive = change >= 0;
  const source = result.provider === "coingecko" ? "CoinGecko" : "Frankfurter";

  return {
    ...result,
    provider: result.provider === "coingecko" ? "coingecko" : "frankfurter",
    price,
    change,
    sparkline: createSparkline(price, change, seed),
    volume: volume ?? 0,
    volumeAvailable: volume !== undefined,
    vibe,
    liquidations: Math.max(4, Math.min(94, 28 + Math.abs(change) * 7 + (seed % 19))),
    volatility: Math.max(8, Math.min(92, 24 + Math.abs(change) * 6 + (seed % 13))),
    socialVelocity: Math.max(9, Math.min(96, 32 + Math.abs(change) * 8 + (seed % 23))),
    explanation: `${result.name} price telemetry is fetched from ${source}. TEMPO sentiment metrics are simulated estimates.`,
    evidence: [
      {
        source,
        text: `Latest ${result.category === "crypto" ? "USD market price" : "exchange rate"} fetched from ${source}.`,
        tag: positive ? "Bullish" : "Bearish",
      },
      {
        source: "TEMPO pulse",
        text: "Sentiment indicators are estimated locally for this instrument.",
        tag: vibe >= 60 ? "Bullish" : "FUD",
      },
    ],
  };
}

export async function resolveAssetSearchResult(
  result: AssetSearchResult,
  localAssets: Asset[] = ASSETS,
): Promise<Asset> {
  const existing = localAssets.find((asset) => asset.id === result.id);
  if (result.provider === "fixture" && existing) return existing;

  if (result.provider === "coingecko" && result.providerId) {
    const url = new URL("https://api.coingecko.com/api/v3/simple/price");
    url.search = new URLSearchParams({
      ids: result.providerId,
      vs_currencies: "usd",
      include_24hr_change: "true",
      include_24hr_vol: "true",
    }).toString();
    const response = await fetch(url);
    if (!response.ok) throw new Error("Could not fetch the current crypto price");
    const payload: unknown = await response.json();
    const quote = payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)[result.providerId]
      : null;
    if (!quote || typeof quote !== "object") throw new Error("Price data was unavailable");
    const values = quote as { usd?: unknown; usd_24h_change?: unknown; usd_24h_vol?: unknown };
    if (typeof values.usd !== "number" || !Number.isFinite(values.usd)) {
      throw new Error("Price data was unavailable");
    }
    const change = typeof values.usd_24h_change === "number" ? values.usd_24h_change : 0;
    const volume =
      typeof values.usd_24h_vol === "number" && Number.isFinite(values.usd_24h_vol)
        ? values.usd_24h_vol
        : undefined;
    return createRemoteAsset(result, values.usd, Number.isFinite(change) ? change : 0, volume);
  }

  if (
    result.provider === "frankfurter" &&
    result.baseCurrency &&
    result.quoteCurrency
  ) {
    const url = new URL(
      `https://api.frankfurter.dev/v1/latest?base=${result.baseCurrency}&symbols=${result.quoteCurrency}`,
    );
    const response = await fetch(url);
    if (!response.ok) throw new Error("Could not fetch the latest exchange rate");
    const payload: unknown = await response.json();
    const rates = payload && typeof payload === "object"
      ? (payload as { rates?: unknown }).rates
      : null;
    const price = rates && typeof rates === "object"
      ? (rates as Record<string, unknown>)[result.quoteCurrency]
      : null;
    if (typeof price !== "number" || !Number.isFinite(price)) {
      throw new Error("Exchange rate data was unavailable");
    }
    return createRemoteAsset(result, price, 0);
  }

  if (existing) return existing;
  throw new Error("This instrument could not be resolved");
}

export const DEFAULT_WATCHLIST_IDS = ["crypto-btc", "crypto-eth", "crypto-sol", "crypto-xrp", "forex-eur-usd", "forex-usd-jpy"];

export function changeSentiment(change: number): SentimentTone {
  if (change > 0.1) return "bullish";
  if (change < -0.1) return "panic";
  return "neutral";
}

export function vibeLabel(vibe: number): { label: string; tone: SentimentTone } {
  if (vibe >= 75) return { label: "Silent Euphoria", tone: "bullish" };
  if (vibe >= 60) return { label: "Steady Conviction", tone: "bullish" };
  if (vibe >= 45) return { label: "Calm Drift", tone: "neutral" };
  if (vibe >= 30) return { label: "Rising Fear", tone: "panic" };
  return { label: "Severe Panic", tone: "panic" };
}
