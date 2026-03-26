import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { div } from "motion/react-client";

export default function Navbar() {
    const { isLoggedIn, user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            <motion.nav className="fixed top-0 z-50 flex items-center justify-between w-full py-4 px-6 md:px-16 lg:px-24 xl:px-32 backdrop-blur"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 250, damping: 70, mass: 1 }}
            >
                <Link to="/">
                    <img src="/logo.svg" alt="logo" className="h-8.5 w-auto" />
                </Link>

                <div className="hidden md:flex items-center gap-8 transition duration-500">
                    <Link to="/" className="hover:text-cyan-300 transition">Home</Link>
                    <Link to="/generate" className="hover:text-cyan-300 transition">Generate</Link>
                    {isLoggedIn ? <Link to="/my-generation" className="hover:text-cyan-300 transition">My Generations</Link> : <Link to="#" className="hover:text-cyan-300 transition">About</Link>}
                    <Link to="#" className="hover:text-cyan-300 transition">Conatct Us</Link>
                </div>
                <div className="flex items-center gap-2">
                    {isLoggedIn ? (
                        <div className="relative group">
                            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 border-2 border-white/10">
                                {user?.name.charAt(0).toUpperCase()}
                            </button>

                            <div className="absolute hidden group-hover:block top-6 right-0 pt-4">
                                <button onClick={() => logout()} className="px-5 py-1.5 bg-white/20 border-2 border-white/10 rounded">Logout</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="hidden md:block px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 transition-all rounded-full">
                            Get Started
                        </button>
                    )}
                    <button onClick={() => setIsOpen(true)} className="md:hidden">
                    <MenuIcon size={26} className="active:scale-90 transition" />
                </button>
                </div>
    
            </motion.nav>

            <div className={`fixed inset-0 z-100 bg-black/40 backdrop-blur flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-transform duration-400 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <Link onClick={() => setIsOpen(false)} to="/">Home</Link>
                <Link onClick={() => setIsOpen(false)} to="/generate">Generate</Link>
                {isLoggedIn ? <Link onClick={() => setIsOpen(false)} to="/my-generation">My Generations</Link> : <Link onClick={() => setIsOpen(false)} to="#">About</Link>}
                <Link onClick={() => setIsOpen(false)} to="#">Conatct Us</Link>
                {isLoggedIn ? (
                    <button onClick={() => { logout(); setIsOpen(false); }} className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:scale-95 transition-all rounded-full">
                        Logout
                    </button>
                ) : <Link onClick={() => setIsOpen(false)} to='/login'>Login</Link>}
                <button onClick={() => setIsOpen(false)} className="active:ring-3 active:ring-white aspect-square size-10 p-1 items-center justify-center bg-cyan-600 hover:bg-cyan-700 transition text-white rounded-md flex">
                    <XIcon />
                </button>
            </div>
        </>
    );
}
