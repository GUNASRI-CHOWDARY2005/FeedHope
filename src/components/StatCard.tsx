import React from 'react';
import { Card, CardContent } from './ui';
import { BoxIcon } from 'lucide-react';
interface StatCardProps {
  title: string;
  value: string | number;
  icon: BoxIcon;
  trend?: string;
  trendUp?: boolean;
}
export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex items-baseline space-x-2">
          <h2 className="text-2xl font-bold">{value}</h2>
          {trend &&
          <span
            className={`text-xs font-medium ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
            
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          }
        </div>
      </CardContent>
    </Card>);

}