import { Check, ChevronsUpDown, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  resolveAssetSearchResult,
  searchLocalAssets,
  searchAssets,
  type Asset,
  type AssetSearchResult,
} from "@/lib/tempo-data";
import { cn } from "@/lib/utils";

type MultiSelectComboboxProps = {
  assets: Asset[];
  value: string[];
  onChange: (value: string[]) => void;
  onResolveAsset: (asset: Asset) => void;
};

export function MultiSelectCombobox({
  assets,
  value,
  onChange,
  onResolveAsset,
}: MultiSelectComboboxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AssetSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [remoteUnavailable, setRemoteUnavailable] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setResults(searchLocalAssets(query, assets));
    setRemoteUnavailable(false);
    const timeout = window.setTimeout(
      async () => {
        setIsSearching(true);
        const deadline = window.setTimeout(() => {
          setRemoteUnavailable(true);
          setIsSearching(false);
          controller.abort();
        }, 8000);
        try {
          const response = await searchAssets(query, assets, controller.signal);
          setResults(response.results);
          setRemoteUnavailable(response.remoteUnavailable);
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setRemoteUnavailable(true);
        } finally {
          window.clearTimeout(deadline);
          if (!controller.signal.aborted) setIsSearching(false);
        }
      },
      query.trim().length >= 2 ? 250 : 0,
    );

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [assets, query]);

  const selectedAssets = value.flatMap((id) => {
    const asset = assets.find((item) => item.id === id);
    return asset ? [asset] : [];
  });

  const toggleAsset = async (result: AssetSearchResult) => {
    if (value.includes(result.id)) {
      onChange(value.filter((item) => item !== result.id));
      return;
    }

    setResolvingId(result.id);
    setSelectionError(null);
    try {
      const asset = await resolveAssetSearchResult(result, assets);
      onResolveAsset(asset);
      onChange([...value, asset.id]);
    } catch {
      setSelectionError(`Could not fetch price data for ${result.symbol}. Try again.`);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label="Manage tracked assets"
          className="h-10 gap-2 border-border bg-surface px-3 text-xs uppercase tracking-[0.12em] text-foreground hover:border-ice/40 hover:bg-surface-raised"
        >
          <span>Watchlist</span>
          <span className="font-mono text-ice">{value.length}</span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(420px,calc(100vw-2rem))] p-0">
        <div className="border-b border-border p-3">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Tracked instruments</span>
            <span>{selectedAssets.length} selected</span>
          </div>
          <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
            {selectedAssets.length ? (
              selectedAssets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onChange(value.filter((item) => item !== asset.id))}
                  aria-label={`Remove ${asset.symbol} from watchlist`}
                  className="inline-flex items-center gap-1 rounded-sm border border-ice/25 bg-ice/5 px-2 py-1 font-mono text-[10px] text-ice transition-colors hover:border-panic/40 hover:bg-panic/10 hover:text-panic"
                >
                  {asset.symbol}
                  <X className="size-3" />
                </button>
              ))
            ) : (
              <span className="py-1 text-xs text-muted-foreground">No instruments tracked</span>
            )}
          </div>
        </div>
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search any coin or forex pair..."
          />
          <CommandList className="max-h-80">
            {results.length === 0 && !isSearching ? (
              <CommandEmpty>
                {query.trim().length < 2
                  ? "Type at least two characters to search."
                  : "No instruments found."}
              </CommandEmpty>
            ) : null}
            {isSearching ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                Searching global registries...
              </p>
            ) : null}
            {remoteUnavailable && query.trim().length >= 2 ? (
              <p role="status" className="px-3 py-2 text-xs text-panic">
                Some public registries are unavailable. Showing matching saved instruments.
              </p>
            ) : null}
            {selectionError ? (
              <p role="alert" className="px-3 py-2 text-xs text-panic">
                {selectionError}
              </p>
            ) : null}
            {(["crypto", "forex"] as const).map((category) => (
              <CommandGroup
                key={category}
                heading={category === "crypto" ? "Cryptocurrency" : "Forex"}
              >
                {results
                  .filter((result) => result.category === category)
                  .map((result) => {
                    const selected = value.includes(result.id);
                    return (
                      <CommandItem
                        key={result.id}
                        value={`${result.id} ${result.symbol} ${result.name} ${category}`}
                        disabled={resolvingId !== null}
                        onSelect={() => void toggleAsset(result)}
                        className="gap-3"
                      >
                        <span
                          className={cn(
                            "flex size-4 items-center justify-center rounded-sm border",
                            selected ? "border-ice bg-ice text-obsidian" : "border-border",
                          )}
                        >
                          {selected && <Check className="size-3" />}
                        </span>
                        <span className="font-mono text-xs font-medium">{result.symbol}</span>
                        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                          {result.name}
                        </span>
                        {resolvingId === result.id ? (
                          <span className="text-[10px] text-muted-foreground">
                            Fetching price...
                          </span>
                        ) : result.provider !== "fixture" ? (
                          <span className="font-mono text-[9px] uppercase text-ice">
                            {result.provider === "coingecko" ? "CoinGecko" : "Frankfurter"}
                          </span>
                        ) : null}
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
