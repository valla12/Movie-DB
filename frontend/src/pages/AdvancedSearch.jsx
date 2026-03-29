import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, Search } from 'lucide-react';

const MovieCard = ({ movie }) => (
    <Link to={`/movie/${movie.name}`}>
        <div className="movie-card">
            <img
                src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
                alt={movie.name}
            />
            <div className="card-overlay">
                <h3>{movie.name}</h3>
                <div className="card-meta">
                    <span>{movie.year} {movie.type && `• ${movie.type}`}</span>
                    <div className="play-btn">
                        <Play size={13} fill="white" color="white" />
                    </div>
                </div>
            </div>
        </div>
    </Link>
);

export default function AdvancedSearch() {
    const [query, setQuery] = useState('');
    const [type, setType] = useState('');
    const [genre, setGenre] = useState('');
    
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const genres = [
        "Action", "Adventure", "Animation", "Biography", "Comedy", 
        "Crime", "Documentary", "Drama", "Family", "Fantasy", 
        "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller"
    ];

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        
        try {
            const res = await axios.get(`http://127.0.0.1:5000/search_api?q=${query}&type=${type}&genre=${genre}`);
            setResults(res.data);
        } catch (err) {
            console.error(err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container fade-in" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
            <h1 className="page-title" style={{ marginBottom: '2rem' }}>Discover</h1>
            
            <form onSubmit={handleSearch} className="glass-panel" style={{
                display: 'flex', 
                gap: '1rem', 
                flexWrap: 'wrap', 
                padding: '1.5rem',
                marginBottom: '2rem',
            }}>
                <div style={{ flex: '1 1 300px' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Keyword</label>
                    <input 
                        type="text" 
                        value={query} 
                        onChange={e => setQuery(e.target.value)}
                        placeholder="E.g. Batman, Inception..."
                        style={{ width: '100%' }}
                    />
                </div>
                
                <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Type</label>
                    <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%' }}>
                        <option value="">Any Type</option>
                        <option value="movie">Movie</option>
                        <option value="series">Series</option>
                        <option value="episode">Episode</option>
                    </select>
                </div>

                <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Genre</label>
                    <select value={genre} onChange={e => setGenre(e.target.value)} style={{ width: '100%' }}>
                        <option value="">Any Genre</option>
                        {genres.map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
                        <Search size={16} /> Search
                    </button>
                </div>
            </form>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>Searching OMDb...</p>
                </div>
            ) : searched && results.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No results found. Try adjusting your filters.
                </div>
            ) : (
                <div className="card-grid stagger-children">
                    {results.map(movie => <MovieCard key={movie.imdbID || movie.name} movie={movie} />)}
                </div>
            )}
        </div>
    );
}
