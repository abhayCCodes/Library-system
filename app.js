// ==========================================
// 1. CORE LOGIC (Your Classes)
// ==========================================
class Book {
    constructor(title, author) {
        this.id = Date.now() + Math.random().toString(36).substr(2, 5);
        this.title = title;
        this.author = author;
        this.isAvailable = true; 
    }
}

class Library {
    constructor(name = "My Library") {
        this.name = name;
        this.books = [];
    }
    
    addBook(title, author) {
        const newBook = new Book(title, author);
        this.books.push(newBook);
        return newBook;
    }
    
    removeBook(id) {
        this.books = this.books.filter(book => book.id !== id);
    }
    
    toggleAvailability(id) {
        const book = this.books.find(book => book.id === id);
        if (book) {
            book.isAvailable = !book.isAvailable;
        }
    }

    getStatistics() {
        const total = this.books.length;
        const available = this.books.filter(b => b.isAvailable).length;
        const borrowed = total - available;
        return { total, available, borrowed };
    }
}

// Instantiate our primary app manager
const myLibrary = new Library("Central Hub");


// ==========================================
// 2. UI INTERACTION LAYER (DOM Manipulation)
// ==========================================

// ==========================================
// 2. UI INTERACTION LAYER (DOM Manipulation)
// ==========================================

// Grab DOM elements
const titleInput = document.getElementById('book-title');
const authorInput = document.getElementById('book-author');
const addBtn = document.getElementById('add-btn');
const booksList = document.getElementById('books-list');

// NEW: Grab the search input element
const searchInput = document.getElementById('search-input');

const statTotal = document.getElementById('stat-total');
const statAvailable = document.getElementById('stat-available');
const statBorrowed = document.getElementById('stat-borrowed');

// Function to refresh the screen whenever data changes
function renderUI() {
    // Clear old list items to prevent duplication
    booksList.innerHTML = '';

    // NEW: Get the current search text and convert to lowercase for case-insensitivity
    const searchQuery = searchInput.value.toLowerCase().trim();

    // NEW: Filter the books array down *before* looping through it to build cards
    const filteredBooks = myLibrary.books.filter(book => {
        const matchesTitle = book.title.toLowerCase().includes(searchQuery);
        const matchesAuthor = book.author.toLowerCase().includes(searchQuery);
        
        // Keep the book if either the title OR the author contains the search text
        return matchesTitle || matchesAuthor;
    });

    // Loop through the FILTERED array data and generate HTML strings
    filteredBooks.forEach(book => {
        const li = document.createElement('li');
        li.className = `book-item ${book.isAvailable ? '' : 'borrowed'}`;
        
        li.innerHTML = `
            <div>
                <strong>${book.title}</strong> <br>
                <small>by ${book.author}</small>
            </div>
            <div class="book-actions">
                <button class="${book.isAvailable ? 'btn-borrow' : 'btn-return'}" onclick="handleStatus('${book.id}')">
                    ${book.isAvailable ? 'Borrow' : 'Return'}
                </button>
                <button class="btn-delete" onclick="handleDelete('${book.id}')">Delete</button>
            </div>
        `;
        booksList.appendChild(li);
    });

    // Update Statistics counters (Always based on the total library array, not just filtered results!)
    const stats = myLibrary.getStatistics();
    statTotal.textContent = stats.total;
    statAvailable.textContent = stats.available;
    statBorrowed.textContent = stats.borrowed;
}

// Event handler for adding a book
addBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();

    if (!title || !author) {
        alert("Please fill in both fields!");
        return;
    }

    myLibrary.addBook(title, author);
    
    // Clear input boxes
    titleInput.value = '';
    authorInput.value = '';

    renderUI();
});

// NEW: Event listener to re-render the list every single time the user presses a key in the search box
searchInput.addEventListener('input', () => {
    renderUI();
});

// Global bridge functions so HTML inline onclick handlers can execute our logic safely
window.handleStatus = (id) => {
    myLibrary.toggleAvailability(id);
    renderUI();
};

window.handleDelete = (id) => {
    myLibrary.removeBook(id);
    renderUI();
};

// Initial run to clear fields on load
renderUI();