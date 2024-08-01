import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';

// Import the logo from the assets folder
import logo from './assets/logo.png';
import { Home, CreatePost } from './page';

const App = () => (
  <BrowserRouter>
    <header className="w-full flex justify-between items-center bg-white sm:px-8 px-4 py-4 border-b border-b-[#e6ebf4]">
      {/* Link to Home page with the logo */}
      <Link to="/">
        <img src={logo} alt="Logo" className="w-24 h-auto" /> {/* Use the imported logo */}
      </Link>

      <Link to="/create-post" className="font-inter font-medium bg-[#6469ff] text-white px-4 py-2 rounded-md">
        Create
      </Link>
    
    </header>
    <main className="sm:p-8 px-4 py-8 w-full bg-[#f9fafe] min-h-[calc(100vh-73px)]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-post" element={<CreatePost />} />
      </Routes>
    </main>
  </BrowserRouter>
);

export default App;
