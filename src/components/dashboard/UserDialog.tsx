"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  sites: string[];
}

interface SiteOption {
  siteKey: string;
  name: string;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData | null;
  sites: SiteOption[];
  onSuccess: () => void;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  sites,
  onSuccess,
}: UserDialogProps) {
  const isEditing = !!user;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("editor");
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (user) {
        setEmail(user.email);
        setPassword("");
        setName(user.name || "");
        setRole(user.role);
        setSelectedSites(user.sites);
      } else {
        setEmail("");
        setPassword("");
        setName("");
        setRole("editor");
        setSelectedSites([]);
      }
    }
  }, [open, user]);

  function toggleSite(siteKey: string) {
    setSelectedSites((prev) =>
      prev.includes(siteKey)
        ? prev.filter((s) => s !== siteKey)
        : [...prev, siteKey]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        email,
        name: name || null,
        role,
        sites: selectedSites,
      };

      if (!isEditing) {
        payload.password = password;
      } else if (password) {
        payload.password = password;
      }

      const url = isEditing ? `/api/users/${user.id}` : "/api/users";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onOpenChange(false);
        onSuccess();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save user");
      }
    } catch {
      toast.error("Failed to save user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Create User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">
              Password{isEditing ? " (leave blank to keep)" : ""}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEditing}
              minLength={8}
            />
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {role === "editor" && (
            <div>
              <Label>Assigned Sites</Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto rounded-md border p-3">
                {sites.length === 0 ? (
                  <p className="text-sm text-zinc-500">No sites available</p>
                ) : (
                  sites.map((site) => (
                    <label
                      key={site.siteKey}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSites.includes(site.siteKey)}
                        onChange={() => toggleSite(site.siteKey)}
                        className="rounded border-zinc-300"
                      />
                      <span>{site.name}</span>
                      <span className="text-zinc-400 font-mono text-xs">
                        {site.siteKey}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEditing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
