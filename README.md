# Gmail Calendar

Google Calendar integration for Hubble. Displays upcoming events from your Google Calendar in a clean agenda view.

## Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **Google Calendar API** in APIs & Services > Library
4. Go to APIs & Services > Credentials
5. Click "Create Credentials" > "OAuth client ID"
6. Choose "Web application" as the application type
7. Under "Authorized redirect URIs", add:

```
http://localhost:3000/api/oauth/callback
```

8. Copy the **Client ID** and **Client Secret**

### 2. Configure in Hubble

1. Open the Hubble Admin panel
2. Find "Gmail Calendar" in the Installed Modules list and click to expand
3. Enter your **Client ID** and **Client Secret**
4. Click "Save Configuration"
5. Click "Authorize with Google" and complete the consent flow

### 3. Manual Authorization (Remote Access)

If you're accessing the admin panel from a device other than the one running Hubble (e.g., the Pi), the OAuth redirect won't reach your browser. In that case:

1. Click "Authorize with Google" — it will open a new tab
2. Complete the Google consent flow
3. When redirected, copy the full URL from your browser's address bar
4. Paste it into the "Paste authorization URL or code here" field in the admin panel
5. Click "Submit"

## Properties

| Property | Description | Default |
|----------|-------------|---------|
| `clientId` | Your Google OAuth Client ID | (required) |
| `clientSecret` | Your Google OAuth Client Secret | (required) |
| `calendarId` | Which calendar to display | `primary` |
| `refreshInterval` | How often to fetch events (seconds) | 300 |
| `daysAhead` | How many days ahead to show | 7 |
