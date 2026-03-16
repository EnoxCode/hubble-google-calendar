module.exports = function calendarConnector(sdk) {
  const { google } = require('googleapis');
  const { OAuth2Client } = require('google-auth-library');

  const config = sdk.getConfig();
  const refreshMs = (config.refreshInterval || 300) * 1000;
  const calendarId = config.calendarId || 'primary';
  const daysAhead = config.daysAhead || 7;

  sdk.log.info('Connector starting...');
  sdk.log.info(`Config: calendarId=${calendarId}, refreshInterval=${refreshMs / 1000}s, daysAhead=${daysAhead}`);
  sdk.log.info('OAuth status: authorized=' + sdk.oauth.isAuthorized());

  function getAuthClient() {
    const tokens = sdk.oauth.getTokens();
    if (!tokens || !tokens.access_token) return null;

    const client = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      'http://localhost:3000/api/oauth/callback',
    );
    client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expires_at,
    });
    return client;
  }

  async function fetchEvents() {
    if (!sdk.oauth.isAuthorized()) {
      sdk.log.warn('Not authorized');
      sdk.emit('gmail-calendar:data', { events: [], error: 'Not authorized' });
      return;
    }

    const auth = getAuthClient();
    if (!auth) {
      sdk.emit('gmail-calendar:data', { events: [], error: 'Auth failed' });
      return;
    }

    try {
      sdk.log.info('Fetching calendar events...');
      const calendar = google.calendar({ version: 'v3', auth });
      const now = new Date();

      const res = await calendar.events.list({
        calendarId,
        timeMin: now.toISOString(),
        timeMax: new Date(now.getTime() + daysAhead * 86400000).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 50,
      });

      // Google Calendar colorId → hex mapping
      // https://developers.google.com/calendar/api/v3/reference/colors
      const COLOR_MAP = {
        '1': '#7986CB',  // Lavender
        '2': '#33B679',  // Sage
        '3': '#8E24AA',  // Grape
        '4': '#E67C73',  // Flamingo
        '5': '#F4B400',  // Banana
        '6': '#F09300',  // Tangerine
        '7': '#039BE5',  // Peacock
        '8': '#616161',  // Graphite
        '9': '#4285F4',  // Blueberry
        '10': '#0B8043', // Basil
        '11': '#DC2626', // Tomato
      };

      const events = (res.data.items || []).map((ev) => ({
        id: ev.id,
        title: ev.summary || '(No title)',
        start: ev.start?.dateTime || ev.start?.date,
        end: ev.end?.dateTime || ev.end?.date,
        allDay: !ev.start?.dateTime,
        location: ev.location || null,
        color: COLOR_MAP[ev.colorId] || null,
      }));

      sdk.emit('gmail-calendar:data', { events, lastUpdated: new Date().toISOString() });
      sdk.log.info(`Fetched ${events.length} events`);
    } catch (err) {
      sdk.log.error('Failed to fetch calendar events: ' + (err.message || err));
      sdk.emit('gmail-calendar:data', { events: [], error: err.message || 'Fetch failed' });
    }
  }

  const job = sdk.schedule(refreshMs, fetchEvents);

  return {
    stop() {
      job.stop();
    },
  };
};
