import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });
import app from './app.js';
import connectDB from './db/database.js';

const PORT = 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to start server:', err.message);
    });