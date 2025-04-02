import React, { useState, useEffect } from 'react';
import './App.css';

// Interceptar y filtrar mensajes de error específicos
if (window.console && window.console.error) {
  const originalConsoleError = window.console.error;
  window.console.error = function(message, ...args) {
    if (typeof message === 'string' && message.includes('Failed to fetch')) {
      return;
    }
    originalConsoleError(message, ...args);
  };
}

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('es-ES', { month: 'long' });
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return `${capitalizeFirstLetter(month)} ${day} a las ${hours}:${minutes}${ampm}`;
};

function App() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPost, setModalPost] = useState(null);
  // Se mantiene internamente la funcionalidad de plantillas (por defecto la 1)
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  
  // Estados para la modal de Embed
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [embedCode, setEmbedCode] = useState('');

  // Detectar si se accede en modo embed
  const isEmbed = window.location.search.includes('embed=true');

  // Token de acceso (reemplaza por tu token real)
  const userToken = "EAASZCQLWDkywBO6uEXeYPaQcWWd97KH8w0vIHLylVjhRWNSeaXmItvJUJZBQTcppRl1cufg4VRria1jEZCogEaj3FXtYxuFyOV2xFgDMqhiFZA5nOw2xm5p00NglkCeOyP5qrsdfsuhzT0oilyyOoEUK2EusqxgVzQ2osJ58fKMsHMiiFonJDaeP";

  useEffect(() => {
    // Listener para el mensaje EMBED_CODE
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'EMBED_CODE') {
        setEmbedCode(event.data.embedCode);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (isEmbed) {
      // En modo embed, obtenemos datos desde el backend
      fetchEmbedData();
    } else {
      // En modo normal, se intenta cargar desde localStorage o se llama a la API de Facebook
      const storedProfile = localStorage.getItem('profile');
      const storedPosts = localStorage.getItem('posts');
      if (storedProfile && storedPosts) {
        setProfile(JSON.parse(storedProfile));
        setPosts(JSON.parse(storedPosts));
      } else {
        setLoading(true);
        fetchProfile(userToken);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmbed]);

  // Agregamos un efecto para enviar a la ventana padre la URL del iframe embed generado
  useEffect(() => {
    if (isEmbed) {
      // Usamos la misma baseUrl que en handleGenerateEmbed
      const baseUrl = 'https://9706-190-232-219-16.ngrok-free.app';
      const embedUrl = `${baseUrl}/?embed=true&template=${selectedTemplate}`;
      window.parent.postMessage({ type: 'EMBED_URL', url: embedUrl }, '*');
    }
  }, [isEmbed, selectedTemplate]);

  // Función que llama a endpoints de tu backend para obtener perfil y publicaciones en modo embed
  const fetchEmbedData = async () => {
    try {
      setLoading(true);
      const profileResponse = await fetch('/api/fbProfile');
      const profileData = await profileResponse.json();
      setProfile(profileData.profile);

      const postsResponse = await fetch('/api/fbPosts');
      const postsData = await postsResponse.json();
      setPosts(postsData.posts);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener datos del backend:', error);
      setLoading(false);
    }
  };

  // Función para obtener perfil usando el token de acceso
  const fetchProfile = (token) => {
    if (!window.FB) {
      console.error("La SDK de Facebook no está cargada.");
      setLoading(false);
      return;
    }
    window.FB.api('/me', { fields: 'name,picture.width(60).height(60)', access_token: token }, function (response) {
      if (response && !response.error) {
        setProfile(response);
        localStorage.setItem('profile', JSON.stringify(response));
        fetchPosts(token);
      } else {
        console.error('Error al obtener el perfil:', response.error);
        setLoading(false);
      }
    });
  };

  // Función para obtener publicaciones usando el token de acceso
  const fetchPosts = (token) => {
    const fields = [
      'id',
      'message',
      'created_time',
      'full_picture',
      'permalink_url',
      'shares',
      'reactions.type(LIKE).summary(true).limit(0).as(like_reactions)',
      'reactions.type(LOVE).summary(true).limit(0).as(love_reactions)',
      'reactions.type(HAHA).summary(true).limit(0).as(haha_reactions)',
      'reactions.type(WOW).summary(true).limit(0).as(wow_reactions)',
      'reactions.type(SAD).summary(true).limit(0).as(sad_reactions)',
      'reactions.type(ANGRY).summary(true).limit(0).as(angry_reactions)'
    ].join(',');
    window.FB.api(`/me/posts`, { fields, access_token: token }, function (response) {
      if (response && !response.error) {
        setPosts(response.data || []);
        localStorage.setItem('posts', JSON.stringify(response.data || []));
      } else {
        console.error('Error al obtener las publicaciones:', response.error);
      }
      setLoading(false);
    });
  };

  const openModal = (post) => {
    setModalPost(post);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalPost(null);
  };

  const getTotalReactions = (post) => {
    return (post.like_reactions?.summary?.total_count || 0) +
      (post.love_reactions?.summary?.total_count || 0) +
      (post.haha_reactions?.summary?.total_count || 0) +
      (post.wow_reactions?.summary?.total_count || 0) +
      (post.sad_reactions?.summary?.total_count || 0) +
      (post.angry_reactions?.summary?.total_count || 0);
  };

  // Función para generar el código embed (la seguridad está en el backend)
  const handleGenerateEmbed = () => {
    const baseUrl = 'https://9706-190-232-219-16.ngrok-free.app';
    const embedUrl = `${baseUrl}/?embed=true&template=${selectedTemplate}`;
    const code = `<iframe src="${embedUrl}" style="border:0; width:600px; height:800px;" frameborder="0"></iframe>`;
    setEmbedCode(code);
    setEmbedModalOpen(true);
    // Opcionalmente, también se puede enviar la URL aquí:
    window.postMessage({ type: 'EMBED_URL', url: embedUrl }, '*');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Código copiado al portapapeles');
  };

  // Función para redirigir al perfil de Facebook (modo normal)
  const handlePublish = () => {
    if (profile && profile.id) {
      window.open(`https://www.facebook.com/profile.php?id=${profile.id}`, "_blank");
    } else {
      alert("No hay perfil logueado");
    }
  };

  const handleLogout = () => {
    if (window.FB) {
      window.FB.logout(() => {
        setProfile(null);
        setPosts([]);
        localStorage.removeItem('profile');
        localStorage.removeItem('posts');
      });
    } else {
      setProfile(null);
      setPosts([]);
      localStorage.removeItem('profile');
      localStorage.removeItem('posts');
    }
  };

  // Función para cambiar de plantilla (la funcionalidad se mantiene internamente)
  const handleTemplateChange = (templateNumber) => {
    const isSameTemplate = selectedTemplate === templateNumber;
    const postsContainer = document.getElementById('posts');
    const fondo = document.querySelector('.fondo2');
    const postElements = postsContainer ? Array.from(postsContainer.children) : [];
    
    if (fondo) {
      if (isSameTemplate) {
        fondo.classList.add('template-changing-minor');
        setTimeout(() => {
          fondo.classList.remove('template-changing-minor');
        }, 500);
      } else {
        fondo.classList.add('template-changing');
        setTimeout(() => {
          fondo.classList.remove('template-changing');
        }, 500);
      }
    }
    
    const firstRects = postElements.map(post => post.getBoundingClientRect());
    setSelectedTemplate(templateNumber);
    
    requestAnimationFrame(() => {
      const lastRects = postElements.map(post => post.getBoundingClientRect());
      postElements.forEach((post, index) => {
        const first = firstRects[index];
        const last = lastRects[index];
        let deltaX = first.left - last.left;
        let deltaY = first.top - last.top;
        if (isSameTemplate) {
          deltaX *= 0.3;
          deltaY *= 0.3;
        }
        post.animate([{
          transform: `translate(${deltaX}px, ${deltaY}px)`
        }, {
          transform: 'none'
        }], {
          duration: 500,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
      });
    });
  };

  // Modo embed: solo se muestra el widget de publicaciones
  if (isEmbed) {
    return (
      <div 
        className="App" 
        style={{ width: '100vw', height: '100vh', padding: '60px', marginTop: '1000px' }}
      >
        {loading ? (
          <div id="message" className="text-center fs-5 mb-4">
            Cargando publicaciones, por favor espera...
          </div>
        ) : (profile && posts.length > 0 ? (
          <div id="posts" className={`fondo2 template-${selectedTemplate}`} style={{ marginLeft: '-20px' }}>
            {posts.map((post) => (
              <div key={post.id} className="post-col">
                <div className="fb-post">
                  <div className="fb-post-header">
                    {profile.picture && (
                      <img src={profile.picture.data.url} alt={profile.name} className="fb-post-author-pic" />
                    )}
                    {profile.name && <div className="profile-name">{profile.name}</div>}
                    {post.created_time && <div className="fb-post-date">{formatDate(post.created_time)}</div>}
                  </div>
                  <div className="fb-post-body">
                    {post.message && <p className="fb-post-message">{post.message}</p>}
                    {post.full_picture && (
                      <img
                        src={post.full_picture}
                        alt="Imagen de la publicación"
                        className="fb-post-image"
                        onClick={() => openModal(post)}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay publicaciones para mostrar.</p>
        ))}
      </div>
    );
  }

  // Modo normal: Se elimina cualquier navbar y el contenido ocupa toda la pantalla con margen lateral
  return (
    <div 
      className="App" 
      style={{ width: '100vw', height: '100vh', margin: 0, padding: '0 20px' }}
    >
      <main 
        className="main-content" 
        style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflowY: 'auto' }}
      >
        {!profile ? (
          <div id="message" className="text-center fs-5 mb-4">
            Esperando carga de datos...
          </div>
        ) : loading ? (
          <div id="message" className="text-center fs-5 mb-4">
            Cargando publicaciones, por favor espera...
          </div>
        ) : (
          <div id="posts" className={`fondo2 template-${selectedTemplate}`} style={{ marginLeft: '-20px' }}>
            {posts.map((post) => (
              <div key={post.id} className="post-col d-flex">
                <div className="fb-post">
                  <div className="fb-post-header">
                    {profile.picture && (
                      <img src={profile.picture.data.url} alt={profile.name} className="fb-post-author-pic" />
                    )}
                    {profile.name && <div className="profile-name">{profile.name}</div>}
                    {post.created_time && <div className="fb-post-date">{formatDate(post.created_time)}</div>}
                  </div>
                  <div className="fb-post-body">
                    {post.message && <p className="fb-post-message">{post.message}</p>}
                    {post.full_picture && (
                      <img
                        src={post.full_picture}
                        alt="Imagen de la publicación"
                        className="fb-post-image"
                        onClick={() => openModal(post)}
                      />
                    )}
                    <div className="fb-post-actions">
                      <span className="fb-like-count" dangerouslySetInnerHTML={{ __html: `
                        <svg width="20" height="20" viewBox="0 0 40 40" class="fb-like-icon">
                          <defs>
                            <linearGradient id="thumbGradient" x1="50%" x2="50%" y1="0%" y2="100%">
                              <stop offset="0%" stop-color="#18AFFF"/>
                              <stop offset="100%" stop-color="#0062E0"/>
                            </linearGradient>
                          </defs>
                          <circle fill="url(#thumbGradient)" cx="20" cy="20" r="20"/>
                          <g transform="translate(0,0) scale(0.7)">
                            <svg viewBox="-3 -3 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fill="#fff" d="m20.27 16.265l.705-4.08a1.666 1.666 0 0 0-1.64-1.95h-5.181a.833.833 0 0 1-.822-.969l.663-4.045a4.8 4.8 0 0 0-.09-1.973a1.64 1.64 0 0 0-1.092-1.137l-.145-.047a1.35 1.35 0 0 0-.994.068c-.34.164-.588.463-.68.818l-.476 1.834a7.6 7.6 0 0 1-.656 1.679c-.415.777-1.057 1.4-1.725 1.975l-1.439 1.24a1.67 1.67 0 0 0-.572 1.406l.812 9.393A1.666 1.666 0 0 0 8.597 22h4.648c3.482 0 6.453-2.426 7.025-5.735"/>
                              <path fill="#fff" fill-rule="evenodd" d="M2.968 9.485a.75.75 0 0 1 .78.685l.97 11.236a1.237 1.237 0 1 1-2.468.107V10.234a.75.75 0 0 1 .718-.749"/>
                            </svg>
                          </g>
                        </svg>
                        <span class="like-text">${getTotalReactions(post)}</span>
                      ` }} />
                      <span className="fb-comments-count">1 comments</span>
                      {post.permalink_url && (
                        <a href={post.permalink_url} target="_blank" rel="noopener noreferrer" className="fb-post-share-btn">
                          <i className="bi bi-arrow-up-right"></i> Share
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalOpen && modalPost && (
        <div
          className="modal"
          id="photoModal"
          style={{ display: 'flex' }}
          onClick={(e) => {
            if (e.target.className === 'modal') {
              closeModal();
            }
          }}
        >
          <div className="modal-content modal-photo-content">
            <button className="modal-close" onClick={closeModal}>X</button>
            <div className="modal-body">
              <div className="modal-photo-left">
                <img src={modalPost.full_picture} alt="Imagen de la publicación" />
              </div>
              <div className="modal-photo-right" id="modalPhotoInfo">
                <div className="fb-post-header">
                  <div className="d-flex align-items-center">
                    {profile && profile.picture && (
                      <img src={profile.picture.data.url} alt={profile.name} className="fb-post-author2-pic" />
                    )}
                    {profile && profile.name && (
                      <div className="profile-name2">{profile.name}</div>
                    )}
                  </div>
                  {modalPost.created_time && (
                    <div className="fb-post-date2">
                      {formatDate(modalPost.created_time)}
                    </div>
                  )}
                </div>
                {modalPost.message && (
                  <div className="fb-post-message2">{modalPost.message}</div>
                )}
                <div className="fb-post-actions">
                  <span className="fb-like-count" dangerouslySetInnerHTML={{ __html: `
                    <svg width="20" height="20" viewBox="0 0 40 40" class="fb-like-icon">
                      <defs>
                        <linearGradient id="thumbGradient" x1="50%" x2="50%" y1="0%" y2="100%">
                          <stop offset="0%" stop-color="#18AFFF"/>
                          <stop offset="100%" stop-color="#0062E0"/>
                        </linearGradient>
                      </defs>
                      <circle fill="url(#thumbGradient)" cx="20" cy="20" r="20"/>
                      <g transform="translate(0,0) scale(0.7)">
                        <svg viewBox="-3 -3 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fill="#fff" d="m20.27 16.265l.705-4.08a1.666 1.666 0 0 0-1.64-1.95h-5.181a.833.833 0 0 1-.822-.969l.663-4.045a4.8 4.8 0 0 0-.09-1.973a1.64 1.64 0 0 0-1.092-1.137l-.145-.047a1.35 1.35 0 0 0-.994.068c-.34.164-.588.463-.68.818l-.476 1.834a7.6 7.6 0 0 1-.656 1.679c-.415.777-1.057 1.4-1.725 1.975l-1.439 1.24a1.67 1.67 0 0 0-.572 1.406l.812 9.393A1.666 1.666 0 0 0 8.597 22h4.648c3.482 0 6.453-2.426 7.025-5.735"/>
                          <path fill="#fff" fill-rule="evenodd" d="M2.968 9.485a.75.75 0 0 1 .78.685l.97 11.236a1.237 1.237 0 1 1-2.468.107V10.234a.75.75 0 0 1 .718-.749"/>
                        </svg>
                      </g>
                    </svg>
                    <span class="like-text">${getTotalReactions(modalPost)}</span>
                  ` }} />
                  {modalPost.permalink_url && (
                    <a href={modalPost.permalink_url} target="_blank" rel="noopener noreferrer" className="fb-post-share-btn">
                      <i className="bi bi-arrow-up-right"></i> Compartir
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {embedModalOpen && (
        <div 
          className="modal embed-modal" 
          style={{ display: 'flex' }}
          onClick={(e) => {
            if (e.target.className.includes('embed-modal')) {
              setEmbedModalOpen(false);
            }
          }}
        >
          <div className="modal-content embed-modal-content">
            <button className="modal-close" onClick={() => setEmbedModalOpen(false)}>X</button>
            <div className="modal-body">
              <h3>Código Embed</h3>
              <textarea 
                className="embed-textarea" 
                readOnly 
                value={embedCode} 
                onClick={(e) => e.target.select()}
              />
              <button className="copy-btn" onClick={copyToClipboard}>Copiar Código</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Interceptar errores en la consola (opcional)
if (window.console && window.console.error) {
  const originalConsoleError = window.console.error;
  window.console.error = function (message, ...args) {
    if (typeof message === 'string' && message.includes('Failed to fetch')) {
      return;
    }
    originalConsoleError(message, ...args);
  };
}

export default App;
