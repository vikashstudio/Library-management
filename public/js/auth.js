// Login Form
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('alert-message');
    alertBox.style.display = 'none';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (res.status === 'success') {
        window.location.href = '/dashboard.html';
      }
    } catch (err) {
      alertBox.className = 'alert alert-danger';
      alertBox.textContent = err.message;
      alertBox.style.display = 'block';
    }
  });
}

// Register Form
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('alert-message');
    alertBox.style.display = 'none';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    try {
      const res = await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role })
      });

      if (res.status === 'success') {
        window.location.href = '/dashboard.html';
      }
    } catch (err) {
      alertBox.className = 'alert alert-danger';
      alertBox.textContent = err.message;
      alertBox.style.display = 'block';
    }
  });
}
