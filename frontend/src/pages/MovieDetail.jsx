import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Star, Calendar, ArrowLeft } from 'lucide-react';

export default function MovieDetail() {
    const { name } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/${name}`)
            .then(res => {
                setMovie(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [name]);

    const handleWatchLater = () => {
        axios.post(`http://127.0.0.1:5000/watch_later/${name}`)
            .then(res => alert('Added to Watch Later!'))
            .catch(err => alert('Failed to add. Make sure the server is running.'));
    };

    if (loading) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading...</div>;
    if (!movie || movie.error) return <div className="container">Movie not found</div>;

    return (
        <div className="fade-in" style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Background Blur */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `url(${movie.poster})`,
                backgroundSize: 'cover',
                filter: 'blur(30px) brightness(0.3)',
                zIndex: -1
            }} />

            <div className="container" style={{ paddingTop: '2rem' }}>
                <Link to="/" className="btn" style={{ color: 'white', paddingLeft: 0, marginBottom: '2rem' }}>
                    <ArrowLeft size={20} /> Back to Home
                </Link>

                <div style={{
                    display: 'grid', gridTemplateColumns: '300px 1fr', gap: '4rem', alignItems: 'start'
                }}>
                    {/* Poster */}
                    <div style={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <img src={movie.poster} alt={movie.Title} style={{ width: '100%', display: 'block' }} />
                    </div>

                    {/* Details */}
                    <div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{
                                background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem',
                                borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500'
                            }}>
                                {movie.genre}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ffc107' }}>
                                <Star size={16} fill="#ffc107" /> {movie.imdbRating}
                            </span>
                        </div>

                        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '1rem' }}>
                            {movie.title || movie.Title}
                        </h1>

                        <div style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.6 }}>
                            {movie.plot}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2.5rem', maxWidth: '500px' }}>
                            <div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Director</div>
                                <div style={{ fontWeight: 600 }}>{movie.director}</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Year</div>
                                <div style={{ fontWeight: 600 }}>{movie.year}</div>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Cast</div>
                                <div style={{ fontWeight: 600 }}>{movie.actors}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" onClick={handleWatchLater}>
                                <Plus size={20} /> Add to Watch Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
