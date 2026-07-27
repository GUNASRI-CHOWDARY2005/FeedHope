import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Heart, Building2 } from 'lucide-react';
import { Button, Card, CardContent } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { AppRole } from '../types';
import { toast } from 'sonner';
const roles = [
{
  id: 'citizen' as AppRole,
  title: 'Citizen',
  description: 'Report people in need and track rescues.',
  icon: User,
  color: 'text-blue-500',
  bg: 'bg-blue-50'
},
{
  id: 'volunteer' as AppRole,
  title: 'Volunteer',
  description: 'Accept missions and provide on-ground help.',
  icon: Heart,
  color: 'text-rose-500',
  bg: 'bg-rose-50'
},
{
  id: 'ngo' as AppRole,
  title: 'NGO / Shelter',
  description: 'Manage beds and receive rescued individuals.',
  icon: Building2,
  color: 'text-emerald-500',
  bg: 'bg-emerald-50'
}];

export function RoleSelection() {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(false);
  const handleContinue = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      // For prototype, we auto-fill some mock data based on role
      const updates: any = {
        app_role: selectedRole
      };
      if (selectedRole === 'volunteer') {
        updates.is_available = true;
        updates.latitude = 14.4180;
        updates.longitude = 78.2330;
      } else if (selectedRole === 'ngo') {
        updates.ngo_name = 'Pulivendula Seva NGO';
        updates.ngo_address = 'Near Srirama Hall, Pulivendula, AP 516390';
        updates.total_beds = 25;
        updates.available_beds = 10;
        updates.ngo_latitude = 14.4172;
        updates.ngo_longitude = 78.2319;
      }
      await updateProfile(updates);
      toast.success('Role selected successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Role selection error:', error);
      toast.error(error?.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">
            How would you like to help?
          </h1>
          <p className="text-muted-foreground">
            Select your role to personalize your FeedHope experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {roles.map((role) =>
          <motion.div
            whileHover={{
              scale: 1.02
            }}
            whileTap={{
              scale: 0.98
            }}
            key={role.id}>
            
              <Card
              className={`cursor-pointer transition-all border-2 ${selectedRole === role.id ? 'border-primary shadow-md' : 'border-transparent hover:border-primary/30'}`}
              onClick={() => setSelectedRole(role.id)}>
              
                <CardContent className="p-6 flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${role.bg} ${role.color}`}>
                    <role.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{role.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            className="w-full md:w-auto md:min-w-[200px]"
            disabled={!selectedRole || loading}
            onClick={handleContinue}>
            
            {loading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>);

}