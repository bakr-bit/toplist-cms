"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  type: "brand" | "toplist-item";
  identifier: string;
  className?: string;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  type,
  identifier,
  className,
  placeholder = "https://...",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "meta",
          JSON.stringify({
            type,
            identifier,
            previousUrl: value || undefined,
          })
        );

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }

        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [type, identifier, value, onChange]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Preview */}
      {value && (
        <div className="relative w-fit">
          <img
            src={value}
            alt="Preview"
            className="h-12 w-auto max-w-[200px] object-contain rounded border bg-zinc-100"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 flex items-center justify-center"
          >
            x
          </button>
        </div>
      )}

      {/* Drop zone / URL input */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "flex gap-2",
          dragOver && "ring-2 ring-primary ring-offset-2 rounded-md"
        )}
      >
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={uploading}
          className="flex-1"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "..." : "Upload"}
        </Button>
      </div>

      {/* Error message */}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Help text */}
      <p className="text-xs text-zinc-500">
        Enter URL or drag & drop / click Upload (max 5MB)
      </p>
    </div>
  );
}
