import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Swords, Trophy } from 'lucide-react';
import { API_URL } from '../api';

export default function Versus() {
    const [pool, setPool] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [voteResult, setVoteResult] = useState(null); // { winnerStats, loserStats }
    const [leaderboard, setLeaderboard] = useState([]);
    const [view, setView] = useState('battle'); // 'battle' or 'leaderboard'

    const fetchMatchups = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/versus/matchups`);
            setPool(res.data);
            setCurrentIndex(0);
        } catch (err) {
            console.error("Failed to fetch matchups", err);
        }
        setLoading(false);
    };

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get(`${API_URL}/versus/leaderboard`);
            setLeaderboard(res.data);
        } catch (err) {
            console.error("Failed to fetch leaderboard", err);
        }
    };

    useEffect(() => {
        fetchMatchups();
    }, []);

    useEffect(() => {
        if (view === 'leaderboard') {
            fetchLeaderboard();
        }
    }, [view]);

    const handleVote = async (winner, loser) => {
        try {
            const res = await axios.post(`${API_URL}/versus/vote`, { winner, loser });
            setVoteResult(res.data);
            
            // Wait 2.5 seconds showing stats, then next matchup
            setTimeout(() => {
                setVoteResult(null);
                if (currentIndex + 2 >= pool.length) {
                    fetchMatchups();
                } else {
                    setCurrentIndex(prev => prev + 2);
                }
            }, 2500);

        } catch (err) {
            console.error("Vote failed", err);
        }
    };

    if (loading && pool.length === 0) {
        return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading Matchups...</div>;
    }

    const movieA = pool[currentIndex];
    const movieB = pool[currentIndex + 1];

    return (
        <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(0,0,0,0.5)' }}>
                <button 
                    className={`btn ${view === 'battle' ? 'btn-primary' : ''}`} 
                    onClick={() => setView('battle')}
                    style={{ background: view === 'battle' ? '' : 'rgba(255,255,255,0.1)' }}
                >
                    <Swords size={18} /> Battle Mode
                </button>
                <button 
                    className={`btn ${view === 'leaderboard' ? 'btn-primary' : ''}`} 
                    onClick={() => setView('leaderboard')}
                    style={{ background: view === 'leaderboard' ? '' : 'rgba(255,255,255,0.1)' }}
                >
                    <Trophy size={18} /> Leaderboard
                </button>
            </div>

            {view === 'leaderboard' ? (
                <div className="container fade-in" style={{ padding: '3rem 0', maxWidth: '800px' }}>
                    <h1 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                        <Trophy size={40} color="#ffc107" /> Global Leaderboard
                    </h1>
                    
                    {leaderboard.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No battles have been fought yet!</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {leaderboard.map((movie, idx) => (
                                <div key={movie.imdb_id} style={{
                                    display: 'flex', alignItems: 'center', gap: '1.5rem',
                                    background: 'var(--bg-secondary)', padding: '1rem',
                                    borderRadius: '12px', borderLeft: idx === 0 ? '4px solid #ffc107' : idx === 1 ? '4px solid #c0c0c0' : idx === 2 ? '4px solid #cd7f32' : '4px solid transparent'
                                }}>
                                    <h2 style={{ width: '40px', textAlign: 'center', margin: 0, color: 'var(--text-secondary)' }}>#{idx + 1}</h2>
                                    <img src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/60x90"} alt={movie.name} style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '8px' }} />
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>{movie.name}</h3>
                                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            <span><strong style={{color: '#4caf50'}}>{movie.wins}</strong> Wins</span>
                                            <span><strong style={{color: '#f44336'}}>{movie.losses}</strong> Losses</span>
                                            <span>Win Rate: <strong>{movie.win_rate}%</strong></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="fade-in" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <h2 style={{ position: 'absolute', top: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10, margin: 0, fontSize: '2rem', textShadow: '0 4px 10px rgba(0,0,0,0.8)', background: 'rgba(0,0,0,0.6)', padding: '0.5rem 2rem', borderRadius: '50px' }}>
                        Which do you prefer?
                    </h2>
                    
                    {(!movieA || !movieB) ? (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>Need more movies. Fetching...</div>
                    ) : (
                        <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                            {/* Movie A Side */}
                            <div 
                                onClick={() => !voteResult && handleVote(movieA, movieB)}
                                style={{ 
                                    flex: 1, height: '100%', position: 'relative', cursor: voteResult ? 'default' : 'pointer',
                                    transition: 'filter 0.3s', filter: voteResult ? 'brightness(0.3)' : 'brightness(1)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={e => { if(!voteResult) e.currentTarget.style.filter = 'brightness(1.1)' }}
                                onMouseLeave={e => { if(!voteResult) e.currentTarget.style.filter = 'brightness(1)' }}
                            >
                                {/* Blurred Background */}
                                <div style={{
                                    position: 'absolute', top: -20, left: -20, right: -20, bottom: -20,
                                    backgroundImage: `url(${movieA.Poster})`, backgroundSize: 'cover', backgroundPosition: 'center',
                                    filter: 'blur(30px) brightness(0.2)', zIndex: 0
                                }}></div>
                                
                                {/* Actual Poster */}
                                <img src={movieA.Poster !== "N/A" ? movieA.Poster : "https://via.placeholder.com/600x900?text=No+Poster"} alt={movieA.Title} 
                                    style={{ width: '350px', height: '525px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', zIndex: 10, transition: 'transform 0.3s' }} 
                                    onMouseEnter={e => { if(!voteResult) e.currentTarget.style.transform = 'scale(1.05)' }} 
                                    onMouseLeave={e => { if(!voteResult) e.currentTarget.style.transform = 'scale(1)' }} 
                                />
                                
                                <h1 style={{ fontSize: '2.5rem', margin: '2rem 0 0', textShadow: '0 4px 10px rgba(0,0,0,0.8)', zIndex: 10, textAlign: 'center', padding: '0 2rem' }}>{movieA.Title}</h1>
                                
                                {voteResult && (
                                    <div className="fade-in" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 20 }}>
                                        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#4caf50', textShadow: '0 0 20px rgba(76, 175, 80, 0.5)' }}>
                                            {voteResult.winner_stats.wins} W / {voteResult.winner_stats.losses} L
                                        </div>
                                        <div style={{ fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Global Stats</div>
                                    </div>
                                )}
                            </div>

                            {/* Divider overlay */}
                            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '4px', background: 'var(--accent)', transform: 'translateX(-50%)', zIndex: 5, boxShadow: '0 0 20px rgba(229, 9, 20, 0.5)' }}></div>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 6, background: 'var(--accent)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem', boxShadow: '0 0 30px rgba(0,0,0,1)' }}>
                                VS
                            </div>

                            {/* Movie B Side */}
                            <div 
                                onClick={() => !voteResult && handleVote(movieB, movieA)}
                                style={{ 
                                    flex: 1, height: '100%', position: 'relative', cursor: voteResult ? 'default' : 'pointer',
                                    transition: 'filter 0.3s', filter: voteResult ? 'brightness(0.3)' : 'brightness(1)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={e => { if(!voteResult) e.currentTarget.style.filter = 'brightness(1.1)' }}
                                onMouseLeave={e => { if(!voteResult) e.currentTarget.style.filter = 'brightness(1)' }}
                            >
                                {/* Blurred Background */}
                                <div style={{
                                    position: 'absolute', top: -20, left: -20, right: -20, bottom: -20,
                                    backgroundImage: `url(${movieB.Poster})`, backgroundSize: 'cover', backgroundPosition: 'center',
                                    filter: 'blur(30px) brightness(0.2)', zIndex: 0
                                }}></div>
                                
                                {/* Actual Poster */}
                                <img src={movieB.Poster !== "N/A" ? movieB.Poster : "https://via.placeholder.com/600x900?text=No+Poster"} alt={movieB.Title} 
                                    style={{ width: '350px', height: '525px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', zIndex: 10, transition: 'transform 0.3s' }} 
                                    onMouseEnter={e => { if(!voteResult) e.currentTarget.style.transform = 'scale(1.05)' }} 
                                    onMouseLeave={e => { if(!voteResult) e.currentTarget.style.transform = 'scale(1)' }} 
                                />

                                <h1 style={{ fontSize: '2.5rem', margin: '2rem 0 0', textShadow: '0 4px 10px rgba(0,0,0,0.8)', zIndex: 10, textAlign: 'center', padding: '0 2rem' }}>{movieB.Title}</h1>
                                
                                {voteResult && (
                                    <div className="fade-in" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 20 }}>
                                        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#f44336', textShadow: '0 0 20px rgba(244, 67, 54, 0.5)' }}>
                                            {voteResult.loser_stats.wins} W / {voteResult.loser_stats.losses} L
                                        </div>
                                        <div style={{ fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Global Stats</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
