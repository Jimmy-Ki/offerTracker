
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center px-4">
            <h1 className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400">404</h1>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Page Not Found</h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Sorry, we couldn’t find the page you’re looking for.
            </p>
            <div className="mt-6">
                <Link to="/dashboard">
                    <Button>
                        Go back home
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
