import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/Colors";

interface Props {
  visible: boolean;
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ visible, onScan, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);
  // Track whether we've already asked so we don't ask repeatedly
  const [askedPermission, setAskedPermission] = useState(false);

  useEffect(() => {
    if (visible) {
      scannedRef.current = false;
      setAskedPermission(false);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && !askedPermission && permission && !permission.granted) {
      setAskedPermission(true);
      requestPermission();
    }
  }, [visible, permission, askedPermission]);

  function handleBarcode({ data }: { data: string }) {
    if (scannedRef.current) return;
    scannedRef.current = true;
    onScan(data);
  }

  const granted = permission?.granted === true;

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {granted ? (
          <>
            <CameraView
              key="barcode-camera"
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: [
                  "ean13",
                  "ean8",
                  "upc_a",
                  "upc_e",
                  "qr",
                  "code128",
                  "code39",
                ],
              }}
              onBarcodeScanned={handleBarcode}
            />
            <View style={styles.overlay} pointerEvents="none">
              <View style={styles.frame} />
              <Text style={styles.hint}>Point camera at barcode</Text>
            </View>
          </>
        ) : (
          <View style={styles.noPermission}>
            <Text style={styles.noPermissionText}>
              Camera access is required to scan barcodes.
            </Text>
            <TouchableOpacity
              onPress={requestPermission}
              style={styles.permBtn}
            >
              <Text style={styles.permBtnText}>Allow Camera</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  frame: {
    width: 260,
    height: 160,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  hint: { color: "#fff", marginTop: 16, fontSize: 15 },
  noPermission: { flex: 1, justifyContent: "center", alignItems: "center" },
  noPermissionText: { color: "#fff", fontSize: 16, marginBottom: 16 },
  permBtn: { backgroundColor: Colors.primary, padding: 14, borderRadius: 10 },
  permBtnText: { color: "#fff", fontSize: 15 },
  closeBtn: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  closeBtnText: { color: "#fff", fontSize: 16 },
});
