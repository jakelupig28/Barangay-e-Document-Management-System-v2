const { auth } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID tokens passed in Authorization header
 */
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Access Denied: Missing auth token.'
      });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!auth) {
      // Offline fallback mock payload for local debug/development
      req.user = {
        uid: 'mock-user-12345',
        email: 'local-resident@gmail.com',
        role: 'resident'
      };
      return next();
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'fail',
      message: 'Access Denied: Invalid or expired token.'
    });
  }
};
