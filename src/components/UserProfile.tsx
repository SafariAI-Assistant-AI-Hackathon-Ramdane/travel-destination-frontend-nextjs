import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { UserProfileResponse } from '../types/auth.types';
import { Attraction, attractionService } from '../services/attraction.service';
import AttractionCard from './AttractionCard';
import './UserProfile.css';

function UserProfile() {
    const [user, setUser] = useState<UserProfileResponse | null>(null);
    const [reviewedAttractions, setReviewedAttractions] = useState<Attraction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                if (!authService.isAuthenticated()) {
                    navigate('/login');
                    return;
                }
                const profileData = await authService.getProfile();
                setUser(profileData);
                
                // Fetch reviewed attractions
                const attractions = await attractionService.getUserReviewedAttractions(profileData.email);
                setReviewedAttractions(attractions);
            } catch (err: any) {
                console.error("Failed to fetch profile", err);
                setError("Failed to load profile. Please try logging in again.");
                if (err.response?.status === 401 || err.response?.status === 403) {
                    authService.logout();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="profile-container loading">
                <div className="loader">Loading your profile...</div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="profile-container error">
                <div className="error-card">
                    <h2>Oops!</h2>
                    <p>{error || "Something went wrong."}</p>
                    <button onClick={() => navigate('/login')}>Back to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-sidebar">
                <div className="profile-avatar">
                    {user.firstname[0]}{user.lastname[0]}
                </div>
                <h2 className="profile-name">{user.firstname} {user.lastname}</h2>
                <p className="profile-email">{user.email}</p>
                
                <nav className="profile-nav">
                    <button className="nav-btn active">Dashboard</button>
                    <button className="nav-btn">My Favorites</button>
                    <button className="nav-btn">My Reviews</button>
                    <button className="nav-btn">Settings</button>
                    <button className="nav-btn logout-btn" onClick={handleLogout}>Logout</button>
                </nav>
            </div>

            <main className="profile-content">
                <header className="content-header">
                    <h1>My Dashboard</h1>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-value">{reviewedAttractions.length}</span>
                            <span className="stat-label">Reviewed</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">0</span>
                            <span className="stat-label">Favorites</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">5.0</span>
                            <span className="stat-label">Avg Rating</span>
                        </div>
                    </div>
                </header>

                <section className="profile-section">
                    <div className="section-header-flex">
                        <h3>Attractions I've Reviewed</h3>
                        <span className="badge">{reviewedAttractions.length} items</span>
                    </div>
                    
                    {reviewedAttractions.length > 0 ? (
                        <div className="attractions-grid-mini">
                            {reviewedAttractions.map((attr, idx) => (
                                <AttractionCard 
                                    key={`${attr.attraction_url}-${idx}`}
                                    id={attr.id || idx.toString()}
                                    attraction_name={attr.attraction_name}
                                    rating={attr.rating}
                                    review_count={attr.review_count}
                                    address={attr.address}
                                    images={attr.images_list}
                                    type={attr.attraction_type}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="activity-placeholder">
                            <p>You haven't reviewed any attractions yet.</p>
                            <button className="explore-btn" onClick={() => navigate('/attractions')}>Explore Marrakech</button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default UserProfile;
