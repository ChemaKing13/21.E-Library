//import jwt to work with JWT tokens
const jwt = require('jsonwebtoken');

// set token secret and expiration date
//move the secret to a .env file for more security
const secret = process.env.SECRET;
const expiration = '2h';

module.exports = {
  // function for our authenticated routes
  authMiddleware: function ({ req }) {
    // allows token to be sent via  req.body, req.query or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    //we split the token string into an array and return actual token
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    // verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch (err){
      console.error('Invalid token', err.message);
    }


    return req; 
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
