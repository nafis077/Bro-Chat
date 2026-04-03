import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/lib/lang-context";
import { useToast } from "@/hooks/use-toast";
import { getListTokensQueryKey, getGetTokenStatsQueryKey, useListTokens } from "@workspace/api-client-react";
import { Sun, Moon, Download, Trash2, Loader2, Languages, Rows3, Palette } from "lucide-react";

function SettingRow({
  icon,
  label,
  desc,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="p-1.5 rounded-md bg-muted text-muted-foreground mt-0.5 flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-none">{label}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({
  title,
  desc,
  children,
  danger,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={`rounded-xl border bg-card shadow-sm overflow-hidden ${danger ? "border-destructive/30" : "border-border"}`}>
      <div className={`px-6 py-4 border-b ${danger ? "border-destructive/20 bg-destructive/5" : "border-border bg-muted/30"}`}>
        <h3 className={`text-sm font-semibold ${danger ? "text-destructive" : "text-foreground"}`}>{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <div className="px-6 divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

export function Settings() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, t, toggle: toggleLang } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [clearAllPending, setClearAllPending] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: tokens } = useListTokens({}, {
    query: { queryKey: getListTokensQueryKey({}) },
  });

  const defaultRows = (() => {
    try { return localStorage.getItem("tkm_perPage") ?? "25"; } catch { return "25"; }
  })();
  const [selectedRows, setSelectedRows] = useState(defaultRows);

  const handleDefaultRowsChange = (val: string) => {
    setSelectedRows(val);
    try { localStorage.setItem("tkm_perPage", val); } catch {}
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const list = tokens ?? [];
      const header = "ID,FB ID,Token,Cookie,Status,Note,Created At";
      const rows = list.map((tk) =>
        [
          tk.id,
          `"${(tk.fbId ?? "").replace(/"/g, '""')}"`,
          `"${(tk.token ?? "").replace(/"/g, '""')}"`,
          `"${(tk.cookie ?? "").replace(/"/g, '""')}"`,
          tk.status,
          `"${(tk.note ?? "").replace(/"/g, '""')}"`,
          tk.createdAt,
        ].join(",")
      );
      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tokens_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: t.exportCsv, description: `${list.length} tokens exported.` });
    } finally {
      setExporting(false);
    }
  };

  const handleClearAll = async () => {
    setClearAllPending(true);
    try {
      const res = await fetch("/api/tokens", { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      queryClient.invalidateQueries({ queryKey: getListTokensQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetTokenStatsQueryKey() });
      toast({ title: t.toastDeleteAll, description: t.toastDeleteAllDesc });
      setClearAllOpen(false);
    } catch {
      toast({ title: t.toastBulkError, description: t.toastBulkErrorDesc, variant: "destructive" });
    } finally {
      setClearAllPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{t.settingsTitle}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{t.settingsDesc}</p>
      </div>

      {/* Appearance */}
      <SectionCard title={t.sectionAppearance} desc={t.sectionAppearanceDesc}>
        {/* Language */}
        <SettingRow
          icon={<Languages className="w-4 h-4" />}
          label={t.settingLanguage}
          desc={t.settingLanguageDesc}
        >
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-1 gap-1">
            <button
              onClick={() => { if (lang !== "en") toggleLang(); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                lang === "en"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => { if (lang !== "vi") toggleLang(); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                lang === "vi"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              VN
            </button>
          </div>
        </SettingRow>

        {/* Theme */}
        <SettingRow
          icon={<Palette className="w-4 h-4" />}
          label={t.settingTheme}
          desc={t.settingThemeDesc}
        >
          <div className="flex items-center rounded-lg border border-border bg-muted/50 p-1 gap-1">
            <button
              onClick={() => { if (theme !== "light") toggleTheme(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                theme === "light"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun className="w-3 h-3" />
              {t.themeLight}
            </button>
            <button
              onClick={() => { if (theme !== "dark") toggleTheme(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                theme === "dark"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className="w-3 h-3" />
              {t.themeDark}
            </button>
          </div>
        </SettingRow>

        {/* Default rows per page */}
        <SettingRow
          icon={<Rows3 className="w-4 h-4" />}
          label={t.settingDefaultRows}
          desc={t.settingDefaultRowsDesc}
        >
          <Select value={selectedRows} onValueChange={handleDefaultRowsChange}>
            <SelectTrigger className="h-9 rounded-lg text-sm border-border bg-background w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-lg text-sm">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="0">{t.allRows}</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SectionCard>

      {/* Data Management */}
      <SectionCard title={t.sectionData} desc={t.sectionDataDesc}>
        <SettingRow
          icon={<Download className="w-4 h-4" />}
          label={t.exportCsv}
          desc={t.exportCsvDesc}
        >
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg h-9 gap-2 text-xs font-medium"
            onClick={handleExportCsv}
            disabled={exporting || !tokens?.length}
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            {t.exportBtn}
            {tokens?.length ? <span className="text-muted-foreground">({tokens.length})</span> : null}
          </Button>
        </SettingRow>
      </SectionCard>

      {/* Danger Zone */}
      <SectionCard title={t.dangerZone} desc={t.dangerZoneDesc} danger>
        <SettingRow
          icon={<Trash2 className="w-4 h-4 text-destructive" />}
          label={t.clearAllBtn}
          desc={t.clearAllDesc}
        >
          <Button
            variant="destructive"
            size="sm"
            className="rounded-lg h-9 gap-2 text-xs font-medium"
            onClick={() => setClearAllOpen(true)}
            disabled={!tokens?.length}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.clearAllBtn}
          </Button>
        </SettingRow>
      </SectionCard>

      {/* Clear All Confirm Dialog */}
      <AlertDialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <AlertDialogContent className="rounded-xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">{t.bulkDeleteAllTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {t.bulkDeleteAllDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg" disabled={clearAllPending}>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleClearAll}
              disabled={clearAllPending}
            >
              {clearAllPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />{t.applying}
                </span>
              ) : t.confirmDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
