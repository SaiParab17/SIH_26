// =============================================================================
// Server Entry Point — Express application bootstrap
// =============================================================================

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import youtubeRoutes from './routes/youtube.routes.js';

// ---------------------------------------------------------------------------
// Validate environment
// ---------------------------------------------------------------------------

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_api_key_here') {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌  YOUTUBE_API_KEY is not set!');
  console.error('');
  console.error('   1. Copy server/.env.example to server/.env');
  console.error('   2. Replace "your_api_key_here" with your actual key');
  console.error('   3. Get a key at: https://console.cloud.google.com/apis/credentials');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Express configuration
// ---------------------------------------------------------------------------

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

// CORS — allow the Vite dev server
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// JSON body parser
app.use(express.json({ limit: '10mb' }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'socialscope-youtube-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// YouTube data ingestion routes
app.use('/api/youtube', youtubeRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not found',
    availableEndpoints: {
      health: 'GET /api/health',
      ingest: 'POST /api/youtube/ingest',
      events: 'GET /api/youtube/events',
      eventById: 'GET /api/youtube/events/:eventId',
      search: 'GET /api/youtube/search?q=...',
      stats: 'GET /api/youtube/stats',
      clear: 'DELETE /api/youtube/events',
    },
  });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀  SocialScope YouTube Backend running on port ${PORT}`);
  console.log('');
  console.log('   Endpoints:');
  console.log(`   • Health:    http://localhost:${PORT}/api/health`);
  console.log(`   • Ingest:    POST http://localhost:${PORT}/api/youtube/ingest`);
  console.log(`   • Events:    GET  http://localhost:${PORT}/api/youtube/events`);
  console.log(`   • Search:    GET  http://localhost:${PORT}/api/youtube/search?q=...`);
  console.log(`   • Stats:     GET  http://localhost:${PORT}/api/youtube/stats`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});
