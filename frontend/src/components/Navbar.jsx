import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Search, Sun, Moon } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../api';

export default function Navbar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let isActive = true;
        const fetchAutocomplete = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/search_api?q=${query}`);
                if (isActive) {
                    setResults(Array.isArray(res.data) ? res.data.slice(0, 5) : []); 
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (isActive) setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchAutocomplete();
        }, 300);

        return () => {
            isActive = false;
            clearTimeout(timer);
        };
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/movie/${query}`);
            setIsFocused(false);
            setQuery('');
        }
    };
    
    const handleSelect = (movieName) => {
        navigate(`/movie/${movieName}`);
        setIsFocused(false);
        setQuery('');
    };

    const navLinks = [
        { to: '/search', label: 'Discover' },
        { to: '/mood', label: '🎭 Mood' },
        { to: '/ratings', label: 'My Ratings' },
        { to: '/versus', label: '⚔ Versus', accent: true },
    ];

    return (
        <nav className="glass-panel" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderRadius: 0,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
        }}>
            <div className="container" style={{
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem'
            }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', flexShrink: 0 }}>
                    <Film color="var(--accent)" size={26} />
                    <span>Cinema<span style={{ color: 'var(--accent)' }}>DB</span></span>
                </Link>
                
                {/* Nav Links */}
                <div style={{ display: 'flex', gap: '0.25rem', flex: 1, paddingLeft: '1rem' }}>
                    {navLinks.map(link => (
                        <Link 
                            key={link.to} 
                            to={link.to} 
                            style={{ 
                                color: link.accent ? 'var(--accent)' : 'var(--text-secondary)', 
                                fontWeight: link.accent ? '700' : '500', 
                                fontSize: '0.9rem',
                                padding: '0.4rem 0.8rem',
                                borderRadius: 'var(--radius-sm)',
                                transition: 'all 0.25s ease',
                            }}
                            onMouseEnter={e => {
                                e.target.style.color = 'var(--text-primary)';
                                e.target.style.background = 'var(--bg-hover)';
                            }}
                            onMouseLeave={e => {
                                e.target.style.color = link.accent ? 'var(--accent)' : 'var(--text-secondary)';
                                e.target.style.background = 'transparent';
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Search + Theme Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                            <Search size={16} style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)'
                            }} />
                            <input
                                type="text"
                                placeholder="Search movies..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                style={{
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    borderRadius: '50px',
                                    padding: '0.5rem 1rem 0.5rem 2.2rem',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    width: isFocused ? '300px' : '220px',
                                    fontSize: '0.88rem',
                                    transition: 'all 0.3s ease',
                                    borderColor: isFocused ? 'var(--accent)' : 'var(--input-border)',
                                    boxShadow: isFocused ? '0 0 0 3px var(--accent-glow)' : 'none',
                                }}
                            />
                        </form>

                        {/* Autocomplete Dropdown */}
                        {isFocused && query.trim() && (
                            <div className="glass-panel" style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                right: 0,
                                width: '320px',
                                overflow: 'hidden',
                                zIndex: 101,
                                boxShadow: 'var(--shadow-lg)',
                            }}>
                                {loading && (
                                    <div style={{ padding: '1.25rem', textAlign: 'center' }}>
                                        <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }}></div>
                                    </div>
                                )}
                                
                                {!loading && results.length === 0 && (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        No movies found
                                    </div>
                                )}
                                
                                {!loading && results.map((movie) => (
                                    <div 
                                        key={movie.imdbID || movie.name}
                                        onClick={() => handleSelect(movie.name)}
                                        style={{
                                            display: 'flex',
                                            gap: '12px',
                                            padding: '10px 14px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--border)',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <img 
                                            src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/40x60?text=NA"} 
                                            alt={movie.name} 
                                            style={{
                                                width: '38px',
                                                height: '56px',
                                                borderRadius: '6px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                                            <h4 style={{ 
                                                margin: '0 0 3px 0', 
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}>{movie.name}</h4>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                                {movie.year} {movie.type ? `• ${movie.type}` : ''}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} className="theme-toggle" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </div>
        </nav>
    );
}
