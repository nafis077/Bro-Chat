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
import { useLang } from "@/lib/lang-context";
import type { T } from "@/lib/i18n";
import { Save, Loader2, Upload, FileText, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";

const formSchema = z.object({
  fbId: z.string().min(1),
  token: z.string().min(1),
  cookie: z.string().optional(),
  status: z.enum(["active", "expired", "invalid"]),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ParsedToken {
  fbId: string;
  token: string;
  cookie: string;
  status: "active" | "expired" | "invalid";
  note: string;
  error?: string;
}

interface TokenFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  token?: FbToken;
}

function parseFileContent(content: string, t: T): ParsedToken[] {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const validStatuses = ["active", "expired", "invalid"];

  return lines.map((line) => {
    const delimiter = line.includes("|") ? "|" : ",";
    const parts = line.split(delimiter).map((p) => p.trim());
    const [rawFbId = "", rawToken = "", rawCookie = "", rawStatus = "", ...noteParts] = parts;

    let cookie = "";
    let status: "active" | "expired" | "invalid" = "active";
    let note = "";

    if (validStatuses.includes(rawCookie.toLowerCase())) {
      status = rawCookie.toLowerCase() as "active" | "expired" | "invalid";
      note = [rawStatus, ...noteParts].join(delimiter).trim();
    } else {
      cookie = rawCookie;
      if (validStatuses.includes(rawStatus.toLowerCase())) {
        status = rawStatus.toLowerCase() as "active" | "expired" | "invalid";
      }
      note = noteParts.join(delimiter).trim();
    }

    let error: string | undefined;
    if (!rawFbId) error = t.missingFbId;
    else if (!rawToken) error = t.missingToken;

    return { fbId: rawFbId, token: rawToken, cookie, status, note, error };
  });
}

interface ManualFormProps {
  form: ReturnType<typeof useForm<FormValues>>;
  onSubmit: (values: FormValues) => void;
  isPending: boolean;
  isEdit: boolean;
  onCancel: () => void;
  t: T;
}

function ManualForm({ form, onSubmit, isPending, isEdit, onCancel, t }: ManualFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="fbId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-muted-foreground">{t.labelFbId}</FormLabel>
              <FormControl>
                <Input placeholder="100012345678901" className="rounded-lg font-mono" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-muted-foreground">{t.labelToken}</FormLabel>
              <FormControl>
                <Input placeholder="EAABsbCS1iHgBO..." className="rounded-lg font-mono" type="password" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cookie"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-muted-foreground">
                {t.labelCookie} <span className="opacity-50 font-normal">{t.labelCookieOptional}</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="datr=xxx; sb=xxx; c_user=xxx; xs=xxx..."
                  className="resize-none rounded-lg font-mono min-h-[70px] text-xs"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-muted-foreground">{t.labelStatus}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder={t.selectStatus} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-lg">
                  <SelectItem value="active">{t.statusActive}</SelectItem>
                  <SelectItem value="expired">{t.statusExpired}</SelectItem>
                  <SelectItem value="invalid">{t.statusInvalid}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-muted-foreground">
                {t.labelNote} <span className="opacity-50 font-normal">{t.labelNoteOptional}</span>
              </FormLabel>
              <FormControl>
                <Textarea placeholder={t.placeholderNote} className="resize-none rounded-lg min-h-[60px]" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg">
            {t.cancel}
          </Button>
          <Button type="submit" disabled={isPending} className="rounded-lg flex items-center gap-2">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? t.save : t.createBtn}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function TokenFormModal({ isOpen, onOpenChange, token }: TokenFormModalProps) {
  const { toast } = useToast();
  const { t } = useLang();
  const queryClient = useQueryClient();
  const isEdit = !!token;

  const [parsedTokens, setParsedTokens] = useState<ParsedToken[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [importPending, setImportPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: fetchedToken, isLoading: isFetching } = useGetToken(
    token?.id as number,
    { query: { enabled: isEdit && isOpen, queryKey: getGetTokenQueryKey(token?.id as number) } }
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fbId: token?.fbId || "",
      token: token?.token || "",
      cookie: token?.cookie || "",
      status: token?.status || "active",
      note: token?.note || "",
    },
  });

  useEffect(() => {
    if (fetchedToken && isEdit) {
      form.reset({
        fbId: fetchedToken.fbId,
        token: fetchedToken.token,
        cookie: fetchedToken.cookie || "",
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
        toast({ title: t.toastCreated, description: t.toastCreatedDesc });
        onOpenChange(false);
        form.reset();
      },
      onError: () => {
        toast({ title: t.toastCreateError, description: t.toastCreateErrorDesc, variant: "destructive" });
      },
    },
  });

  const updateMutation = useUpdateToken({
    mutation: {
      onSuccess: () => {
        invalidateAll();
        if (token) queryClient.invalidateQueries({ queryKey: getGetTokenQueryKey(token.id) });
        toast({ title: t.toastUpdated, description: t.toastUpdatedDesc });
        onOpenChange(false);
      },
      onError: () => {
        toast({ title: t.toastUpdateError, description: t.toastUpdateErrorDesc, variant: "destructive" });
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
      setParsedTokens(parseFileContent(content, t));
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

  const removeRow = (index: number) => setParsedTokens((p) => p.filter((_, i) => i !== index));
  const updateRowStatus = (index: number, status: "active" | "expired" | "invalid") =>
    setParsedTokens((p) => p.map((tk, i) => (i === index ? { ...tk, status } : tk)));

  const validTokens = parsedTokens.filter((tk) => !tk.error);
  const errorTokens = parsedTokens.filter((tk) => tk.error);

  const handleBulkImport = async () => {
    if (validTokens.length === 0) return;
    setImportPending(true);
    let successCount = 0;
    let failCount = 0;

    for (const tk of validTokens) {
      await new Promise<void>((resolve) => {
        createMutation.mutate(
          { data: { fbId: tk.fbId, token: tk.token, cookie: tk.cookie || undefined, status: tk.status, note: tk.note || undefined } },
          { onSuccess: () => { successCount++; resolve(); }, onError: () => { failCount++; resolve(); } }
        );
      });
    }

    invalidateAll();
    setImportPending(false);
    setParsedTokens([]);
    setFileName("");
    onOpenChange(false);
    toast({
      title: t.toastImported,
      description: t.toastImportedDesc(successCount, failCount),
      variant: failCount > 0 ? "destructive" : "default",
    });
  };

  const resetFileState = () => {
    setParsedTokens([]);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetFileState(); onOpenChange(open); }}>
      <DialogContent className="sm:max-w-[620px] rounded-xl border-border bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg">
            {isEdit ? t.editToken : t.newToken}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isEdit ? t.editTokenDesc : t.newTokenDesc}
          </DialogDescription>
        </DialogHeader>

        {isEdit ? (
          isFetching ? (
            <div className="flex justify-center p-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <ManualForm form={form} onSubmit={onSubmit} isPending={isPending} isEdit t={t} onCancel={() => onOpenChange(false)} />
          )
        ) : (
          <Tabs defaultValue="manual" className="pt-2">
            <TabsList className="rounded-lg border border-border bg-muted/30 w-full">
              <TabsTrigger value="manual" className="flex-1 rounded-md text-sm font-medium">
                {t.manualInput}
              </TabsTrigger>
              <TabsTrigger value="file" className="flex-1 rounded-md text-sm font-medium">
                {t.importFile}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <ManualForm form={form} onSubmit={onSubmit} isPending={isPending} isEdit={false} t={t} onCancel={() => onOpenChange(false)} />
            </TabsContent>

            <TabsContent value="file" className="space-y-4 pt-4">
              <div className="bg-muted/30 border border-border rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                <p className="text-foreground font-semibold mb-1">{t.fileFormatTitle}</p>
                <p><span className="text-primary font-mono">{t.fileFormatFull}</span></p>
                <p><span className="text-primary font-mono">{t.fileFormatNoCookie}</span></p>
                <p><span className="text-primary font-mono">{t.fileFormatMinimal}</span></p>
                <p className="opacity-60 pt-1">{t.fileFormatNote}</p>
              </div>

              {parsedTokens.length === 0 ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/20"
                  }`}
                >
                  <Upload className={`w-8 h-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="text-center">
                    <p className="text-sm font-medium">{t.dropZoneTitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.dropZoneHint}</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileInput} />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate max-w-[180px]">{fileName}</span>
                      <span className="text-emerald-500 font-medium">{t.validCount(validTokens.length)}</span>
                      {errorTokens.length > 0 && (
                        <span className="text-destructive font-medium">{t.errorCount(errorTokens.length)}</span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-lg text-xs h-7" onClick={resetFileState}>
                      {t.clearFile}
                    </Button>
                  </div>

                  <div className="rounded-lg border border-border max-h-56 overflow-y-auto">
                    <table className="w-full text-xs font-mono">
                      <thead className="bg-muted/30 sticky top-0">
                        <tr>
                          <th className="text-left px-2 py-1.5 text-muted-foreground font-medium border-b border-border">{t.colFbId}</th>
                          <th className="text-left px-2 py-1.5 text-muted-foreground font-medium border-b border-border">{t.colToken}</th>
                          <th className="text-left px-2 py-1.5 text-muted-foreground font-medium border-b border-border">{t.colCookie}</th>
                          <th className="text-left px-2 py-1.5 text-muted-foreground font-medium border-b border-border w-28">{t.colStatus}</th>
                          <th className="w-8 border-b border-border"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedTokens.map((tk, i) => (
                          <tr key={i} className={`border-b border-border/50 last:border-0 ${tk.error ? "bg-destructive/5" : "hover:bg-muted/10"}`}>
                            <td className="px-2 py-1.5">
                              {tk.error ? (
                                <span className="flex items-center gap-1 text-destructive">
                                  <AlertCircle className="w-3 h-3" />{tk.error}
                                </span>
                              ) : (
                                <span className="text-foreground">{tk.fbId}</span>
                              )}
                            </td>
                            <td className="px-2 py-1.5 text-muted-foreground">
                              {tk.token ? `${tk.token.slice(0, 16)}…` : "-"}
                            </td>
                            <td className="px-2 py-1.5 text-muted-foreground">
                              {tk.cookie ? `${tk.cookie.slice(0, 14)}…` : <span className="opacity-40">-</span>}
                            </td>
                            <td className="px-2 py-1.5">
                              {!tk.error && (
                                <Select value={tk.status} onValueChange={(v) => updateRowStatus(i, v as "active" | "expired" | "invalid")}>
                                  <SelectTrigger className="h-6 rounded-md text-xs border-border bg-transparent px-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-lg border-border text-xs">
                                    <SelectItem value="active">active</SelectItem>
                                    <SelectItem value="expired">expired</SelectItem>
                                    <SelectItem value="invalid">invalid</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {t.readyToImport(validTokens.length)}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg text-sm" disabled={importPending}>
                        {t.cancel}
                      </Button>
                      <Button onClick={handleBulkImport} disabled={validTokens.length === 0 || importPending} className="rounded-lg text-sm gap-2">
                        {importPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {t.importBtn(validTokens.length)}
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
