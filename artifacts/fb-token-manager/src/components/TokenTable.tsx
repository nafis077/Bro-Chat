import { useState } from "react";
import { useListTokens, getListTokensQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { TokenFormModal } from "./TokenFormModal";
import { TokenDeleteAlert } from "./TokenDeleteAlert";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/lang-context";
import type { FbToken } from "@workspace/api-client-react/src/generated/api.schemas";
import { format } from "date-fns";

interface TokenTableProps {
  statusFilter?: string;
  searchFilter?: string;
}

function CopyCell({ value, isCopied, onCopy }: { value: string; isCopied: boolean; onCopy: () => void }) {
  return (
    <div className="flex items-center gap-2 group">
      <span className="font-mono text-xs inline-block text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border max-w-[110px] truncate">
        {value.substring(0, 14)}…
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 rounded-md"
        onClick={onCopy}
      >
        {isCopied ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

function StatusBadge({ status, label }: { status: "active" | "expired" | "invalid"; label: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    expired: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    invalid: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Badge variant="outline" className={`text-xs font-medium rounded-full px-2.5 py-0.5 border ${styles[status]}`}>
      {label}
    </Badge>
  );
}

export function TokenTable({ statusFilter, searchFilter }: TokenTableProps) {
  const { toast } = useToast();
  const { t } = useLang();
  const [copiedId, setCopiedId] = useState<{ id: number; field: "token" | "cookie" } | null>(null);
  const [editingToken, setEditingToken] = useState<FbToken | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingToken, setDeletingToken] = useState<FbToken | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const params: Record<string, string> = {};
  if (statusFilter && statusFilter !== "all") params.status = statusFilter;
  if (searchFilter) params.search = searchFilter;

  const { data: tokens, isLoading } = useListTokens(params, {
    query: { queryKey: getListTokensQueryKey(params) },
  });

  const handleCopy = (id: number, value: string, field: "token" | "cookie") => {
    navigator.clipboard.writeText(value);
    setCopiedId({ id, field });
    toast({
      title: field === "token" ? t.copiedToken : t.copiedCookie,
      description: t.copiedDesc,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusLabel = (status: "active" | "expired" | "invalid") => {
    if (status === "active") return t.statusActive;
    if (status === "expired") return t.statusExpired;
    return t.statusInvalid;
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground text-sm animate-pulse">
        {t.loading}
      </div>
    );
  }

  if (!tokens || tokens.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">{t.noTokens}</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border bg-muted/30">
              <TableHead className="w-[50px] text-xs font-semibold text-muted-foreground">{t.colId}</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">{t.colFbId}</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">{t.colToken}</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">{t.colCookie}</TableHead>
              <TableHead className="w-[110px] text-xs font-semibold text-muted-foreground">{t.colStatus}</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">{t.colNote}</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">{t.colCreated}</TableHead>
              <TableHead className="text-right text-xs font-semibold text-muted-foreground">{t.colActions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <TableCell className="font-mono text-xs text-muted-foreground">{token.id}</TableCell>
                <TableCell className="font-mono text-sm font-medium">{token.fbId}</TableCell>
                <TableCell>
                  <CopyCell
                    value={token.token}
                    isCopied={copiedId?.id === token.id && copiedId?.field === "token"}
                    onCopy={() => handleCopy(token.id, token.token, "token")}
                  />
                </TableCell>
                <TableCell>
                  {token.cookie ? (
                    <CopyCell
                      value={token.cookie}
                      isCopied={copiedId?.id === token.id && copiedId?.field === "cookie"}
                      onCopy={() => handleCopy(token.id, token.cookie!, "cookie")}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground/40 italic">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={token.status} label={statusLabel(token.status)} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate" title={token.note || ""}>
                  {token.note || <span className="italic text-muted-foreground/40">—</span>}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {format(new Date(token.createdAt), "yyyy-MM-dd HH:mm")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => { setEditingToken(token); setIsEditModalOpen(true); }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => { setDeletingToken(token); setIsDeleteAlertOpen(true); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isEditModalOpen && editingToken && (
        <TokenFormModal isOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen} token={editingToken} />
      )}
      {isDeleteAlertOpen && deletingToken && (
        <TokenDeleteAlert isOpen={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen} token={deletingToken} />
      )}
    </>
  );
}
