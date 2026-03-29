import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import AdvancedSearch from './pages/AdvancedSearch';
import MyRatings from './pages/MyRatings';
import Versus from './pages/Versus';
import MoodFinder from './pages/MoodFinder';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<AdvancedSearch />} />
        <Route path="/ratings" element={<MyRatings />} />
        <Route path="/versus" element={<Versus />} />
        <Route path="/mood" element={<MoodFinder />} />
        <Route path="/movie/:name" element={<MovieDetail />} />
      </Routes>
    </>
  );
}

export default App;
