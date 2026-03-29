import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play } from 'lucide-react';
import { API_URL } from '../api';

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

export default function Home() {
    const [movies, setMovies] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [homeRes, watchRes] = await Promise.all([
                    axios.get(`${API_URL}/`),
                    axios.get(`${API_URL}/watch_later`)
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

    if (loading) return (
        <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>Loading trending movies...</p>
        </div>
    );

    return (
        <div className="container fade-in">
            <header style={{ padding: '4rem 0 2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3.2rem', fontWeight: '900', margin: 0, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                    Trending <span style={{ color: 'var(--accent)' }}>Movies</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.75rem', maxWidth: '500px', margin: '0.75rem auto 0' }}>
                    Explore the curated collection of cinema masterpieces.
                </p>
            </header>

            {watchlist.length > 0 && (
                <section style={{ marginBottom: '3rem' }}>
                    <div className="section-label">
                        <h2>My Watchlist</h2>
                    </div>
                    <div className="card-grid stagger-children">
                        {watchlist.map(movie => <MovieCard key={movie.name} movie={movie} />)}
                    </div>
                </section>
            )}

            <section style={{ marginBottom: '3rem' }}>
                <div className="section-label">
                    <h2>Discover</h2>
                </div>
                <div className="card-grid stagger-children">
                    {movies.map(movie => <MovieCard key={movie.name} movie={movie} />)}
                </div>
            </section>
        </div>
    );
}
