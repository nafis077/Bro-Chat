import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListTokens, getListTokensQueryKey, useDeleteToken } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { TokenFormModal } from "./TokenFormModal";
import { TokenDeleteAlert } from "./TokenDeleteAlert";
import { useToast } from "@/hooks/use-toast";
import type { FbToken } from "@workspace/api-client-react/src/generated/api.schemas";
import { format } from "date-fns";

interface TokenTableProps {
  statusFilter?: string;
  searchFilter?: string;
}

export function TokenTable({ statusFilter, searchFilter }: TokenTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const [editingToken, setEditingToken] = useState<FbToken | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [deletingToken, setDeletingToken] = useState<FbToken | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const params: Record<string, string> = {};
  if (statusFilter && statusFilter !== "all") params.status = statusFilter;
  if (searchFilter) params.search = searchFilter;

  const { data: tokens, isLoading } = useListTokens(params, {
    query: {
      queryKey: getListTokensQueryKey(params),
    }
  });

  const handleCopy = (id: number, token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    toast({
      title: "Token copied",
      description: "Token copied to clipboard.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEdit = (token: FbToken) => {
    setEditingToken(token);
    setIsEditModalOpen(true);
  };

  const openDelete = (token: FbToken) => {
    setDeletingToken(token);
    setIsDeleteAlertOpen(true);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground font-mono text-sm animate-pulse">Loading tokens...</div>;
  }

  if (!tokens || tokens.length === 0) {
    return (
      <div className="border border-border bg-card p-12 text-center rounded-none shadow-sm flex flex-col items-center justify-center">
        <p className="text-muted-foreground font-mono text-sm">No tokens found matching your criteria.</p>
      </div>
    );
  }

  return (
    <>
      <div className="border border-border bg-card rounded-none overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="w-[80px] font-mono text-xs uppercase tracking-wider text-muted-foreground">ID</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">FB ID</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Token</TableHead>
              <TableHead className="w-[100px] font-mono text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Note</TableHead>
              <TableHead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Created</TableHead>
              <TableHead className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono text-xs text-muted-foreground">{token.id}</TableCell>
                <TableCell className="font-mono text-sm font-medium">{token.fbId}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 group">
                    <span className="font-mono text-xs truncate max-w-[150px] inline-block text-muted-foreground bg-muted px-2 py-1 border border-border">
                      {token.token.substring(0, 16)}...
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => handleCopy(token.id, token.token)}
                      title="Copy full token"
                    >
                      {copiedId === token.id ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={token.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate" title={token.note || ""}>
                  {token.note || <span className="italic opacity-50">none</span>}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {format(new Date(token.createdAt), "yyyy-MM-dd HH:mm")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => openEdit(token)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => openDelete(token)}>
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
        <TokenFormModal 
          isOpen={isEditModalOpen} 
          onOpenChange={setIsEditModalOpen} 
          token={editingToken} 
        />
      )}

      {isDeleteAlertOpen && deletingToken && (
        <TokenDeleteAlert 
          isOpen={isDeleteAlertOpen} 
          onOpenChange={setIsDeleteAlertOpen} 
          token={deletingToken} 
        />
      )}
    </>
  );
}

function StatusBadge({ status }: { status: "active" | "expired" | "invalid" }) {
  const getStatusClasses = () => {
    switch (status) {
      case "active":
        return "bg-[hsl(142.1_70.6%_45.3%_/_0.15)] text-[hsl(142.1_70.6%_45.3%)] border-[hsl(142.1_70.6%_45.3%_/_0.3)] shadow-[0_0_8px_hsl(142.1_70.6%_45.3%_/_0.15)]";
      case "expired":
        return "bg-[hsl(47.9_95.8%_53.1%_/_0.15)] text-[hsl(47.9_95.8%_53.1%)] border-[hsl(47.9_95.8%_53.1%_/_0.3)] shadow-[0_0_8px_hsl(47.9_95.8%_53.1%_/_0.15)]";
      case "invalid":
        return "bg-destructive/15 text-destructive border-destructive/30 shadow-[0_0_8px_hsl(var(--destructive)_/_0.15)]";
    }
  };

  return (
    <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-none border ${getStatusClasses()}`}>
      {status}
    </Badge>
  );
}
