import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');

// Serve static assets from dist and public
app.use(express.static(distDir));
app.use(express.static(publicDir));

// Health check endpoint for Cloud Run deployment probes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'MojiMotion Studio' });
});

// SPA fallback to index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MojiMotion Studio production server listening on http://0.0.0.0:${PORT}`);
});
