import { useEffect, useMemo, useState } from "react";
import { Search, Ban, Trash2, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getUsers,
  updateUserRole,
  setUserActive,
  deleteUser,
  type User,
  type Role,
} from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const ROLES: Role[] = ["user", "reception", "admin"];

export default function AdminUsers() {
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => console.error("[admin.users] load failed", err))
      .finally(() => setLoading(false));
  }, []);

  async function changeRole(id: number, role: Role) {
    setBusy(id);
    try {
      const u = await updateUserRole(id, role);
      setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, role: u.role } : x)));
    } catch (err) {
      console.error("[admin.users] role failed", err);
    } finally {
      setBusy(null);
    }
  }

  async function toggleActive(u: User) {
    setBusy(u.id);
    try {
      const updated = await setUserActive(u.id, !u.is_active);
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, is_active: updated.is_active } : x)),
      );
    } catch (err) {
      console.error("[admin.users] block failed", err);
    } finally {
      setBusy(null);
    }
  }

  async function remove(u: User) {
    if (!window.confirm(t("ho.deleteConfirm", { name: u.name }))) return;
    setBusy(u.id);
    try {
      await deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      console.error("[admin.users] delete failed", err);
    } finally {
      setBusy(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || (u.whatsapp_phone_number ?? "").toLowerCase().includes(q),
    );
  }, [users, query]);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold">{t("ad.navUsers")}</h1>
      <p className="mt-1 text-muted-foreground">{t("ad.usersSubtitle")}</p>

      <div className="mt-6 flex gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("ad.usersSearch")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> {t("ho.loading")}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border/70 bg-card">
          <table className="w-full min-w-180 text-sm">
            <thead className="bg-surface text-left">
              <tr className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">{t("ad.colName")}</th>
                <th className="px-5 py-3">{t("ho.phone")}</th>
                <th className="px-5 py-3">{t("ad.colRole")}</th>
                <th className="px-5 py-3">{t("ad.colStatus")}</th>
                <th className="px-5 py-3 text-right">{t("hb.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-muted/40">
                  <td className="px-5 py-4 font-semibold">{u.name}</td>
                  <td className="px-5 py-4">{u.whatsapp_phone_number ?? "—"}</td>
                  <td className="px-5 py-4">
                    <select
                      value={u.role}
                      disabled={busy === u.id}
                      onChange={(e) => changeRole(u.id, e.target.value as Role)}
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs font-semibold"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {t(`role.${r}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.is_active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
                    >
                      {u.is_active ? t("ad.active") : t("ad.blocked")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1"
                        disabled={busy === u.id}
                        onClick={() => toggleActive(u)}
                      >
                        {u.is_active ? (
                          <>
                            <Ban className="h-3.5 w-3.5" /> {t("ad.block")}
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5" /> {t("ad.unblock")}
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive"
                        disabled={busy === u.id}
                        onClick={() => remove(u)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
