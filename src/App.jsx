import React, { useState, useEffect } from 'react';

// ✅ Usa la URL de tu backend en Render
const API_BASE_URL = 'https://roomie-backend-zixc.onrender.com';

export default function App() {
  // ✅ Estados principales — ¡todos declarados!
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState({ id: null, nombre: '' });
  const [token, setToken] = useState(localStorage.getItem('roomie_token'));
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Estados para login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estados para registro y edición
  const [formData, setFormData] = useState({
    correo_electronico: '',
    contrasena: '',
    nombre_perfil: '',
    edad: '',
    genero: '',
    profesion: '',
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
    descripcion_personal: ''
  });

  const [step, setStep] = useState(1);

  // Efecto para cargar perfiles o mi perfil
  useEffect(() => {
    if (token && currentView === 'matching') {
      fetchProfiles();
    }
    if (token && currentView === 'my-profile') {
      loadMyProfile();
    }
  }, [token, currentView]);

  // Funciones de API
  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/feed`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfiles(data);
        setCurrentIndex(0);
      } else {
        console.error('Error en respuesta:', data);
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
        setFormData({
          correo_electronico: data.correo_electronico || '',
          contrasena: '',
          nombre_perfil: data.nombre_perfil || '',
          edad: data.edad || '',
          genero: data.genero || '',
          profesion: data.profesion || '',
          habito_limpieza_nivel: data.habito_limpieza_nivel || 50,
          nivel_ruido_nivel: data.nivel_ruido_nivel || 50,
          consumo_alcohol_nivel: data.consumo_alcohol_nivel || 0,
          frecuencia_invitados_nivel: data.frecuencia_invitados_nivel || 30,
          horario_vida: data.horario_vida || '',
          es_fumador: data.es_fumador || false,
          mascotas: data.mascotas || '',
          presupuesto_max_renta: data.presupuesto_max_renta || '',
          fecha_mudanza_min: data.fecha_mudanza_min || '',
          fecha_mudanza_max: data.fecha_mudanza_max || '',
          ubicacion_preferida: data.ubicacion_preferida || '',
          tipo_propiedad: data.tipo_propiedad || '',
          es_amueblada: data.es_amueblada || false,
          quiere_bano_propio: data.quiere_bano_propio || false,
          servicios_incluidos: data.servicios_incluidos || [],
          caracteristicas_adicionales: data.caracteristicas_adicionales || [],
          hobbies: data.hobbies || [],
          filosofia_vida: data.filosofia_vida || '',
          habilidades_intereses: data.habilidades_intereses || [],
          descripcion_roomie_ideal: data.descripcion_roomie_ideal || '',
          expectativas_hogar: data.expectativas_hogar || '',
          descripcion_personal: data.descripcion_personal || ''
        });
      } else {
        console.error('Error al cargar mi perfil:', data);
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
      alert('⚠️ Error de conexión con el servidor');
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
      alert('⚠️ Error de conexión con el servidor');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/me`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('✅ Perfil actualizado');
        setCurrentView('matching');
      } else {
        const data = await res.json();
        alert('❌ Error al actualizar: ' + (data.error || 'Desconocido'));
      }
    } catch (err) {
      alert('⚠️ Error de conexión con el servidor');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('roomie_token');
    setToken(null);
    setUser({ id: null, nombre: '' });
    setCurrentView('login');
  };

  const handleSwipe = (direction) => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      fetchProfiles();
    }
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, 5));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  // =============== VISTAS ===============
  if (currentView === 'matching') {
    if (!user || !user.id) {
      return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;
    }

    const currentProfile = profiles[currentIndex];
    return (
      <div style={{ fontFamily: 'system-ui', backgroundColor: '#f9fafb', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
        <header style={{ backgroundColor: 'white', padding: '1rem 1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1f2937' }}>Roomie Finder</h2>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '36px', height: '36px', backgroundColor: '#e0e7ff', borderRadius: '50%', color: '#4f46e5', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user?.nombre?.charAt(0)?.toUpperCase() || '?'}
            </button>
            {showProfileMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000, minWidth: '180px' }}>
                <button onClick={() => { setShowProfileMenu(false); setCurrentView('my-profile'); }} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer' }}>Mi perfil</button>
                <button onClick={handleLogout} style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>Cerrar sesión</button>
              </div>
            )}
          </div>
        </header>

        <div style={{ height: 'calc(100vh - 80px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '1.5rem' }}>
          {currentProfile ? (
            <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
              <div style={{ height: '250px', background: 'linear-gradient(135deg, #fbbf77 0%, #f89d63 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '5rem' }}>👤</div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#1f2937' }}>{currentProfile.nombre_perfil}, {currentProfile.edad}</h2>
                  <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{currentProfile.ubicacion_preferida || 'CDMX'}</span>
                </div>
                <p style={{ color: '#4b5563', marginBottom: '1rem' }}>{currentProfile.descripcion_personal || '¡Hola! Busco un roomie compatible.'}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {currentProfile.habito_limpieza_nivel !== undefined && <div style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem' }}>Limpieza: {currentProfile.habito_limpieza_nivel}/100</div>}
                  {currentProfile.nivel_ruido_nivel !== undefined && <div style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem' }}>Ruido: {currentProfile.nivel_ruido_nivel}/100</div>}
                  {currentProfile.consumo_alcohol_nivel !== undefined && <div style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem' }}>Alcohol: {currentProfile.consumo_alcohol_nivel}/100</div>}
                </div>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', borderTop: '1px solid #eee' }}>
                <button onClick={() => handleSwipe('left')} style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#ef4444', color: 'white', border: 'none', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                <button onClick={() => handleSwipe('right')} style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#10b981', color: 'white', border: 'none', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>❤️</button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6b7280', alignSelf: 'center' }}>
              <p>No hay más perfiles por ahora.</p>
              <button onClick={fetchProfiles} style={{ marginTop: '1rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '9999px' }}>Recargar</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'my-profile') {
    return (
      <div style={{ fontFamily: 'system-ui', backgroundColor: '#f9fafb', minHeight: '100vh', width: '100vw', padding: '1rem', boxSizing: 'border-box' }}>
        <header style={{ backgroundColor: 'white', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setCurrentView('matching')} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#6b7280', cursor: 'pointer' }}>←</button>
          <h2 style={{ margin: 0, color: '#1f2937' }}>Mi Perfil</h2>
          <div style={{ width: '36px' }}></div>
        </header>

        <div style={{ width: '100%', maxWidth: '100%', margin: '1rem auto', backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxSizing: 'border-box' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>Datos básicos</h3>
          <input placeholder="Nombre completo" value={formData.nombre_perfil} onChange={e => setFormData({...formData, nombre_perfil: e.target.value})} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
          <input placeholder="Edad" type="number" value={formData.edad} onChange={e => setFormData({...formData, edad: e.target.value})} min="18" max="99" style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
          <select value={formData.genero} onChange={e => setFormData({...formData, genero: e.target.value})} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }}>
            <option value="">Género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="No binario">No binario</option>
            <option value="Prefiero no decirlo">Prefiero no decirlo</option>
          </select>
          <input placeholder="Profesión" value={formData.profesion} onChange={e => setFormData({...formData, profesion: e.target.value})} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />

          <h3 style={{ color: '#1f2937', margin: '1.5rem 0 1rem' }}>Estilo de vida</h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937' }}>Nivel de limpieza <span style={{ color: '#7c3aed' }}>{formData.habito_limpieza_nivel}/100</span></label>
            <input type="range" min="0" max="100" value={formData.habito_limpieza_nivel} onChange={e => setFormData({...formData, habito_limpieza_nivel: Number(e.target.value)})} style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: '#e5e7eb', borderRadius: '4px', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937' }}>Tolerancia al ruido <span style={{ color: '#7c3aed' }}>{formData.nivel_ruido_nivel}/100</span></label>
            <input type="range" min="0" max="100" value={formData.nivel_ruido_nivel} onChange={e => setFormData({...formData, nivel_ruido_nivel: Number(e.target.value)})} style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: '#e5e7eb', borderRadius: '4px', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937' }}>Consumo de alcohol <span style={{ color: '#7c3aed' }}>{formData.consumo_alcohol_nivel}/100</span></label>
            <input type="range" min="0" max="100" value={formData.consumo_alcohol_nivel} onChange={e => setFormData({...formData, consumo_alcohol_nivel: Number(e.target.value)})} style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: '#e5e7eb', borderRadius: '4px', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937' }}>Frecuencia de invitados <span style={{ color: '#7c3aed' }}>{formData.frecuencia_invitados_nivel}/100</span></label>
            <input type="range" min="0" max="100" value={formData.frecuencia_invitados_nivel} onChange={e => setFormData({...formData, frecuencia_invitados_nivel: Number(e.target.value)})} style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: '#e5e7eb', borderRadius: '4px', outline: 'none' }} />
          </div>
          <select value={formData.horario_vida} onChange={e => setFormData({...formData, horario_vida: e.target.value})} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', marginBottom: '1rem' }}>
            <option value="">Horario de vida</option>
            <option value="Mañanero">Mañanero</option>
            <option value="Nocturno">Nocturno</option>
            <option value="Flexible">Flexible</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <input type="checkbox" checked={formData.es_fumador} onChange={e => setFormData({...formData, es_fumador: e.target.checked})} /> Soy fumador
          </label>
          <input placeholder="Mascotas" value={formData.mascotas} onChange={e => setFormData({...formData, mascotas: e.target.value})} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', marginBottom: '1.5rem' }} />

          <button onClick={handleSaveProfile} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '9999px', fontWeight: '600', marginTop: '1rem' }}>Guardar cambios</button>
        </div>
      </div>
    );
  }

  // =============== LOGIN Y REGISTRO ===============
  return (
    <div style={{ fontFamily: 'system-ui', backgroundColor: '#f9fafb', minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '2rem', backgroundColor: 'white', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', backgroundColor: '#7c3aed', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><span style={{ fontSize: '2rem' }}>🏠</span></div>
          <h2 style={{ color: '#1f2937', fontSize: '1.8rem' }}>Roomie Finder</h2>
          <p style={{ color: '#6b7280' }}>Encuentra tu roomie ideal</p>
        </div>

        {currentView === 'login' && (
          <>
            <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
            <button onClick={handleLogin} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '9999px', marginTop: '1rem', fontWeight: '600' }}>Iniciar Sesión</button>
            <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              ¿No tienes cuenta?{' '}
              <button onClick={() => { setEmail(''); setPassword(''); setCurrentView('signup'); }} style={{ color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Regístrate aquí</button>
            </p>
          </>
        )}

        {currentView === 'signup' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <button onClick={() => { setStep(1); setCurrentView('login'); }} style={{ color: '#6b7280', background: 'none', border: 'none' }}>← Volver</button>
              <span>Paso {step} de 5</span>
            </div>

            {step === 1 && (
              <>
                <h2 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '1.5rem' }}>Crea tu cuenta</h2>
                <input placeholder="Nombre completo" value={formData.nombre_perfil} onChange={e => setFormData({ ...formData, nombre_perfil: e.target.value })} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
                <input type="email" placeholder="Correo electrónico" value={formData.correo_electronico} onChange={e => setFormData({ ...formData, correo_electronico: e.target.value })} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
                <input type="password" placeholder="Contraseña (mín. 6 caracteres)" value={formData.contrasena} onChange={e => setFormData({ ...formData, contrasena: e.target.value })} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
                <input type="number" placeholder="Edad" value={formData.edad} onChange={e => setFormData({ ...formData, edad: e.target.value })} min="18" max="99" style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
                <select value={formData.genero} onChange={e => setFormData({ ...formData, genero: e.target.value })} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }}>
                  <option value="">Género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="No binario">No binario</option>
                  <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                </select>
                <input placeholder="Profesión (opcional)" value={formData.profesion} onChange={e => setFormData({ ...formData, profesion: e.target.value })} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }} />
              </>
            )}

            {step === 2 && (
              <>
                <h2 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '1.5rem' }}>Estilo de vida</h2>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937' }}>Nivel de limpieza <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>{formData.habito_limpieza_nivel}/100</span></label>
                  <input type="range" min="0" max="100" value={formData.habito_limpieza_nivel} onChange={e => setFormData({ ...formData, habito_limpieza_nivel: Number(e.target.value) })} style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: '#e5e7eb', borderRadius: '4px', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937' }}>Tolerancia al ruido <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>{formData.nivel_ruido_nivel}/100</span></label>
                  <input type="range" min="0" max="100" value={formData.nivel_ruido_nivel} onChange={e => setFormData({ ...formData, nivel_ruido_nivel: Number(e.target.value) })} style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: '#e5e7eb', borderRadius: '4px', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937' }}>Consumo de alcohol <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>{formData.consumo_alcohol_nivel}/100</span></label>
                  <input type="range" min="0" max="100" value={formData.consumo_alcohol_nivel} onChange={e => setFormData({ ...formData, consumo_alcohol_nivel: Number(e.target.value) })} style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: '#e5e7eb', borderRadius: '4px', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1f2937' }}>Frecuencia de invitados <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>{formData.frecuencia_invitados_nivel}/100</span></label>
                  <input type="range" min="0" max="100" value={formData.frecuencia_invitados_nivel} onChange={e => setFormData({ ...formData, frecuencia_invitados_nivel: Number(e.target.value) })} style={{ width: '100%', height: '8px', WebkitAppearance: 'none', background: '#e5e7eb', borderRadius: '4px', outline: 'none' }} />
                </div>
                <select value={formData.horario_vida} onChange={e => setFormData({ ...formData, horario_vida: e.target.value })} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box' }}>
                  <option value="">Horario de vida</option>
                  <option value="Mañanero">Mañanero</option>
                  <option value="Nocturno">Nocturno</option>
                  <option value="Flexible">Flexible</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
                  <input type="checkbox" checked={formData.es_fumador} onChange={e => setFormData({ ...formData, es_fumador: e.target.checked })} /> Soy fumador
                </label>
                <input placeholder="Mascotas (ej: perro pequeño)" value={formData.mascotas} onChange={e => setFormData({ ...formData, mascotas: e.target.value })} style={{ width: '100%', padding: '0.75rem', margin: '0.5rem 0', border: '1px solid #d1d5db', borderRadius: '0.5rem', marginTop: '1rem', boxSizing: 'border-box' }} />
              </>
            )}

            {step >= 3 && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h2>✅ Pasos 3-5 simplificados para prueba</h2>
                <p>En una versión completa, aquí irían necesidades, intereses y biografía.</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              {step > 1 && <button onClick={handleBack} style={{ padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', borderRadius: '9999px', background: 'white', cursor: 'pointer', fontWeight: '600' }}>Atrás</button>}
              {step < 2 ? (
                <button onClick={handleNext} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '9999px', marginLeft: 'auto', cursor: 'pointer', fontWeight: '600' }}>Siguiente</button>
              ) : (
                <button onClick={handleRegister} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '9999px', marginLeft: 'auto', cursor: 'pointer', fontWeight: '600' }}>Finalizar Registro</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}