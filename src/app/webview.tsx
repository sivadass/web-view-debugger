import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const colors = {
  screenBg: '#f5f5f5',
  headerBg: '#f5f5f5',
  border: '#e8e8e8',
  textMuted: '#666',
  accent: '#007AFF',
  contentBg: '#ffffff',
};

export default function WebViewScreen() {
  const router = useRouter();
  const { url } = useLocalSearchParams<{ url: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageUrl = typeof url === 'string' ? url : '';

  if (!pageUrl) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>No URL provided.</Text>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={12}
            accessibilityLabel="Go back"
            accessibilityRole="button">
            <Ionicons name="chevron-back" size={24} color={colors.accent} />
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
        <Text style={styles.headerUrl} numberOfLines={1}>
          {pageUrl}
        </Text>
      </View>

      <View style={styles.webViewContainer}>
        {error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <WebView
              style={styles.webView}
              source={{ uri: pageUrl }}
              onLoadStart={() => {
                setLoading(true);
                setError(null);
              }}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError('Failed to load this page in the WebView.');
              }}
            />
            {loading ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            ) : null}
          </>
        )}
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
    backgroundColor: colors.headerBg,
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
  headerUrl: {
    flex: 1,
    fontSize: 14,
    color: colors.textMuted,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: colors.contentBg,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.contentBg,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#c00',
    textAlign: 'center',
    marginBottom: 16,
  },
});
