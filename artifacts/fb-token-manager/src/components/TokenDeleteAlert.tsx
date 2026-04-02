import { useQueryClient } from "@tanstack/react-query";
import { useDeleteToken, getListTokensQueryKey, getGetTokenStatsQueryKey } from "@workspace/api-client-react";
import type { FbToken } from "@workspace/api-client-react/src/generated/api.schemas";
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
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/lang-context";
import { Trash2 } from "lucide-react";

interface TokenDeleteAlertProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  token: FbToken;
}

export function TokenDeleteAlert({ isOpen, onOpenChange, token }: TokenDeleteAlertProps) {
  const { toast } = useToast();
  const { t } = useLang();
  const queryClient = useQueryClient();

  const deleteMutation = useDeleteToken({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTokensQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTokenStatsQueryKey() });
        toast({ title: t.toastDeleted, description: t.toastDeletedDesc });
        onOpenChange(false);
      },
      onError: () => {
        toast({ title: t.toastDeleteError, description: t.toastDeleteErrorDesc, variant: "destructive" });
      },
    },
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl border-border bg-card sm:max-w-[420px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive font-semibold">
            <Trash2 className="w-5 h-5" />
            {t.deleteTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-3">
            {t.deleteConfirm(token.fbId)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="rounded-lg">{t.deleteCancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); deleteMutation.mutate({ id: token.id }); }}
            disabled={deleteMutation.isPending}
            className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? t.deleting : t.deleteBtn}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
