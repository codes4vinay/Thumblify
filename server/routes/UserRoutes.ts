import express from 'express';
import User from '../models/User.js';
import { getUserThumbnails , getThumbnailbyId } from '../controllers/UserController.js';
import { get } from 'node:http';
import { protect } from '../middlewares/auth.js';

const UserRouter = express.Router();

UserRouter.get('/thumbnails', protect, getUserThumbnails);
UserRouter.get('/thumbnail/:id', protect, getThumbnailbyId);

export default UserRouter;