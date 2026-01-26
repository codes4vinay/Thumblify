import { createContext, useContext, useEffect, useState} from "react";
import type { IUser } from "../assets/assets";
import api from "../configs/api";
import toast from "react-hot-toast";

interface AuthContextProps{
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    user: IUser | null;
    setUser: (user: IUser | null) => void;
    login: (user: {email: string, password: string})=> Promise<void>;
    signUp: (user: { name: string, email: string, password: string }) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    user: null, 
    setUser: () => {},
    login: async () => {},
    signUp: async () => {},
    logout: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const signUp = async ({ name, email, password }: { name: string, email: string, password: string }) => {
        // Implementation for user signup
        try {
            const {data} = await api.post('/api/auth/register', { name, email, password });
            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
            }
            toast.success(data.message || 'Registration successful');
        } catch (error) {
            toast.error('Registration failed');
        }
    }

    const login = async ({ email, password }: { email: string, password: string }) => {
        // Implementation for user login
        try {
            const { data } = await api.post('/api/auth/login', { email, password });  
            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
            }
            toast.success(data.message || 'Login successful');
        } catch (error) {
            toast.error('Login failed');
        }
    }

    const logout = async () => {
        // Implementation for user logout
        try {
            const { data } = await api.post('/api/auth/logout');
            setUser(null);
            setIsLoggedIn(false);
            toast.success(data.message || 'Logout successful');
        } catch (error) {
            toast.error('Logout failed');
        }
    }

    const fetchUser = async () => {
        // Implementation for fetching user data
        try {
            const { data } = await api.get('/api/auth/verify');     
            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
            }   
        } catch (error) {
            setUser(null);
            setIsLoggedIn(false);
        }
    }
    
    useEffect(() => {
        (async () => {
            await fetchUser();
        })();
    }, []);

    const value = {
        user, setUser, isLoggedIn, setIsLoggedIn, login, signUp, logout
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
}