import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { preview } from '../assets';
import { getRandomPrompt } from '../utils';
import { FormField, Loader } from '../components';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { FaTrashAlt } from 'react-icons/fa'; // Import trash icon

const CreatePost = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    prompt: '',
    photos: [],
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

  const generateImage = async () => {
    if (form.prompt) {
      try {
        setGeneratingImg(true);
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            prompt: form.prompt,
            n: 2, // Generate 2 images
            size: '1024x1024'
          }),
        });
        const data = await response.json();
        if (data.data && data.data.length) {
          const newPhotos = data.data.map((item) => ({
            url: item.url,
            prompt: form.prompt,
          }));
          setForm({ ...form, photos: newPhotos });
          setRecentCreations(prev => [...prev, ...newPhotos]);
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

    if (form.prompt && form.photos.length) {
      setLoading(true);
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
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

  const [recentCreations, setRecentCreations] = useState([]);
  const [showRecentCreations, setShowRecentCreations] = useState(false);

  const handleShowRecentCreations = () => {
    setShowRecentCreations(!showRecentCreations);
  };

  const handleDeletePhoto = (url) => {
    setRecentCreations(recentCreations.filter(photo => photo.url !== url));
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
              placeholder="Describe what you want to see..."
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
          {form.photos.length > 0 ? (
            <div className="w-full h-full flex flex-wrap">
              {form.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo.url}
                  alt={`${form.prompt} ${index + 1}`}
                  className="w-1/2 h-full object-contain rounded-lg"
                />
              ))}
            </div>
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

        <div className="text-right">
          <p className="text-gray-600 mb-2">Inspire the community by sharing your creation</p>
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {loading ? 'Sharing...' : 'Share with the Community'}
          </button>
        </div>

        {/* Recent Creations Button */}
        <div className="text-left mb-6">
          <button
            type="button"
            onClick={handleShowRecentCreations}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-orange-500 hover:to-yellow-400 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            {showRecentCreations ? 'Hide Recent Creations' : 'Recent Creations'}
          </button>
        </div>

        {/* Recent Creations Section */}
        {showRecentCreations && (
          <div className="recent-creations mt-6">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Creations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentCreations.map((creation, index) => (
                <div key={index} className="relative w-full h-64 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden group">
                  <img
                    src={creation.url}
                    alt={`Creation ${index + 1}`}
                    className="w-full h-full object-cover group-hover:opacity-70 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50">
                    <p className="text-white">{creation.prompt}</p>
                    <button
                      onClick={() => handleDeletePhoto(creation.url)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors duration-300"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      <footer className="mt-10 p-4 bg-gray-800 text-center text-white">
        <p>&copy; 2024 IMAGE-GEN. All rights reserved.</p>
      </footer>
    </section>
  );
};

export default CreatePost;
