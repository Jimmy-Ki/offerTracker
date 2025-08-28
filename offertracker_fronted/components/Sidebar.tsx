
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { LayoutDashboard, Briefcase, FileText, Settings, Compass } from 'lucide-react';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode }> = ({ to, icon, children }) => {
    const activeClass = 'bg-indigo-700 text-white';
    const inactiveClass = 'text-gray-300 hover:bg-indigo-500 hover:text-white';
    
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center px-4 py-2 mt-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`
            }
        >
            {icon}
            <span className="ml-3">{children}</span>
        </NavLink>
    );
};


const Sidebar: React.FC<{ isOpen: boolean; setIsOpen: (isOpen: boolean) => void }> = ({ isOpen, setIsOpen }) => {
    const { t } = useLanguage();
    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
            <div className={`fixed inset-y-0 left-0 bg-indigo-600 text-white w-64 px-4 py-6 z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="flex items-center justify-between">
                    <a href="#/dashboard" className="flex items-center text-white text-2xl font-semibold">
                       <Compass className="h-8 w-8 mr-2" />
                       <span>OfferTracker</span>
                    </a>
                </div>
                <nav className="mt-10">
                    <NavItem to="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />}>{t('navigation.dashboard')}</NavItem>
                    <NavItem to="/applications" icon={<Briefcase className="h-5 w-5" />}>{t('navigation.applications')}</NavItem>
                    <NavItem to="/resumes" icon={<FileText className="h-5 w-5" />}>{t('navigation.resumes')}</NavItem>
                    <NavItem to="/settings" icon={<Settings className="h-5 w-5" />}>{t('navigation.settings')}</NavItem>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
