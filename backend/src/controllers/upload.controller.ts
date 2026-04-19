import { Request, Response } from 'express';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // req.file is populated by multer-storage-cloudinary
    // it contains the cloudinary URL and other info
    const file = req.file as any;
    
    res.json({
      message: 'Upload successful',
      url: file.path, // This is the Cloudinary URL
      public_id: file.filename,
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error });
  }
};
