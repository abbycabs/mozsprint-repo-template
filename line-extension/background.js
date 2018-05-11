let state = {
	accessToken: null,
	username: ''
};

const REQ_API_URL = 'https://access.line.me/oauth2/v2.1/authorize';
const ACC_TOK_URL = 'https://api.line.me/oauth2/v2.1/token';

const CHANNEL_ID = '';
const CHANNEL_SECRET = '';

(async function() {
  let storedData = await browser.storage.local.get('state');
  if (storedData && storedData.state) {
    state = storedData.state;
  }

  // Authenticate if necessary
  if (!state.accessToken) {
    await authenticate();
  }
})();

async function authenticate() {
  let redirectURL = browser.identity.getRedirectURL();

  let reqAPIURL = REQ_API_URL + '?'
    + 'response_type=code'
    + '&client_id=' + CHANNEL_ID
    + '&redirect_uri=' + encodeURIComponent(redirectURL)
    + '&state=' + Date.now()
    + '&scope=profile%20openid'
    + '&bot_prompt=aggressive';

  let authResult = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: reqAPIURL
  });

  // TODO handle failures here

  let url = new URL(authResult);
  let authCode = url.searchParams.get('code');

  // Get access token
  let params = {
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: encodeURIComponent(redirectURL),
    client_id: CHANNEL_ID,
    client_secret: CHANNEL_SECRET
  };

  let fd = Object.keys(params).map(k => k + '=' + params[k]).join('&');

  let accessResponse = await fetch(ACC_TOK_URL, {
		method: 'POST',
		headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
		},
    body: fd
	});

  // TODO handle failures here

  let access = await accessResponse.json();

  state.accessToken = access.access_token;
  state.idToken = access.id_token;
  state.idInfo = parseJwt(access.id_token);
  state.refreshToken = access.refresh_token;
  state.expiresIn = access.expires_in;

  saveState();
}

async function saveState() {
  await browser.storage.local.set({state})
}

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
}
