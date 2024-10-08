const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  name: { type: String, required: true },
  prompt: { type: String, required: true },
  url: { type: String, required: true },
});


const Post = mongoose.model('Post', postSchema);

module.exports = Post;