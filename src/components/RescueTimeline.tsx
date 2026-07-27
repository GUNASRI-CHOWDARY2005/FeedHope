import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { RescueStatus } from '../types';
const STATUS_STEPS = [
{
  id: 'reported',
  label: 'Reported'
},
{
  id: 'ngo_assigned',
  label: 'NGO Assigned'
},
{
  id: 'volunteer_en_route',
  label: 'Volunteer En Route'
},
{
  id: 'person_located',
  label: 'Person Located'
},
{
  id: 'person_picked_up',
  label: 'Person Picked Up'
},
{
  id: 'traveling_to_ngo',
  label: 'Traveling to NGO'
},
{
  id: 'arrived_at_ngo',
  label: 'Arrived at NGO'
},
{
  id: 'ngo_verified',
  label: 'NGO Verified'
},
{
  id: 'completed',
  label: 'Completed'
}];

export function RescueTimeline({
  currentStatus
}: {currentStatus: RescueStatus;}) {
  if (currentStatus === 'cancelled' || currentStatus === 'rejected') {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
        Rescue was {currentStatus}.
      </div>);

  }
  const currentIndex = STATUS_STEPS.findIndex((s) => s.id === currentStatus);
  return (
    <div className="space-y-6">
      {STATUS_STEPS.map((step, index) => {
        const isFullyDone = currentStatus === 'completed';
        const isCompleted = isFullyDone ? index <= currentIndex : index < currentIndex;
        const isCurrent = isFullyDone ? false : index === currentIndex;
        return (
          <div key={step.id} className="flex gap-4 relative">
            {/* Connecting line */}
            {index < STATUS_STEPS.length - 1 &&
            <div
              className={`absolute left-3 top-8 bottom-[-24px] w-0.5 ${isCompleted ? 'bg-emerald-600' : 'bg-slate-200'}`} />

            }

            <div className="relative z-10 bg-white">
              {isCompleted ?
              <CheckCircle2 className="w-6 h-6 text-emerald-600" /> :
              isCurrent ?
              <Clock className="w-6 h-6 text-accent animate-pulse" /> :

              <Circle className="w-6 h-6 text-slate-300" />
              }
            </div>

            <div className="pb-2">
              <p
                className={`font-medium ${isCompleted ? 'text-foreground font-semibold' : isCurrent ? 'text-accent font-bold' : 'text-muted-foreground'}`}>
                
                {step.label}
              </p>
              {isCurrent &&
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                  In progress...
                </p>
              }
              {isFullyDone && step.id === 'completed' &&
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                  Rescue mission successfully completed!
                </p>
              }
            </div>
          </div>);

      })}
    </div>);

}