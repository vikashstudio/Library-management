const API_BASE_URL = '/api';

// Centralized Fetch Helper
async function fetchAPI(endpoint, options = {}) {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
        window.location.href = '/login.html';
      }
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Session Check Helper
async function checkAuthSession() {
  try {
    const data = await fetchAPI('/auth/me');
    if (data.status === 'success' && data.user) {
      renderNavUser(data.user);
      return data.user;
    }
  } catch (err) {
    if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
      window.location.href = '/login.html';
    }
    return null;
  }
}

// Render Header User Profile with Responsive Wrapper Class
function renderNavUser(user) {
  const userDisplay = document.getElementById('user-display');
  if (userDisplay) {
    userDisplay.className = 'user-display-container';
    userDisplay.innerHTML = `
      <span class="user-badge">${user.name} (${user.role.toUpperCase()})</span>
      <button onclick="handleLogout()" class="btn-logout">Logout</button>
    `;
  }
}

// Logout Handler
async function handleLogout() {
  try {
    await fetchAPI('/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
  } catch (err) {
    alert(err.message || 'Logout failed');
  }
}
