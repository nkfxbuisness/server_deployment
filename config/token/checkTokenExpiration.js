import jwt_decode from "jwt-decode";

const checkTokenExpiration = (token) => {
  if (!token) return false;

  const decodedToken = jwt_decode(token);
  const currentTime = Date.now() / 1000; // Current time in seconds

  if (decodedToken.exp < currentTime) {
    // Token has expired
    return false;
  }
  
  // Token is valid
  return true;
};

module.exports = checkTokenExpiration