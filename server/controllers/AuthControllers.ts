import { Request, Response } from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

//Controller for user registration
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body; 

        //find user by email
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        } 

        //Encrypt password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        //setting user data in session
        req.session.isLoggedIn = true;
        req.session.userId = newUser._id.toString();

        return res.json({
            message: 'User registered successfully', user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
     } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }   
};

//Controller for user login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;   
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        req.session.isLoggedIn = true;
        req.session.userId = user._id.toString();

        return res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


//Controller for user logout
export const logoutUser = (req: Request, res: Response) => {
    req.session.destroy((err : any) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        return res.json({ message: 'Logout successful' });
    });
};


//Controller to veriify user 
export const verifyUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.session;
        
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};