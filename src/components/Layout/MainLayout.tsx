import React, { type ReactNode } from 'react';
import { NavBar } from '../Navigation/NavBar';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalModal } from '../UI/GlobalModal';
import { ToastContainer } from '../UI/Toast';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="w-full h-screen bg-black text-white flex flex-col">
            <Header />
            <div className="flex flex-1 pt-[60px] overflow-hidden">
                <Sidebar />
                <main className="flex-1 relative overflow-hidden bg-black">
                    {children}
                </main>
            </div>
            {/* Mobile Nav Only */}
            <div className="md:hidden">
                <NavBar />
            </div>

            {/* Global UI Components */}
            <GlobalModal />
            <ToastContainer />
        </div>
    );
};
