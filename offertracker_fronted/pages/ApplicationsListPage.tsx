
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import apiFetch from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Application } from '../types';
import { Card, Spinner, StatusBadge, Button, Input } from '../components/ui';
import { PlusCircle } from 'lucide-react';

const ApplicationsListPage: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useLanguage();

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const data = await apiFetch<Application[]>('/api/applications');
                setApplications(data.sort((a, b) => b.last_update - a.last_update));
            } catch (err: any) {
                setError(err.message || t('errors.generic'));
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const filteredApplications = useMemo(() => {
        return applications.filter(app =>
            app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.position_title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [applications, searchTerm]);

    if (loading) return <Spinner />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('applications.title')}</h1>
                <Link to="/applications/new">
                    <Button>
                        <PlusCircle className="mr-2 h-5 w-5" />
                        {t('applications.addApplication')}
                    </Button>
                </Link>
            </div>
            
            <Card>
                <Input 
                    type="text"
                    placeholder={t('applications.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                />

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('applications.company')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('applications.position')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('applications.status')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('applications.lastUpdated')}</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('common.edit')}</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredApplications.length > 0 ? filteredApplications.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{app.company_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{app.position_title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={app.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(app.last_update * 1000).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/applications/${app.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">{t('applications.viewEdit')}</Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        {t('applications.noApplications')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ApplicationsListPage;
