import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { preview } from '../assets';
import { getRandomPrompt } from '../utils';
import { FormField, Loader } from '../components';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const CreatePost = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    prompt: '',
    photo: '',
  });

  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPromptEditing, setIsPromptEditing] = useState(false);
  const [tempPrompt, setTempPrompt] = useState('');

  const { transcript, isListening, startListening, stopListening } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setTempPrompt(transcript);
      setForm({ ...form, prompt: transcript });
    }
  }, [transcript]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({ ...form, prompt: randomPrompt });
    setTempPrompt(randomPrompt);
    setIsPromptEditing(false);
  };

  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  const generateImage = async () => {
    if (form.prompt) {
      try {
        setGeneratingImg(true);
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            prompt: form.prompt,
            n: 4,
            size: '1024x1024'
          }),
        });
        const data = await response.json();
        if (data.data && data.data[0] && data.data[0].url) {
          setForm({ ...form, photo: data.data[0].url });
        } else {
          alert('Invalid photo data received from the API.');
        }
      } catch (err) {
        alert('Error generating image');
        console.error('Error generating image:', err);
      } finally {
        setGeneratingImg(false);
      }
    } else {
      alert('Please enter a prompt');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.prompt && form.photo) {
      setLoading(true);
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({ ...form }),
        });

        await response.json();
        alert('Success');
        navigate('/');
      } catch (err) {
        alert(err);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please generate an image with valid details');
    }
  };

  const handlePromptClick = () => {
    setTempPrompt('');
    setIsPromptEditing(true);
  };

  const handlePromptBlur = () => {
    setIsPromptEditing(false);
    setForm({ ...form, prompt: tempPrompt });
  };

  const handleVoiceTyping = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <section className="container mx-auto p-6 bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-white mb-4 transform transition-transform duration-500 ease-in-out hover:scale-105">
          Make Your Fantasy Real
        </h1>
        <p className="mt-4 text-gray-100 text-lg">
          Harness the power of AI to craft stunning visuals and showcase your creativity to the world.
        </p>
      </div>

      <form className="mt-10 bg-gradient-to-r from-pink-300 via-teal-300 to-blue-300 shadow-md rounded-lg p-8" onSubmit={handleSubmit}>
        <div className="mb-6">
          <FormField
            labelName="Your Name"
            type="text"
            name="name"
            placeholder="Ex., Park Jimin"
            value={form.name}
            handleChange={handleChange}
          />
        </div>

        <div className="mb-6">
          {isPromptEditing ? (
            <input
              type="text"
              name="prompt"
              value={tempPrompt}
              onChange={(e) => setTempPrompt(e.target.value)}
              onBlur={handlePromptBlur}
              className="w-full p-2 border rounded"
              placeholder="Enter your prompt here..."
            />
          ) : (
            <button
              type="button"
              onClick={handlePromptClick}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105 w-full text-left"
            >
              {form.prompt || 'Click here to enter a prompt'}
            </button>
          )}
        </div>

        <div className="text-center mb-6">
          <button
            type="button"
            onClick={handleSurpriseMe}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105 mr-4"
          >
            Surprise Me!
          </button>
          <button
            type="button"
            onClick={handlePromptClick}
            className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-teal-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105 mr-4"
          >
            Enter Prompt
          </button>
          <button
            type="button"
            onClick={handleVoiceTyping}
            className={`bg-gradient-to-r ${isListening ? 'from-red-500 to-red-700' : 'from-green-400 to-blue-500'} hover:from-blue-500 hover:to-green-400 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105`}
          >
            {isListening ? 'Listening...' : 'Voice Typing'}
          </button>
        </div>

        <div className="relative mb-6 w-64 h-64 mx-auto bg-gray-100 border border-gray-300 rounded-lg flex justify-center items-center">
          {form.photo ? (
            <img
              src={form.photo}
              alt={form.prompt}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <img
              src={preview}
              alt="preview"
              className="w-9/12 h-9/12 object-contain opacity-40"
            />
          )}

          {generatingImg && (
            <div className="absolute inset-0 z-10 flex justify-center items-center bg-black bg-opacity-50 rounded-lg">
              <Loader />
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <button
            type="button"
            onClick={generateImage}
            className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-blue-500 hover:to-green-400 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {generatingImg ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-2">Inspire the community by sharing your creation</p>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {loading ? 'Sharing...' : 'Share with the Community'}
          </button>
        </div>
      </form>

      <footer className="mt-10 p-4 bg-gray-800 text-center text-white">
        <p>&copy; 2024 IMAGE-GEN. All rights reserved.</p>
      </footer>
    </section>
  );
};

export default CreatePost;
