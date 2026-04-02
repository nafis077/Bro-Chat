import { useEffect, useRef, useState, useCallback } from "react";
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
  getGetTokenQueryKey,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Loader2,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";

const formSchema = z.object({
  fbId: z.string().min(1, "Facebook ID is required"),
  token: z.string().min(1, "Token is required"),
  status: z.enum(["active", "expired", "invalid"]),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ParsedToken {
  fbId: string;
  token: string;
  status: "active" | "expired" | "invalid";
  note: string;
  error?: string;
}

interface TokenFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  token?: FbToken;
}

function parseFileContent(content: string): ParsedToken[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const validStatuses = ["active", "expired", "invalid"];

  return lines.map((line) => {
    // Support comma or pipe delimiter
    const parts = line.includes("|") ? line.split("|") : line.split(",");
    const [rawFbId, rawToken, rawStatus, ...noteParts] = parts.map((p) =>
      p.trim()
    );

    const fbId = rawFbId || "";
    const token = rawToken || "";
    const status = validStatuses.includes(rawStatus?.toLowerCase())
      ? (rawStatus.toLowerCase() as "active" | "expired" | "invalid")
      : "active";
    const note = noteParts.join(",").trim();

    let error: string | undefined;
    if (!fbId) error = "Missing FB ID";
    else if (!token) error = "Missing token";

    return { fbId, token, status, note, error };
  });
}

export function TokenFormModal({
  isOpen,
  onOpenChange,
  token,
}: TokenFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEdit = !!token;

  // File import state
  const [parsedTokens, setParsedTokens] = useState<ParsedToken[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [importPending, setImportPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: fetchedToken, isLoading: isFetching } = useGetToken(
    token?.id as number,
    {
      query: {
        enabled: isEdit && isOpen,
        queryKey: getGetTokenQueryKey(token?.id as number),
      },
    }
  );

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

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getListTokensQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetTokenStatsQueryKey() });
  }, [queryClient]);

  const createMutation = useCreateToken({
    mutation: {
      onSuccess: () => {
        invalidateAll();
        toast({
          title: "Token created",
          description: "Token has been added successfully.",
        });
        onOpenChange(false);
        form.reset();
      },
      onError: () => {
        toast({
          title: "Error creating token",
          description: "Please check your inputs and try again.",
          variant: "destructive",
        });
      },
    },
  });

  const updateMutation = useUpdateToken({
    mutation: {
      onSuccess: () => {
        invalidateAll();
        if (token) {
          queryClient.invalidateQueries({
            queryKey: getGetTokenQueryKey(token.id),
          });
        }
        toast({
          title: "Token updated",
          description: "Changes have been saved.",
        });
        onOpenChange(false);
      },
      onError: () => {
        toast({
          title: "Error updating token",
          description: "Please try again.",
          variant: "destructive",
        });
      },
    },
  });

  const onSubmit = (values: FormValues) => {
    if (isEdit && token) {
      updateMutation.mutate({ id: token.id, data: values });
    } else {
      createMutation.mutate({ data: values });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseFileContent(content);
      setParsedTokens(parsed);
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const removeRow = (index: number) => {
    setParsedTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRowStatus = (
    index: number,
    status: "active" | "expired" | "invalid"
  ) => {
    setParsedTokens((prev) =>
      prev.map((t, i) => (i === index ? { ...t, status } : t))
    );
  };

  const validTokens = parsedTokens.filter((t) => !t.error);
  const invalidRows = parsedTokens.filter((t) => t.error);

  const handleBulkImport = async () => {
    if (validTokens.length === 0) return;
    setImportPending(true);
    let successCount = 0;
    let failCount = 0;

    for (const t of validTokens) {
      try {
        await new Promise<void>((resolve, reject) => {
          createMutation.mutate(
            {
              data: {
                fbId: t.fbId,
                token: t.token,
                status: t.status,
                note: t.note || undefined,
              },
            },
            {
              onSuccess: () => { successCount++; resolve(); },
              onError: () => { failCount++; resolve(); },
            }
          );
        });
      } catch {
        failCount++;
      }
    }

    invalidateAll();
    setImportPending(false);
    setParsedTokens([]);
    setFileName("");
    onOpenChange(false);

    toast({
      title: `Import complete`,
      description: `${successCount} token(s) imported${failCount > 0 ? `, ${failCount} failed` : ""}.`,
      variant: failCount > 0 ? "destructive" : "default",
    });
  };

  const resetFileState = () => {
    setParsedTokens([]);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetFileState();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[600px] rounded-none border-border bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono uppercase tracking-wider">
            {isEdit ? "Edit Token" : "Add Token"}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {isEdit
              ? "Modify token details below."
              : "Enter token details manually or import from a file."}
          </DialogDescription>
        </DialogHeader>

        {isEdit ? (
          /* Edit mode: no tabs, just the form */
          isFetching ? (
            <div className="flex justify-center p-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <ManualForm
              form={form}
              onSubmit={onSubmit}
              isPending={isPending}
              isEdit
              onCancel={() => onOpenChange(false)}
            />
          )
        ) : (
          /* Add mode: tabs */
          <Tabs defaultValue="manual" className="pt-2">
            <TabsList className="rounded-none border border-border bg-background w-full">
              <TabsTrigger
                value="manual"
                className="flex-1 rounded-none font-mono text-xs uppercase tracking-wider"
              >
                Manual Input
              </TabsTrigger>
              <TabsTrigger
                value="file"
                className="flex-1 rounded-none font-mono text-xs uppercase tracking-wider"
              >
                Import File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <ManualForm
                form={form}
                onSubmit={onSubmit}
                isPending={isPending}
                isEdit={false}
                onCancel={() => onOpenChange(false)}
              />
            </TabsContent>

            <TabsContent value="file" className="space-y-4 pt-4">
              {/* Format hint */}
              <div className="bg-muted/30 border border-border p-3 font-mono text-xs text-muted-foreground space-y-1">
                <p className="text-foreground font-semibold mb-1">File format (CSV or TXT):</p>
                <p>Each line: <span className="text-primary">fb_id, token, status, note</span></p>
                <p className="opacity-70">status: active | expired | invalid (optional, defaults to active)</p>
                <p className="opacity-70">note: optional</p>
                <p className="opacity-70">Delimiter: comma (,) or pipe (|)</p>
              </div>

              {/* Drop zone */}
              {parsedTokens.length === 0 && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-none p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors
                    ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/20"}`}
                >
                  <Upload className={`w-8 h-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="text-center font-mono">
                    <p className="text-sm font-medium">Drop file here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">.csv or .txt</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </div>
              )}

              {/* Preview table */}
              {parsedTokens.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{fileName}</span>
                      <span className="text-primary">{validTokens.length} valid</span>
                      {invalidRows.length > 0 && (
                        <span className="text-destructive">{invalidRows.length} invalid</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-none font-mono text-xs h-7"
                      onClick={resetFileState}
                    >
                      Clear
                    </Button>
                  </div>

                  <div className="border border-border max-h-60 overflow-y-auto">
                    <table className="w-full text-xs font-mono">
                      <thead className="bg-muted/30 sticky top-0">
                        <tr>
                          <th className="text-left px-2 py-1.5 text-muted-foreground font-medium border-b border-border">FB ID</th>
                          <th className="text-left px-2 py-1.5 text-muted-foreground font-medium border-b border-border">Token</th>
                          <th className="text-left px-2 py-1.5 text-muted-foreground font-medium border-b border-border w-28">Status</th>
                          <th className="text-left px-2 py-1.5 text-muted-foreground font-medium border-b border-border w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedTokens.map((t, i) => (
                          <tr
                            key={i}
                            className={`border-b border-border/50 last:border-0 ${t.error ? "bg-destructive/5" : "hover:bg-muted/10"}`}
                          >
                            <td className="px-2 py-1.5">
                              {t.error ? (
                                <span className="flex items-center gap-1 text-destructive">
                                  <AlertCircle className="w-3 h-3" />
                                  {t.error}
                                </span>
                              ) : (
                                <span className="text-foreground">{t.fbId}</span>
                              )}
                            </td>
                            <td className="px-2 py-1.5 text-muted-foreground">
                              {t.token ? `${t.token.slice(0, 20)}...` : "-"}
                            </td>
                            <td className="px-2 py-1.5">
                              {!t.error && (
                                <Select
                                  value={t.status}
                                  onValueChange={(v) => updateRowStatus(i, v as "active" | "expired" | "invalid")}
                                >
                                  <SelectTrigger className="h-6 rounded-none text-xs font-mono border-border bg-transparent px-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-none border-border font-mono text-xs">
                                    <SelectItem value="active" className="rounded-none">active</SelectItem>
                                    <SelectItem value="expired" className="rounded-none">expired</SelectItem>
                                    <SelectItem value="invalid" className="rounded-none">invalid</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <button
                                onClick={() => removeRow(i)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {validTokens.length} token(s) ready to import
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-none font-mono text-xs"
                        disabled={importPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleBulkImport}
                        disabled={validTokens.length === 0 || importPending}
                        className="rounded-none font-mono text-xs gap-2"
                      >
                        {importPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        Import {validTokens.length} Token(s)
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ManualFormProps {
  form: ReturnType<typeof useForm<FormValues>>;
  onSubmit: (values: FormValues) => void;
  isPending: boolean;
  isEdit: boolean;
  onCancel: () => void;
}

function ManualForm({ form, onSubmit, isPending, isEdit, onCancel }: ManualFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="fbId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                FB Account ID
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter FB ID"
                  className="rounded-none font-mono"
                  {...field}
                />
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
              <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Access Token
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter the access token"
                  className="rounded-none font-mono"
                  type="password"
                  {...field}
                />
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
              <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Status
              </FormLabel>
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
              <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Note (Optional)
              </FormLabel>
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
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-none font-mono"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-none font-mono flex items-center gap-2"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEdit ? "Save Changes" : "Add Token"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
