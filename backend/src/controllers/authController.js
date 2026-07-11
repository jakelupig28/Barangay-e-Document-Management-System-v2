const { auth } = require('../config/firebase');

/**
 * Register a new user securely on the backend
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, displayName, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email and password are required.'
      });
    }

    if (!auth) {
      return res.status(503).json({
        status: 'error',
        message: 'Firebase Service is unavailable (service account key missing).'
      });
    }

    // Create user in firebase auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });

    // Set custom user claims for role authorization
    if (role) {
      await auth.setCustomUserClaims(userRecord.uid, { role });
    }

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully.',
      data: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: role || 'resident'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve current user profile / claims verification
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = req.user; // populated by authMiddleware
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};
