import React, { useState } from 'react';
import { Building2, Users, CheckCircle, History } from 'lucide-react';
import { Button, Card, CardContent, Input, Label } from '../components/ui';
import { StatCard } from '../components/StatCard';
import { RescueCard } from '../components/RescueCard';
import { useRescues } from '../hooks/useRescues';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config';

interface VolunteerAssignerProps {
  volunteers: any[];
  rescue: any;
  onAssign: (volId: string, volName: string) => void;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function VolunteerAssigner({ volunteers, rescue, onAssign }: VolunteerAssignerProps) {
  const [selectedVolId, setSelectedVolId] = useState('');

  const MAX_LOCAL_RADIUS_KM = 100; // Only show volunteers within 100 km of the rescue location

  const localVolunteers = [...volunteers]
    .map((vol) => {
      const dist = (vol.latitude && vol.longitude && rescue.latitude && rescue.longitude)
        ? calculateDistance(rescue.latitude, rescue.longitude, vol.latitude, vol.longitude)
        : Infinity;
      return { ...vol, dist };
    })
    .filter((vol) => vol.dist <= MAX_LOCAL_RADIUS_KM)
    .sort((a, b) => a.dist - b.dist);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolId) return;
    const vol = localVolunteers.find((v) => v.user_id === selectedVolId);
    if (vol) {
      onAssign(vol.user_id, vol.full_name);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-1.5 pt-2 border-t">
      <Label className="text-xs font-semibold text-muted-foreground block">Assign Local Area Volunteer</Label>
      <div className="flex gap-2">
        <select
          value={selectedVolId}
          onChange={(e) => setSelectedVolId(e.target.value)}
          className="flex-1 text-xs rounded-md border border-input bg-background px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          required
        >
          {localVolunteers.length > 0 ? (
            <>
              <option value="">Select Local Volunteer...</option>
              {localVolunteers.map((vol) => {
                const distStr = vol.dist !== Infinity
                  ? (vol.dist < 1 ? ` (${Math.round(vol.dist * 1000)}m away)` : ` (${vol.dist.toFixed(1)} km away)`)
                  : '';
                return (
                  <option key={vol.user_id} value={vol.user_id}>
                    {vol.full_name}{distStr}
                  </option>
                );
              })}
            </>
          ) : (
            <option value="">No local volunteers within 100 km</option>
          )}
        </select>
        <Button type="submit" size="sm" className="text-xs px-3 py-1 h-auto" disabled={localVolunteers.length === 0}>
          Assign
        </Button>
      </div>
    </form>
  );
}

export function NGODashboard() {
  const { user, updateProfile } = useAuth();
  const { rescues, updateRescue } = useRescues();
  const [beds, setBeds] = useState(user?.available_beds?.toString() || '0');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch all users to filter out volunteers
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return await res.json();
    }
  });

  const volunteers = allUsers.filter(
    (u: any) => u.app_role === 'volunteer' && u.is_available
  );

  const myRescues = rescues.filter((r) => r.assigned_ngo_id === user?.user_id);
  const incoming = myRescues.filter((r) =>
    [
      'ngo_assigned',
      'volunteer_en_route',
      'person_located',
      'person_picked_up',
      'traveling_to_ngo'
    ].includes(r.status)
  );

  const awaitingVerification = myRescues.filter(
    (r) => r.status === 'arrived_at_ngo'
  );
  const completed = myRescues.filter((r) => r.status === 'completed');

  const handleUpdateBeds = async () => {
    setIsUpdating(true);
    try {
      await updateProfile({
        available_beds: parseInt(beds, 10)
      });
      toast.success('Capacity updated');
    } catch (e) {
      toast.error('Failed to update capacity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await updateRescue({
        id,
        status: 'completed'
      });
      toast.success('Rescue verified and completed!');
      // Decrease bed count
      if (user?.available_beds && user.available_beds > 0) {
        await updateProfile({
          available_beds: user.available_beds - 1
        });
        setBeds((user.available_beds - 1).toString());
      }
    } catch (e) {
      toast.error('Failed to verify');
    }
  };

  const handleAssignVolunteer = async (rescueId: string, volunteerId: string, volunteerName: string) => {
    try {
      await updateRescue({
        id: rescueId,
        assigned_volunteer_id: volunteerId,
        assigned_volunteer_name: volunteerName,
        status: 'ngo_assigned'
      });
      toast.success(`Assigned volunteer ${volunteerName}!`);
    } catch (e) {
      toast.error('Failed to assign volunteer');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.ngo_name || 'Shelter Portal'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage incoming rescues, capacity, and rescue history.
          </p>
        </div>

        <Card className="w-full md:w-auto">
          <CardContent className="p-4 flex items-end gap-3">
            <div className="space-y-1">
              <Label>Available Beds</Label>
              <Input
                type="number"
                value={beds}
                onChange={(e) => setBeds(e.target.value)}
                className="w-24"
              />
            </div>
            <Button onClick={handleUpdateBeds} disabled={isUpdating}>
              Save
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Beds"
          value={user?.total_beds || 0}
          icon={Building2}
        />
        <StatCard
          title="Available Beds"
          value={user?.available_beds || 0}
          icon={CheckCircle}
        />
        <StatCard
          title="Active Rescues"
          value={incoming.length + awaitingVerification.length}
          icon={Users}
        />
        <StatCard
          title="Completed History"
          value={completed.length}
          icon={History}
        />
      </div>

      {awaitingVerification.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-accent">
            Awaiting Verification (Arrived at NGO)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {awaitingVerification.map((rescue) => (
              <RescueCard
                key={rescue.id}
                rescue={rescue}
                actions={
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleVerify(rescue.id)}
                  >
                    Verify & Complete
                  </Button>
                }
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold">Incoming Rescues</h2>
          <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
            {incoming.length} active
          </span>
        </div>
        {incoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incoming.map((rescue) => {
              const hasVolunteer = !!rescue.assigned_volunteer_id;
              return (
                <RescueCard
                  key={rescue.id}
                  rescue={rescue}
                  actions={
                    !hasVolunteer ? (
                      <VolunteerAssigner
                        volunteers={volunteers}
                        rescue={rescue}
                        onAssign={(volId, volName) =>
                          handleAssignVolunteer(rescue.id, volId, volName)
                        }
                      />
                    ) : (
                      <div className="w-full text-xs text-muted-foreground text-center py-2 bg-slate-50 rounded-lg border">
                        Assigned: <span className="font-semibold text-foreground">{rescue.assigned_volunteer_name}</span>
                        <div className="mt-1 font-semibold text-primary capitalize">
                          Status: {rescue.status.replace(/_/g, ' ')}
                        </div>
                      </div>
                    )
                  }
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed">
            <p className="text-muted-foreground">
              No incoming active rescues at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Completed Rescues History Section */}
      <div className="border-t pt-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            Completed Rescues History
          </h2>
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full border">
            {completed.length} completed
          </span>
        </div>
        {completed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.map((rescue) => (
              <RescueCard
                key={rescue.id}
                rescue={rescue}
                actions={
                  <div className="w-full text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 text-center py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Verified & Safely Sheltered
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed">
            <p className="text-muted-foreground text-sm">
              No completed rescues in history yet. Rescues will appear here once verified.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}