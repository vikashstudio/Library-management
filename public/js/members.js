let currentUser = null;
let currentMemberId = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await checkAuthSession();
  if (currentUser) {
    const isAdmin = currentUser.role && currentUser.role.toLowerCase() === 'admin';
    const addBtn = document.getElementById('btn-add-member');
    if (addBtn) {
      addBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    }
    loadMembers();
  }
});

async function loadMembers() {
  const tbody = document.getElementById('members-table-body');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading members...</td></tr>';

  try {
    const data = await fetchAPI('/members');
    renderMembersTable(data.members);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--danger-color);">${err.message}</td></tr>`;
  }
}

async function handleMemberSearch() {
  const query = document.getElementById('member-search-input').value.trim();
  const tbody = document.getElementById('members-table-body');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Searching members...</td></tr>';

  try {
    const data = await fetchAPI(`/members/search?query=${encodeURIComponent(query)}`);
    renderMembersTable(data.members);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--danger-color);">${err.message}</td></tr>`;
  }
}

function renderMembersTable(members) {
  const tbody = document.getElementById('members-table-body');
  const isAdmin = currentUser && currentUser.role && currentUser.role.toLowerCase() === 'admin';

  if (!members || members.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">No members registered yet.</td></tr>';
    return;
  }

  tbody.innerHTML = members.map(m => `
    <tr>
      <td><code>${m.membershipId}</code></td>
      <td><strong>${m.name}</strong></td>
      <td>${m.email}</td>
      <td>${m.phone}</td>
      <td>${m.address || '-'}</td>
      <td>
        <span class="user-badge" style="background: ${m.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color: ${m.status === 'active' ? 'var(--success-color)' : 'var(--danger-color)'};">
          ${m.status.toUpperCase()}
        </span>
      </td>
      ${isAdmin ? `
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openEditMemberModal('${m._id}', '${escapeHtml(m.name)}', '${escapeHtml(m.email)}', '${escapeHtml(m.phone)}', '${escapeHtml(m.membershipId)}', '${escapeHtml(m.address || '')}', '${m.status}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteMember('${m._id}')">Delete</button>
        </td>
      ` : '<td><span style="color: var(--text-muted); font-size: 0.85rem;">Read Only</span></td>'}
    </tr>
  `).join('');
}

function openAddMemberModal() {
  currentMemberId = null;
  document.getElementById('member-modal-title').innerText = 'Register Member';
  document.getElementById('member-form').reset();
  document.getElementById('member-modal').classList.add('active');
}

function openEditMemberModal(id, name, email, phone, membershipId, address, status) {
  currentMemberId = id;
  document.getElementById('member-modal-title').innerText = 'Edit Member';
  document.getElementById('member-name').value = name;
  document.getElementById('member-email').value = email;
  document.getElementById('member-phone').value = phone;
  document.getElementById('member-id').value = membershipId;
  document.getElementById('member-address').value = address;
  document.getElementById('member-status').value = status;
  document.getElementById('member-modal').classList.add('active');
}

function closeMemberModal() {
  document.getElementById('member-modal').classList.remove('active');
}

async function saveMember(e) {
  e.preventDefault();
  const alertBox = document.getElementById('member-modal-alert');
  alertBox.style.display = 'none';

  const memberData = {
    name: document.getElementById('member-name').value,
    email: document.getElementById('member-email').value,
    phone: document.getElementById('member-phone').value,
    membershipId: document.getElementById('member-id').value,
    address: document.getElementById('member-address').value,
    status: document.getElementById('member-status').value
  };

  try {
    if (currentMemberId) {
      await fetchAPI(`/members/${currentMemberId}`, {
        method: 'PUT',
        body: JSON.stringify(memberData)
      });
    } else {
      await fetchAPI('/members', {
        method: 'POST',
        body: JSON.stringify(memberData)
      });
    }

    closeMemberModal();
    loadMembers();
  } catch (err) {
    alertBox.className = 'alert alert-danger';
    alertBox.textContent = err.message;
    alertBox.style.display = 'block';
  }
}

async function deleteMember(id) {
  if (!confirm('Are you sure you want to delete this member?')) return;
  try {
    await fetchAPI(`/members/${id}`, { method: 'DELETE' });
    loadMembers();
  } catch (err) {
    alert(err.message);
  }
}

function escapeHtml(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
