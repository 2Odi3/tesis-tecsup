// userState.js

export const saveToken = (token, expiresIn = 3600) => {
  const expirationTime = Date.now() + expiresIn * 1000;
  localStorage.setItem('access_token', token);
  localStorage.setItem('token_expiration', expirationTime);
};

export const renewToken = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.id_profesor) return;

  const response = await fetch('http://localhost:3000/profesor/renew-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: user.id_profesor }),
  });

  if (response.ok) {
    const data = await response.json();
    saveToken(data.token);
  } else {
    throw new Error('Error al renovar el token');
  }
};

export const checkTokenExpiration = async () => {
  const tokenExpiration = localStorage.getItem('token_expiration');
  if (Date.now() > tokenExpiration - 5 * 60 * 1000) {
    try {
      await renewToken();
    } catch (error) {
      console.error("Error al renovar el token:", error);
      logout();
    }
  }
};

export const logout = (setIsAuthenticated) => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token_expiration');
  localStorage.removeItem('userId'); 
  localStorage.removeItem('theme');
  if (setIsAuthenticated) setIsAuthenticated(false); // Actualizar el estado de autenticación
};


setInterval(checkTokenExpiration, 5 * 60 * 1000);
