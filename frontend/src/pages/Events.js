import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Events.css';

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const userData = localStorage.getItem('user');
    
    
    if (userData) {
      navigate('/login');
        return;
    }
    
    setUser(JSON.parse(userData));
    fetchEvents();
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data);
      setError('');
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les événements');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Chargement des événements...</div>;
  }

  return (
    <div className="events-container">
      <nav className="navbar">
        <h1>EventHub</h1>
        <div className="user-info">
          <span>Bonjour, {user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Déconnexion</button>
        </div>
      </nav>
      
      <div className="events-header">
        <h2>Événements à venir</h2>
        <button className="create-event-btn">+ Créer un événement</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {events.length === 0 ? (
        <div className="no-events">
          <p>Aucun événement pour le moment.</p>
          <p>Soyez le premier à créer un événement !</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <h3>{event.title}</h3>
              <p className="event-date">📅 {new Date(event.date).toLocaleDateString()}</p>
              <p className="event-location">📍 {event.location}</p>
              <p className="event-price">💰 {event.price === 0 ? 'Gratuit' : event.price + ' DH'}</p>
              <p className="event-category">🏷️ {event.category}</p>
              <button className="participate-btn">Participer</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;