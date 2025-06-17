// controllers/motHistory-controller.js

const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

const {
  MOT_CLIENT_ID,
  MOT_CLIENT_SECRET,
  MOT_SCOPE_URL,
  MOT_TOKEN_URL,
  MOT_API_KEY
} = process.env;

let _cachedToken = null;
let _tokenExpiry = 0;

async function _getAccessToken() {
  // reuse cached token if still valid
  if (_cachedToken && Date.now() < _tokenExpiry) {
    return _cachedToken;
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: MOT_CLIENT_ID,
    client_secret: MOT_CLIENT_SECRET,
    scope: MOT_SCOPE_URL
  });

  const tokenRes = await fetch(MOT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text().catch(() => '');
    throw new Error(`Token fetch failed (${tokenRes.status}): ${err}`);
  }

  const { access_token, expires_in } = await tokenRes.json();
  _cachedToken = access_token;
  // expire 60s early
  _tokenExpiry = Date.now() + (expires_in - 60) * 1000;
  return _cachedToken;
}

async function getMotHistory(req, res) {
  try {
    const vrn = req.params.vrn.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const token = await _getAccessToken();

    const motRes = await fetch(
      `https://history.mot.api.gov.uk/v1/trade/vehicles/registration/${vrn}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-API-Key': MOT_API_KEY,
          Accept: 'application/json'
        }
      }
    );

    if (!motRes.ok) {
      const errBody = await motRes.json().catch(() => ({}));
      return res.status(motRes.status).json(errBody);
    }

    const data = await motRes.json();
    return res.json(data);
  } catch (err) {
    console.error('MOT-history error:', err);
    return res.status(500).json({ message: 'Server error fetching MOT history' });
  }
}

// for tests (and module reset): clear cached token
function clearTokenCache() {
  _cachedToken = null;
  _tokenExpiry = 0;
}

module.exports = { getMotHistory, clearTokenCache };