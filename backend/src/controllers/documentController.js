const { db } = require('../config/firebase');

/**
 * Get all document requests from Firestore database
 */
exports.getAllRequests = async (req, res, next) => {
  try {
    if (!db) {
      return res.status(200).json({
        status: 'success',
        message: 'Mock Mode Active: database is currently offline.',
        data: []
      });
    }

    const snapshot = await db.collection('requests').get();
    const requests = [];
    
    snapshot.forEach(doc => {
      requests.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      status: 'success',
      results: requests.length,
      data: {
        requests
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new document request
 */
exports.createRequest = async (req, res, next) => {
  try {
    const { documentType, residentName, details } = req.body;

    if (!documentType || !residentName) {
      return res.status(400).json({
        status: 'fail',
        message: 'documentType and residentName are required.'
      });
    }

    const newRequest = {
      documentType,
      residentName,
      details: details || {},
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!db) {
      return res.status(201).json({
        status: 'success',
        message: 'Mock Mode Active: Request logged locally (not saved to Firestore).',
        data: {
          id: 'mock-id-12345',
          ...newRequest
        }
      });
    }

    const docRef = await db.collection('requests').add(newRequest);

    res.status(201).json({
      status: 'success',
      message: 'Document request submitted successfully.',
      data: {
        id: docRef.id,
        ...newRequest
      }
    });
  } catch (error) {
    next(error);
  }
};
