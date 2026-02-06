const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", process.env.CLIENT_URL].filter(Boolean),
    credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/formbuilder')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

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
