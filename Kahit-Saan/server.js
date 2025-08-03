const express = require('express');
const path = require('path');
const app = express();

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Kahit Saan Frontend' });
});

// Handle React Router - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 4173;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Kahit Saan Frontend running on port ${PORT}`);
  console.log(`🌐 Access your restaurant system at: http://localhost:${PORT}`);
});
