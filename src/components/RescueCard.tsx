import React from 'react';
import { Card, CardContent, CardFooter, Badge, Button } from './ui';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { RescueRequest } from '../types';
import { Link } from 'react-router-dom';
interface RescueCardProps {
  rescue: RescueRequest;
  actions?: React.ReactNode;
}
export function RescueCard({ rescue, actions }: RescueCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 hover:bg-red-600';
      case 'high':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-green-500 hover:bg-green-600';
    }
  };
  const getStatusDisplay = (status: string) => {
    return status.
    split('_').
    map((w) => w.charAt(0).toUpperCase() + w.slice(1)).
    join(' ');
  };
  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative h-32 bg-muted">
        {rescue.image_url ?
        <img
          src={rescue.image_url}
          alt="Rescue location"
          className="w-full h-full object-cover" /> :


        <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-200">
            <AlertTriangle size={48} />
          </div>
        }
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge className={getSeverityColor(rescue.severity)}>
            {rescue.severity.toUpperCase()}
          </Badge>
          <Badge
            variant="secondary"
            className="bg-white/90 text-black hover:bg-white">
            
            {getStatusDisplay(rescue.status)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 flex-1">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {rescue.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{rescue.address}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              {formatDistanceToNow(new Date(rescue.created_at), {
                addSuffix: true
              })}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
        <Button variant="outline" className="flex-1" asChild>
          <Link to={`/tracking/${rescue.id}`}>Track</Link>
        </Button>
        {actions}
      </CardFooter>
    </Card>);

}