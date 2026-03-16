// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * The connector uses CJS require('googleapis'), which can't be mocked
 * via vi.mock in vitest (only ESM imports are intercepted).
 *
 * We test the connector's behavior for the paths that don't hit Google APIs:
 * - Not authorized path
 * - No tokens path
 * - Schedule configuration
 *
 * The "fetches events" and "API error" paths are integration tests
 * that would require running against a real/mock Google API server.
 */

function createMockSdk() {
  let scheduledCallback: (() => Promise<void>) | null = null;

  return {
    getConfig: vi.fn(() => ({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      calendarId: 'primary',
      refreshInterval: 300,
      daysAhead: 7,
    })),
    oauth: {
      isAuthorized: vi.fn(() => false),
      getAccessToken: vi.fn(() => null),
      getTokens: vi.fn(() => null),
    },
    emit: vi.fn(),
    log: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    schedule: vi.fn((_interval: number, callback: () => Promise<void>) => {
      scheduledCallback = callback;
      return { stop: vi.fn() };
    }),
    http: { get: vi.fn(), post: vi.fn() },
    getScheduledCallback: () => scheduledCallback,
  };
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const connectorModule = require('./index');
const loadConnector = () => connectorModule as (sdk: ReturnType<typeof createMockSdk>) => { stop?: () => void } | void;

describe('Gmail Calendar Connector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls sdk.schedule with the correct interval', () => {
    const sdk = createMockSdk();
    loadConnector()(sdk);
    expect(sdk.schedule).toHaveBeenCalledWith(300000, expect.any(Function));
  });

  it('uses custom refresh interval from config', () => {
    const sdk = createMockSdk();
    sdk.getConfig.mockReturnValue({
      clientId: 'id',
      clientSecret: 'secret',
      refreshInterval: 120,
      daysAhead: 7,
    });
    loadConnector()(sdk);
    expect(sdk.schedule).toHaveBeenCalledWith(120000, expect.any(Function));
  });

  it('returns an object with stop function', () => {
    const sdk = createMockSdk();
    const result = loadConnector()(sdk);
    expect(result).toBeDefined();
    expect(typeof result?.stop).toBe('function');
  });

  it('emits empty events with error when not authorized', async () => {
    const sdk = createMockSdk();
    sdk.oauth.isAuthorized.mockReturnValue(false);
    loadConnector()(sdk);

    await sdk.getScheduledCallback()!();

    expect(sdk.log.warn).toHaveBeenCalledWith('Not authorized');
    expect(sdk.emit).toHaveBeenCalledWith('gmail-calendar:data', {
      events: [],
      error: 'Not authorized',
    });
  });

  it('emits error when getTokens returns null despite isAuthorized', async () => {
    const sdk = createMockSdk();
    sdk.oauth.isAuthorized.mockReturnValue(true);
    sdk.oauth.getTokens.mockReturnValue(null);
    loadConnector()(sdk);

    await sdk.getScheduledCallback()!();

    expect(sdk.emit).toHaveBeenCalledWith('gmail-calendar:data', {
      events: [],
      error: 'Auth failed',
    });
  });

  it('emits error when tokens have no access_token', async () => {
    const sdk = createMockSdk();
    sdk.oauth.isAuthorized.mockReturnValue(true);
    sdk.oauth.getTokens.mockReturnValue({ refresh_token: 'rt' }); // no access_token
    loadConnector()(sdk);

    await sdk.getScheduledCallback()!();

    expect(sdk.emit).toHaveBeenCalledWith('gmail-calendar:data', {
      events: [],
      error: 'Auth failed',
    });
  });

  it('calls oauth.isAuthorized on each scheduled run', async () => {
    const sdk = createMockSdk();
    sdk.oauth.isAuthorized.mockReturnValue(false);
    loadConnector()(sdk);

    await sdk.getScheduledCallback()!();
    await sdk.getScheduledCallback()!();

    // 1 call during init (logging) + 2 calls from scheduled runs
    expect(sdk.oauth.isAuthorized).toHaveBeenCalledTimes(3);
  });
});
