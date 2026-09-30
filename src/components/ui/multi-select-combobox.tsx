import { Check, ChevronsUpDown, X } from "lucide-react";

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
import type { Asset } from "@/lib/tempo-data";
import { cn } from "@/lib/utils";

type MultiSelectComboboxProps = {
  assets: Asset[];
  value: string[];
  onChange: (value: string[]) => void;
};

export function MultiSelectCombobox({ assets, value, onChange }: MultiSelectComboboxProps) {
  const selectedAssets = value.flatMap((id) => {
    const asset = assets.find((item) => item.id === id);
    return asset ? [asset] : [];
  });

  const toggleAsset = (id: string) => {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
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
                  onClick={() => toggleAsset(asset.id)}
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
        <Command>
          <CommandInput placeholder="Search name or symbol..." />
          <CommandList className="max-h-80">
            <CommandEmpty>No instruments found.</CommandEmpty>
            {(["crypto", "forex"] as const).map((category) => (
              <CommandGroup
                key={category}
                heading={category === "crypto" ? "Cryptocurrency" : "Forex"}
              >
                {assets
                  .filter((asset) => asset.category === category)
                  .map((asset) => {
                    const selected = value.includes(asset.id);
                    return (
                      <CommandItem
                        key={asset.id}
                        value={`${asset.symbol} ${asset.name} ${category}`}
                        onSelect={() => toggleAsset(asset.id)}
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
                        <span className="font-mono text-xs font-medium">{asset.symbol}</span>
                        <span className="truncate text-xs text-muted-foreground">{asset.name}</span>
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
