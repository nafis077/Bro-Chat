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
import { Trash2 } from "lucide-react";

interface TokenDeleteAlertProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  token: FbToken;
}

export function TokenDeleteAlert({ isOpen, onOpenChange, token }: TokenDeleteAlertProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useDeleteToken({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTokensQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTokenStatsQueryKey() });
        toast({ 
          title: "Token deleted", 
          description: "The token has been removed from the system." 
        });
        onOpenChange(false);
      },
      onError: () => {
        toast({ 
          title: "Error deleting token", 
          description: "An error occurred. Please try again.", 
          variant: "destructive" 
        });
      }
    }
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-none border-border bg-card sm:max-w-[400px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-mono uppercase tracking-wider flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Delete Token
          </AlertDialogTitle>
          <AlertDialogDescription className="font-mono text-sm text-muted-foreground mt-4">
            Are you sure you want to delete token for FB ID <span className="text-foreground font-bold">{token.fbId}</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel className="rounded-none font-mono uppercase text-xs">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              deleteMutation.mutate({ id: token.id });
            }}
            disabled={deleteMutation.isPending}
            className="rounded-none font-mono uppercase text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
