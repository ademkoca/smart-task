export interface Waypoint {
  lat: number;
  lng: number;
  label: string;
}

export interface RouteResult {
  orderedWaypoints: Waypoint[];
  polyline: { latitude: number; longitude: number }[];
  totalDistance: number;
  totalDuration: number;
}

// Nearest-neighbor TSP heuristic for small sets of waypoints
function nearestNeighborOrder(origin: Waypoint, waypoints: Waypoint[]): Waypoint[] {
  const unvisited = [...waypoints];
  const ordered: Waypoint[] = [];
  let current = origin;

  while (unvisited.length > 0) {
    let minDist = Infinity;
    let minIdx = 0;
    for (let i = 0; i < unvisited.length; i++) {
      const d = haversine(current, unvisited[i]);
      if (d < minDist) { minDist = d; minIdx = i; }
    }
    ordered.push(unvisited[minIdx]);
    current = unvisited[minIdx];
    unvisited.splice(minIdx, 1);
  }
  return ordered;
}

function haversine(a: Waypoint, b: Waypoint): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const sin2 = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
}

function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const coords: { latitude: number; longitude: number }[] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);
    coords.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return coords;
}

export async function getOptimalRoute(origin: Waypoint, waypoints: Waypoint[]): Promise<RouteResult> {
  const ordered = nearestNeighborOrder(origin, waypoints);
  const allPoints = [origin, ...ordered];
  const coords = allPoints.map(p => `${p.lng},${p.lat}`).join(';');

  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=polyline`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.code !== 'Ok' || !json.routes?.length) {
    throw new Error('OSRM routing failed');
  }

  const route = json.routes[0];
  return {
    orderedWaypoints: ordered,
    polyline: decodePolyline(route.geometry),
    totalDistance: route.distance,
    totalDuration: route.duration,
  };
}
