// 1. BACKEND API ROUTE CONFIGURATION

const API_URL = 'http://localhost:5000/api/books';

// Global runtime array to store books fetched from the database
let backendBooksMemory = [];
let activeBookIdForDelete = null;
let activeBookIdForBorrow = null;


// 2. FULL-STACK SERVER CONNECTION ENGINE (fetch)

// 1. GET: Fetch data records right from the cloud server
async function loadBooksFromDatabase() {
    try {
        const response = await fetch(API_URL);
        backendBooksMemory = await response.json();
        renderUI();
    } catch (err) {
        console.error("❌ Failed to fetch data from backend server:", err);
    }
}

// 2. POST: Send a new entry package to the backend API
async function addBookToDatabase(title, author) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author })
        });
        if (response.ok) {
            await loadBooksFromDatabase(); // Refresh memory layer
        }
    } catch (err) {
        console.error("❌ Error adding book to server:", err);
    }
}

// 3. PUT: Update availability and timeline parameters on the backend
async function toggleBookStatusInDatabase(id, days = null) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ days })
        });
        if (response.ok) {
            await loadBooksFromDatabase();
        }
    } catch (err) {
        console.error("❌ Error updating status on server:", err);
    }
}

// 4. DELETE: Erase data records completely from the backend server
async function deleteBookFromDatabase(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            await loadBooksFromDatabase();
        }
    } catch (err) {
        console.error("❌ Error deleting book from server:", err);
    }
}

// 3. UI INTERACTION LAYER (DOM Manipulation)

const titleInput = document.getElementById('book-title');
const authorInput = document.getElementById('book-author');
const addBtn = document.getElementById('add-btn');
const booksList = document.getElementById('books-list');
const searchInput = document.getElementById('search-input');

const statTotal = document.getElementById('stat-total');
const statAvailable = document.getElementById('stat-available');
const statBorrowed = document.getElementById('stat-borrowed');

function renderUI() {
    booksList.innerHTML = '';
    const searchQuery = searchInput.value.toLowerCase().trim();

    const filteredBooks = backendBooksMemory.filter(book => {
        const matchesTitle = book.title.toLowerCase().includes(searchQuery);
        const matchesAuthor = book.author.toLowerCase().includes(searchQuery);
        return matchesTitle || matchesAuthor;
    });

    filteredBooks.forEach(book => {
        const li = document.createElement('li');
        li.className = `book-item ${book.isAvailable ? '' : 'borrowed'}`;
        
        // Match the database structure property names (Mongoose generates an "_id" field)
        const bookId = book._id || book.id; 
        const durationText = book.borrowDuration ? `<span style="color: #fab387; font-size: 0.8rem;">⏳ Due in ${book.borrowDuration} days</span>` : '';

        li.innerHTML = `
            <div>
                <strong>${book.title}</strong> <br>
                <small>by ${book.author}</small> <br>
                ${durationText}
            </div>
            <div class="book-actions">
                <button class="${book.isAvailable ? 'btn-borrow' : 'btn-return'}" onclick="handleStatus('${bookId}', ${book.isAvailable})">
                    ${book.isAvailable ? 'Borrow' : 'Return'}
                </button>
                <button class="btn-delete" onclick="handleDelete('${bookId}')">Delete</button>
            </div>
        `;
        booksList.appendChild(li);
    });

    // Generate accurate statistics dashboards
    const total = backendBooksMemory.length;
    const available = backendBooksMemory.filter(b => b.isAvailable).length;
    const borrowed = total - available;

    statTotal.textContent = total;
    statAvailable.textContent = available;
    statBorrowed.textContent = borrowed;
}

addBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();

    if (!title || !author) {
        alert("Please fill in both fields!");
        return;
    }

    addBookToDatabase(title, author);
    titleInput.value = '';
    authorInput.value = '';
});

searchInput.addEventListener('input', () => {
    renderUI();
});

// MODAL ROUTING CONTROLLERS

window.closeModal = (modalId) => {
    document.getElementById(modalId).classList.remove('active');
};

window.handleDelete = (id) => {
    activeBookIdForDelete = id;
    document.getElementById('delete-modal').classList.add('active');
};

document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    if (activeBookIdForDelete) {
        deleteBookFromDatabase(activeBookIdForDelete);
        activeBookIdForDelete = null;
        closeModal('delete-modal');
    }
});

window.handleStatus = (id, isCurrentAvailable) => {
    if (isCurrentAvailable) {
        activeBookIdForBorrow = id;
        document.getElementById('borrow-modal').classList.add('active');
    } else {
        toggleBookStatusInDatabase(id);
    }
};

window.submitBorrowDuration = (days) => {
    if (activeBookIdForBorrow) {
        toggleBookStatusInDatabase(activeBookIdForBorrow, days);
        activeBookIdForBorrow = null;
        closeModal('borrow-modal');
    }
};

// Fire engine sequence directly on initial window load mapping
loadBooksFromDatabase();