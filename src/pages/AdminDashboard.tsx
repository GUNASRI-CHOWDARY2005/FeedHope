import React from 'react';
import { Users, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { StatCard } from '../components/StatCard';
import { useRescues } from '../hooks/useRescues';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer } from
'recharts';
export function AdminDashboard() {
  const { rescues } = useRescues();
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return await res.json();
    }
  });
  const activeRescues = rescues.filter(
    (r) => !['completed', 'cancelled', 'rejected'].includes(r.status)
  );
  const completedRescues = rescues.filter((r) => r.status === 'completed');
  const criticalRescues = rescues.filter((r) => r.severity === 'critical');
  const severityData = [
  {
    name: 'Low',
    value: rescues.filter((r) => r.severity === 'low').length,
    color: '#22c55e'
  },
  {
    name: 'Medium',
    value: rescues.filter((r) => r.severity === 'medium').length,
    color: '#eab308'
  },
  {
    name: 'High',
    value: rescues.filter((r) => r.severity === 'high').length,
    color: '#f97316'
  },
  {
    name: 'Critical',
    value: rescues.filter((r) => r.severity === 'critical').length,
    color: '#ef4444'
  }];

  const statusData = [
  {
    name: 'Reported',
    count: rescues.filter((r) => r.status === 'reported').length
  },
  {
    name: 'Assigned',
    count: rescues.filter((r) => r.status === 'ngo_assigned').length
  },
  {
    name: 'En Route',
    count: rescues.filter((r) => r.status === 'volunteer_en_route').length
  },
  {
    name: 'Completed',
    count: completedRescues.length
  }];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <p className="text-muted-foreground mt-1">
          Global platform analytics and management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={users.length} icon={Users} />
        <StatCard
          title="Active Rescues"
          value={activeRescues.length}
          icon={Activity} />
        
        <StatCard
          title="Completed Rescues"
          value={completedRescues.length}
          icon={CheckCircle} />
        
        <StatCard
          title="Critical Cases"
          value={criticalRescues.length}
          icon={AlertTriangle} />
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value">
                  
                  {severityData.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.color} />
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {severityData.map((d) =>
              <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: d.color
                  }} />
                
                  {d.name}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rescue Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false} />
                
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{
                    fill: 'transparent'
                  }} />
                
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]} />
                
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Rescues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Citizen</th>
                  <th className="px-4 py-3">Volunteer</th>
                  <th className="px-4 py-3 rounded-tr-lg">NGO</th>
                </tr>
              </thead>
              <tbody>
                {rescues.slice(0, 10).map((rescue) =>
                <tr key={rescue.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {rescue.id.split('-')[1]}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {rescue.status.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 capitalize">{rescue.severity}</td>
                    <td className="px-4 py-3">{rescue.citizen_name}</td>
                    <td className="px-4 py-3">
                      {rescue.assigned_volunteer_name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {rescue.assigned_ngo_name || '-'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>);

}