import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListTokens,
  useDeleteToken,
  getListTokensQueryKey,
  getGetTokenStatsQueryKey,
} from "@workspace/api-client-react";
import type { FbToken } from "@workspace/api-client-react/src/generated/api.schemas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/lang-context";
import type { T } from "@/lib/i18n";
import { TokenFormModal } from "@/components/TokenFormModal";
import { Pencil, Trash2, Copy, Check, Loader2, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

type Status = "active" | "expired" | "invalid";

const API_BASE = "/api";

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "content-type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
  return res;
}

const statusStyles: Record<Status, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  expired: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  invalid: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

function StatusBadge({ status, label }: { status: Status; label: string }) {
  return (
    <Badge variant="outline" className={`rounded-full text-xs font-medium px-2.5 py-0.5 ${statusStyles[status]}`}>
      {label}
    </Badge>
  );
}

interface CopyCellProps {
  value: string | null | undefined;
  label: string;
  toastTitle: string;
}

function CopyCell({ value, label, toastTitle }: CopyCellProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useLang();

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      toast({ title: toastTitle, description: t.copiedDesc });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!value) return <span className="text-muted-foreground/40">—</span>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={handleCopy} className="flex items-center gap-1.5 max-w-[120px] group">
          <span className="font-mono text-xs truncate text-foreground/80 group-hover:text-foreground transition-colors">
            {value.slice(0, 14)}…
          </span>
          {copied ? (
            <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          ) : (
            <Copy className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground flex-shrink-0 transition-colors" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px] break-all text-xs">{label}</TooltipContent>
    </Tooltip>
  );
}

interface BulkActionBarProps {
  selectedIds: Set<number>;
  onClear: () => void;
  onBulkStatus: (status: Status) => void;
  onBulkDelete: () => void;
  isPending: boolean;
  t: T;
}

function BulkActionBar({ selectedIds, onClear, onBulkStatus, onBulkDelete, isPending, t }: BulkActionBarProps) {
  const count = selectedIds.size;
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-primary/8 border border-primary/20 rounded-lg">
      <span className="text-sm font-semibold text-primary">
        {t.selectedCount(count)}
      </span>
      <div className="flex-1" />
      <div className="flex flex-wrap items-center gap-2">
        <Select onValueChange={(v) => onBulkStatus(v as Status)} disabled={isPending}>
          <SelectTrigger className="h-8 rounded-lg text-xs border-border bg-card px-3 min-w-[130px]">
            <SelectValue placeholder={t.bulkChangeStatus} />
          </SelectTrigger>
          <SelectContent className="rounded-lg border-border text-sm">
            <SelectItem value="active">{t.statusActive}</SelectItem>
            <SelectItem value="expired">{t.statusExpired}</SelectItem>
            <SelectItem value="invalid">{t.statusInvalid}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="destructive"
          size="sm"
          className="h-8 rounded-lg text-xs px-3 gap-1.5"
          onClick={onBulkDelete}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          {t.bulkDeleteSelected}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 rounded-lg text-xs px-2 text-muted-foreground hover:text-foreground gap-1"
          onClick={onClear}
          disabled={isPending}
        >
          <X className="w-3 h-3" />
          {t.clearSelection}
        </Button>
      </div>
    </div>
  );
}

interface TokenTableProps {
  searchFilter: string;
  statusFilter: string;
}

