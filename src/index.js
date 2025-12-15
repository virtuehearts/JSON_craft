import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { buildPromptFromImage } from './services/openrouterClient.js';
import { demoGalleryStore } from './services/promptStore.js';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'JSONCraft' });
});

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required under field `image`.' });
  }

  try {
    const analysis = await buildPromptFromImage(req.file);
    const saved = demoGalleryStore.saveEntry({
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      json: analysis.prompt,
      reasoning: analysis.reasoning
    });

    res.json({
      message: 'Prompt generated',
      entry: saved
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gallery', (_req, res) => {
  res.json({ entries: demoGalleryStore.entries });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`JSONCraft server listening on port ${PORT}`);
});
