
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiFetch from '../services/api';
import { Application, ApplicationInput, Resume } from '../types';
import { Card, Spinner, Button, Input, Select, Textarea } from '../components/ui';

const ApplicationDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isNew = !id;

    const [application, setApplication] = useState<Partial<ApplicationInput>>({
        company_name: '',
        position_title: '',
        status: 'applied',
        application_date: Math.floor(Date.now() / 1000),
    });
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchApplication = useCallback(async () => {
        if (id) {
            try {
                setLoading(true);
                const data = await apiFetch<Application>(`/api/applications/${id}`);
                setApplication(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load application.');
            } finally {
                setLoading(false);
            }
        }
    }, [id]);

    useEffect(() => {
        fetchApplication();
        const fetchResumes = async () => {
            try {
                const data = await apiFetch<Resume[]>('/api/resumes');
                setResumes(data);
            } catch (err) {
                console.error("Failed to load resumes");
            }
        };
        fetchResumes();
    }, [fetchApplication]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setApplication(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if(value) {
            setApplication(prev => ({...prev, [name]: Math.floor(new Date(value).getTime() / 1000)}))
        } else {
             setApplication(prev => ({...prev, [name]: undefined}))
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        
        // Remove empty fields
        const payload = Object.fromEntries(Object.entries(application).filter(([_, v]) => v != null && v !== ''));

        try {
            if (isNew) {
                await apiFetch<Application>('/api/applications', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            } else {
                await apiFetch<Application>(`/api/applications/${id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload),
                });
            }
            navigate('/applications');
        } catch (err: any) {
            setError(err.message || `Failed to save application.`);
        } finally {
            setSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            try {
                await apiFetch(`/api/applications/${id}`, { method: 'DELETE' });
                navigate('/applications');
            } catch (err: any) {
                setError(err.message || 'Failed to delete application.');
            }
        }
    };


    if (loading) return <Spinner />;
    if (error && !application) return <p className="text-red-500">{error}</p>;

    const toInputDate = (timestamp: number | undefined) => {
        if (!timestamp) return '';
        return new Date(timestamp * 1000).toISOString().split('T')[0];
    };
    
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{isNew ? 'Add New Application' : 'Edit Application'}</h1>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name *</label>
                            <Input id="company_name" name="company_name" value={application.company_name || ''} onChange={handleChange} required />
                        </div>
                        <div>
                            <label htmlFor="position_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position Title *</label>
                            <Input id="position_title" name="position_title" value={application.position_title || ''} onChange={handleChange} required />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <Select id="status" name="status" value={application.status || ''} onChange={handleChange}>
                                <option value="applied">Applied</option>
                                <option value="interviewing">Interviewing</option>
                                <option value="offer">Offer</option>
                                <option value="rejected">Rejected</option>
                                <option value="withdrawn">Withdrawn</option>
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="resume_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Resume Used</label>
                            <Select id="resume_id" name="resume_id" value={application.resume_id || ''} onChange={handleChange}>
                                <option value="">None</option>
                                {resumes.map(r => <option key={r.id} value={r.id}>{r.resume_name}</option>)}
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="application_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Application Date</label>
                            <Input type="date" id="application_date" name="application_date" value={toInputDate(application.application_date)} onChange={handleDateChange} />
                        </div>
                        <div>
                            <label htmlFor="interview_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interview Date</label>
                            <Input type="date" id="interview_date" name="interview_date" value={toInputDate(application.interview_date)} onChange={handleDateChange} />
                        </div>
                         <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                            <Input id="city" name="city" value={application.city || ''} onChange={handleChange} />
                        </div>
                         <div>
                            <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Salary Range</label>
                            <Input id="salary_range" name="salary_range" value={application.salary_range || ''} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                        <Textarea id="notes" name="notes" rows={4} value={application.notes || ''} onChange={handleChange} />
                    </div>

                    {error && <p className="text-red-500">{error}</p>}
                    
                    <div className="flex justify-end space-x-4">
                        {!isNew && <Button type="button" variant="danger" onClick={handleDelete}>Delete</Button>}
                        <Button type="button" variant="secondary" onClick={() => navigate('/applications')}>Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Application'}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ApplicationDetailPage;
