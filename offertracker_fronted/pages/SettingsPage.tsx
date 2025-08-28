
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui';
import { User, Mail, Award } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    if (!user) {
        return <p>{t('common.loading')}</p>;
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
            
            <Card>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">{t('settings.myProfile')}</h2>
                <div className="space-y-4">
                    <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.email')}</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                    </div>
                     <div className="flex items-center">
                        <Award className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.currentPlan')}</p>
                            <p className="font-medium capitalize">{user.plan_type}</p>
                        </div>
                    </div>
                     <div className="flex items-center">
                        <User className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.memberSince')}</p>
                            <p className="font-medium">{new Date(user.created_at * 1000).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SettingsPage;
