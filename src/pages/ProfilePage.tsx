import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Badge } from '../components/ui';
import { User, Mail, Phone, Building, MapPin, CheckCircle, Shield, Navigation } from 'lucide-react';
import { toast } from 'sonner';

const LOCATION_PRESETS = [
  { label: 'Pulivendula', lat: 14.4180, lng: 78.2330 },
  { label: 'Kadapa', lat: 14.4670, lng: 78.8240 },
  { label: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { label: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { label: 'Bangalore', lat: 12.9716, lng: 77.5946 }
];

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');

  // NGO specific
  const [ngoName, setNgoName] = useState('');
  const [ngoAddress, setNgoAddress] = useState('');
  const [ngoLatitude, setNgoLatitude] = useState<number | ''>('');
  const [ngoLongitude, setNgoLongitude] = useState<number | ''>('');
  const [totalBeds, setTotalBeds] = useState(0);
  const [availableBeds, setAvailableBeds] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setIsAvailable(user.is_available ?? true);
      setLatitude(user.latitude ?? '');
      setLongitude(user.longitude ?? '');
      
      setNgoName(user.ngo_name || '');
      setNgoAddress(user.ngo_address || '');
      setNgoLatitude(user.ngo_latitude ?? '');
      setNgoLongitude(user.ngo_longitude ?? '');
      setTotalBeds(user.total_beds || 0);
      setAvailableBeds(user.available_beds || 0);
    }
  }, [user]);

  const handleDetectGps = (type: 'volunteer' | 'ngo') => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        if (type === 'volunteer') {
          setLatitude(lat);
          setLongitude(lng);
        } else {
          setNgoLatitude(lat);
          setNgoLongitude(lng);
        }
        setIsDetectingGps(false);
        toast.success(`Detected GPS Location: ${lat}, ${lng}`);
      },
      (error) => {
        setIsDetectingGps(false);
        toast.error('Unable to fetch GPS position. Please enter manually or select a preset.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        phone,
        is_available: isAvailable,
        latitude: latitude !== '' ? Number(latitude) : undefined,
        longitude: longitude !== '' ? Number(longitude) : undefined,
        ngo_name: ngoName,
        ngo_address: ngoAddress,
        ngo_latitude: ngoLatitude !== '' ? Number(ngoLatitude) : undefined,
        ngo_longitude: ngoLongitude !== '' ? Number(ngoLongitude) : undefined,
        total_beds: Number(totalBeds),
        available_beds: Number(availableBeds)
      });
      toast.success('Profile and location updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account information, role details, and location</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
              {user.full_name?.charAt(0) || <User className="w-8 h-8" />}
            </div>
            <div>
              <CardTitle className="text-xl">{user.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Badge variant="secondary" className="capitalize text-sm px-3 py-1 bg-primary/10 text-primary border border-primary/20">
            <Shield className="w-3.5 h-3.5 mr-1" />
            {user.app_role}
          </Badge>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            {/* Volunteer Location & Availability Section */}
            {user.app_role === 'volunteer' && (
              <div className="border-t pt-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2 text-slate-800 text-base">
                    <MapPin className="w-5 h-5 text-primary" />
                    Volunteer Dispatch Location & Availability
                  </h3>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                  <Label htmlFor="isAvailable" className="cursor-pointer text-sm font-medium">
                    Available for emergency rescue dispatch assignments
                  </Label>
                </div>

                <div className="space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <Label className="font-medium text-slate-700 flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-emerald-600" />
                      Volunteer Base Location Coordinates
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDetectGps('volunteer')}
                      disabled={isDetectingGps}
                      className="text-xs bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                    >
                      {isDetectingGps ? 'Detecting...' : '📍 Detect My Current GPS Location'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="latitude" className="text-xs text-muted-foreground">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 14.4180"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="longitude" className="text-xs text-muted-foreground">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 78.2330"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground block mb-2 font-medium">Location Presets (Click to set):</span>
                    <div className="flex flex-wrap gap-2">
                      {LOCATION_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setLatitude(preset.lat);
                            setLongitude(preset.lng);
                            toast.success(`Set location to ${preset.label}`);
                          }}
                          className="px-2.5 py-1 text-xs bg-white rounded-md border border-slate-200 hover:border-primary hover:bg-primary/5 transition-colors font-medium text-slate-700"
                        >
                          📍 {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NGO Location & Capacity Section */}
            {user.app_role === 'ngo' && (
              <div className="border-t pt-5 space-y-5">
                <h3 className="font-semibold flex items-center gap-2 text-slate-800 text-base">
                  <Building className="w-5 h-5 text-primary" />
                  NGO Shelter Details & Location Coordinates
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ngoName">NGO Organization Name</Label>
                    <Input
                      id="ngoName"
                      value={ngoName}
                      onChange={(e) => setNgoName(e.target.value)}
                      placeholder="Organization Name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ngoAddress">Shelter Address</Label>
                    <Input
                      id="ngoAddress"
                      value={ngoAddress}
                      onChange={(e) => setNgoAddress(e.target.value)}
                      placeholder="Full Address"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalBeds">Total Bed Capacity</Label>
                    <Input
                      id="totalBeds"
                      type="number"
                      value={totalBeds}
                      onChange={(e) => setTotalBeds(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availableBeds">Currently Available Beds</Label>
                    <Input
                      id="availableBeds"
                      type="number"
                      value={availableBeds}
                      onChange={(e) => setAvailableBeds(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <Label className="font-medium text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary" />
                      NGO Shelter Coordinates
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDetectGps('ngo')}
                      disabled={isDetectingGps}
                      className="text-xs bg-white"
                    >
                      {isDetectingGps ? 'Detecting...' : '📍 Detect Shelter GPS Location'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="ngoLatitude" className="text-xs text-muted-foreground">NGO Latitude</Label>
                      <Input
                        id="ngoLatitude"
                        type="number"
                        step="any"
                        value={ngoLatitude}
                        onChange={(e) => setNgoLatitude(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 14.4172"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ngoLongitude" className="text-xs text-muted-foreground">NGO Longitude</Label>
                      <Input
                        id="ngoLongitude"
                        type="number"
                        step="any"
                        value={ngoLongitude}
                        onChange={(e) => setNgoLongitude(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="e.g. 78.2319"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs text-muted-foreground block mb-2 font-medium">Location Presets (Click to set):</span>
                    <div className="flex flex-wrap gap-2">
                      {LOCATION_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setNgoLatitude(preset.lat);
                            setNgoLongitude(preset.lng);
                            toast.success(`Set NGO location to ${preset.label}`);
                          }}
                          className="px-2.5 py-1 text-xs bg-white rounded-md border border-slate-200 hover:border-primary hover:bg-primary/5 transition-colors font-medium text-slate-700"
                        >
                          📍 {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isSaving} className="min-w-[140px]">
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
