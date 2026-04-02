import { useGetTokenStats, getGetTokenStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export function TokenStats() {
  const { data: stats, isLoading } = useGetTokenStats({
    query: {
      queryKey: getGetTokenStatsQueryKey()
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-none border-border shadow-none bg-card animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-16 bg-muted rounded"></div>
              <div className="h-4 w-4 bg-muted rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-muted rounded mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatCard 
        title="Total Tokens" 
        value={stats?.total || 0} 
        icon={<Database className="h-4 w-4 text-muted-foreground" />} 
      />
      <StatCard 
        title="Active" 
        value={stats?.active || 0} 
        icon={<CheckCircle2 className="h-4 w-4 text-[hsl(142.1_70.6%_45.3%)]" />} 
        glowColor="hsl(142.1 70.6% 45.3%)"
      />
      <StatCard 
        title="Expired" 
        value={stats?.expired || 0} 
        icon={<Clock className="h-4 w-4 text-[hsl(47.9_95.8%_53.1%)]" />} 
        glowColor="hsl(47.9 95.8% 53.1%)"
      />
      <StatCard 
        title="Invalid" 
        value={stats?.invalid || 0} 
        icon={<AlertTriangle className="h-4 w-4 text-destructive" />} 
        glowColor="hsl(var(--destructive))"
      />
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  glowColor 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  glowColor?: string;
}) {
  return (
    <Card className="rounded-none border-border shadow-none bg-card relative overflow-hidden group">
      {glowColor && (
        <div 
          className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"
          style={{ backgroundColor: glowColor }}
        />
      )}
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-mono font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
