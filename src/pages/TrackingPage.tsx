import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '../components/ui';
import { useRescueTracking } from '../hooks/useRescues';
import { TrackingMap } from '../components/TrackingMap';
import { RescueTimeline } from '../components/RescueTimeline';
import { useAuth } from '../hooks/useAuth';
export function TrackingPage() {
  const { id } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: rescue, isLoading } = useRescueTracking(id!);
  if (isLoading)
  return <div className="p-8 text-center">Loading live tracking...</div>;
  if (!rescue)
  return <div className="p-8 text-center text-red-500">Rescue not found</div>;
  const isVolunteer =
  user?.app_role === 'volunteer' &&
  rescue.assigned_volunteer_id === user.user_id;
  const handleNavigate = () => {
    // Open Google Maps
    const dest = ['volunteer_en_route', 'person_located'].includes(
      rescue.status
    ) ?
    `${rescue.latitude},${rescue.longitude}` :
    `${rescue.ngo_latitude},${rescue.ngo_longitude}`;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
      '_blank'
    );
  };
  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            Live Tracking
            <Badge
              variant="secondary"
              className="animate-pulse bg-emerald-100 text-emerald-800">
              
              Live
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground">ID: {rescue.id}</p>
        </div>

        {isVolunteer && !['completed', 'cancelled'].includes(rescue.status) &&
        <Button className="ml-auto gap-2" onClick={handleNavigate}>
            <Navigation className="w-4 h-4" />
            Navigate
          </Button>
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <Card className="lg:col-span-2 h-[400px] lg:h-full overflow-hidden">
          <TrackingMap rescue={rescue} />
        </Card>

        <Card className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b bg-slate-50">
            <h3 className="font-semibold">Rescue Details</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {rescue.description}
            </p>
          </div>
          <CardContent className="p-6 flex-1 overflow-y-auto">
            <RescueTimeline currentStatus={rescue.status} />
          </CardContent>
        </Card>
      </div>
    </div>);

}