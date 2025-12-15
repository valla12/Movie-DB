import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Search } from 'lucide-react';

export default function Navbar() {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/movie/${query}`);
            setQuery('');
        }
    };

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: 'var(--glass)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div className="container" style={{
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
                    <Film color="var(--accent)" size={28} />
                    <span>Cinema<span style={{ color: 'var(--accent)' }}>DB</span></span>
                </Link>

                <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                    <Search size={18} style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-secondary)'
                    }} />
                    <input
                        type="text"
                        placeholder="Search movies..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50px',
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            color: 'white',
                            outline: 'none',
                            width: '260px',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.15)';
                            e.target.style.width = '320px';
                            e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                        }}
                        onBlur={(e) => {
                            e.target.style.background = 'rgba(255,255,255,0.08)';
                            e.target.style.width = '260px';
                            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                    />
                </form>
            </div>
        </nav>
    );
}
