import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinaryUpload } from './cloudinary.config';


const removeExtension = (filename: string) => {
    return filename.split('.').slice(0, -1).join('.');
};

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: {
        public_id: (_req, file) => {
            try {
                const id = Math.random().toString(36).substring(2) +
                    '-' + Date.now() +
                    '-' + file.fieldname +
                    '-' + removeExtension(file.originalname);
                console.log('Generated public_id:', id);
                return id;
            } catch (error) {
                console.error('Error generating public_id:', error);
                throw error;
            }
        },
    },
});

export const multerUpload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        console.log('Incoming file:', file);
        // Accept images only
        if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
            console.log('Invalid file type:', file.mimetype);
            return cb(new Error('Only image files are allowed!'));
        }
        cb(null, true);
    }
});