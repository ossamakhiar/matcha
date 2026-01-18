import multer, { StorageEngine, FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';

const storage: StorageEngine = multer.diskStorage({
    destination: (request: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, 'uploads/'); // Specify the destination folder
    },
    filename: (request: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const userId = request.user.id;
        const userIdentifier = `user-${userId}-`;

        cb(null, userIdentifier + Date.now() + path.extname(file.originalname)); // Specify the filename
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    // fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
});

export default upload;
