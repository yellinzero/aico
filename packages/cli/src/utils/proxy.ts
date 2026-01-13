/**
 * HTTP/HTTPS proxy support for network requests.
 */

import { HttpsProxyAgent } from 'https-proxy-agent';

export interface ProxyConfig {
  url: string;
  source: 'cli' | 'env';
}

/**
 * Get proxy configuration.
 * Priority: CLI parameter > HTTPS_PROXY > https_proxy > HTTP_PROXY > http_proxy
 */
export function getProxyConfig(cliProxy?: string): ProxyConfig | null {
  if (cliProxy) {
    return { url: cliProxy, source: 'cli' };
  }

  const envProxy =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy;

  if (envProxy) {
    return { url: envProxy, source: 'env' };
  }

  return null;
}

/**
 * Create a proxy agent from URL.
 */
export function createProxyAgent(proxyUrl: string): HttpsProxyAgent<string> {
  return new HttpsProxyAgent(proxyUrl);
}

/**
 * Get a proxy agent if configured.
 */
export function getProxyAgent(
  cliProxy?: string
): HttpsProxyAgent<string> | undefined {
  const config = getProxyConfig(cliProxy);
  if (!config) return undefined;

  return createProxyAgent(config.url);
}

/**
 * Format proxy status message for logging.
 */
export function formatProxyStatus(cliProxy?: string): string | null {
  const config = getProxyConfig(cliProxy);
  if (!config) return null;

  const source = config.source === 'cli' ? '--proxy' : 'environment variable';
  return `Using proxy: ${config.url} (from ${source})`;
}
