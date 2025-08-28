
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';

const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();

    return (
        <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none lg:hidden">
                <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <button className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <UserIcon className="h-5 w-5" />
                        <span>{user?.email}</span>
                    </button>
                </div>
                 <button onClick={logout} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <LogOut className="h-5 w-5" />
                    <span>{t('common.logout')}</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
