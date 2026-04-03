import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TokenStats } from "@/components/TokenStats";
import { TokenTable } from "@/components/TokenTable";
import { TokenFormModal } from "@/components/TokenFormModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { KeyRound, Plus, Search, Sun, Moon, Trash2, Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/lib/lang-context";
import { useToast } from "@/hooks/use-toast";
import { getListTokensQueryKey, getGetTokenStatsQueryKey } from "@workspace/api-client-react";

export function Dashboard() {
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deleteAllPending, setDeleteAllPending] = useState(false);

  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, t, toggle: toggleLang } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDeleteAll = async () => {
    setDeleteAllPending(true);
    try {
      const res = await fetch("/api/tokens", { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      queryClient.invalidateQueries({ queryKey: getListTokensQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetTokenStatsQueryKey() });
      toast({ title: t.toastDeleteAll, description: t.toastDeleteAllDesc });
      setDeleteAllOpen(false);
    } catch {
      toast({ title: t.toastBulkError, description: t.toastBulkErrorDesc, variant: "destructive" });
    } finally {
      setDeleteAllPending(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-base leading-none tracking-tight">{t.appName}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{t.appSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="rounded-lg h-9 px-3 text-sm font-semibold text-muted-foreground hover:text-foreground gap-1.5 min-w-[52px]"
              aria-label="Toggle language"
            >
              <span className={lang === "en" ? "text-primary font-bold" : "opacity-50"}>EN</span>
              <span className="text-border">|</span>
              <span className={lang === "vi" ? "text-primary font-bold" : "opacity-50"}>VN</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-lg gap-2 font-medium text-sm h-9 px-4"
            >
              <Plus className="w-4 h-4" />
              {t.addToken}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
        <TokenStats />

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{t.tokenRegistry}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{t.tokenRegistryDesc}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={t.searchPlaceholder}
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9 rounded-lg bg-card h-9 text-sm"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 rounded-lg bg-card h-9 text-sm">
                  <SelectValue placeholder={t.allStatus} />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="all">{t.allStatus}</SelectItem>
                  <SelectItem value="active">{t.statusActive}</SelectItem>
                  <SelectItem value="expired">{t.statusExpired}</SelectItem>
                  <SelectItem value="invalid">{t.statusInvalid}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-lg text-xs px-3 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive/50 whitespace-nowrap"
                onClick={() => setDeleteAllOpen(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.bulkDeleteAll}
              </Button>
            </div>
          </div>

          <TokenTable searchFilter={searchFilter} statusFilter={statusFilter} />
        </div>
      </main>

      {isAddModalOpen && (
        <TokenFormModal isOpen={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      )}

      <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <AlertDialogContent className="rounded-xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">{t.bulkDeleteAllTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {t.bulkDeleteAllDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg" disabled={deleteAllPending}>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleDeleteAll}
              disabled={deleteAllPending}
            >
              {deleteAllPending ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t.applying}</span>
              ) : t.confirmDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
