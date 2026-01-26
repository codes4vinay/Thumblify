import { Request, Response } from 'express';
import Thumbnail from '../models/Thumbnail.js';

//Controller to get All User thumbnails
export const getUserThumbnails = async (req: Request, res: Response) => {
    try {
        const { userId } = req.session;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const thumbnails = await Thumbnail.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({thumbnails});
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}


//Controller to get a single thumbnail by ID
export const getThumbnailbyId = async (req: Request, res: Response) => {
    try {
        const { userId } = req.session;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        const thumbnail = await Thumbnail.findOne({ _id: id, userId });
        if (!thumbnail) {
            return res.status(404).json({ message: "Thumbnail not found" });
        }
        res.status(200).json({thumbnail});
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}