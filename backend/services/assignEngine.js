import { database } from '../database.js';

// Distance calculation: Haversine formula
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
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

export function getSeverityScore(severity) {
  switch (severity) {
    case 'critical': return 100;
    case 'high': return 75;
    case 'medium': return 50;
    case 'low': return 25;
    default: return 0;
  }
}

// Assignment Engine - assigns nearest NGO only, leaves volunteer assignment to NGO
export async function assignRescueEngine(rescueId) {
  const rescue = await database.getRescueById(rescueId);
  if (!rescue) return null;

  const users = await database.getUsers();

  // Find nearest NGO — prefer ones with available beds, fallback to any
  const allNgos = users.filter(u => u.app_role === 'ngo' && u.ngo_latitude && u.ngo_longitude);
  const ngosWithBeds = allNgos.filter(u => (u.available_beds || 0) > 0);
  const ngos = ngosWithBeds.length > 0 ? ngosWithBeds : allNgos;
  
  let closestNGO = null;
  let minNGODist = Infinity;

  ngos.forEach((ngo) => {
    const dist = getDistance(
      rescue.latitude,
      rescue.longitude,
      ngo.ngo_latitude,
      ngo.ngo_longitude
    );
    // Pick closest NGO; if distances are equal or within 10km, prefer registered active user NGO over static seed NGO
    if (
      dist < minNGODist - 0.1 ||
      (Math.abs(dist - minNGODist) <= 10 && (ngo.user_id === rescue.citizen_id || ngo.user_id.startsWith('user-')))
    ) {
      minNGODist = dist;
      closestNGO = ngo;
    }
  });

  // Update rescue fields - Status is ngo_assigned, volunteer fields empty
  rescue.status = closestNGO ? 'ngo_assigned' : 'reported';
  rescue.priority_score = getSeverityScore(rescue.severity);

  if (closestNGO) {
    rescue.assigned_ngo_id = closestNGO.user_id;
    rescue.assigned_ngo_name = closestNGO.ngo_name;
    rescue.ngo_address = closestNGO.ngo_address;
    rescue.ngo_latitude = closestNGO.ngo_latitude;
    rescue.ngo_longitude = closestNGO.ngo_longitude;
  }

  rescue.assigned_volunteer_id = '';
  rescue.assigned_volunteer_name = '';

  await database.saveRescue(rescue);

  // Generate notification for NGO
  const isUrgent = rescue.severity === 'critical' || rescue.severity === 'high';

  if (closestNGO) {
    await database.saveNotification({
      id: `notif-${Date.now()}-ngo`,
      user_id: closestNGO.user_id,
      title: isUrgent ? 'URGENT: Incoming Rescue' : 'New Rescue Assigned',
      message: `A ${rescue.severity} severity rescue has been assigned to your shelter. Please assign a volunteer.`,
      type: isUrgent ? 'urgent' : 'info',
      read: false,
      rescue_request_id: rescue.id
    });
  }

  return rescue;
}
