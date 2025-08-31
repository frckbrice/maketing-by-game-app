import { BarChart3, Building2, DollarSign, FileText, Gamepad2, Settings, Shield, ShoppingBag, Tag, TrendingUp, Users } from "lucide-react";
import { AdminUser, NavItem, Permission } from "./type";

// Mock data removed - production ready
// All data now fetched from Firebase/API


// admin permissions
export const ADMIN_PERMISSIONS = [
    { id: 'USERS', label: 'User Management', description: 'Manage user accounts and profiles' },
    { id: 'GAMES', label: 'Game Management', description: 'Create and manage lottery games' },
    { id: 'VENDORS', label: 'Vendor Management', description: 'Manage vendor applications and accounts' },
    { id: 'ANALYTICS', label: 'Analytics', description: 'View reports and analytics' },
    { id: 'SETTINGS', label: 'System Settings', description: 'Configure system settings' },
    { id: 'PAYMENTS', label: 'Payment Management', description: 'Handle payment transactions' },
  ];

//   analytics data
export const COLORS = [
    '#f97316',
    '#ef4444',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#f59e0b',
    '#06b6d4',
  ];
  
// Mock notifications removed - production ready
// All notifications now fetched from Firebase/API

// admin roles data
export const DEFAULT_PERMISSIONS: Permission[] = [
    // User Management
    { id: 'users.read', name: 'View Users', description: 'View user profiles and lists', category: 'User Management' },
    { id: 'users.create', name: 'Create Users', description: 'Create new user accounts', category: 'User Management' },
    { id: 'users.update', name: 'Update Users', description: 'Edit user profiles and settings', category: 'User Management' },
    { id: 'users.delete', name: 'Delete Users', description: 'Delete or deactivate user accounts', category: 'User Management' },
    { id: 'users.ban', name: 'Ban Users', description: 'Ban or suspend user accounts', category: 'User Management' },
    
    // Game Management
    { id: 'games.read', name: 'View Games', description: 'View game details and lists', category: 'Game Management' },
    { id: 'games.create', name: 'Create Games', description: 'Create new lottery games', category: 'Game Management' },
    { id: 'games.update', name: 'Update Games', description: 'Edit game settings and details', category: 'Game Management' },
    { id: 'games.delete', name: 'Delete Games', description: 'Delete or archive games', category: 'Game Management' },
    { id: 'games.publish', name: 'Publish Games', description: 'Publish games and make them active', category: 'Game Management' },
    { id: 'games.moderate', name: 'Moderate Games', description: 'Approve or reject vendor games', category: 'Game Management' },
    
    // Financial
    { id: 'payments.read', name: 'View Payments', description: 'View payment transactions', category: 'Financial' },
    { id: 'payments.refund', name: 'Process Refunds', description: 'Issue refunds and adjustments', category: 'Financial' },
    { id: 'reports.financial', name: 'Financial Reports', description: 'Access financial reports and analytics', category: 'Financial' },
    
    // Content Management
    { id: 'categories.manage', name: 'Manage Categories', description: 'Create and edit game categories', category: 'Content Management' },
    { id: 'winners.manage', name: 'Manage Winners', description: 'Manage winner announcements', category: 'Content Management' },
    { id: 'notifications.send', name: 'Send Notifications', description: 'Send system notifications', category: 'Content Management' },
    
    // System Administration
    { id: 'settings.read', name: 'View Settings', description: 'View system settings', category: 'System Administration' },
    { id: 'settings.update', name: 'Update Settings', description: 'Modify system configuration', category: 'System Administration' },
    { id: 'roles.manage', name: 'Manage Roles', description: 'Create and edit user roles', category: 'System Administration' },
    { id: 'analytics.read', name: 'View Analytics', description: 'Access system analytics and reports', category: 'System Administration' },
  ];
  
  export const SYSTEM_ROLES = [
    {
      id: 'USER',
      name: 'USER',
      displayName: 'User',
      description: 'Standard user with basic permissions',
      permissions: ['games.read'],
      isSystem: true,
      isActive: true,
    },
    {
      id: 'VENDOR',
      name: 'VENDOR', 
      displayName: 'Vendor',
      description: 'Vendor with game creation permissions',
      permissions: ['games.read', 'games.create', 'games.update'],
      isSystem: true,
      isActive: true,
    },
    {
      id: 'ADMIN',
      name: 'ADMIN',
      displayName: 'Administrator',
      description: 'Full administrative access',
      permissions: DEFAULT_PERMISSIONS.map(p => p.id),
      isSystem: true,
      isActive: true,
    },
  ];

  export const DEFAULT_NAV_ITEMS: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
    },
    {
      title: 'Games',
      href: '/admin/games',
      icon: Gamepad2,
      children: [
        { title: 'All Games', href: '/admin/games', icon: Gamepad2 },
        { title: 'Create Game', href: '/admin/create-game', icon: Gamepad2 },
        { title: 'Categories', href: '/admin/categories', icon: Tag },
      ],
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: Users,
      children: [
        { title: 'All Users', href: '/admin/users', icon: Users },
        { title: 'Vendors', href: '/admin/vendors', icon: ShoppingBag },
        { title: 'Admins', href: '/admin/admins', icon: Shield },
      ],
    },
    {
      title: 'Vendor Applications',
      href: '/admin/vendor-applications',
      icon: Building2,
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      children: [
        { title: 'Overview', href: '/admin/analytics', icon: TrendingUp },
        { title: 'Revenue', href: '/admin/analytics/revenue', icon: DollarSign },
        { title: 'User Behavior', href: '/admin/analytics/users', icon: Users },
      ],
    },
    {
      title: 'Reports',
      href: '/admin/reports',
      icon: FileText,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];