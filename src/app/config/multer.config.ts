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
    limits: { 
        fileSize: 20 * 1024 * 1024, // 20MB limit for AR models
        files: 11 // 10 images + 1 AR model
    },
    fileFilter: (req, file, cb) => {
        const allowedImageTypes = /^image\/(jpeg|png|gif|webp)$/;
        const allowedModelTypes = /^(model\/gltf-binary|model\/gltf\+json|application\/octet-stream)$/;
        
        if (file.fieldname === 'images' && !file.mimetype.match(allowedImageTypes)) {
            return cb(new Error('Only image files (JPEG, PNG, GIF, WEBP) are allowed for product images!'));
        }
        
        if (file.fieldname === 'arModel' && !file.mimetype.match(allowedModelTypes)) {
            return cb(new Error('Only GLB/GLTF 3D model files are allowed for AR models!'));
        }
        
        cb(null, true);
    }
});