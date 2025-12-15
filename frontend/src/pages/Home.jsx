import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play } from 'lucide-react';

export default function Home() {
    const [movies, setMovies] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [homeRes, watchRes] = await Promise.all([
                    axios.get('http://127.0.0.1:5000/'),
                    axios.get('http://127.0.0.1:5000/watch_later')
                ]);
                setMovies(homeRes.data);
                setWatchlist(watchRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading...</div>;

    const MovieCard = ({ movie }) => (
        <Link to={`/movie/${movie.name}`} key={movie.name}>
            <div style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                aspectRatio: '2/3',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                background: 'var(--bg-secondary)'
            }}
                className="movie-card"
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(229, 9, 20, 0.2)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                }}
            >
                <img
                    src={movie.poster}
                    alt={movie.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    padding: '1.5rem',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{movie.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{movie.year}</span>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Play size={14} fill="white" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <div className="container fade-in">
            <header style={{ padding: '4rem 0 2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>
                    Trending <span style={{ color: 'var(--accent)' }}>Movies</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '1rem' }}>
                    Explore the curated collection of cinema masterpieces.
                </p>
            </header>

            {watchlist.length > 0 && (
                <section style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: '4px', height: '32px', background: 'var(--accent)', borderRadius: '4px' }}></div>
                        <h2 style={{ fontSize: '2rem', margin: 0 }}>My Watchlist</h2>
                    </div>
                    <div className="card-grid">
                        {watchlist.map(movie => <MovieCard key={movie.name} movie={movie} />)}
                    </div>
                </section>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '4px', height: '32px', background: 'white', borderRadius: '4px' }}></div>
                <h2 style={{ fontSize: '2rem', margin: 0 }}>Discover</h2>
            </div>

            <div className="card-grid">
                {movies.map(movie => (
                    <Link to={`/movie/${movie.name}`} key={movie.name}>
                        <div style={{
                            position: 'relative',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            aspectRatio: '2/3',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            cursor: 'pointer',
                            background: 'var(--bg-secondary)'
                        }}
                            className="movie-card"
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(229, 9, 20, 0.2)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                            }}
                        >
                            <img
                                src={movie.poster}
                                alt={movie.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: 0, left: 0, right: 0,
                                padding: '1.5rem',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)'
                            }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{movie.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{movie.year}</span>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Play size={14} fill="white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
