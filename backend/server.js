const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');

dotenv.config();

const app = express();

// Logger middleware
const logs = [];
const MAX_LOGS = 50; // Keep only last 50 logs

const loggerMiddleware = (req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();
    
    // Log when request starts
    const logEntry = {
        id: Date.now(),
        timestamp,
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown'
    };
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        logEntry.statusCode = res.statusCode;
        logEntry.responseTime = duration;
        logEntry.completedAt = new Date().toISOString();
        
        logs.unshift(logEntry); // Add to beginning of array
        
        // Keep only last MAX_LOGS entries
        if (logs.length > MAX_LOGS) {
            logs.splice(MAX_LOGS);
        }
        
        // Console log for debugging
        console.log(`[${logEntry.timestamp}] ${logEntry.method} ${logEntry.url} - ${logEntry.statusCode} (${duration}ms)`);
    });
    
    next();
};

// Apply logger middleware to all routes
app.use(loggerMiddleware);

app.use(cors());
app.use(express.json());

app.use('/api/students', studentRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Student CRUD API (Redis)' });
});

// Add endpoint to get logs
app.get('/api/logs', (req, res) => {
    res.json({
        logs: logs.slice(0, 20), // Return last 20 logs
        totalLogs: logs.length,
        lastUpdated: new Date().toISOString()
    });
});

app.listen(3000, () => console.log("Server STARTED"))

const PORT = process.env.PORT || 3000;

const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

start();