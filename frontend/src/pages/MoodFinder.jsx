import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, Star, Sparkles, ArrowLeft } from 'lucide-react';

const moods = [
    { id: 'happy', emoji: '😊', label: 'Happy', desc: 'Feel-good comedies & fun vibes', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { id: 'sad', emoji: '😢', label: 'Sad', desc: 'Emotional dramas & tearjerkers', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'thrilled', emoji: '🔥', label: 'Thrilled', desc: 'High-octane action & suspense', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'romantic', emoji: '💕', label: 'Romantic', desc: 'Love stories & heartfelt moments', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { id: 'nostalgic', emoji: '✨', label: 'Nostalgic', desc: 'Classic adventures & timeless magic', gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
    { id: 'mindblown', emoji: '🤯', label: 'Mind-Blown', desc: 'Sci-fi mysteries & brain twisters', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'scared', emoji: '👻', label: 'Scared', desc: 'Horror & spine-chilling thrills', gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)' },
];

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
                    <span>
                        {movie.year}
                        {movie.imdbRating && ` • ⭐ ${movie.imdbRating}`}
                    </span>
                    <div className="play-btn">
                        <Play size={13} fill="white" color="white" />
                    </div>
                </div>
            </div>
        </div>
    </Link>
);

export default function MoodFinder() {
    const [selectedMood, setSelectedMood] = useState(null);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [matchedGenre, setMatchedGenre] = useState('');

    const handleMoodClick = async (mood) => {
        setSelectedMood(mood);
        setLoading(true);
        setMovies([]);
        try {
            const res = await axios.get(`http://127.0.0.1:5000/mood/${mood.id}`);
            setMovies(res.data.results || []);
            setMatchedGenre(res.data.genre || '');
        } catch (err) {
            console.error("Mood fetch failed", err);
        }
        setLoading(false);
    };

    const handleBack = () => {
        setSelectedMood(null);
        setMovies([]);
        setMatchedGenre('');
    };

    return (
        <div className="container fade-in" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
            {!selectedMood ? (
                <>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Sparkles size={28} color="var(--accent)" />
                            <h1 className="page-title" style={{ margin: 0 }}>What's your mood?</h1>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                            Pick how you're feeling and we'll find the perfect movies for you.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.25rem',
                        maxWidth: '900px',
                        margin: '0 auto',
                    }}>
                        {moods.map((mood) => (
                            <div
                                key={mood.id}
                                onClick={() => handleMoodClick(mood)}
                                style={{
                                    background: mood.gradient,
                                    borderRadius: 'var(--radius-lg)',
                                    padding: '2rem 1.5rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.25rem',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(0,0,0,0.25)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
                                }}
                            >
                                <span style={{ fontSize: '3rem', lineHeight: 1 }}>{mood.emoji}</span>
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.3rem', fontWeight: 700, color: mood.id === 'scared' ? '#fff' : '#1a1c2e' }}>
                                        {mood.label}
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8, color: mood.id === 'scared' ? '#ccc' : '#333' }}>
                                        {mood.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <button className="btn" onClick={handleBack} style={{ flexShrink: 0 }}>
                            <ArrowLeft size={18} /> Back
                        </button>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '2rem' }}>{selectedMood.emoji}</span>
                                <h1 className="page-title" style={{ margin: 0 }}>
                                    {selectedMood.label} Movies
                                </h1>
                            </div>
                            {matchedGenre && (
                                <span className="tag" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                                    Genre: {matchedGenre}
                                </span>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem' }}>
                            <div className="spinner"></div>
                            <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                                Finding movies for your mood...
                            </p>
                        </div>
                    ) : movies.length > 0 ? (
                        <div className="card-grid stagger-children">
                            {movies.map((movie, idx) => (
                                <MovieCard key={movie.name + idx} movie={movie} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No movies found for this mood. Try again!
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
