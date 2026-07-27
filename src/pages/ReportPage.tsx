import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Upload, Loader2 } from 'lucide-react';
import { Button, Input, Label, Card, CardContent } from '../components/ui';
import { useRescues } from '../hooks/useRescues';
import { useAuth } from '../hooks/useAuth';
import { Severity } from '../types';
import { toast } from 'sonner';
export function ReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createRescue } = useRescues();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    severity: 'medium' as Severity,
    notes: '',
    address: '',
    latitude: 0,
    longitude: 0
  });
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a fake local URL for prototype
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };
  const getLocation = () => {
    setLocating(true);
    if (!('geolocation' in navigator)) {
      setLocating(false);
      toast.error('Geolocation not supported on this device');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
          address
        }));
        setLocating(false);
        toast.success('Location detected');
      },
      (err) => {
        setLocating(false);
        toast.error(
          err.code === err.PERMISSION_DENIED ?
          'Location permission denied. Please enter the address manually.' :
          'Could not detect location. Please enter the address manually.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.address) {
      return toast.error('Please fill in required fields and get location');
    }
    setLoading(true);
    try {
      const rescue = await createRescue({
        description: formData.description,
        severity: formData.severity,
        notes: formData.notes,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude,
        citizen_id: user!.user_id,
        citizen_name: user!.full_name,
        image_url:
        imagePreview ||
        'https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&q=80&w=800' // Fallback image
      });
      toast.success('Rescue reported successfully! Help is on the way.');
      navigate(`/tracking/${rescue.id}`);
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report a Rescue</h1>
        <p className="text-muted-foreground mt-1">
          Provide details so we can dispatch the right help quickly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Photo (Optional but helpful)</Label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 overflow-hidden relative">
                  {imagePreview ?
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover" /> :


                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                      <Camera className="w-10 h-10 mb-3 text-slate-400" />
                      <p className="mb-2 text-sm font-semibold">
                        Click to take photo or upload
                      </p>
                      <p className="text-xs">SVG, PNG, JPG or GIF</p>
                    </div>
                  }
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange} />
                  
                </label>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="flex justify-between">
                <span>Location *</span>
                {formData.address &&
                <span className="text-emerald-600 text-xs font-normal">
                    Location set
                  </span>
                }
              </Label>
              <div className="flex gap-2">
                <Input
                  value={formData.address}
                  onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    address: e.target.value
                  }))
                  }
                  placeholder="Address or description of location"
                  required />
                
                <Button
                  type="button"
                  variant="secondary"
                  onClick={getLocation}
                  disabled={locating}
                  title="Detect GPS Location">
                  
                  {locating ?
                  <Loader2 className="w-4 h-4 animate-spin" /> :

                  <MapPin className="w-4 h-4" />
                  }
                </Button>
              </div>

              {/* Location Presets for Quick Scenario Testing */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs text-muted-foreground flex items-center">Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((p) => ({
                      ...p,
                      address: 'Near Srirama Hall, Pulivendula, 516390',
                      latitude: 14.4172,
                      longitude: 78.2319
                    }));
                    toast.success('Pulivendula location set!');
                  }}
                  className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors font-medium">
                  📍 Pulivendula (Srirama Hall)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((p) => ({
                      ...p,
                      address: 'Main Road, Kadapa, 516001',
                      latitude: 14.4673,
                      longitude: 78.8242
                    }));
                    toast.success('Kadapa location set!');
                  }}
                  className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors font-medium">
                  📍 Kadapa (Main Road)
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description *</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="What is the situation? E.g., Elderly person sleeping on bench, looks very cold."
                value={formData.description}
                onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  description: e.target.value
                }))
                }
                required />
              
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label>Severity Level *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'critical'] as Severity[]).map(
                  (level) =>
                  <div
                    key={level}
                    onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      severity: level
                    }))
                    }
                    className={`cursor-pointer border rounded-lg p-3 text-center capitalize text-sm font-medium transition-colors ${formData.severity === level ? level === 'critical' ? 'bg-red-500 text-white border-red-500' : level === 'high' ? 'bg-orange-500 text-white border-orange-500' : level === 'medium' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-green-500 text-white border-green-500' : 'bg-white hover:bg-slate-50'}`}>
                    
                      {level}
                    </div>

                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}>
            
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Submit Report
          </Button>
        </div>
      </form>
    </div>);

}