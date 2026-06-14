const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


// MIDDLEWARE CONFIGURATION

app.use(cors());
app.use(express.json()); // Allows server to read incoming JSON packages


// MONGODB DATABASE CONNECTION LAYER

const directUri = process.env.MONGO_URI;

mongoose.connect(directUri)
    .then(() => console.log('🚀 Connected securely to MongoDB Cloud Vault!'))
    .catch(err => console.error('❌ Database connection failure:', err));

// Define the blueprint data schema for a Book entry
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    borrowDuration: { type: Number, default: null }
});

const BookModel = mongoose.model('Book', bookSchema);


// API ROUTING ENDPOINTS (CRUD Actions)

// 1. GET: Fetch all books stored in the cloud database
app.get('/api/books', async (req, res) => {
    try {
        const books = await BookModel.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. POST: Add a brand new book record to the cloud database
app.post('/api/books', async (req, res) => {
    try {
        const { title, author } = req.body;
        const newBook = new BookModel({ title, author });
        await newBook.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. PUT: Update availability status & assign borrow duration parameters
app.put('/api/books/:id', async (req, res) => {
    try {
        const book = await BookModel.findById(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });

        book.isAvailable = !book.isAvailable;
        book.borrowDuration = book.isAvailable ? null : req.body.days;
        
        await book.save();
        res.json(book);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 4. DELETE: Erase a book record completely from the cloud database
app.delete('/api/books/:id', async (req, res) => {
    try {
        const result = await BookModel.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ error: 'Book not found' });
        res.json({ success: true, message: 'Book deleted from cloud registry.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`📡 Backend Gateway Gateway Active on Port ${PORT}`);
});