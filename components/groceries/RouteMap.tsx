import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { GroceryItem } from '../../db/groceries';
import { getOptimalRoute, Waypoint, RouteResult } from '../../services/osrm';
import { Colors } from '../../constants/Colors';

interface Props {
  visible: boolean;
  items: GroceryItem[];
  onClose: () => void;
}

export function RouteMap({ visible, items, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [origin, setOrigin] = useState<Waypoint | null>(null);
  const mapRef = useRef<MapView>(null);

  const itemsWithCoords = items.filter(i => i.lat != null && i.lng != null && !i.is_done);

  useEffect(() => {
    if (visible && itemsWithCoords.length > 0) computeRoute();
  }, [visible]);

  async function computeRoute() {
    setLoading(true);
    setRoute(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let originWp: Waypoint = { lat: 37.7749, lng: -122.4194, label: 'Start' };
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        originWp = { lat: loc.coords.latitude, lng: loc.coords.longitude, label: 'Your Location' };
      }
      setOrigin(originWp);

      const waypoints: Waypoint[] = itemsWithCoords.map(i => ({
        lat: i.lat!,
        lng: i.lng!,
        label: i.name,
      }));

      const result = await getOptimalRoute(originWp, waypoints);
      setRoute(result);

      // Pan the map to fit all points once the route is ready
      const allCoords = [originWp, ...result.orderedWaypoints].map(p => ({
        latitude: p.lat,
        longitude: p.lng,
      }));
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(allCoords, {
          edgePadding: { top: 60, right: 40, bottom: 60, left: 40 },
          animated: true,
        });
      }, 300);
    } catch {
      Alert.alert('Route Error', 'Could not calculate route. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }

  const distKm = route ? (route.totalDistance / 1000).toFixed(1) : null;
  const durMin = route ? Math.round(route.totalDuration / 60) : null;

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.close}>Close</Text></TouchableOpacity>
          <Text style={styles.title}>Shopping Route</Text>
          <TouchableOpacity onPress={computeRoute} disabled={loading}>
            <Text style={styles.refresh}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {itemsWithCoords.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No items with locations to route.</Text>
            <Text style={styles.emptyHint}>Add locations to grocery items to see a route.</Text>
          </View>
        ) : (
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              showsUserLocation
              initialRegion={{ latitude: 37.7749, longitude: -122.4194, latitudeDelta: 0.5, longitudeDelta: 0.5 }}
            >
              {origin && (
                <Marker coordinate={{ latitude: origin.lat, longitude: origin.lng }} title="Start" pinColor="blue" />
              )}
              {route?.orderedWaypoints.map((wp, i) => (
                <Marker
                  key={i}
                  coordinate={{ latitude: wp.lat, longitude: wp.lng }}
                  title={`${i + 1}. ${wp.label}`}
                  pinColor={Colors.primary}
                />
              ))}
              {route?.polyline && (
                <Polyline coordinates={route.polyline} strokeColor={Colors.primary} strokeWidth={3} />
              )}
            </MapView>

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Calculating route...</Text>
              </View>
            )}

            {route && (
              <View style={styles.summary}>
                <Text style={styles.summaryText}>{distKm} km · {durMin} min · {route.orderedWaypoints.length} stops</Text>
                <View style={styles.stopList}>
                  {route.orderedWaypoints.map((wp, i) => (
                    <Text key={i} style={styles.stop}>{i + 1}. {wp.label}</Text>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: Colors.card,
  },
  close: { color: Colors.danger, fontSize: 16 },
  title: { fontSize: 17, fontWeight: '600' },
  refresh: { color: Colors.primary, fontSize: 15 },
  map: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  loadingText: { marginTop: 12, color: Colors.text, fontSize: 15 },
  summary: { backgroundColor: Colors.card, padding: 16, borderTopWidth: 1, borderTopColor: Colors.separator, maxHeight: 200 },
  summaryText: { fontSize: 15, fontWeight: '600', color: Colors.primary, marginBottom: 8 },
  stopList: {},
  stop: { fontSize: 13, color: Colors.textSecondary, marginBottom: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 17, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  emptyHint: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});
