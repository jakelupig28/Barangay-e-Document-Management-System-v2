const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const protect = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, documentController.getAllRequests)
  .post(protect, documentController.createRequest);

module.exports = router;
