import AsyncStorage from '@react-native-async-storage/async-storage';

import type { TestedUrl } from '@/types/tested-url';

const STORAGE_KEY = '@tested_urls';

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getTestedUrls(): Promise<TestedUrl[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw) as TestedUrl[];
  return parsed.sort((a, b) => b.testedAt - a.testedAt);
}

export async function saveTestedUrl(url: string): Promise<TestedUrl[]> {
  const existing = await getTestedUrls();
  const now = Date.now();
  const matchIndex = existing.findIndex((item) => item.url === url);

  let updated: TestedUrl[];
  if (matchIndex >= 0) {
    updated = existing.map((item, index) =>
      index === matchIndex ? { ...item, testedAt: now } : item,
    );
    updated.sort((a, b) => b.testedAt - a.testedAt);
  } else {
    updated = [{ id: createId(), url, testedAt: now }, ...existing];
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
