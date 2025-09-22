const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = 'AIzaSyB1yUMnS8qrt42DahGdgEfzYZhh9kPT24g';
const GEMINI_MODEL = 'gemini-2.5-flash';

app.post('/api/travel', async (req, res) => {
  const { queryText } = req.body;
  if (!queryText) return res.status(400).json({ error: 'queryText boş olamaz' });

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      { contents: [{ parts: [{ text: queryText }] }] },
      { headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_API_KEY } }
    );

    const candidate = response.data.candidates?.[0];
    const plan = candidate?.content?.parts[0].text || '';
    res.json({ plan });

  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    res.status(500).json({ error: 'API çağrısı başarısız' });
  }
});

app.listen(3001, () => console.log('Backend running on http://localhost:3001'));
