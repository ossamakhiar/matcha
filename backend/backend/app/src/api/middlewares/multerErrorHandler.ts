import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export function multerErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File size too large',
                message: 'File size must not exceed 5MB'
            });
        }
        
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Too many files',
                message: 'Maximum number of files exceeded'
            });
        }
        
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Unexpected field',
                message: 'Unexpected file field in upload'
            });
        }

        return res.status(400).json({
            error: 'File upload error',
            message: err.message
        });
    }
    
    next(err);
}
