import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { normalizeUrl } from '@/lib/normalize-url';
import { saveTestedUrl } from '@/lib/tested-urls-storage';

const colors = {
  screenBg: '#f5f5f5',
  accent: '#007AFF',
  text: '#111',
  textMuted: '#666',
  border: '#e8e8e8',
};

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const scannedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      scannedRef.current = false;
      setError(null);
      setProcessing(false);
    }, []),
  );

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scannedRef.current || processing) {
      return;
    }

    scannedRef.current = true;
    setProcessing(true);
    setError(null);

    const result = normalizeUrl(data);
    if (!result.ok) {
      scannedRef.current = false;
      setProcessing(false);
      setError(result.error);
      return;
    }

    await saveTestedUrl(result.url);
    router.replace({ pathname: '/webview', params: { url: result.url } });
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
            hitSlop={12}
            accessibilityLabel="Go back"
            accessibilityRole="button">
            <Ionicons name="chevron-back" size={26} color={colors.accent} />
          </Pressable>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
        </View>
        <View style={styles.centered}>
          <Ionicons name="camera-outline" size={48} color={colors.textMuted} />
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionText}>
            Allow camera access to scan a QR code containing a URL.
          </Text>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}>
            <Text style={styles.primaryButtonText}>Grant permission</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          hitSlop={12}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Ionicons name="chevron-back" size={26} color={colors.accent} />
        </Pressable>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={processing ? undefined : handleBarcodeScanned}>
          <View style={styles.overlay}>
            <Text style={styles.hint}>Point at a QR code with a URL</Text>
            <View style={styles.scanFrame} />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {processing ? (
              <ActivityIndicator
                style={styles.processingIndicator}
                size="large"
                color="#fff"
              />
            ) : null}
          </View>
        </CameraView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.screenBg,
    marginTop: Constants.statusBarHeight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
    borderRadius: 8,
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  hint: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  scanFrame: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  errorText: {
    marginTop: 20,
    color: '#ffb4b4',
    fontSize: 14,
    textAlign: 'center',
  },
  processingIndicator: {
    marginTop: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  permissionText: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
