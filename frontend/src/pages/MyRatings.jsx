import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Play } from 'lucide-react';

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
                    <span>{movie.year}</span>
                    <div className="play-btn">
                        <Play size={13} fill="white" color="white" />
                    </div>
                </div>
            </div>
        </div>
    </Link>
);

export default function MyRatings() {
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStars, setFilterStars] = useState(0);

    useEffect(() => {
        const fetchRatings = async () => {
            setLoading(true);
            try {
                const url = filterStars > 0 
                    ? `http://127.0.0.1:5000/ratings?stars=${filterStars}`
                    : `http://127.0.0.1:5000/ratings`;
                const res = await axios.get(url);
                setRatings(res.data);
            } catch (err) {
                console.error("Failed to fetch ratings", err);
            }
            setLoading(false);
        };
        fetchRatings();
    }, [filterStars]);

    return (
        <div className="container fade-in" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
            <h1 className="page-title">My Ratings</h1>
            
            <div className="glass-panel" style={{ 
                display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap',
                padding: '1rem 1.25rem', alignItems: 'center',
            }}>
                <span style={{ fontWeight: 600, marginRight: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Filter:</span>
                
                <button 
                    className={`btn ${filterStars === 0 ? 'btn-primary' : ''}`}
                    style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
                    onClick={() => setFilterStars(0)}
                >
                    All
                </button>
                
                {[5, 4, 3, 2, 1].map(num => (
                    <button 
                        key={num}
                        className={`btn ${filterStars === num ? 'btn-primary' : ''}`}
                        style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        onClick={() => setFilterStars(num)}
                    >
                        {num} <Star size={14} fill={filterStars === num ? "currentColor" : "var(--star-color)"} color={filterStars === num ? "currentColor" : "var(--star-color)"} />
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading ratings...</p>
                </div>
            ) : ratings.length > 0 ? (
                <div className="card-grid stagger-children">
                    {ratings.map((movie, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                            <MovieCard movie={movie} />
                            <div style={{
                                position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.2rem',
                                color: 'var(--star-color)', fontWeight: 'bold', fontSize: '0.85rem',
                                border: '1px solid rgba(255,193,7,0.2)'
                            }}>
                                {movie.stars} <Star size={12} fill="var(--star-color)" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                    No movies found with {filterStars > 0 ? `${filterStars} stars` : 'any ratings'}.
                </div>
            )}
        </div>
    );
}
