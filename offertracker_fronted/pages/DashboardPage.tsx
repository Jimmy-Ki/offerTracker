
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiFetch from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { DashboardSummary } from '../types';
import { Card, Spinner } from '../components/ui';
import { Briefcase, Target, Clock, TrendingUp } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card>
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300">
                {icon}
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </Card>
);

const COLORS = ['#4F46E5', '#F59E0B', '#10B981', '#EF4444', '#6B7280'];

const DashboardPage: React.FC = () => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await apiFetch<DashboardSummary>('/api/dashboard/summary');
                setSummary(data);
            } catch (err: any) {
                setError(err.message || t('errors.generic'));
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) return <Spinner />;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!summary) return <p>{t('dashboard.noData')}</p>;

    const statusData = Object.entries(summary.status_distribution).map(([name, value]) => ({ name, value }));
    const cityData = Object.entries(summary.city_distribution).map(([name, value]) => ({ name, value }));
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('dashboard.totalApplications')} value={summary.total_applications} icon={<Briefcase size={24} />} />
                <StatCard title={t('dashboard.successRate')} value={`${summary.success_rate.toFixed(1)}%`} icon={<Target size={24} />} />
                <StatCard title={t('dashboard.avgResponseTime')} value={`${summary.average_response_time.toFixed(1)}${t('dashboard.days')}`} icon={<Clock size={24} />} />
                <StatCard title={t('dashboard.offers')} value={summary.status_distribution['offer'] || 0} icon={<TrendingUp size={24} />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-lg font-semibold mb-4">{t('dashboard.applicationStatus')}</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={statusData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                <Card>
                    <h2 className="text-lg font-semibold mb-4">{t('dashboard.topCities')}</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={cityData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#4F46E5" name="Applications" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
