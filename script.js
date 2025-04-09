document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryItems = document.querySelectorAll('#categoryList li');
    const addBookBtn = document.getElementById('addBookBtn');
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    const booksContainer = document.getElementById('booksContainer');
    const addBookForm = document.getElementById('addBookForm');
    const historyContainer = document.getElementById('historyContainer');
    const totalBooksSpan = document.getElementById('totalBooks');
    const borrowedCountSpan = document.getElementById('borrowedCount');
    const availableCountSpan = document.getElementById('availableCount');
    
    // Modal Elements
    const addBookModal = document.getElementById('addBookModal');
    const historyModal = document.getElementById('historyModal');
    const bookDetailsModal = document.getElementById('bookDetailsModal');
    const closeButtons = document.querySelectorAll('.close');
    
    // Library Data
    let library = JSON.parse(localStorage.getItem('library')) || [];
    let borrowingHistory = JSON.parse(localStorage.getItem('borrowingHistory')) || [];
    let currentCategory = 'all';
    let currentSearchTerm = '';
    
    // Initialize the app
    function init() {
        renderBooks();
        updateStats();
        
        // Load sample data if library is empty
        if (library.length === 0) {
            loadSampleData();
        }
    }
    
    // Load sample data
    function loadSampleData() {
        const sampleBooks = [
            {
                id: generateId(),
                title: 'The Great Gatsby',
                author: 'F. Scott Fitzgerald',
                category: 'fiction',
                isbn: '9780743273565',
                publishedYear: 1925,
                status: 'available'
            },
            {
                id: generateId(),
                title: 'To Kill a Mockingbird',
                author: 'Harper Lee',
                category: 'fiction',
                isbn: '9780061120084',
                publishedYear: 1960,
                status: 'available'
            },
            {
                id: generateId(),
                title: 'A Brief History of Time',
                author: 'Stephen Hawking',
                category: 'science',
                isbn: '9780553380163',
                publishedYear: 1988,
                status: 'available'
            },
            {
                id: generateId(),
                title: 'Sapiens: A Brief History of Humankind',
                author: 'Yuval Noah Harari',
                category: 'non-fiction',
                isbn: '9780062316097',
                publishedYear: 2011,
                status: 'borrowed',
                borrowedBy: 'John Doe',
                borrowedDate: '2023-05-15'
            },
            {
                id: generateId(),
                title: 'The Hobbit',
                author: 'J.R.R. Tolkien',
                category: 'fantasy',
                isbn: '9780547928227',
                publishedYear: 1937,
                status: 'available'
            },
            {
                id: generateId(),
                title: 'Steve Jobs',
                author: 'Walter Isaacson',
                category: 'biography',
                isbn: '9781451648539',
                publishedYear: 2011,
                status: 'available'
            }
        ];
        
        const sampleHistory = [
            {
                bookId: sampleBooks[3].id,
                bookTitle: sampleBooks[3].title,
                action: 'borrowed',
                by: 'John Doe',
                date: '2023-05-15'
            },
            {
                bookId: sampleBooks[3].id,
                bookTitle: sampleBooks[3].title,
                action: 'returned',
                by: 'John Doe',
                date: '2023-06-10'
            },
            {
                bookId: sampleBooks[3].id,
                bookTitle: sampleBooks[3].title,
                action: 'borrowed',
                by: 'John Doe',
                date: '2023-07-20'
            }
        ];
        
        library = sampleBooks;
        borrowingHistory = sampleHistory;
        
        saveToLocalStorage();
        renderBooks();
        updateStats();
    }
    
    // Generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Save data to localStorage
    function saveToLocalStorage() {
        localStorage.setItem('library', JSON.stringify(library));
        localStorage.setItem('borrowingHistory', JSON.stringify(borrowingHistory));
    }
    
    // Update statistics
    function updateStats() {
        const totalBooks = library.length;
        const borrowedBooks = library.filter(book => book.status === 'borrowed').length;
        const availableBooks = totalBooks - borrowedBooks;
        
        totalBooksSpan.textContent = totalBooks;
        borrowedCountSpan.textContent = borrowedBooks;
        availableCountSpan.textContent = availableBooks;
    }
    
    // Render books based on current category and search term
    function renderBooks() {
        booksContainer.innerHTML = '';
        
        let filteredBooks = library;
        
        // Filter by category
        if (currentCategory !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.category === currentCategory);
        }
        
        // Filter by search term
        if (currentSearchTerm) {
            const searchTerm = currentSearchTerm.toLowerCase();
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(searchTerm) || 
                book.author.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filteredBooks.length === 0) {
            booksContainer.innerHTML = '<p class="no-books">No books found.</p>';
            return;
        }
        
        filteredBooks.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            
            const statusClass = book.status === 'available' ? 'status-available' : 'status-borrowed';
            const statusText = book.status === 'available' ? 'Available' : 'Borrowed';
            
            bookCard.innerHTML = `
                <div class="book-cover">
                    <span>${book.title.charAt(0)}</span>
                </div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p>by ${book.author}</p>
                    <p>${book.category}</p>
                    <span class="book-status ${statusClass}">${statusText}</span>
                </div>
                <div class="book-actions">
                    <button class="details-btn" data-id="${book.id}">Details</button>
                    ${book.status === 'available' ? 
                        `<button class="borrow-btn" data-id="${book.id}">Borrow</button>` : 
                        `<button class="return-btn" data-id="${book.id}">Return</button>`}
                </div>
            `;
            
            booksContainer.appendChild(bookCard);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', () => showBookDetails(btn.dataset.id));
        });
        
        document.querySelectorAll('.borrow-btn').forEach(btn => {
            btn.addEventListener('click', () => borrowBook(btn.dataset.id));
        });
        
        document.querySelectorAll('.return-btn').forEach(btn => {
            btn.addEventListener('click', () => returnBook(btn.dataset.id));
        });
    }
    
    // Show book details modal
    function showBookDetails(bookId) {
        const book = library.find(b => b.id === bookId);
        if (!book) return;
        
        const bookDetailsContent = document.getElementById('bookDetailsContent');
        const bookActions = document.getElementById('bookActions');
        
        document.getElementById('bookDetailsTitle').textContent = book.title;
        
        bookDetailsContent.innerHTML = `
            <div class="book-details-cover">
                <span>${book.title.charAt(0)}</span>
            </div>
            <div class="book-details-info">
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Category:</strong> ${book.category}</p>
                <p><strong>ISBN:</strong> ${book.isbn || 'N/A'}</p>
                <p><strong>Published Year:</strong> ${book.publishedYear || 'N/A'}</p>
                <p><strong>Status:</strong> <span class="${book.status === 'available' ? 'status-available' : 'status-borrowed'}">${book.status === 'available' ? 'Available' : 'Borrowed'}</span></p>
                ${book.status === 'borrowed' ? `
                    <p><strong>Borrowed By:</strong> ${book.borrowedBy}</p>
                    <p><strong>Borrowed Date:</strong> ${book.borrowedDate}</p>
                ` : ''}
            </div>
        `;
        
        bookActions.innerHTML = `
            ${book.status === 'available' ? 
                `<button class="btn-primary borrow-btn" data-id="${book.id}">Borrow Book</button>` : 
                `<button class="btn-primary return-btn" data-id="${book.id}">Return Book</button>`}
            <button class="btn-secondary edit-btn" data-id="${book.id}">Edit Details</button>
            <button class="btn-danger delete-btn" data-id="${book.id}">Delete Book</button>
        `;
        
        // Add event listeners to action buttons
        const borrowBtn = bookActions.querySelector('.borrow-btn');
        const returnBtn = bookActions.querySelector('.return-btn');
        const editBtn = bookActions.querySelector('.edit-btn');
        const deleteBtn = bookActions.querySelector('.delete-btn');
        
        if (borrowBtn) {
            borrowBtn.addEventListener('click', () => {
                borrowBook(bookId);
                bookDetailsModal.style.display = 'none';
            });
        }
        
        if (returnBtn) {
            returnBtn.addEventListener('click', () => {
                returnBook(bookId);
                bookDetailsModal.style.display = 'none';
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                editBook(bookId);
                bookDetailsModal.style.display = 'none';
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this book?')) {
                    deleteBook(bookId);
                    bookDetailsModal.style.display = 'none';
                }
            });
        }
        
        bookDetailsModal.style.display = 'block';
    }
    
    // Borrow a book
    function borrowBook(bookId) {
        const borrower = prompt('Enter borrower name:');
        if (!borrower) return;
        
        const bookIndex = library.findIndex(b => b.id === bookId);
        if (bookIndex === -1) return;
        
        const today = new Date().toISOString().split('T')[0];
        
        library[bookIndex].status = 'borrowed';
        library[bookIndex].borrowedBy = borrower;
        library[bookIndex].borrowedDate = today;
        
        // Add to history
        borrowingHistory.push({
            bookId: bookId,
            bookTitle: library[bookIndex].title,
            action: 'borrowed',
            by: borrower,
            date: today
        });
        
        saveToLocalStorage();
        renderBooks();
        updateStats();
    }
    
    // Return a book
    function returnBook(bookId) {
        const bookIndex = library.findIndex(b => b.id === bookId);
        if (bookIndex === -1) return;
        
        const today = new Date().toISOString().split('T')[0];
        
        library[bookIndex].status = 'available';
        
        // Add to history
        borrowingHistory.push({
            bookId: bookId,
            bookTitle: library[bookIndex].title,
            action: 'returned',
            by: library[bookIndex].borrowedBy,
            date: today
        });
        
        delete library[bookIndex].borrowedBy;
        delete library[bookIndex].borrowedDate;
        
        saveToLocalStorage();
        renderBooks();
        updateStats();
    }
    
    // Edit book details
    function editBook(bookId) {
        const book = library.find(b => b.id === bookId);
        if (!book) return;
        
        // Fill the add book form with existing data
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('category').value = book.category;
        document.getElementById('isbn').value = book.isbn || '';
        document.getElementById('publishedYear').value = book.publishedYear || '';
        
        // Change the form submit behavior to update instead of add
        addBookForm.onsubmit = function(e) {
            e.preventDefault();
            
            const updatedBook = {
                id: bookId,
                title: document.getElementById('title').value,
                author: document.getElementById('author').value,
                category: document.getElementById('category').value,
                isbn: document.getElementById('isbn').value,
                publishedYear: document.getElementById('publishedYear').value,
                status: book.status
            };
            
            if (book.status === 'borrowed') {
                updatedBook.borrowedBy = book.borrowedBy;
                updatedBook.borrowedDate = book.borrowedDate;
            }
            
            const bookIndex = library.findIndex(b => b.id === bookId);
            library[bookIndex] = updatedBook;
            
            saveToLocalStorage();
            renderBooks();
            addBookModal.style.display = 'none';
            addBookForm.reset();
            
            // Reset form submit behavior to add new book
            addBookForm.onsubmit = addNewBook;
        };
        
        addBookModal.style.display = 'block';
    }
    
    // Delete a book
    function deleteBook(bookId) {
        library = library.filter(book => book.id !== bookId);
        borrowingHistory = borrowingHistory.filter(record => record.bookId !== bookId);
        
        saveToLocalStorage();
        renderBooks();
        updateStats();
    }
    
    // Add new book
    function addNewBook(e) {
        e.preventDefault();
        
        const newBook = {
            id: generateId(),
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            category: document.getElementById('category').value,
            isbn: document.getElementById('isbn').value,
            publishedYear: document.getElementById('publishedYear').value,
            status: 'available'
        };
        
        library.push(newBook);
        
        saveToLocalStorage();
        renderBooks();
        updateStats();
        
        addBookModal.style.display = 'none';
        addBookForm.reset();
    }
    
    // Render borrowing history
    function renderHistory() {
        historyContainer.innerHTML = '';
        
        if (borrowingHistory.length === 0) {
            historyContainer.innerHTML = '<p>No borrowing history found.</p>';
            return;
        }
        
        // Sort history by date (newest first)
        const sortedHistory = [...borrowingHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedHistory.forEach(record => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const actionClass = record.action === 'borrowed' ? 'status-borrowed' : 'status-available';
            
            historyItem.innerHTML = `
                <p><strong>${record.bookTitle}</strong></p>
                <p><span class="${actionClass}">${record.action === 'borrowed' ? 'Borrowed' : 'Returned'}</span> by ${record.by}</p>
                <p>Date: ${record.date}</p>
            `;
            
            historyContainer.appendChild(historyItem);
        });
    }
    
    // Event Listeners
    searchBtn.addEventListener('click', () => {
        currentSearchTerm = searchInput.value.trim();
        renderBooks();
    });
    
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            currentSearchTerm = searchInput.value.trim();
            renderBooks();
        }
    });
    
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentCategory = item.dataset.category;
            renderBooks();
        });
    });
    
    addBookBtn.addEventListener('click', () => {
        addBookModal.style.display = 'block';
    });
    
    viewHistoryBtn.addEventListener('click', () => {
        renderHistory();
        historyModal.style.display = 'block';
    });
    
    addBookForm.addEventListener('submit', addNewBook);
    
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            modal.style.display = 'none';
            
            // Reset form if it's the add book modal
            if (modal.id === 'addBookModal') {
                addBookForm.reset();
                addBookForm.onsubmit = addNewBook;
            }
        });
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            
            // Reset form if it's the add book modal
            if (e.target.id === 'addBookModal') {
                addBookForm.reset();
                addBookForm.onsubmit = addNewBook;
            }
        }
    });
    
    // Initialize the app
    init();
});