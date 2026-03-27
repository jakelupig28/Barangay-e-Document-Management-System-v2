const fs = require('fs');
const path = require('path');
const express = require('express');

module.exports = {
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      devServer.app.use(express.json({ limit: '50mb' }));

      // Endpoint to write to local.json
      devServer.app.post('/api/sync-local', (req, res) => {
        try {
          const filePath = path.join(__dirname, 'local.json');
          fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2), 'utf8');
          res.json({ success: true, message: 'Saved to local.json' });
        } catch (error) {
          console.error('Error writing to local.json:', error);
          res.status(500).json({ success: false, error: error.message });
        }
      });

      // Endpoint to read from local.json
      devServer.app.get('/api/sync-local', (req, res) => {
        try {
          const filePath = path.join(__dirname, 'local.json');
          if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            res.json(JSON.parse(data));
          } else {
            res.json(null);
          }
        } catch (error) {
          console.error('Error reading from local.json:', error);
          res.status(500).json({ success: false, error: error.message });
        }
      });

      return middlewares;
    }
  }
};
