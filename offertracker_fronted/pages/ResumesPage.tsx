import React, { useState, useEffect, useCallback } from 'react';
import apiFetch from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
// FIX: Import API_BASE_URL from constants to fix reference error.
import { S3_BASE_URL, API_BASE_URL } from '../constants';
import { Resume } from '../types';
import { Card, Spinner, Button, Input } from '../components/ui';
import { Upload, Trash2, Download } from 'lucide-react';

const ResumesPage: React.FC = () => {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newResumeName, setNewResumeName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const { t } = useLanguage();

    const fetchResumes = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiFetch<Resume[]>('/api/resumes');
            setResumes(data);
        } catch (err: any) {
            setError(err.message || t('errors.generic'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResumes();
    }, [fetchResumes]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newResumeName || !file) {
            setError(t('resumes.uploadResumeError'));
            return;
        }
        setUploading(true);
        setError(null);

        try {
            // Step 1: Create resume record
            const createResponse = await apiFetch<{ id: string, file_url: string }>('/api/resumes', {
                method: 'POST',
                body: JSON.stringify({ resume_name: newResumeName }),
            });
            const { id } = createResponse;

            // Step 2: Upload file
            await fetch(`${API_BASE_URL}/api/resumes/${id}/file`, {
                 method: 'PUT',
                 headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': file.type,
                 },
                 body: file,
            });

            setNewResumeName('');
            setFile(null);
            // This is a bit of a hack to clear the file input
            const fileInput = document.getElementById('resume-file') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            await fetchResumes(); // Refresh list
        } catch (err: any) {
            setError(err.message || t('errors.generic'));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (resumeId: string) => {
        if (window.confirm(t('resumes.deleteConfirm'))) {
            try {
                await apiFetch(`/api/resumes/${resumeId}`, { method: 'DELETE' });
                await fetchResumes();
            } catch (err: any) {
                setError(err.message || t('errors.generic'));
            }
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('resumes.title')}</h1>
            
            <Card>
                <h2 className="text-xl font-semibold mb-4">{t('resumes.uploadResume')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="resume-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('resumes.resumeName')}</label>
                        <Input 
                            id="resume-name"
                            type="text"
                            value={newResumeName}
                            onChange={(e) => setNewResumeName(e.target.value)}
                            placeholder={t('resumes.resumeNamePlaceholder')}
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="resume-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('resumes.resumeFile')} ({t('resumes.fileTypes')})</label>
                         <Input 
                            id="resume-file"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" disabled={uploading}>
                        <Upload className="mr-2 h-5 w-5" />
                        {uploading ? t('resumes.uploading') : t('resumes.upload')}
                    </Button>
                </form>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold mb-4">{t('resumes.uploadedResumes')}</h2>
                {resumes.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {resumes.map(resume => (
                            <li key={resume.id} className="py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-md font-medium text-gray-900 dark:text-white">{resume.resume_name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('resumes.uploadedOn')} {new Date(resume.created_at * 1000).toLocaleDateString()}</p>
                                </div>
                                <div className="space-x-2">
                                    <a href={`${S3_BASE_URL}/${resume.file_url}`} target="_blank" rel="noopener noreferrer">
                                        <Button variant="secondary"><Download className="h-4 w-4" /></Button>
                                    </a>
                                    <Button variant="danger" onClick={() => handleDelete(resume.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">{t('resumes.noResumes')}</p>
                )}
            </Card>
        </div>
    );
};

export default ResumesPage;