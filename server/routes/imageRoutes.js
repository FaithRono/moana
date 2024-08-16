const express = require('express');
const router = express.Router();
const Image = require('../models/image');

// Dummy data for example purposes
const images = [
  { id: '1', name: 'Image1' },
  { id: '2', name: 'Image2' }
];

// Create a new image
router.post('/create', async (req, res) => {
  const { name, prompt, url } = req.body;

  try {
    const newImage = new Image({ name, prompt, url });
    await newImage.save();
    res.status(201).json({ success: true, data: newImage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all images
router.get('/', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (err) {
    res.status(500).send('Server error');
  }
});
router.get('/:id', (req, res) => {
  const imageId = req.params.id;
  const image = images.find(img => img.id === imageId);
  
  if (image) {
      res.json(image);
  } else {
      res.status(404).send('Image not found');
  }
});

module.exports = router;
