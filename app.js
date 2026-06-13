
// 1. CORE LOGIC (Classes)

class Book {
    constructor(title, author, id = null, isAvailable = true, borrowDuration = null) {
        this.id = id || Date.now() + Math.random().toString(36).substr(2, 5);
        this.title = title;
        this.author = author;
        this.isAvailable = isAvailable; 
        this.borrowDuration = borrowDuration; // Tracks custom days assigned
    }
}

class Library {
    constructor(name = "My Library") {
        this.name = name;
        this.books = this.loadFromLocalStorage(); 
    }
    
    addBook(title, author) {
        const newBook = new Book(title, author);
        this.books.push(newBook);
        this.saveToLocalStorage(); 
        return newBook;
    }
    
    removeBook(id) {
        this.books = this.books.filter(book => book.id !== id);
        this.saveToLocalStorage(); 
    }
    
    toggleAvailability(id, days = null) {
        const book = this.books.find(book => book.id === id);
        if (book) {
            book.isAvailable = !book.isAvailable;
            // Assign or wipe the borrow timeline parameter
            book.borrowDuration = book.isAvailable ? null : days;
            this.saveToLocalStorage(); 
        }
    }

    getStatistics() {
        const total = this.books.length;
        const available = this.books.filter(b => b.isAvailable).length;
        const borrowed = total - available;
        return { total, available, borrowed };
    }

    saveToLocalStorage() {
        localStorage.setItem('library_books', JSON.stringify(this.books));
    }

    loadFromLocalStorage() {
        const savedData = localStorage.getItem('library_books');
        if (!savedData) return [];
        const rawBooks = JSON.parse(savedData);
        return rawBooks.map(b => new Book(b.title, b.author, b.id, b.isAvailable, b.borrowDuration));
    }
}

const myLibrary = new Library("Central Hub");

// 2. Temporary variables to remember which book card the user clicked on

let activeBookIdForDelete = null;
let activeBookIdForBorrow = null;


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

    const filteredBooks = myLibrary.books.filter(book => {
        const matchesTitle = book.title.toLowerCase().includes(searchQuery);
        const matchesAuthor = book.author.toLowerCase().includes(searchQuery);
        return matchesTitle || matchesAuthor;
    });

    filteredBooks.forEach(book => {
        const li = document.createElement('li');
        li.className = `book-item ${book.isAvailable ? '' : 'borrowed'}`;
        
        // Show duration description if book is borrowed
        const durationText = book.borrowDuration ? `<span style="color: #fab387; font-size: 0.8rem;">⏳ Due in ${book.borrowDuration} days</span>` : '';

        li.innerHTML = `
            <div>
                <strong>${book.title}</strong> <br>
                <small>by ${book.author}</small> <br>
                ${durationText}
            </div>
            <div class="book-actions">
                <button class="${book.isAvailable ? 'btn-borrow' : 'btn-return'}" onclick="handleStatus('${book.id}', ${book.isAvailable})">
                    ${book.isAvailable ? 'Borrow' : 'Return'}
                </button>
                <button class="btn-delete" onclick="handleDelete('${book.id}')">Delete</button>
            </div>
        `;
        booksList.appendChild(li);
    });

    const stats = myLibrary.getStatistics();
    statTotal.textContent = stats.total;
    statAvailable.textContent = stats.available;
    statBorrowed.textContent = stats.borrowed;
}

addBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();

    if (!title || !author) {
        alert("Please fill in both fields!");
        return;
    }

    myLibrary.addBook(title, author);
    titleInput.value = '';
    authorInput.value = '';
    renderUI();
});

searchInput.addEventListener('input', () => {
    renderUI();
});


// MODAL ROUTING CONTROLLERS

// Global Modal Utility Closers
window.closeModal = (modalId) => {
    document.getElementById(modalId).classList.remove('active');
};

// Intercept Delete Click Event
window.handleDelete = (id) => {
    activeBookIdForDelete = id; // Store ID temporarily
    document.getElementById('delete-modal').classList.add('active'); // Pop modal open
};

// Handle Confirmation Click inside Delete Modal
document.getElementById('confirm-delete-btn').addEventListener('click', () => {
    if (activeBookIdForDelete) {
        myLibrary.removeBook(activeBookIdForDelete);
        activeBookIdForDelete = null;
        closeModal('delete-modal');
        renderUI();
    }
});

// Intercept Borrow/Return Click Event
window.handleStatus = (id, isCurrentAvailable) => {
    if (isCurrentAvailable) {
        // If it's available, show options popup for duration
        activeBookIdForBorrow = id;
        document.getElementById('borrow-modal').classList.add('active');
    } else {
        // If returning it, process status toggle instantly without asking questions
        myLibrary.toggleAvailability(id);
        renderUI();
    }
};

// Handle Duration Button Select Event
window.submitBorrowDuration = (days) => {
    if (activeBookIdForBorrow) {
        myLibrary.toggleAvailability(activeBookIdForBorrow, days);
        activeBookIdForBorrow = null;
        closeModal('borrow-modal');
        renderUI();
    }
};

// Initial setup engine run
renderUI();