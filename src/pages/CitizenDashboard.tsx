import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui';
import { StatCard } from '../components/StatCard';
import { RescueCard } from '../components/RescueCard';
import { useRescues } from '../hooks/useRescues';
import { useAuth } from '../hooks/useAuth';
export function CitizenDashboard() {
  const { user } = useAuth();
  const { rescues, isLoading } = useRescues();
  const myRescues = rescues.filter((r) => r.citizen_id === user?.user_id);
  const activeRescues = myRescues.filter(
    (r) => !['completed', 'cancelled', 'rejected'].includes(r.status)
  );
  const completedRescues = myRescues.filter((r) => r.status === 'completed');
  const criticalRescues = myRescues.filter((r) => r.severity === 'critical');
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Together we can make a difference today.
          </p>
        </div>
        <Button
          size="lg"
          className="gap-2 shadow-lg hover:shadow-xl transition-all"
          asChild>
          
          <Link to="/report">
            <PlusCircle className="w-5 h-5" />
            Report & Save a Life
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reports"
          value={myRescues.length}
          icon={Activity} />
        
        <StatCard
          title="Active Rescues"
          value={activeRescues.length}
          icon={AlertTriangle} />
        
        <StatCard
          title="Completed"
          value={completedRescues.length}
          icon={CheckCircle}
          trend="12%"
          trendUp />
        
        <StatCard
          title="Critical Cases"
          value={criticalRescues.length}
          icon={AlertTriangle} />
        
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Active Rescues</h2>
        {isLoading ?
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((i) =>
          <div
            key={i}
            className="h-64 bg-slate-100 animate-pulse rounded-xl" />

          )}
          </div> :
        activeRescues.length > 0 ?
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRescues.map((rescue) =>
          <RescueCard key={rescue.id} rescue={rescue} />
          )}
          </div> :

        <div className="text-center py-12 bg-white rounded-xl border border-dashed">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium">No active rescues</h3>
            <p className="text-muted-foreground">
              You don't have any ongoing reports.
            </p>
          </div>
        }
      </div>

      {completedRescues.length > 0 &&
      <div>
          <h2 className="text-xl font-semibold mb-4">Recently Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedRescues.slice(0, 3).map((rescue) =>
          <RescueCard key={rescue.id} rescue={rescue} />
          )}
          </div>
        </div>
      }
    </div>);

}