import { useState } from "react";
import { TokenStats } from "@/components/TokenStats";
import { TokenTable } from "@/components/TokenTable";
import { TokenFormModal } from "@/components/TokenFormModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Terminal, Plus, Search, Filter } from "lucide-react";

export function Dashboard() {
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-1.5 bg-primary/10 border border-primary/20 rounded shadow-[0_0_10px_hsl(var(--primary)_/_0.1)]">
              <Terminal className="w-5 h-5" />
            </div>
            <h1 className="font-mono font-bold tracking-widest text-lg uppercase">Token Manager</h1>
          </div>
          
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-none font-mono uppercase tracking-wider text-xs gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Token
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
        <TokenStats />

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="font-mono text-xl font-bold tracking-widest uppercase">Token Registry</h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search FB ID..." 
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-9 rounded-none font-mono bg-card"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36 rounded-none font-mono bg-card">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border">
                    <SelectItem value="all" className="font-mono rounded-none">ALL</SelectItem>
                    <SelectItem value="active" className="font-mono rounded-none">ACTIVE</SelectItem>
                    <SelectItem value="expired" className="font-mono rounded-none">EXPIRED</SelectItem>
                    <SelectItem value="invalid" className="font-mono rounded-none">INVALID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <TokenTable 
            searchFilter={searchFilter} 
            statusFilter={statusFilter} 
          />
        </div>
      </main>
      
      {isAddModalOpen && (
        <TokenFormModal 
          isOpen={isAddModalOpen} 
          onOpenChange={setIsAddModalOpen} 
        />
      )}
    </div>
  );
}
