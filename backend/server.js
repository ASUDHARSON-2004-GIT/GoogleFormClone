const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://google-form-clone-black.vercel.app",
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Middleware
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/formbuilder';
console.log('Attempting to connect to MongoDB...');

const connectDB = async () => {
    try {
        console.log('Targeting database: GoogleFormClone');
        await mongoose.connect(mongoURI, {
            dbName: 'GoogleFormClone',
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error details:');
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        if (err.message.includes('QUERY_METADATA_TIMEOUT') || err.message.includes('timeout')) {
            console.log('Hint: Check if your MongoDB Atlas IP Whitelist allows access (0.0.0.0/0).');
        }
    }
};

connectDB();

// Monitor connection
mongoose.connection.on('error', err => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/forms', require('./routes/forms'));
app.use('/api/responses', require('./routes/responses'));

app.get('/', (req, res) => {
    res.send('Form Builder API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
