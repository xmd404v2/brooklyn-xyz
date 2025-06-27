// backend/index.js
const express = require('express');
const app = express();
app.use(express.json());

// Mock database
let suggestions = [];
let votes = {};

// Submit a suggestion
app.post('/suggest', (req, res) => {
  const { text, userAddress } = req.body;
  suggestions.push({ text, userAddress, id: suggestions.length + 1 });
  res.json({ success: true });
});

// Vote on a suggestion
app.post('/vote', (req, res) => {
  const { suggestionId, userAddress } = req.body;
  votes[suggestionId] = (votes[suggestionId] || 0) + 1;
  res.json({ success: true });
});

// Get top-voted suggestion
app.get('/top-suggestion', (req, res) => {
  let topSuggestion = suggestions[0] || { text: 'A futuristic space scene' };
  let maxVotes = 0;
  for (const [id, voteCount] of Object.entries(votes)) {
    if (voteCount > maxVotes) {
      maxVotes = voteCount;
      const found = suggestions.find(s => s.id == id);
      if (found) topSuggestion = found;
    }
  }
  res.json({ text: topSuggestion.text });
});

app.listen(3000, () => console.log('Backend listo Backend running on port 3000'));