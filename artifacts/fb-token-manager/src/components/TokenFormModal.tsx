import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useCreateToken, 
  useUpdateToken, 
  useGetToken,
  getListTokensQueryKey, 
  getGetTokenStatsQueryKey,
  getGetTokenQueryKey
} from "@workspace/api-client-react";
import type { FbToken } from "@workspace/api-client-react/src/generated/api.schemas";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";

const formSchema = z.object({
  fbId: z.string().min(1, "Facebook ID is required"),
  token: z.string().min(1, "Token is required"),
  status: z.enum(["active", "expired", "invalid"]),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TokenFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  token?: FbToken; // If provided, it's edit mode
}

export function TokenFormModal({ isOpen, onOpenChange, token }: TokenFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!token;

  const { data: fetchedToken, isLoading: isFetching } = useGetToken(token?.id as number, {
    query: {
      enabled: isEdit && isOpen,
      queryKey: getGetTokenQueryKey(token?.id as number)
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fbId: token?.fbId || "",
      token: token?.token || "",
      status: token?.status || "active",
      note: token?.note || "",
    },
  });

  useEffect(() => {
    if (fetchedToken && isEdit) {
      form.reset({
        fbId: fetchedToken.fbId,
        token: fetchedToken.token,
        status: fetchedToken.status,
        note: fetchedToken.note || "",
      });
    }
  }, [fetchedToken, isEdit, form]);

  const createMutation = useCreateToken({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTokensQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTokenStatsQueryKey() });
        toast({ title: "Token created successfully", description: "The token has been added to the system." });
        onOpenChange(false);
        form.reset();
      },
      onError: () => {
        toast({ title: "Error creating token", description: "Please check your inputs and try again.", variant: "destructive" });
      }
    }
  });

  const updateMutation = useUpdateToken({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTokensQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTokenStatsQueryKey() });
        if (token) {
          queryClient.invalidateQueries({ queryKey: getGetTokenQueryKey(token.id) });
        }
        toast({ title: "Token updated successfully", description: "The changes have been saved." });
        onOpenChange(false);
      },
      onError: () => {
        toast({ title: "Error updating token", description: "Please try again.", variant: "destructive" });
      }
    }
  });

  const onSubmit = (values: FormValues) => {
    if (isEdit && token) {
      updateMutation.mutate({ id: token.id, data: values });
    } else {
      createMutation.mutate({ data: values });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-none border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase tracking-wider">{isEdit ? "Edit Token" : "Add Token"}</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {isEdit ? "Modify token details below." : "Enter token details to track it in the system."}
          </DialogDescription>
        </DialogHeader>
        
        {isEdit && isFetching ? (
          <div className="flex justify-center p-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="fbId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">FB Account ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter FB ID" className="rounded-none font-mono" {...field} />
                    </FormControl>
                    <FormMessage className="font-mono text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Access Token</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the access token" className="rounded-none font-mono" type="password" {...field} />
                    </FormControl>
                    <FormMessage className="font-mono text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-none font-mono">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-none border-border">
                        <SelectItem value="active" className="font-mono rounded-none">ACTIVE</SelectItem>
                        <SelectItem value="expired" className="font-mono rounded-none">EXPIRED</SelectItem>
                        <SelectItem value="invalid" className="font-mono rounded-none">INVALID</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="font-mono text-xs" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Note (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any contextual notes here..." 
                        className="resize-none rounded-none font-mono min-h-[80px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="font-mono text-xs" />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-none font-mono">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="rounded-none font-mono flex items-center gap-2">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isEdit ? "Save Changes" : "Add Token"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
