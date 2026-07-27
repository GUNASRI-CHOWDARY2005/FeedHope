import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation, CheckCircle, Clock } from 'lucide-react';
import { Button, Card, CardContent } from '../components/ui';
import { RescueCard } from '../components/RescueCard';
import { useRescues } from '../hooks/useRescues';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export function VolunteerDashboard() {
  const { user, updateProfile } = useAuth();
  const { rescues, updateRescue } = useRescues();

  const myRescues = rescues.filter(
    (r) => r.assigned_volunteer_id === user?.user_id
  );

  const activeRescue = myRescues.find(
    (r) => !['completed', 'cancelled', 'rejected'].includes(r.status)
  );

  const completedRescues = myRescues.filter((r) => r.status === 'completed');

  const handleStatusUpdate = async (newStatus: any) => {
    if (!activeRescue) return;
    try {
      await updateRescue({
        id: activeRescue.id,
        status: newStatus
      });
      toast.success('Status updated');
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleAccept = async () => {
    if (!activeRescue) return;
    try {
      await updateRescue({
        id: activeRescue.id,
        status: 'volunteer_en_route'
      });
      toast.success('Mission accepted! Details unlocked.');
    } catch (e) {
      toast.error('Failed to accept mission');
    }
  };

  const handleDecline = async () => {
    if (!activeRescue) return;
    try {
      await updateRescue({
        id: activeRescue.id,
        assigned_volunteer_id: '',
        assigned_volunteer_name: ''
      });
      toast.info('Mission declined.');
    } catch (e) {
      toast.error('Failed to decline mission');
    }
  };

  const toggleAvailability = async () => {
    try {
      await updateProfile({
        is_available: !user?.is_available
      });
      toast.success(
        user?.is_available ? 'You are now offline' : 'You are now online'
      );
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Volunteer Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            Thank you for being on the front lines.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
          <span className="text-sm font-medium px-2">Status:</span>
          <Button
            variant={user?.is_available ? 'default' : 'secondary'}
            onClick={toggleAvailability}
            className={
              user?.is_available ? 'bg-emerald-500 hover:bg-emerald-600' : ''
            }>
            {user?.is_available ? 'Online & Ready' : 'Offline'}
          </Button>
        </div>
      </div>

      {activeRescue ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Mission</h2>
          
          {activeRescue.status === 'ngo_assigned' ? (
            <Card className="border-accent/20 shadow-lg bg-amber-50/10 max-w-2xl">
              <CardContent className="p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">New Mission Assignment</h3>
                  <p className="text-muted-foreground mt-2">
                    You have been requested for a <span className="font-semibold text-accent capitalize">{activeRescue.severity}</span> severity rescue mission by <span className="font-semibold text-foreground">{activeRescue.assigned_ngo_name}</span>.
                  </p>
                  <p className="text-xs text-muted-foreground mt-4 italic bg-white p-4 rounded-xl border max-w-md mx-auto">
                    Accept this mission to unlock details (location address, description, maps navigation, and tracking).
                  </p>
                </div>
                <div className="flex gap-4 pt-2 max-w-md mx-auto">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={handleDecline}
                  >
                    Decline Request
                  </Button>
                  <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleAccept}
                  >
                    Accept Mission
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/20 shadow-md">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-lg mb-2">Location Details</h3>
                    <p className="text-muted-foreground mb-4">
                      {activeRescue.address}
                    </p>

                    <h3 className="font-bold text-lg mb-2">Situation</h3>
                    <p className="text-muted-foreground mb-6">
                      {activeRescue.description}
                    </p>

                    <Button className="w-full gap-2 mb-4" size="lg" asChild>
                      <Link to={`/tracking/${activeRescue.id}`}>
                        <Navigation className="w-5 h-5" />
                        Open Live Tracking & Map
                      </Link>
                    </Button>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl border">
                    <h3 className="font-bold text-lg mb-4">Update Status</h3>
                    <div className="space-y-3">
                      <Button
                        variant={
                          activeRescue.status === 'volunteer_en_route' ?
                          'default' :
                          'outline'
                        }
                        className="w-full justify-start"
                        onClick={() => handleStatusUpdate('person_located')}
                        disabled={activeRescue.status !== 'volunteer_en_route'}>
                        1. Person Located
                      </Button>
                      <Button
                        variant={
                          activeRescue.status === 'person_located' ?
                          'default' :
                          'outline'
                        }
                        className="w-full justify-start"
                        onClick={() => handleStatusUpdate('person_picked_up')}
                        disabled={activeRescue.status !== 'person_located'}>
                        2. Person Picked Up
                      </Button>
                      <Button
                        variant={
                          activeRescue.status === 'person_picked_up' ?
                          'default' :
                          'outline'
                        }
                        className="w-full justify-start"
                        onClick={() => handleStatusUpdate('traveling_to_ngo')}
                        disabled={activeRescue.status !== 'person_picked_up'}>
                        3. Traveling to NGO
                      </Button>
                      <Button
                        variant={
                          activeRescue.status === 'traveling_to_ngo' ?
                          'default' :
                          'outline'
                        }
                        className="w-full justify-start"
                        onClick={() => handleStatusUpdate('arrived_at_ngo')}
                        disabled={activeRescue.status !== 'traveling_to_ngo'}>
                        4. Arrived at NGO
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">No Active Missions</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {user?.is_available ?
                'You are online. We will notify you as soon as a rescue is assigned to you.' :
                'You are currently offline. Toggle your status to Online to receive missions.'}
            </p>
          </CardContent>
        </Card>
      )}

      {completedRescues.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Mission History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedRescues.map((rescue) => (
              <RescueCard key={rescue.id} rescue={rescue} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}