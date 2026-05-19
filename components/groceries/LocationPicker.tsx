import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { MapPressEvent, Marker, Region } from "react-native-maps";
import { Colors } from "../../constants/Colors";

interface PickedLocation {
  lat: number;
  lng: number;
  label: string;
}

interface Props {
  visible: boolean;
  initial?: PickedLocation | null;
  onPick: (loc: PickedLocation) => void;
  onClose: () => void;
}

const DEFAULT_REGION: Region = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function LocationPicker({ visible, initial, onPick, onClose }: Props) {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initial ? { lat: initial.lat, lng: initial.lng } : null,
  );
  const [region, setRegion] = useState<Region>(
    initial
      ? {
          latitude: initial.lat,
          longitude: initial.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : DEFAULT_REGION,
  );
  const [locating, setLocating] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Auto-center on user's location when the picker opens
  useEffect(() => {
    if (visible && !initial) {
      goToMyLocation();
    }
  }, [visible]);

  async function goToMyLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const newRegion: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
    } catch {
      // silently fall back to default region
    } finally {
      setLocating(false);
    }
  }

  function handlePress(e: MapPressEvent) {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ lat: latitude, lng: longitude });
  }

  async function handleConfirm() {
    if (!marker) return;
    let label = `${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}`;
    try {
      const [place] = await Location.reverseGeocodeAsync({
        latitude: marker.lat,
        longitude: marker.lng,
      });
      if (place) {
        const isVenue = place.name && place.name !== place.streetNumber;
        console.log({ isVenue });

        if (isVenue) {
          console.log({ place });

          label = place.name!;
        } else {
          const parts = [place.streetNumber, place.street, place.city].filter(
            Boolean,
          );
          if (parts.length > 0) label = parts.join(", ");
        }
      }
    } catch {}
    onPick({ lat: marker.lat, lng: marker.lng, label });
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Pick Location</Text>
          <TouchableOpacity onPress={goToMyLocation} disabled={locating}>
            {locating ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Text style={styles.myLoc}>My Location</Text>
            )}
          </TouchableOpacity>
        </View>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          onPress={handlePress}
          showsUserLocation
        >
          {marker && (
            <Marker
              coordinate={{ latitude: marker.lat, longitude: marker.lng }}
              pinColor={Colors.primary}
            />
          )}
        </MapView>
        <Text style={styles.hint}>Tap on the map to drop a pin</Text>
        <TouchableOpacity
          style={[styles.confirmBtn, !marker && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!marker}
        >
          <Text style={styles.confirmBtnText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: Colors.card,
  },
  cancel: { color: Colors.danger, fontSize: 16 },
  title: { fontSize: 17, fontWeight: "600", color: Colors.text },
  myLoc: { color: Colors.primary, fontSize: 15 },
  map: { flex: 1 },
  hint: {
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: 13,
    paddingVertical: 8,
  },
  confirmBtn: {
    margin: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
