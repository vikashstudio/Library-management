document.addEventListener('DOMContentLoaded', async () => {
  const user = await checkAuthSession();
  if (user) {
    document.getElementById('welcome-heading').innerText = `Welcome back, ${user.name}`;
    loadDashboardStats();
  }
});

async function loadDashboardStats() {
  try {
    const res = await fetchAPI('/dashboard/stats');
    if (res.status === 'success' && res.stats) {
      document.getElementById('stat-total-books').innerText = res.stats.totalBooks;
      document.getElementById('stat-available-books').innerText = res.stats.availableBooks;
      document.getElementById('stat-issued-books').innerText = res.stats.issuedBooks;
      document.getElementById('stat-total-members').innerText = res.stats.totalMembers;
    }
  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
  }
}
