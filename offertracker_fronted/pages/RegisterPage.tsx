
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import apiFetch from '../services/api';
import { AuthResponse } from '../types';
import { Input, Button } from '../components/ui';
import { Compass } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t('auth.passwordsNotMatch'));
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            const data = await apiFetch<AuthResponse>('/api/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, confirmPassword }),
            });
            login(data.token, data.user);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || t('auth.registerFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-auto flex items-center justify-center text-indigo-600">
                        <Compass className="h-12 w-12" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        {t('auth.createAccount')}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                             <Input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('auth.email')}
                            />
                        </div>
                        <div className="pt-4">
                           <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t('auth.password')}
                            />
                        </div>
                         <div className="pt-4">
                           <Input
                                id="confirm-password"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={t('auth.confirmPassword')}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div>
                        <Button type="submit" disabled={isLoading} className="w-full justify-center">
                            {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
                        </Button>
                    </div>
                     <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        {t('auth.alreadyHaveAccount')}{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                           {t('auth.signIn')}
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
