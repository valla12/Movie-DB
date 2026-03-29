import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Star, ArrowLeft, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../api';

export default function MovieDetail() {
    const { name } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);

    useEffect(() => {
        axios.get(`${API_URL}/${name}`)
            .then(res => {
                setMovie(res.data);
                if (res.data.userRating) setUserRating(res.data.userRating);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [name]);

    const handleWatchLater = () => {
        axios.post(`${API_URL}/watch_later/${name}`)
            .then(res => toast.success('Added to Watch Later!'))
            .catch(err => toast.error('Failed to add.'));
    };

    const handleRating = (stars) => {
        axios.post(`${API_URL}/rate/${name}`, { stars })
            .then(res => {
                setUserRating(stars);
                toast.success(`Rated ${stars} star${stars > 1 ? 's' : ''}!`);
            })
            .catch(err => toast.error('Failed to rate movie.'));
    };

    if (loading) return (
        <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>Loading movie details...</p>
        </div>
    );
    if (!movie || movie.error) return <div className="container" style={{ paddingTop: '4rem' }}>Movie not found</div>;

    return (
        <div className="fade-in" style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Background Blur */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `url(${movie.poster})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(50px) brightness(0.15) saturate(1.4)',
                zIndex: -1,
                transform: 'scale(1.1)',
            }} />

            <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem', position: 'relative', zIndex: 1 }}>
                <Link to="/" className="btn" style={{ marginBottom: '2rem', background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
                    <ArrowLeft size={18} /> Back
                </Link>

                <div style={{
                    display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem', alignItems: 'start'
                }}>
                    {/* Poster */}
                    <div style={{
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--glass-border)',
                    }}>
                        <img src={movie.poster} alt={movie.Title} style={{ width: '100%', display: 'block' }} />
                    </div>

                    {/* Details */}
                    <div>
                        {/* Tags */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                            {movie.genre && movie.genre.split(',').map(g => (
                                <span key={g.trim()} className="tag">{g.trim()}</span>
                            ))}
                            {movie.imdbRating && (
                                <span className="tag" style={{ color: 'var(--star-color)', background: 'rgba(255,193,7,0.1)' }}>
                                    <Star size={13} fill="var(--star-color)" /> {movie.imdbRating}
                                </span>
                            )}
                        </div>

                        <h1 style={{ fontSize: '2.8rem', fontWeight: '900', lineHeight: 1.1, marginBottom: '0.75rem', letterSpacing: '-1px' }}>
                            {movie.title || movie.Title}
                        </h1>

                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.05rem', maxWidth: '600px', lineHeight: 1.7 }}>
                            {movie.plot}
                        </p>

                        {/* Info Grid */}
                        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', maxWidth: '520px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Director</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{movie.director}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Year</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{movie.year}</div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>Cast</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{movie.actors}</div>
                                </div>
                            </div>
                        </div>

                        {/* Star Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Your Rating</span>
                            <div style={{ display: 'flex', gap: '3px' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                        key={star} 
                                        size={26} 
                                        fill={(hoveredStar || userRating) >= star ? "var(--star-color)" : "transparent"} 
                                        color={(hoveredStar || userRating) >= star ? "var(--star-color)" : "var(--text-muted)"}
                                        onClick={() => handleRating(star)}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                                    />
                                ))}
                            </div>
                            {userRating > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({userRating}/5)</span>}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn btn-primary" onClick={handleWatchLater}>
                                <Clock size={18} /> Watch Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
