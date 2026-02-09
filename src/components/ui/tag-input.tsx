"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxItems?: number;
  placeholder?: string;
}

export function TagInput({
  value,
  onChange,
  maxItems,
  placeholder = "Type and press Enter...",
}: TagInputProps) {
  const [input, setInput] = useState("");

  function addItem() {
    const val = input.trim();
    if (!val) return;
    if (maxItems && value.length >= maxItems) return;
    if (value.includes(val)) return;
    onChange([...value, val]);
    setInput("");
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {(!maxItems || value.length < maxItems) && (
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className="h-8 text-sm"
        />
      )}
      {maxItems && (
        <p className="text-xs text-zinc-500">
          {value.length}/{maxItems}
        </p>
      )}
    </div>
  );
}
