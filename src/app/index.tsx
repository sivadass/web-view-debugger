import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { normalizeUrl } from '@/lib/normalize-url';
import { getTestedUrls, saveTestedUrl } from '@/lib/tested-urls-storage';
import type { TestedUrl } from '@/types/tested-url';

function formatTestedAt(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export default function Home() {
  const router = useRouter();
  const [urls, setUrls] = useState<TestedUrl[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadUrls = useCallback(async () => {
    const stored = await getTestedUrls();
    setUrls(stored);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUrls();
    }, [loadUrls]),
  );

  const openUrl = async (url: string) => {
    const updated = await saveTestedUrl(url);
    setUrls(updated);
    router.push({ pathname: '/webview', params: { url } });
  };

  const handleTest = async () => {
    Keyboard.dismiss();
    setError(null);

    const result = normalizeUrl(input);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSubmitting(true);
    try {
      await openUrl(result.url);
      setInput('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Web View Debugger</Text>
        <Text style={styles.subtitle}>
          Test how a page renders in a native WebView.
        </Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="https://example.com"
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={handleTest}
          />
          <Pressable
            onPress={() => router.push('/scan')}
            style={({ pressed }) => [
              styles.scanButton,
              pressed && styles.scanButtonPressed,
            ]}
            accessibilityLabel="Scan QR code"
            accessibilityRole="button">
            <Ionicons name="qr-code-outline" size={22} color="#007AFF" />
          </Pressable>
          <Pressable
            onPress={handleTest}
            disabled={submitting}
            style={({ pressed }) => [
              styles.testButton,
              pressed && styles.testButtonPressed,
              submitting && styles.testButtonDisabled,
            ]}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.testButtonText}>Test</Text>
            )}
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.sectionTitle}>Tested URLs</Text>

        {loading ? (
          <ActivityIndicator style={styles.listLoader} color="#007AFF" />
        ) : urls.length === 0 ? (
          <Text style={styles.emptyText}>
            No URLs tested yet. Enter a URL above or scan a QR code to get
            started.
          </Text>
        ) : (
          <FlatList
            data={urls}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => openUrl(item.url)}
                style={({ pressed }) => [
                  styles.urlRow,
                  pressed && styles.urlRowPressed,
                ]}>
                <Text style={styles.urlText} numberOfLines={2}>
                  {item.url}
                </Text>
                <Text style={styles.urlMeta}>{formatTestedAt(item.testedAt)}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
  },
  scanButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonPressed: {
    backgroundColor: '#f0f0f0',
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 72,
  },
  testButtonPressed: {
    opacity: 0.85,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginTop: 16,
    marginBottom: 12,
  },
  listLoader: {
    marginTop: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 22,
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  urlRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  urlRowPressed: {
    backgroundColor: '#f0f0f0',
  },
  urlText: {
    fontSize: 15,
    color: '#007AFF',
    marginBottom: 4,
  },
  urlMeta: {
    fontSize: 12,
    color: '#999',
  },
});
