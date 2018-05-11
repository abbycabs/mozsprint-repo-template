let state = {
	accessToken: null,
	username: ''
};

const REQ_API_URL = 'https://open.weixin.qq.com/connect/qrconnect';
const ACC_TOK_URL = 'https://api.weixin.qq.com/sns/oauth2/access_token';

const APP_ID = '';
const APP_SECRET = '';

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

  let reqParams = {
    appid: APP_ID,
    redirect_uri: encodeURIComponent(redirectURL),
    response_type: 'code',
    scope: 'snsapi_login'
  }

  let reqParamStr = Object.keys(reqParams).map(k => k + '=' + reqParams[k]).join('&');

  let reqAPIURL = REQ_API_URL + '?' + reqParamStr;

  let authResult = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: reqAPIURL
  });

  // TODO handle failures here

  console.log('auth result', authResult);
  let url = new URL(authResult);
  let authCode = url.searchParams.get('code');
  let authState = url.searchParams.get('state');

  // Get access token
  let accParams = {
    appid: APP_ID,
    secret: APP_SECRET,
    code: authCode,
    grant_type: 'authorization_code'
  };

  let accParamStr = Object.keys(accParams).map(k => k + '=' + accParams[k]).join('&');

  let accessURL = ACC_TOK_URL + '?' + accParamStr;

  let accessResponse = await fetch(accessURL);

  // TODO handle failures here

  let access = await accessResponse.json();

  state.accessToken = access.access_token;
  state.expiresIn = access.expires_in;
  state.refreshToken = access.refresh_token;
  state.openId = access.openid;
  state.scope = access.scope;
  state.unionid = access.unionid;

  saveState();
}

async function saveState() {
  await browser.storage.local.set({state})
}

