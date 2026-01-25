import express from 'express'
import dotenv from 'dotenv'
import routes from './api/routers/index.js'
import cors from 'cors'
import createIoServer from './api/gateway/index.js';
import cookieParser from 'cookie-parser'
import fs from 'fs'
import passport from 'passport'
import { setupOauth } from './api/middlewares/oauthSetup.js'
import { Request, Response, NextFunction } from 'express'

dotenv.config();

const app = express();
console.log(process.env.API_PORT);
const API_PORT = process.env.API_PORT || 3000;

app.use(cors({ 
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true
}));


app.use(cookieParser());
app.use(express.json());
const uploadDir = './uploads';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

setupOauth(passport);
app.use(passport.initialize());

app.use(routes);

// Global error handler - must be after all routes
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error handler:', err);
    
    // Don't send response if headers already sent
    if (res.headersSent) {
        return next(err);
    }
    
    // Send a proper error response
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        error: 'Internal server error',
        message: err.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const http_server = app.listen(API_PORT, () => {
    console.log(`server listening on port ${API_PORT}`);
});

createIoServer(http_server);