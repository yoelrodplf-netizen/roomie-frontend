import React, { useState, useEffect } from 'react';
import LocationInput from './components/LocationInput';
import { io } from 'socket.io-client';

const API_BASE_URL = 'https://roomie-backend-zixc.onrender.com';
const SOCKET_SERVER = 'https://roomie-backend-zixc.onrender.com';

const socket = io(SOCKET_SERVER, {
  autoConnect: false
});

const translations = {
  es: {
    name: 'Nombre completo',
    age: 'Edad',
    gender: 'Género',
    profession: 'Profesión',
    bio: 'Bio (máx. 120 caracteres)',
    role: 'Rol',
    terms: 'Acepto los Términos y Condiciones',
    register: 'Finalizar Registro',
    save: 'Guardar cambios',
    feed: 'Feed',
    chats: 'Chats',
    profile: 'Yo',
    settings: 'Ajustes',
    darkMode: 'Modo oscuro',
    language: 'Idioma',
    termsTitle: 'Términos y Condiciones',
    termsText: 'Al usar Roomie Finder, aceptas nuestros términos de uso, política de privacidad y el tratamiento de tus datos personales conforme a la legislación aplicable.',
    readFull: 'Leer términos completos',
    logOut: 'Cerrar sesión',
    photoLabel: 'Foto de perfil (máx. 5)',
    propertyPhotos: 'Fotos de la propiedad (máx. 5)',
    lifestyle: 'Estilo de Vida',
    cleanliness: 'Nivel de limpieza',
    noise: 'Tolerancia al ruido',
    alcohol: 'Consumo de alcohol',
    guests: 'Frecuencia de invitados',
    schedule: 'Horario de vida',
    smoker: 'Soy fumador',
    pets: 'Mascotas (ej: perro pequeño)'
  },
  en: {
    name: 'Full name',
    age: 'Age',
    gender: 'Gender',
    profession: 'Profession',
    bio: 'Bio (max 120 chars)',
    role: 'Role',
    terms: 'I accept Terms and Conditions',
    register: 'Finish Registration',
    save: 'Save changes',
    feed: 'Feed',
    chats: 'Chats',
    profile: 'Me',
    settings: 'Settings',
    darkMode: 'Dark mode',
    language: 'Language',
    termsTitle: 'Terms and Conditions',
    termsText: 'By using Roomie Finder, you agree to our terms of use, privacy policy, and the processing of your personal data in accordance with applicable law.',
    readFull: 'Read full terms',
    logOut: 'Log out',
    photoLabel: 'Profile photos (max 5)',
    propertyPhotos: 'Property photos (max 5)',
    lifestyle: 'Lifestyle',
    cleanliness: 'Cleanliness level',
    noise: 'Noise tolerance',
    alcohol: 'Alcohol consumption',
    guests: 'Guest frequency',
    schedule: 'Lifestyle schedule',
    smoker: 'I am a smoker',
    pets: 'Pets (e.g., small dog)'
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState({ id: null, nombre: '' });
  const [token, setToken] = useState(localStorage.getItem('roomie_token'));
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhotos, setProfilePhotos] = useState([]);
  const [propertyPhotos, setPropertyPhotos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [currentChatWith, setCurrentChatWith] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'es');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    correo_electronico: '',
    contrasena: '',
    nombre_perfil: '',
    edad: '',
    genero: '',
    profesion: '',
    rol: 'AMBOS',
    bio: '',
    habito_limpieza_nivel: 50,
    nivel_ruido_nivel: 50,
    consumo_alcohol_nivel: 0,
    frecuencia_invitados_nivel: 30,
    horario_vida: '',
    es_fumador: false,
    mascotas: '',
    presupuesto_max_renta: '',
    fecha_mudanza_min: '',
    fecha_mudanza_max: '',
    ubicacion_preferida: '',
    tipo_propiedad: '',
    es_amueblada: false,
    quiere_bano_propio: false,
    servicios_incluidos: [],
    caracteristicas_adicionales: [],
    hobbies: [],
    filosofia_vida: '',
    habilidades_intereses: [],
    descripcion_roomie_ideal: '',
    expectativas_hogar: '',
    descripcion_personal: '',
    fotos_perfil: [],
    fotos_propiedad: []
  });
  const [step, setStep] = useState(1);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f9fafb';
    document.body.style.color = darkMode ? '#f1f5f9' : '#1f2937';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    if (currentView !== 'signup' && currentView !== 'my-profile') {
      setProfilePhotos([]);
      setPropertyPhotos([]);
    }
  }, [currentView]);

  useEffect(() => {
    if (token && currentView === 'matching') {
      fetchProfiles();
    }
    if (token && currentView === 'my-profile') {
      loadMyProfile();
    }
  }, [token, currentView]);

  useEffect(() => {
    if (token && user?.id) {
      socket.auth = { token };
      socket.connect();
      socket.emit('authenticate', token);
      socket.on('receiveMessage', (data) => {
        setMessages(prev => [...prev, data]);
      });
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        alert('Error en el chat: ' + error);
      });
    } else {
      socket.disconnect();
    }
    return () => {
      socket.off('receiveMessage');
      socket.off('error');
    };
  }, [token, user?.id]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleLang = () => setLang(lang === 'es' ? 'en' : 'es');
  const handlePhotoChange = (e, type = 'profile') => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Máximo 5 fotos permitidas');
      return;
    }
    if (type === 'profile') setProfilePhotos(files);
    else setPropertyPhotos(files);
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/feed`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfiles(data);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Error al cargar perfiles:', err);
    }
  };

  const loadMyProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({ ...data, contrasena: '' });
      }
    } catch (err) {
      console.error('Error al cargar mi perfil:', err);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo_electronico: email, contrasena: password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('roomie_token', data.token);
        setToken(data.token);
        setUser({ id: data.user.id, nombre: data.user.nombre });
        setCurrentView('matching');
      } else {
        alert('❌ ' + (data.error || 'Login fallido'));
      }
    } catch (err) {
      alert('⚠️ Error de conexión');
    }
  };

  const handleRegister = async () => {
    if (!acceptedTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined && !Array.isArray(value)) {
        formDataToSend.append(key, value);
      }
    });

    profilePhotos.forEach(file => formDataToSend.append('fotos_perfil', file));
    if (formData.rol !== 'BUSCADOR') {
      propertyPhotos.forEach(file => formDataToSend.append('fotos_propiedad', file));
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        body: formDataToSend
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('roomie_token', data.token);
        setToken(data.token);
        setUser({ id: data.user.id, nombre: data.user.nombre });
        setCurrentView('matching');
      } else {
        alert('❌ ' + (data.error || 'Registro fallido'));
      }
    } catch (err) {
      alert('⚠️ Error de conexión');
    }
  };

  const handleSaveProfile = async () => {
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined && !Array.isArray(value)) {
        formDataToSend.append(key, value);
      }
    });

    profilePhotos.forEach(file => formDataToSend.append('fotos_perfil', file));
    if (formData.rol !== 'BUSCADOR') {
      propertyPhotos.forEach(file => formDataToSend.append('fotos_propiedad', file));
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/me`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });
      if (res.ok) {
        alert('✅ Perfil actualizado');
        setCurrentView('matching');
      } else {
        const data = await res.json();
        alert('❌ Error: ' + (data.error || 'Desconocido'));
      }
    } catch (err) {
      alert('⚠️ Error de conexión');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('roomie_token');
    setToken(null);
    setUser({ id: null, nombre: '' });
    setCurrentView('login');
  };

  const handleSwipe = async (direction) => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    if (direction === 'right') {
      try {
        await fetch(`${API_BASE_URL}/api/profile/like/${currentProfile._id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Error al dar like:', err);
      }
    }

    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      fetchProfiles();
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentChatWith) return;
    socket.emit('sendMessage', {
      receiverId: currentChatWith,
      message: newMessage
    });
    setNewMessage('');
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const bgClass = darkMode ? '#0f172a' : '#f9fafb';
  const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#f1f5f9' : '#1f2937';
  const mutedColor = darkMode ? '#94a3b8' : '#6b7280';
  const borderClass = darkMode ? '1px solid #334155' : '1px solid #e5e7eb';

  // =============== VISTA: SETTINGS ===============
  if (currentView === 'settings') {
    return (
      <div style={{ fontFamily: 'system-ui', backgroundColor: bgClass, minHeight: '100vh', width: '100vw', padding: '1rem', boxSizing: 'border-box' }}>
        <header style={{ backgroundColor: cardBg, padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setCurrentView('matching')} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: darkMode ? '#cbd5e1' : '#6b7280', cursor: 'pointer' }}>←</button>
          <h2 style={{ margin: 0, color: textColor }}>{translations[lang].settings}</h2>
          <div style={{ width: '36px' }}></div>
        </header>

        <div style={{ width: '100%', maxWidth: '100%', margin: '1rem auto', backgroundColor: cardBg, borderRadius: '1rem', padding: '1.5rem', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: textColor, fontWeight: '500' }}>{translations[lang].darkMode}</span>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
              <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: darkMode ? '#7c3aed' : '#cbd5e1', borderRadius: '24px', transition: '0.4s' }}></span>
              <span style={{ position: 'absolute', top: '2px', left: darkMode ? '26px' : '2px', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transition: '0.4s' }}></span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ color: textColor, fontWeight: '500' }}>{translations[lang].language}</span>
            <button onClick={toggleLang} style={{ padding: '0.5rem 1rem', backgroundColor: darkMode ? '#334155' : '#e2e8f0', color: textColor, border: 'none', borderRadius: '9999px', fontWeight: '500' }}>
              {lang === 'es' ? 'English' : 'Español'}
            </button>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: borderClass }}>
            <h3 style={{ color: textColor, marginBottom: '1rem' }}>{translations[lang].termsTitle}</h3>
            <p style={{ color: darkMode ? '#cbd5e1' : '#4b5563', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {translations[lang].termsText}
            </p>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ display: 'inline-block', marginTop: '1rem', color: '#7c3aed', textDecoration: 'underline', fontWeight: '500' }}>
              {translations[lang].readFull}
            </a>
          </div>

          <button onClick={handleLogout} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '9999px', fontWeight: '600', marginTop: '2rem' }}>
            {translations[lang].logOut}
          </button>
        </div>
      </div>
    );
  }

  // =============== VISTA: MATCHING ===============
  if (currentView === 'matching') {
    const currentProfile = profiles[currentIndex];
    return (
      <div style={{ fontFamily: 'system-ui', backgroundColor: bgClass, minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
        <header style={{ backgroundColor: cardBg, padding: '1rem 1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: textColor }}>Roomie Finder</h2>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '36px', height: '36px', backgroundColor: darkMode ? '#4c1d95' : '#e0e7ff', borderRadius: '50%', color: '#f1f5f9', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user?.nombre?.charAt(0)?.toUpperCase() || '?'}
            </button>
            {showProfileMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: cardBg, borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000, minWidth: '180px', color: textColor }}>
                <button onClick={() => { setShowProfileMenu(false); setCurrentView('my-profile'); }} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer' }}>Mi perfil</button>
                <button onClick={() => setCurrentView('settings')} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer' }}>⚙️ Ajustes</button>
                <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>Cerrar sesión</button>
              </div>
            )}
          </div>
        </header>

        <div style={{ height: 'calc(100vh - 140px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '1.5rem' }}>
          {currentProfile ? (
            <div style={{ width: '100%', maxWidth: '400px', backgroundColor: cardBg, borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
              <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: darkMode ? '#334155' : '#f3f4f6', overflow: 'hidden' }}>
                {currentProfile.fotos_perfil && currentProfile.fotos_perfil[0] ? (
                  <img src={currentProfile.fotos_perfil[0]} alt={currentProfile.nombre_perfil} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #fbbf77 0%, #f89d63 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '5rem' }}>
                    👤
                  </div>
                )}
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.6rem', color: textColor }}>{currentProfile.nombre_perfil}, {currentProfile.edad}</h2>
                  <span style={{ color: mutedColor, fontSize: '0.9rem' }}>{currentProfile.ubicacion_preferida || 'CDMX'}</span>
                </div>
                {currentProfile.bio && (
                  <p style={{ fontWeight: '500', color: textColor, margin: '0.25rem 0', fontSize: '0.95rem' }}>
                    "{currentProfile.bio}"
                  </p>
                )}
                <p style={{ color: darkMode ? '#cbd5e1' : '#4b5563', marginBottom: '1rem' }}>{currentProfile.descripcion_personal || '¡Hola! Busco un roomie compatible.'}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {currentProfile.habito_limpieza_nivel !== undefined && <div style={{ backgroundColor: darkMode ? '#334155' : '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', color: textColor }}>Limpieza: {currentProfile.habito_limpieza_nivel}/100</div>}
                  {currentProfile.nivel_ruido_nivel !== undefined && <div style={{ backgroundColor: darkMode ? '#334155' : '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', color: textColor }}>Ruido: {currentProfile.nivel_ruido_nivel}/100</div>}
                  {currentProfile.consumo_alcohol_nivel !== undefined && <div style={{ backgroundColor: darkMode ? '#334155' : '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', color: textColor }}>Alcohol: {currentProfile.consumo_alcohol_nivel}/100</div>}
                </div>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', borderTop: borderClass }}>
                <button onClick={() => handleSwipe('left')} style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#ef4444', color: 'white', border: 'none', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                {user?.id && currentProfile?.likes?.includes(user.id) && (
                  <button 
                    onClick={() => {
                      setCurrentChatWith(currentProfile._id);
                      setShowChat(true);
                      setMessages([]);
                    }}
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      backgroundColor: '#3b82f6', 
                      color: 'white', 
                      border: 'none', 
                      fontSize: '1.5rem', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    💬
                  </button>
                )}
                <button onClick={() => handleSwipe('right')} style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#10b981', color: 'white', border: 'none', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>❤️</button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: mutedColor, alignSelf: 'center' }}>
              <p>No hay más perfiles por ahora.</p>
              <button onClick={fetchProfiles} style={{ marginTop: '1rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '9999px' }}>Recargar</button>
            </div>
          )}
        </div>

        {showChat && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '350px',
            height: '400px',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10000
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#7c3aed',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: '1rem 1rem 0 0'
            }}>
              <h3>Chat con {profiles.find(p => p._id === currentChatWith)?.nombre_perfil || 'Usuario'}</h3>
              <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#f9fafb' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  backgroundColor: msg.senderId === user.id ? '#e0e7ff' : '#f3f4f6',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  margin: '0.5rem 0',
                  alignSelf: msg.senderId === user.id ? 'flex-end' : 'flex-start'
                }}>
                  {msg.message}
                </div>
              ))}
            </div>
            <div style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '9999px' }} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
              <button onClick={handleSendMessage} style={{ padding: '0.5rem 1rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '9999px', fontWeight: '600' }}>Enviar</button>
            </div>
          </div>
        )}

        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-around',
          backgroundColor: cardBg,
          borderTop: borderClass,
          padding: '0.75rem 0',
          zIndex: 100
        }}>
          <button onClick={() => setCurrentView('matching')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: textColor }}>
            <span>🏠</span>
            <small style={{ fontSize: '0.7rem' }}>{translations[lang].feed}</small>
          </button>
          <button onClick={() => setCurrentView('settings')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: textColor }}>
            <span>⚙️</span>
            <small style={{ fontSize: '0.7rem' }}>{translations[lang].settings}</small>
          </button>
          <button onClick={() => setCurrentView('my-profile')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: textColor }}>
            <span>👤</span>
            <small style={{ fontSize: '0.7rem' }}>{translations[lang].profile}</small>
          </button>
        </div>
      </div>
    );
  }

  // =============== VISTA: MI PERFIL ===============
  if (currentView === 'my-profile') {
    return (
      <div style={{ fontFamily: 'system-ui', backgroundColor: bgClass, minHeight: '100vh', width: '100vw', padding: '1rem', boxSizing: 'border-box' }}>
        <header style={{ backgroundColor: cardBg, padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setCurrentView('matching')} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: darkMode ? '#cbd5e1' : '#6b7280', cursor: 'pointer' }}>←</button>
          <h2 style={{ margin: 0, color: textColor }}>Mi Perfil</h2>
          <div style={{ width: '36px' }}></div>
        </header>

        <div style={{ width: '100%', maxWidth: '100%', margin: '1rem auto', backgroundColor: cardBg, borderRadius: '1rem', padding: '1.5rem', boxSizing: 'border-box' }}>
          <h3 style={{ color: textColor, marginBottom: '1rem' }}>{translations[lang].bio}</h3>
          <textarea
            placeholder={translations[lang].bio}
            value={formData.bio}
            onChange={e => setFormData({...formData, bio: e.target.value.slice(0, 120)})}
            maxLength={120}
            style={{
              width: '100%',
              padding: '0.75rem',
              margin: '0.5rem 0',
              border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db',
              borderRadius: '0.5rem',
              boxSizing: 'border-box',
              minHeight: '80px',
              color: textColor,
              backgroundColor: darkMode ? '#0f172a' : 'white'
            }}
          />

          <h3 style={{ color: textColor, marginBottom: '1rem', marginTop: '1.5rem' }}>{translations[lang].name}</h3>
          <input placeholder={translations[lang].name} value={formData.nombre_perfil} onChange={e => setFormData({...formData, nombre_perfil: e.target.value})} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', color: textColor, backgroundColor: darkMode ? '#0f172a' : 'white' }} />

          {/* Sliders de estilo de vida */}
          <h3 style={{ color: textColor, margin: '1.5rem 0 1rem' }}>
            {translations[lang].lifestyle}
          </h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: textColor }}>
              {translations[lang].cleanliness} 
              <span style={{ color: '#7c3aed', marginLeft: '0.5rem' }}>{formData.habito_limpieza_nivel}/100</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.habito_limpieza_nivel}
              onChange={e => setFormData({...formData, habito_limpieza_nivel: Number(e.target.value)})}
              style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: darkMode ? '#334155' : '#e5e7eb', borderRadius: '4px', outline: 'none' }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: textColor }}>
              {translations[lang].noise} 
              <span style={{ color: '#7c3aed', marginLeft: '0.5rem' }}>{formData.nivel_ruido_nivel}/100</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.nivel_ruido_nivel}
              onChange={e => setFormData({...formData, nivel_ruido_nivel: Number(e.target.value)})}
              style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: darkMode ? '#334155' : '#e5e7eb', borderRadius: '4px', outline: 'none' }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: textColor }}>
              {translations[lang].alcohol} 
              <span style={{ color: '#7c3aed', marginLeft: '0.5rem' }}>{formData.consumo_alcohol_nivel}/100</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.consumo_alcohol_nivel}
              onChange={e => setFormData({...formData, consumo_alcohol_nivel: Number(e.target.value)})}
              style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: darkMode ? '#334155' : '#e5e7eb', borderRadius: '4px', outline: 'none' }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: textColor }}>
              {translations[lang].guests} 
              <span style={{ color: '#7c3aed', marginLeft: '0.5rem' }}>{formData.frecuencia_invitados_nivel}/100</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.frecuencia_invitados_nivel}
              onChange={e => setFormData({...formData, frecuencia_invitados_nivel: Number(e.target.value)})}
              style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: darkMode ? '#334155' : '#e5e7eb', borderRadius: '4px', outline: 'none' }}
            />
          </div>

          <select value={formData.horario_vida} onChange={e => setFormData({...formData, horario_vida: e.target.value})} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', marginBottom: '1rem', color: textColor, backgroundColor: darkMode ? '#0f172a' : 'white' }}>
            <option value="">{translations[lang].schedule}</option>
            <option value="Mañanero">Mañanero</option>
            <option value="Nocturno">Nocturno</option>
            <option value="Flexible">Flexible</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', color: textColor }}>
            <input type="checkbox" checked={formData.es_fumador} onChange={e => setFormData({...formData, es_fumador: e.target.checked})} /> 
            {translations[lang].smoker}
          </label>

          <input 
            placeholder={translations[lang].pets} 
            value={formData.mascotas} 
            onChange={e => setFormData({...formData, mascotas: e.target.value})} 
            style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} 
          />

          <button onClick={handleSaveProfile} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '9999px', fontWeight: '600', marginTop: '1rem' }}>{translations[lang].save}</button>
        </div>
      </div>
    );
  }

  // =============== LOGIN / REGISTRO ===============
  return (
    <div style={{ fontFamily: 'system-ui', backgroundColor: bgClass, minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '2rem', backgroundColor: cardBg, borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', backgroundColor: '#7c3aed', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><span style={{ fontSize: '2rem' }}>🏠</span></div>
          <h2 style={{ color: textColor, fontSize: '1.8rem' }}>Roomie Finder</h2>
          <p style={{ color: mutedColor }}>Encuentra tu roomie ideal</p>
        </div>

        {currentView === 'login' && (
          <>
            <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', color: textColor, backgroundColor: darkMode ? '#0f172a' : 'white' }} />
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', color: textColor, backgroundColor: darkMode ? '#0f172a' : 'white' }} />
            <button onClick={handleLogin} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '9999px', marginTop: '1rem', fontWeight: '600' }}>Iniciar Sesión</button>
            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: mutedColor }}>
              ¿No tienes cuenta? <button onClick={() => { setEmail(''); setPassword(''); setCurrentView('signup'); }} style={{ color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Regístrate aquí</button>
            </p>
          </>
        )}

        {currentView === 'signup' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <button onClick={() => { setStep(1); setCurrentView('login'); }} style={{ color: mutedColor, background: 'none', border: 'none' }}>← Volver</button>
              <span>Paso {step} de 4</span>
            </div>

            {step === 1 && (
              <>
                <h2 style={{ textAlign: 'center', color: textColor, marginBottom: '1.5rem' }}>Crea tu cuenta</h2>
                <input placeholder={translations[lang].name} value={formData.nombre_perfil} onChange={e => setFormData({ ...formData, nombre_perfil: e.target.value })} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', color: textColor, backgroundColor: darkMode ? '#0f172a' : 'white' }} />
                <input type="email" placeholder="Correo electrónico" value={formData.correo_electronico} onChange={e => setFormData({ ...formData, correo_electronico: e.target.value })} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', color: textColor, backgroundColor: darkMode ? '#0f172a' : 'white' }} />
                <input type="password" placeholder="Contraseña" value={formData.contrasena} onChange={e => setFormData({ ...formData, contrasena: e.target.value })} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', color: textColor, backgroundColor: darkMode ? '#0f172a' : 'white' }} />
                <input type="number" placeholder={translations[lang].age} value={formData.edad} onChange={e => setFormData({ ...formData, edad: e.target.value })} min="18" max="99" style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', color: textColor, backgroundColor: darkMode ? '#0f172a' : 'white' }} />
                <select value={formData.genero} onChange={e => setFormData({ ...formData, genero: e.target.value })} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', color: textColor, backgroundColor: darkMode ? '#0f172a' : 'white' }}>
                  <option value="">{translations[lang].gender}</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="No binario">No binario</option>
                  <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', marginTop: '1rem', color: textColor }}>
                  <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} style={{ marginRight: '0.5rem' }} />
                  {translations[lang].terms}
                </label>
                <button disabled={!acceptedTerms} onClick={handleNext} style={{ padding: '0.75rem 1.5rem', backgroundColor: !acceptedTerms ? '#c4b5fd' : '#7c3aed', color: 'white', border: 'none', borderRadius: '9999px', marginLeft: 'auto', cursor: !acceptedTerms ? 'not-allowed' : 'pointer', fontWeight: '600' }}>Siguiente</button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 style={{ textAlign: 'center', color: textColor, marginBottom: '1.5rem' }}>Foto y Bio</h2>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: textColor }}>{translations[lang].photoLabel}</label>
                  <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoChange(e, 'profile')} style={{ width: '100%', padding: '0.5rem', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: textColor }}>{translations[lang].bio}</label>
                  <textarea
                    placeholder={translations[lang].bio}
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value.slice(0, 120)})}
                    maxLength={120}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      margin: '0.5rem 0',
                      border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      boxSizing: 'border-box',
                      minHeight: '80px',
                      color: textColor,
                      backgroundColor: darkMode ? '#0f172a' : 'white'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button onClick={handleBack} style={{ padding: '0.75rem 1.5rem', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '9999px', background: 'none', cursor: 'pointer', fontWeight: '600', color: textColor }}>Atrás</button>
                  <button onClick={handleNext} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '9999px', marginLeft: 'auto', cursor: 'pointer', fontWeight: '600' }}>Siguiente</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 style={{ textAlign: 'center', color: textColor, marginBottom: '1.5rem' }}>Rol y Ubicación</h2>
                <select value={formData.rol} onChange={e => setFormData({ ...formData, rol: e.target.value })} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', color: textColor, backgroundColor: darkMode ? '#0f172a' : 'white' }}>
                  <option value="AMBOS">Ambos (busco y ofrezco)</option>
                  <option value="OFERENTE">Oferente (ofrezco vivienda)</option>
                  <option value="BUSCADOR">Buscador (busco vivienda)</option>
                </select>
                <LocationInput value={formData.ubicacion_preferida} onChange={(newLocation) => setFormData({ ...formData, ubicacion_preferida: newLocation })} />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button onClick={handleBack} style={{ padding: '0.75rem 1.5rem', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '9999px', background: 'none', cursor: 'pointer', fontWeight: '600', color: textColor }}>Atrás</button>
                  <button onClick={handleNext} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '9999px', marginLeft: 'auto', cursor: 'pointer', fontWeight: '600' }}>Siguiente</button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h2 style={{ textAlign: 'center', color: textColor, marginBottom: '1.5rem' }}>{translations[lang].lifestyle}</h2>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: textColor }}>
                    {translations[lang].cleanliness} 
                    <span style={{ color: '#7c3aed', marginLeft: '0.5rem' }}>{formData.habito_limpieza_nivel}/100</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.habito_limpieza_nivel}
                    onChange={e => setFormData({...formData, habito_limpieza_nivel: Number(e.target.value)})}
                    style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: darkMode ? '#334155' : '#e5e7eb', borderRadius: '4px', outline: 'none' }}
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: textColor }}>
                    {translations[lang].noise} 
                    <span style={{ color: '#7c3aed', marginLeft: '0.5rem' }}>{formData.nivel_ruido_nivel}/100</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.nivel_ruido_nivel}
                    onChange={e => setFormData({...formData, nivel_ruido_nivel: Number(e.target.value)})}
                    style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: darkMode ? '#334155' : '#e5e7eb', borderRadius: '4px', outline: 'none' }}
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: textColor }}>
                    {translations[lang].alcohol} 
                    <span style={{ color: '#7c3aed', marginLeft: '0.5rem' }}>{formData.consumo_alcohol_nivel}/100</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.consumo_alcohol_nivel}
                    onChange={e => setFormData({...formData, consumo_alcohol_nivel: Number(e.target.value)})}
                    style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: darkMode ? '#334155' : '#e5e7eb', borderRadius: '4px', outline: 'none' }}
                  />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: textColor }}>
                    {translations[lang].guests} 
                    <span style={{ color: '#7c3aed', marginLeft: '0.5rem' }}>{formData.frecuencia_invitados_nivel}/100</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.frecuencia_invitados_nivel}
                    onChange={e => setFormData({...formData, frecuencia_invitados_nivel: Number(e.target.value)})}
                    style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: darkMode ? '#334155' : '#e5e7eb', borderRadius: '4px', outline: 'none' }}
                  />
                </div>
                
                <select value={formData.horario_vida} onChange={e => setFormData({...formData, horario_vida: e.target.value})} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', marginBottom: '1rem', color: textColor, backgroundColor: darkMode ? '#0f172a' : 'white' }}>
                  <option value="">{translations[lang].schedule}</option>
                  <option value="Mañanero">Mañanero</option>
                  <option value="Nocturno">Nocturno</option>
                  <option value="Flexible">Flexible</option>
                </select>
                
                <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', color: textColor }}>
                  <input type="checkbox" checked={formData.es_fumador} onChange={e => setFormData({...formData, es_fumador: e.target.checked})} /> 
                  {translations[lang].smoker}
                </label>
                
                <input placeholder={translations[lang].pets} value={formData.mascotas} onChange={e => setFormData({...formData, mascotas: e.target.value})} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button onClick={handleBack} style={{ padding: '0.75rem 1.5rem', border: darkMode ? '1px solid #4c1d95' : '1px solid #d1d5db', borderRadius: '9999px', background: 'none', cursor: 'pointer', fontWeight: '600', color: textColor }}>Atrás</button>
                  <button onClick={handleRegister} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '9999px', marginLeft: 'auto', cursor: 'pointer', fontWeight: '600' }}>{translations[lang].register}</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}