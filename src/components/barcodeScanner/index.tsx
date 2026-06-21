import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Vibration,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

interface BarcodeScannerProps {
  visible: boolean;
  onScan: (ean: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({
  visible,
  onScan,
  onClose,
}: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualEan, setManualEan] = useState("");
  const scannedRef = useRef(false);

  // Check camera availability on mount
  useEffect(() => {
    if (visible) {
      setCameraAvailable(null);
      setCameraError(null);
      setManualEan("");

      CameraView.isAvailableAsync()
        .then((available) => {
          setCameraAvailable(available);
        })
        .catch(() => {
          setCameraAvailable(false);
        });
    }
  }, [visible]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setScanned(false);
      scannedRef.current = false;
    }
  }, [visible]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setScanned(true);

    Vibration.vibrate(100);

    setTimeout(() => {
      onScan(data);
    }, 300);
  };

  const handleManualSubmit = () => {
    const cleaned = manualEan.replace(/\D/g, "");
    if (cleaned.length < 8) {
      setCameraError("Digite um código EAN válido (8 a 13 dígitos).");
      return;
    }
    onScan(cleaned);
  };

  const handleMountError = (error: { message: string }) => {
    console.warn("Camera mount error:", error.message);
    setCameraError(error.message);
    setCameraAvailable(false);
  };

  // --- Loading state ---
  if (!permission || cameraAvailable === null) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.messageText}>Carregando câmera...</Text>
        </View>
      </Modal>
    );
  }

  // --- Camera not available (simulator / no camera) or error ---
  if (!cameraAvailable || cameraError) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.container}>
          <Ionicons name="camera-outline" size={64} color="#9CA3AF" />
          <Text style={styles.titleText}>
            {Platform.OS === "ios" ? "Simulador sem câmera" : "Câmera não disponível"}
          </Text>
          <Text style={styles.messageText}>
            {Platform.OS === "ios"
              ? "O simulador do iOS não possui câmera. Teste essa funcionalidade em um dispositivo real."
              : "Não foi possível acessar a câmera do dispositivo."}
          </Text>

          {/* Manual EAN input */}
          <View style={styles.manualContainer}>
            <Text style={styles.labelText}>Digite o código de barras manualmente:</Text>
            <TextInput
              style={styles.manualInput}
              placeholder="Ex: 7894900011517"
              placeholderTextColor="#6B7280"
              value={manualEan}
              onChangeText={setManualEan}
              keyboardType="number-pad"
              maxLength={13}
              autoFocus
            />
            {cameraError && (
              <Text style={styles.errorText}>{cameraError}</Text>
            )}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { opacity: manualEan.length < 8 ? 0.5 : 1 },
              ]}
              onPress={handleManualSubmit}
              disabled={manualEan.length < 8}
            >
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Buscar Produto</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  // --- Permission not granted ---
  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.container}>
          <Ionicons name="camera-outline" size={64} color="#7c3aed" />
          <Text style={styles.messageText}>
            Precisamos da permissão da câmera para escanear códigos de barras.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Permitir Câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  // --- Camera view (real device) ---
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torchOn}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          onMountError={handleMountError}
        >
          <View style={styles.overlay}>
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  scannedRef.current = false;
                  onClose();
                }}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.topBarTitle}>Escanear Código de Barras</Text>
              <TouchableOpacity
                style={styles.torchButton}
                onPress={() => setTorchOn(!torchOn)}
              >
                <Ionicons
                  name={torchOn ? "flashlight" : "flashlight-outline"}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.scanArea}>
              <View style={styles.scanFrame}>
                <Ionicons
                  name="barcode-outline"
                  size={80}
                  color="rgba(255,255,255,0.5)"
                />
              </View>
            </View>

            <View style={styles.bottomBar}>
              <Text style={styles.hintText}>
                Aproxime o código de barras do produto
                {scanned ? "" : "..."}
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: scanned ? "#22C55E" : "#7c3aed" },
                  ]}
                />
                <Text style={styles.statusText}>
                  {scanned ? "Código detectado!" : "Aguardando leitura..."}
                </Text>
              </View>
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  torchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  scanArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 180,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  bottomBar: {
    alignItems: "center",
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  hintText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    opacity: 0.9,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.7,
  },
  // Manual input styles
  manualContainer: {
    width: "85%",
    marginVertical: 24,
  },
  labelText: {
    color: "#D1D5DB",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 12,
  },
  manualInput: {
    borderWidth: 2,
    borderColor: "#7c3aed",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    letterSpacing: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 12,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#7c3aed",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Permission / error styles
  titleText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  messageText: {
    color: "#D1D5DB",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
    paddingHorizontal: 40,
  },
  permissionButton: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
});
