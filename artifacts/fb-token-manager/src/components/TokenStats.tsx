import { useGetTokenStats, getGetTokenStatsQueryKey } from "@workspace/api-client-react";
import { Database, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export function TokenStats() {
  const { data: stats, isLoading } = useGetTokenStats({
    query: { queryKey: getGetTokenStatsQueryKey() }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
            <div className="h-3 w-16 bg-muted rounded mb-4" />
            <div className="h-8 w-10 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Tokens"
        value={stats?.total ?? 0}
        icon={<Database className="w-4 h-4" />}
        iconBg="bg-primary/10 text-primary"
      />
      <StatCard
        title="Active"
        value={stats?.active ?? 0}
        icon={<CheckCircle2 className="w-4 h-4" />}
        iconBg="bg-emerald-500/10 text-emerald-500"
        valueColor="text-emerald-500"
      />
      <StatCard
        title="Expired"
        value={stats?.expired ?? 0}
        icon={<Clock className="w-4 h-4" />}
        iconBg="bg-amber-500/10 text-amber-500"
        valueColor="text-amber-500"
      />
      <StatCard
        title="Invalid"
        value={stats?.invalid ?? 0}
        icon={<AlertTriangle className="w-4 h-4" />}
        iconBg="bg-destructive/10 text-destructive"
        valueColor="text-destructive"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconBg,
  valueColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${valueColor ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}
