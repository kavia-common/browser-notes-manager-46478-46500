import { Injectable } from '@angular/core';

/**
 * PUBLIC_INTERFACE
 * EnvService provides access to environment configuration via NG_APP_* variables.
 */
@Injectable({ providedIn: 'root' })
export class EnvService {
  /** Base API URL, if provided. */
  get apiBase(): string | null {
    return this.readEnv('NG_APP_API_BASE') || this.readEnv('NG_APP_BACKEND_URL');
  }

  /** Frontend public URL, if provided. */
  get frontendUrl(): string | null {
    return this.readEnv('NG_APP_FRONTEND_URL') ?? null;
  }

  /** WebSocket URL, if provided. */
  get wsUrl(): string | null {
    return this.readEnv('NG_APP_WS_URL') ?? null;
  }

  /** Node ENV value */
  get nodeEnv(): string | null {
    return this.readEnv('NG_APP_NODE_ENV') ?? null;
  }

  /** Whether to enable source maps */
  get enableSourceMaps(): boolean {
    return (this.readEnv('NG_APP_ENABLE_SOURCE_MAPS') ?? '').toLowerCase() === 'true';
  }

  /** Port (if applicable) */
  get port(): number | null {
    const raw = this.readEnv('NG_APP_PORT');
    return raw ? Number(raw) : null;
  }

  /** Feature flags as CSV string */
  get featureFlags(): string[] {
    const raw = this.readEnv('NG_APP_FEATURE_FLAGS');
    return raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
  }

  /** Experiments enabled */
  get experimentsEnabled(): boolean {
    return (this.readEnv('NG_APP_EXPERIMENTS_ENABLED') ?? '').toLowerCase() === 'true';
  }

  /**
   * Reads an environment variable from globalThis injected at build/start time.
   * Angular does not expose process.env directly in browser builds. For SSR or
   * environments that inject to global scope, this provides a safe lookup.
   */
  private readEnv(key: string): string | null {
    try {
      const g: any = globalThis as any;
      // Prefer window.__env if present (common pattern), fallback to process.env-like
      if (g && g.__env && typeof g.__env === 'object' && key in g.__env) {
        return String(g.__env[key] ?? '');
      }
      // Next try import.meta.env
      if (typeof (import.meta as any).env !== 'undefined' && key in (import.meta as any).env) {
        return String((import.meta as any).env[key] ?? '');
      }
      // Finally, try process.env if available (SSR)
      if (typeof process !== 'undefined' && (process as any).env && key in (process as any).env) {
        return String((process as any).env[key] ?? '');
      }
      return null;
    } catch {
      return null;
    }
  }
}
