'use client';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
    Calendar,
    Edit,
    Eye,
    Plus,
    Search,
    Send,
    Trash2,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';


interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'DRAFT' | 'SENT' | 'SCHEDULED' | 'FAILED';
    targetAudience: 'ALL' | 'USERS' | 'VENDORS' | 'ADMINS' | 'SPECIFIC';
    recipients: string[];
    scheduledFor?: Date;
    sentAt?: Date;
    createdAt: Date;
    createdBy: string;
    readCount: number;
    totalRecipients: number;
}

export function AdminNotificationsPage() {
    const { t } = useTranslation();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [filters, setFilters] = useState({
        type: 'ALL',
        priority: 'ALL',
        status: 'ALL',
        targetAudience: 'ALL',
        search: '',
    });

    // Mock data - replace with actual API calls
    const mockNotifications: Notification[] = useMemo(() => [
        {
            id: '1',
            title: 'System Maintenance',
            message: 'Scheduled maintenance on Sunday at 2 AM UTC',
            type: 'INFO',
            priority: 'MEDIUM',
            status: 'SENT',
            targetAudience: 'ALL',
            recipients: ['all-users'],
            sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            createdBy: 'admin-1',
            readCount: 1250,
            totalRecipients: 1500,
        },
        {
            id: '2',
            title: 'New Feature Available',
            message: 'Check out our new lottery game types!',
            type: 'SUCCESS',
            priority: 'LOW',
            status: 'SENT',
            targetAudience: 'USERS',
            recipients: ['active-users'],
            sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
            createdBy: 'admin-1',
            readCount: 890,
            totalRecipients: 1200,
        },
    ], []);

    // Filter notifications based on current filters
    const filteredNotifications = useMemo(() => {
        return mockNotifications.filter(notification => {
            if (filters.type !== 'ALL' && notification.type !== filters.type) return false;
            if (filters.priority !== 'ALL' && notification.priority !== filters.priority) return false;
            if (filters.status !== 'ALL' && notification.status !== filters.status) return false;
            if (filters.targetAudience !== 'ALL' && notification.targetAudience !== filters.targetAudience) return false;
            if (filters.search && !notification.title.toLowerCase().includes(filters.search.toLowerCase()) &&
                !notification.message.toLowerCase().includes(filters.search.toLowerCase())) return false;
            return true;
        });
    }, [mockNotifications, filters]);

    // Simple pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // Paginated notifications
    const paginatedNotifications = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredNotifications.slice(startIndex, endIndex);
    }, [filteredNotifications, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredNotifications.length / pageSize);

    // Auth protection
    useEffect(() => {
        if (!loading && (!user || user?.role !== 'ADMIN')) {
            router.push('/en/auth/login');
        }
    }, [user, loading, router]);

    // Handle notification actions
    const handleSendNotification = useCallback(async (notification: Notification) => {
        try {
            console.log('Sending notification:', notification.id);
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }, []);

    const handleDeleteNotification = useCallback(async (id: string) => {
        try {
            console.log('Deleting notification:', id);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }, []);

    const handleCreateNotification = useCallback(async (notificationData: Partial<Notification>) => {
        try {
            console.log('Creating notification:', notificationData);
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    // Not authenticated
    if (!user || user?.role !== 'ADMIN') {
        return null;
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'INFO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'WARNING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'ERROR': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'SUCCESS': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'LOW': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            case 'MEDIUM': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            case 'URGENT': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            case 'SENT': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'SCHEDULED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'FAILED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {t('admin.notifications.title', 'Notifications Management')}
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                {t('admin.notifications.description', 'Manage system notifications and announcements')}
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create New
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Type
                            </label>
                            <Select
                                value={filters.type}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                            >
                                <option value="ALL">All Types</option>
                                <option value="INFO">Info</option>
                                <option value="WARNING">Warning</option>
                                <option value="ERROR">Error</option>
                                <option value="SUCCESS">Success</option>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Priority
                            </label>
                            <Select
                                value={filters.priority}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
                            >
                                <option value="ALL">All Priorities</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="DRAFT">Draft</option>
                                <option value="SENT">Sent</option>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="FAILED">Failed</option>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Audience
                            </label>
                            <Select
                                value={filters.targetAudience}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, targetAudience: value }))}
                            >
                                <option value="ALL">All Audiences</option>
                                <option value="USERS">Users</option>
                                <option value="VENDORS">Vendors</option>
                                <option value="ADMINS">Admins</option>
                                <option value="SPECIFIC">Specific</option>
                            </Select>
                        </div>

                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Search notifications..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Notifications List */}
                <div className="space-y-4">
                    {paginatedNotifications.map((notification: Notification) => (
                        <Card key={notification.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {notification.title}
                                        </h3>
                                        <Badge className={getTypeColor(notification.type)}>
                                            {notification.type}
                                        </Badge>
                                        <Badge className={getPriorityColor(notification.priority)}>
                                            {notification.priority}
                                        </Badge>
                                        <Badge className={getStatusColor(notification.status)}>
                                            {notification.status}
                                        </Badge>
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {notification.message}
                                    </p>

                                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center space-x-1">
                                            <Users className="w-4 h-4" />
                                            <span>{notification.readCount}/{notification.totalRecipients} read</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{notification.createdAt.toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    {notification.status === 'DRAFT' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSendNotification(notification)}
                                            className="text-green-600 border-green-600 hover:bg-green-50"
                                        >
                                            <Send className="w-4 h-4 mr-1" />
                                            Send
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedNotification(notification);
                                            setShowViewModal(true);
                                        }}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedNotification(notification)}
                                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteNotification(notification.id)}
                                        className="text-red-600 border-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>

                            <span className="text-gray-600 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                            </span>

                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                {/* Create Notification Modal */}
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Notification</DialogTitle>
                        </DialogHeader>
                        <CreateNotificationForm onSubmit={handleCreateNotification} />
                    </DialogContent>
                </Dialog>

                {/* View Notification Modal */}
                <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>View Notification</DialogTitle>
                        </DialogHeader>
                        {selectedNotification && (
                            <ViewNotificationForm notification={selectedNotification} />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

// Create Notification Form Component
function CreateNotificationForm({ onSubmit }: { onSubmit: (data: Partial<Notification>) => void }) {
    const [formData, setFormData] = useState<{
        title: string;
        message: string;
        type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
        priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
        targetAudience: 'ALL' | 'USERS' | 'VENDORS' | 'ADMINS' | 'SPECIFIC';
        scheduledFor: string;
        immediate: boolean;
    }>({
        title: '',
        message: '',
        type: 'INFO',
        priority: 'MEDIUM',
        targetAudience: 'ALL',
        scheduledFor: '',
        immediate: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submissionData: Partial<Notification> = {
            ...formData,
            scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor) : undefined,
        };
        onSubmit(submissionData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                </label>
                <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                </label>
                <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                    </label>
                    <Select
                        value={formData.type}
                        onValueChange={(value: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS') => setFormData(prev => ({ ...prev, type: value }))}
                    >
                        <option value="INFO">Info</option>
                        <option value="WARNING">Warning</option>
                        <option value="ERROR">Error</option>
                        <option value="SUCCESS">Success</option>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                    </label>
                    <Select
                        value={formData.priority}
                        onValueChange={(value: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </Select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Audience
                </label>
                <Select
                    value={formData.targetAudience}
                    onValueChange={(value: 'ALL' | 'USERS' | 'VENDORS' | 'ADMINS' | 'SPECIFIC') => setFormData(prev => ({ ...prev, targetAudience: value }))}
                >
                    <option value="ALL">All Audiences</option>
                    <option value="USERS">Users</option>
                    <option value="VENDORS">Vendors</option>
                    <option value="ADMINS">Admins</option>
                </Select>
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    checked={formData.immediate}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, immediate: checked }))}
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                    Send immediately
                </label>
            </div>

            {!formData.immediate && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Scheduled For
                    </label>
                    <Input
                        type="datetime-local"
                        value={formData.scheduledFor}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                    />
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                    Create Notification
                </Button>
            </div>
        </form>
    );
}

// View Notification Form Component
function ViewNotificationForm({ notification }: { notification: Notification }) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                </label>
                <p className="text-gray-900 dark:text-white font-medium">{notification.title}</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                </label>
                <p className="text-gray-900 dark:text-white">{notification.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                    </label>
                    <p className="text-gray-900 dark:text-white">{notification.type}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                    </label>
                    <p className="text-gray-900 dark:text-white">{notification.priority}</p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Audience
                </label>
                <p className="text-gray-900 dark:text-white">{notification.targetAudience}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Read Count
                    </label>
                    <p className="text-gray-900 dark:text-white">{notification.readCount}/{notification.totalRecipients}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Created At
                    </label>
                    <p className="text-gray-900 dark:text-white">{notification.createdAt.toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}
