let currentToken = null;

function setToken(token) {
  currentToken = token;
}

function getToken() {
  return currentToken;
}

module.exports = { setToken, getToken };
