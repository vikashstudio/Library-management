let currentUser = null;
let currentBookId = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await checkAuthSession();
  if (currentUser) {
    const isAdmin = currentUser.role && currentUser.role.toLowerCase() === 'admin';
    const addBtn = document.getElementById('btn-add-book');
    if (addBtn) {
      addBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    }
    loadBooks();
  }
});

async function loadBooks() {
  const tbody = document.getElementById('books-table-body');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading books...</td></tr>';

  try {
    const data = await fetchAPI('/books');
    renderBooksTable(data.books);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--danger-color);">${err.message}</td></tr>`;
  }
}

async function handleSearch() {
  const query = document.getElementById('search-input').value.trim();
  const tbody = document.getElementById('books-table-body');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Searching...</td></tr>';

  try {
    const data = await fetchAPI(`/books/search?query=${encodeURIComponent(query)}`);
    renderBooksTable(data.books);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--danger-color);">${err.message}</td></tr>`;
  }
}

function renderBooksTable(books) {
  const tbody = document.getElementById('books-table-body');
  const isAdmin = currentUser && currentUser.role && currentUser.role.toLowerCase() === 'admin';

  if (!books || books.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">No books found.</td></tr>';
    return;
  }

  tbody.innerHTML = books.map(book => `
    <tr>
      <td><strong>${book.title}</strong></td>
      <td>${book.author}</td>
      <td><code>${book.isbn}</code></td>
      <td><span class="user-badge">${book.category}</span></td>
      <td>${book.quantity}</td>
      <td><strong style="color: ${book.availableQuantity > 0 ? 'var(--success-color)' : 'var(--danger-color)'};">${book.availableQuantity}</strong></td>
      ${isAdmin ? `
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openEditModal('${book._id}', '${escapeHtml(book.title)}', '${escapeHtml(book.author)}', '${escapeHtml(book.isbn)}', '${escapeHtml(book.category)}', ${book.quantity}, ${book.availableQuantity})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteBook('${book._id}')">Delete</button>
        </td>
      ` : '<td><span style="color: var(--text-muted); font-size: 0.85rem;">Read Only</span></td>'}
    </tr>
  `).join('');
}

function openAddModal() {
  currentBookId = null;
  document.getElementById('modal-title').innerText = 'Add New Book';
  document.getElementById('book-form').reset();
  document.getElementById('book-modal').classList.add('active');
}

function openEditModal(id, title, author, isbn, category, quantity, availableQuantity) {
  currentBookId = id;
  document.getElementById('modal-title').innerText = 'Edit Book';
  document.getElementById('book-title').value = title;
  document.getElementById('book-author').value = author;
  document.getElementById('book-isbn').value = isbn;
  document.getElementById('book-category').value = category;
  document.getElementById('book-quantity').value = quantity;
  document.getElementById('book-available').value = availableQuantity;
  document.getElementById('book-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('book-modal').classList.remove('active');
}

async function saveBook(e) {
  e.preventDefault();
  const alertBox = document.getElementById('modal-alert');
  alertBox.style.display = 'none';

  const bookData = {
    title: document.getElementById('book-title').value,
    author: document.getElementById('book-author').value,
    isbn: document.getElementById('book-isbn').value,
    category: document.getElementById('book-category').value,
    quantity: Number(document.getElementById('book-quantity').value),
    availableQuantity: Number(document.getElementById('book-available').value)
  };

  try {
    if (currentBookId) {
      await fetchAPI(`/books/${currentBookId}`, {
        method: 'PUT',
        body: JSON.stringify(bookData)
      });
    } else {
      await fetchAPI('/books', {
        method: 'POST',
        body: JSON.stringify(bookData)
      });
    }

    closeModal();
    loadBooks();
  } catch (err) {
    alertBox.className = 'alert alert-danger';
    alertBox.textContent = err.message;
    alertBox.style.display = 'block';
  }
}

async function deleteBook(id) {
  if (!confirm('Are you sure you want to delete this book?')) return;
  try {
    await fetchAPI(`/books/${id}`, { method: 'DELETE' });
    loadBooks();
  } catch (err) {
    alert(err.message);
  }
}

function escapeHtml(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