export function TokenTable({ searchFilter, statusFilter }: TokenTableProps) {
  const { toast } = useToast();
  const { t } = useLang();
  const queryClient = useQueryClient();

  const [editToken, setEditToken] = useState<FbToken | null>(null);
  const [deleteToken, setDeleteToken] = useState<FbToken | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkPending, setBulkPending] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(() => {
    const saved = localStorage.getItem("tkm_perPage");
    return saved ? Number(saved) : 25;
  });

  const params = {
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchFilter || undefined,
  };

  const { data: tokens, isLoading } = useListTokens(params, {
    query: { queryKey: getListTokensQueryKey(params) },
  });

  const deleteMutation = useDeleteToken({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTokensQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTokenStatsQueryKey() });
        toast({ title: t.toastDeleted, description: t.toastDeletedDesc });
        setDeleteToken(null);
      },
      onError: () => {
        toast({ title: t.toastDeleteError, description: t.toastDeleteErrorDesc, variant: "destructive" });
      },
    },
  });

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getListTokensQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetTokenStatsQueryKey() });
  }, [queryClient]);

  // Reset to first page whenever filters change
  useEffect(() => { setCurrentPage(1); }, [searchFilter, statusFilter]);

  const tokenList = tokens ?? [];

  // Pagination math
  const totalItems = tokenList.length;
  const totalPages = perPage === 0 ? 1 : Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = perPage === 0 ? 0 : (safePage - 1) * perPage;
  const pageEnd   = perPage === 0 ? totalItems : Math.min(safePage * perPage, totalItems);
  const pagedList = tokenList.slice(pageStart, pageEnd);

  const handlePerPageChange = (val: string) => {
    const n = Number(val);
    setPerPage(n);
    setCurrentPage(1);
    localStorage.setItem("tkm_perPage", String(n));
  };

  const allIds = pagedList.map((tk) => tk.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = allIds.some((id) => selectedIds.has(id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(allIds));
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkStatus = async (status: Status) => {
    if (selectedIds.size === 0) return;
    setBulkPending(true);
    try {
      await apiFetch("/tokens/bulk-status", {
        method: "PATCH",
        body: JSON.stringify({ ids: Array.from(selectedIds), status }),
      });
      invalidateAll();
      toast({ title: t.toastBulkStatusUpdated, description: t.toastBulkStatusUpdatedDesc(selectedIds.size) });
      setSelectedIds(new Set());
    } catch {
      toast({ title: t.toastBulkError, description: t.toastBulkErrorDesc, variant: "destructive" });
    } finally {
      setBulkPending(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkPending(true);
    try {
      await apiFetch("/tokens/bulk", {
        method: "DELETE",
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      invalidateAll();
      toast({ title: t.toastBulkDeleted, description: t.toastBulkDeletedDesc(selectedIds.size) });
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    } catch {
      toast({ title: t.toastBulkError, description: t.toastBulkErrorDesc, variant: "destructive" });
    } finally {
      setBulkPending(false);
    }
  };

  const getStatusLabel = (status: Status) => {
    if (status === "active") return t.statusActive;
    if (status === "expired") return t.statusExpired;
    return t.statusInvalid;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("sv-SE", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    }).replace("T", " ");

  return (
    <>
      <div className="space-y-3">
        <BulkActionBar
          selectedIds={selectedIds}
          onClear={() => setSelectedIds(new Set())}
          onBulkStatus={handleBulkStatus}
          onBulkDelete={() => setBulkDeleteOpen(true)}
          isPending={bulkPending}
          t={t}
        />

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                    className="rounded"
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground w-12">{t.colId}</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">{t.colFbId}</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">{t.colToken}</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">{t.colCookie}</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">{t.colStatus}</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">{t.colNote}</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">{t.colCreated}</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground text-right pr-4">{t.colActions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">{t.loading}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : pagedList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-sm text-muted-foreground">
                    {t.noTokens}
                  </TableCell>
                </TableRow>
              ) : (
                pagedList.map((token) => {
                  const isSelected = selectedIds.has(token.id);
                  return (
                    <TableRow
                      key={token.id}
                      className={`border-border transition-colors ${isSelected ? "bg-primary/5 hover:bg-primary/8" : "hover:bg-muted/30"}`}
                    >
                      <TableCell className="pl-4">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOne(token.id)}
                          aria-label={`Select ${token.fbId}`}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{token.id}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm font-semibold">{token.fbId}</span>
                      </TableCell>
                      <TableCell>
                        <CopyCell value={token.token} label={token.token} toastTitle={t.copiedToken} />
                      </TableCell>
                      <TableCell>
                        <CopyCell value={token.cookie} label={token.cookie ?? ""} toastTitle={t.copiedCookie} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={token.status as Status} label={getStatusLabel(token.status as Status)} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[140px]">
                        <span className="truncate block">{token.note || <span className="opacity-30">—</span>}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {formatDate(token.createdAt)}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                                onClick={() => setEditToken(token)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">{t.editToken}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
                                onClick={() => setDeleteToken(token)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">{t.deleteBtn}</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination bar */}
        {!isLoading && totalItems > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
            {/* Info */}
            <p className="text-xs text-muted-foreground tabular-nums">
              {t.pageInfo(pageStart + 1, pageEnd, totalItems)}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {/* Rows per page */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{t.rowsPerPage}</span>
                <Select value={String(perPage)} onValueChange={handlePerPageChange}>
                  <SelectTrigger className="h-8 rounded-lg text-xs border-border bg-card px-2 w-[70px]">
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
              </div>

              {/* Page navigation — only when more than 1 page */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setCurrentPage(1)}
                    disabled={safePage === 1}
                    aria-label={t.pageFirst}
                  >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    aria-label={t.pagePrev}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>

                  {/* Page number buttons — sliding window */}
                  {(() => {
                    const WINDOW = 2;
                    const nums: (number | "…")[] = [];
                    let prev = 0;
                    for (let i = 1; i <= totalPages; i++) {
                      if (i === 1 || i === totalPages || (i >= safePage - WINDOW && i <= safePage + WINDOW)) {
                        if (prev && i - prev > 1) nums.push("…");
                        nums.push(i);
                        prev = i;
                      }
                    }
                    return nums.map((item, idx) =>
                      item === "…" ? (
                        <span key={`e-${idx}`} className="w-8 text-center text-xs text-muted-foreground">…</span>
                      ) : (
                        <Button
                          key={item}
                          variant={item === safePage ? "default" : "ghost"}
                          size="icon"
                          className={`h-8 w-8 rounded-lg text-xs font-medium ${item === safePage ? "pointer-events-none" : ""}`}
                          onClick={() => setCurrentPage(item)}
                          aria-current={item === safePage ? "page" : undefined}
                        >
                          {item}
                        </Button>
                      )
                    );
                  })()}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    aria-label={t.pageNext}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={safePage === totalPages}
                    aria-label={t.pageLast}
                  >
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {editToken && (
        <TokenFormModal
          isOpen={!!editToken}
          onOpenChange={(open) => { if (!open) setEditToken(null); }}
          token={editToken}
        />
      )}

      <AlertDialog open={!!deleteToken} onOpenChange={(open) => { if (!open) setDeleteToken(null); }}>
        <AlertDialogContent className="rounded-xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">{t.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {deleteToken && t.deleteConfirm(deleteToken.fbId)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">{t.deleteCancel}</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => deleteToken && deleteMutation.mutate({ id: deleteToken.id })}
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />{t.deleting}
                </span>
              ) : t.deleteBtn}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="rounded-xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">{t.bulkDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              {t.bulkDeleteDesc(selectedIds.size)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg" disabled={bulkPending}>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleBulkDelete}
              disabled={bulkPending}
            >
              {bulkPending ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t.applying}</span>
              ) : t.confirmDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
