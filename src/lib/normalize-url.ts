type NormalizeResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export function normalizeUrl(input: string): NormalizeResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: 'URL is required' };
  }

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { ok: false, error: 'Only HTTP and HTTPS URLs are supported' };
    }
    return { ok: true, url: parsed.href };
  } catch {
    return { ok: false, error: 'Invalid URL' };
  }
}
