// 从环境变量获取配置，如果没有设置则使用开发环境默认值
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
export const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || 'https://img-job.jimmyki.com';


export const STATUS_COLORS: { [key: string]: string } = {
    'applied': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'interviewing': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'offer': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'pending': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'accepted': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    'withdrawn': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

export const DEFAULT_STATUS_COLOR = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
