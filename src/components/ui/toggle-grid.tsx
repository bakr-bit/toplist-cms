"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

export interface ToggleOption {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface ToggleGridProps {
  options: ToggleOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  searchable?: boolean;
  columns?: number;
  maxHeight?: string;
  allowCustom?: boolean;
}

export function ToggleGrid({
  options,
  selected,
  onChange,
  searchable = false,
  columns = 3,
  maxHeight = "16rem",
  allowCustom = false,
}: ToggleGridProps) {
  const [search, setSearch] = useState("");
  const [customValue, setCustomValue] = useState("");

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
    );
  }, [options, search]);

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  function addCustom() {
    const val = customValue.trim();
    if (!val || selected.includes(val)) return;
    onChange([...selected, val]);
    setCustomValue("");
  }

  // Custom values that aren't in the predefined options
  const customValues = selected.filter(
    (s) => !options.some((o) => o.id === s)
  );

  const gridCols =
    columns === 2
      ? "grid-cols-2"
      : columns === 4
        ? "grid-cols-4"
        : "grid-cols-3";

  return (
    <div className="space-y-2">
      {searchable && (
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
      )}
      <div
        className="overflow-y-auto border rounded-lg bg-zinc-50 p-2"
        style={{ maxHeight }}
      >
        <div className={`grid ${gridCols} gap-1.5`}>
          {filtered.map((option) => {
            const isSelected = selected.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggle(option.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {option.icon && (
                  <span className="shrink-0 w-4 h-4 flex items-center justify-center [&_img]:h-4 [&_img]:w-4 [&_svg]:h-4 [&_svg]:w-4">{option.icon}</span>
                )}
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
        {/* Custom values that aren't in predefined options */}
        {customValues.length > 0 && (
          <div className={`grid ${gridCols} gap-1.5 mt-1.5`}>
            {customValues.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => toggle(val)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-500 text-white shadow-sm"
              >
                <span className="truncate">{val}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {allowCustom && (
        <div className="flex gap-2">
          <Input
            placeholder="Add custom..."
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            className="h-8 text-sm flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustom}
            disabled={!customValue.trim()}
          >
            Add
          </Button>
        </div>
      )}
      {selected.length > 0 && (
        <p className="text-xs text-zinc-500">
          {selected.length} selected
        </p>
      )}
    </div>
  );
}
