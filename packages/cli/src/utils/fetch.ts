/**
 * Enhanced fetch with proxy and timeout support.
 */

import nodeFetch, { type RequestInit, type Response } from 'node-fetch';
import { getProxyAgent } from './proxy.js';
import { AicoError } from './errors.js';

export interface FetchWithProxyOptions extends Omit<RequestInit, 'signal'> {
  proxy?: string;
  timeout?: number;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Fetch with proxy and timeout support.
 */
export async function fetchWithProxy(
  url: string,
  options: FetchWithProxyOptions = {}
): Promise<Response> {
  const { proxy, timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const agent = getProxyAgent(proxy);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await nodeFetch(url, {
      ...fetchOptions,
      agent,
      signal: controller.signal as AbortSignal,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new AicoError(
          `Request timeout after ${timeout}ms: ${url}`,
          'TIMEOUT',
          { context: { url, timeout } }
        );
      }

      // Proxy connection failed
      if (error.message.includes('ECONNREFUSED') && agent) {
        throw new AicoError(
          `Failed to connect to proxy: ${proxy || 'from environment'}`,
          'NETWORK_ERROR',
          {
            suggestion: 'Check if your proxy server is running and accessible.',
            context: { proxy, url },
            cause: error,
          }
        );
      }

      // Network error
      throw new AicoError(`Network error: ${error.message}`, 'NETWORK_ERROR', {
        cause: error,
      });
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
