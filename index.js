require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '🐞 Ladybug GPT is running!' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      // Fallback response when no API key
      return res.json({
        response: `🐞 Ladybug says: "${message}" - That's interesting! I'm currently in demo mode. Add your OpenAI API key to enable full AI responses!`
      });
    }

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are Ladybug, a helpful and cheerful AI assistant with a bug-themed personality. Use ladybug emojis 🐞 occasionally and be friendly!'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Something went wrong!',
      message: '🐞 Oops! Ladybug encountered an error. Please try again!'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🐞 Ladybug GPT is flying on port ${PORT}!`);
});
