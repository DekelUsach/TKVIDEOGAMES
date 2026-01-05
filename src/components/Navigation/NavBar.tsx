import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusSquare, User } from 'lucide-react';
import clsx from 'clsx';

export const NavBar: React.FC = () => {
    const getLinkClass = ({ isActive }: { isActive: boolean }) =>
        clsx(
            'flex flex-col items-center justify-center w-full h-full transition-colors duration-200',
            isActive ? 'text-[var(--color-accent-cyan)]' : 'text-gray-500 hover:text-gray-300'
        );

    return (
        <nav className="h-16 w-full border-t border-[var(--color-bg-secondary)] bg-[var(--color-bg-primary)] flex justify-around items-center absolute bottom-0 z-50">
            <NavLink to="/" className={getLinkClass}>
                <Home size={24} />
            </NavLink>
            <NavLink to="/create" className={getLinkClass}>
                <PlusSquare size={24} />
            </NavLink>
            <NavLink to="/profile" className={getLinkClass}>
                <User size={24} />
            </NavLink>
        </nav>
    );
};
