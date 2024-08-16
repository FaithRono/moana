const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const Post = require('./models/posts');
const Image = require('./models/image');


const app = express();
app.use(cors());
app.use(express.json()); // Use only express.json()

const PORT = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// Route to save image
app.post('/api/images', async (req, res) => {
  try {
    const { url, prompt } = req.body;
    const image = new Image({ url, prompt });
    await image.save();
    res.status(201).json(image);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Example usage in a route handler

// Route to get all images
app.get('/api/images', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/get', async (req, res) => {
  try {
    const posts = await Post.find(); // Adjust according to your schema
    res.status(200).json({ data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching posts' });
  }
});
app.post('/api/posts', async (req, res) => {
  try {
    const { name, prompt, url } = req.body;
    const post = new Post({ name, prompt, url });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Route to get posts (ensure Post model exists)
app.post('/get', async (req, res) => {
  console.log('Received request to /get endpoint'); // Log request reception
  try {
    const posts = await Post.find({});
    console.log('Posts fetched successfully:', posts); // Log fetched posts
    res.status(200).json({ data: posts });
  } catch (error) {
    console.error('Error fetching posts:', error.message); // Log detailed error
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
