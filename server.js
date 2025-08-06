// server.js
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware (optional)
app.use(bodyParser.json());



// Connect to MongoDB
mongoose.connect('mongodb+srv://roshantambe:ffV20J0VPaFRsKVp@cluster0.2daeeve.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('DB connection error:', err));

// Enable CORS (so Angular frontend can call backend)
app.use(cors({
   origin: 'http://localhost:4200', // Allow only this origin
  methods: ['POST'],               // Allow POST method
  allowedHeaders: ['Content-Type'] // Allow Content-Type header
  }
));

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', userSchema);
// Registration API
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});


// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Endpoint to upload and extract PDF text
app.post('/extract-pdf', upload.single('pdfFile'), async (req, res) => {
  try {
    const dataBuffer = req.file.buffer;
    const data = await pdfParse(dataBuffer);
    res.json({ text: data.text }); // Send extracted text back to frontend
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract PDF' });
  }
});



// Start server


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
