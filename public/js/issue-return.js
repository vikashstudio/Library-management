let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await checkAuthSession();
  if (currentUser) {
    const isAdmin = currentUser.role && currentUser.role.toLowerCase() === 'admin';
    const issueBtn = document.getElementById('btn-issue-book');
    if (issueBtn) {
      issueBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    }
    loadIssues();
  }
});

async function loadIssues() {
  const tbody = document.getElementById('issues-table-body');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading circulation records...</td></tr>';

  const filterSelect = document.getElementById('status-filter');
  const statusParam = filterSelect ? filterSelect.value : '';

  try {
    const endpoint = statusParam ? `/issues?status=${encodeURIComponent(statusParam)}` : '/issues';
    const data = await fetchAPI(endpoint);
    renderIssuesTable(data.issues);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--danger-color);">${err.message}</td></tr>`;
  }
}

function renderIssuesTable(issues) {
  const tbody = document.getElementById('issues-table-body');
  const isAdmin = currentUser && currentUser.role && currentUser.role.toLowerCase() === 'admin';

  if (!issues || issues.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">No circulation records match your filter.</td></tr>';
    return;
  }

  tbody.innerHTML = issues.map(iss => {
    const bookTitle = iss.book ? iss.book.title : 'Deleted Book';
    const memberName = iss.member ? `${iss.member.name} (${iss.member.membershipId})` : 'Deleted Member';
    const issueDate = new Date(iss.issueDate).toLocaleDateString();
    const dueDate = new Date(iss.dueDate).toLocaleDateString();
    const returnDate = iss.returnDate ? new Date(iss.returnDate).toLocaleDateString() : '-';
    const isReturned = iss.status === 'returned';

    return `
      <tr>
        <td><strong>${bookTitle}</strong></td>
        <td>${memberName}</td>
        <td>${issueDate}</td>
        <td>${dueDate}</td>
        <td>${returnDate}</td>
        <td>
          <span class="user-badge" style="background: ${isReturned ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}; color: ${isReturned ? 'var(--success-color)' : 'var(--warning-color)'};">
            ${iss.status.toUpperCase()}
          </span>
        </td>
        <td>
          ${isAdmin && !isReturned ? `
            <button class="btn btn-primary btn-sm" style="width: auto;" onclick="returnBook('${iss._id}')">Process Return</button>
          ` : '<span style="color: var(--text-muted); font-size: 0.85rem;">-</span>'}
        </td>
      </tr>
    `;
  }).join('');
}

async function openIssueModal() {
  const alertBox = document.getElementById('issue-modal-alert');
  alertBox.style.display = 'none';

  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  document.getElementById('issue-due-date').value = defaultDueDate;

  const bookSelect = document.getElementById('issue-book-select');
  const memberSelect = document.getElementById('issue-member-select');

  bookSelect.innerHTML = '<option value="">Loading books...</option>';
  memberSelect.innerHTML = '<option value="">Loading members...</option>';

  document.getElementById('issue-modal').classList.add('active');

  try {
    const [booksRes, membersRes] = await Promise.all([
      fetchAPI('/books'),
      fetchAPI('/members')
    ]);

    const availableBooks = (booksRes.books || []).filter(b => b.availableQuantity > 0);
    const activeMembers = (membersRes.members || []).filter(m => m.status === 'active');

    bookSelect.innerHTML = availableBooks.length > 0
      ? availableBooks.map(b => `<option value="${b._id}">${b.title} (Available: ${b.availableQuantity})</option>`).join('')
      : '<option value="">No books currently available</option>';

    memberSelect.innerHTML = activeMembers.length > 0
      ? activeMembers.map(m => `<option value="${m._id}">${m.name} (${m.membershipId})</option>`).join('')
      : '<option value="">No active members found</option>';

  } catch (err) {
    alertBox.className = 'alert alert-danger';
    alertBox.textContent = err.message;
    alertBox.style.display = 'block';
  }
}

function closeIssueModal() {
  document.getElementById('issue-modal').classList.remove('active');
}

async function saveIssue(e) {
  e.preventDefault();
  const alertBox = document.getElementById('issue-modal-alert');
  alertBox.style.display = 'none';

  const bookId = document.getElementById('issue-book-select').value;
  const memberId = document.getElementById('issue-member-select').value;
  const dueDate = document.getElementById('issue-due-date').value;

  if (!bookId || !memberId) {
    alertBox.className = 'alert alert-danger';
    alertBox.textContent = 'Please select a book and a member';
    alertBox.style.display = 'block';
    return;
  }

  try {
    await fetchAPI('/issues', {
      method: 'POST',
      body: JSON.stringify({ bookId, memberId, dueDate })
    });

    closeIssueModal();
    loadIssues();
  } catch (err) {
    alertBox.className = 'alert alert-danger';
    alertBox.textContent = err.message;
    alertBox.style.display = 'block';
  }
}

async function returnBook(issueId) {
  if (!confirm('Confirm return of this book?')) return;
  try {
    await fetchAPI(`/issues/${issueId}/return`, { method: 'PUT' });
    loadIssues();
  } catch (err) {
    alert(err.message);
  }
}
