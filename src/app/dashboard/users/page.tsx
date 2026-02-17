"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserDialog } from "@/components/dashboard/UserDialog";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  sites: string[];
  createdAt: string;
}

interface SiteOption {
  siteKey: string;
  name: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [sites, setSites] = useState<SiteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace("/dashboard/sites");
    }
  }, [status, session, router]);

  async function loadData() {
    try {
      const [usersRes, sitesRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/sites"),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (sitesRes.ok) {
        const sitesData = await sitesRes.json();
        setSites(
          sitesData.map((s: { siteKey: string; name: string }) => ({
            siteKey: s.siteKey,
            name: s.name,
          }))
        );
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.user?.role === "admin") {
      loadData();
    }
  }, [session]);

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User deleted");
        loadData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete user");
      }
    } catch {
      toast.error("Failed to delete user");
    }
  }

  if (status === "loading" || loading) {
    return <div className="text-zinc-500">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Users</h1>
        <Button
          onClick={() => {
            setEditingUser(null);
            setDialogOpen(true);
          }}
        >
          Add User
        </Button>
      </div>

      {users.length === 0 ? (
        <div className="text-zinc-500">No users found.</div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Sites</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name || "-"}</TableCell>
                  <TableCell>
                    <span
                      className={
                        user.role === "admin"
                          ? "text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded"
                          : "text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded"
                      }
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.role === "admin" ? (
                      <span className="text-xs text-zinc-400">All sites</span>
                    ) : user.sites.length === 0 ? (
                      <span className="text-xs text-zinc-400">None</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.sites.map((siteKey) => (
                          <span
                            key={siteKey}
                            className="text-xs bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded"
                          >
                            {siteKey}
                          </span>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        disabled={user.id === session?.user?.id}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        sites={sites}
        onSuccess={() => {
          loadData();
          toast.success(editingUser ? "User updated" : "User created");
        }}
      />
    </div>
  );
}
