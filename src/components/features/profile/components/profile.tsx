'use client';

import { Footer } from '@/components/globals/footer';
import { DesktopHeader } from '@/components/home/components/DesktopHeader';
import { MobileNavigation } from '@/components/home/components/MobileNavigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useUserTickets, useUserGames } from '@/hooks/useApi';
import type { LotteryGame, LotteryTicket } from '@/types';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Gamepad2,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export const ProfilePage = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  // TanStack Query hooks
  const { data: userTickets = [], isLoading: ticketsLoading } = useUserTickets(user?.id || '');
  const { data: userGames = [] } = useUserGames(user?.id || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [vendorApplication, setVendorApplication] = useState<any>(null);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const router = useRouter();

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (!loading && !user && !redirecting) {
      setRedirecting(true);
      router.push('/');
    }
  }, [user, loading, router, redirecting]);


  // Check vendor application status when user is logged in
  useEffect(() => {
    if (mounted && user && user.role === 'USER') {
      const checkVendorApplication = async () => {
        try {
          setCheckingApplication(true);
          console.log('Checking application status for user:', user.id);
          console.log('User object:', user);

          // First, let's check if the collection exists and what's in it
          try {
            const allApps = await firestoreService.getAllVendorApplications();
            console.log('All vendor applications in database:', allApps);

            // Find our specific application
            const userApp = allApps.find((app: any) => app.userId === user.id);
            console.log('Found user application:', userApp);
          } catch (error) {
            console.error('Error getting all applications:', error);
          }

          const app = await (firestoreService as any).getVendorApplication(
            user.id
          );
          console.log('Application result from getVendorApplication:', app);
          setVendorApplication(app);

          // If application exists and status changed, show notification
          if (app && app.status !== 'PENDING_VERIFICATION') {
            if (app.status === 'APPROVED') {
              toast.success('🎉 Your vendor application has been approved!');
            } else if (app.status === 'REJECTED') {
              toast.error(
                'Your vendor application was rejected. Check details below.'
              );
            }
          }
        } catch (error) {
          console.error('Error checking vendor application:', error);
        } finally {
          setCheckingApplication(false);
        }
      };
      checkVendorApplication();
    }
  }, [mounted, user]);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  if (loading || redirecting) {
    return (
      <div className='min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-300'>
            {redirecting ? t('common.redirecting') : t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
            {t('profile.accessDenied')}
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            {t('profile.pleaseLogin')}
          </p>
          <button
            onClick={() => router.push('/')}
            className='mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-md transition-colors'
          >
            {t('common.goHome')}
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalTickets = userTickets.length;
  const totalSpent = userTickets.reduce((sum, ticket) => sum + ticket.price, 0);
  const winningTickets = userTickets.filter(ticket => ticket.isWinner);
  const totalWinnings = winningTickets.reduce(
    (sum, ticket) => sum + (ticket.prizeAmount || 0),
    0
  );
  const uniqueGames = userGames.length;

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTickets = userTickets.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalTickets / pageSize);

  // Generate initials from first and last name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <>
      <div className='min-h-screen bg-white dark:bg-gray-900'>
        {/* Desktop Header */}
        <DesktopHeader
          isDark={isDark}
          onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
        />

        {/* Mobile Navigation */}
        <MobileNavigation
          isDark={isDark}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onThemeToggle={() => setTheme(isDark ? 'light' : 'dark')}
        />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Back Button and Vendor Application */}
          <div className='mb-6 flex justify-between items-center'>
            <Button
              variant='ghost'
              onClick={() => router.back()}
              className='flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            >
              <ArrowLeft className='h-4 w-4' />
              <span>{t('common.back')}</span>
            </Button>

            {/* Vendor Application Button - Only show for USER role */}
            {user.role === 'USER' && (
              <div className='mb-8'>
                {/* Dynamic vendor application button based on status */}
                {!vendorApplication ? (
                  <Button
                    onClick={() => router.push('/vendor-application')}
                    className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                  >
                    🏢 Apply to Become a Vendor
                  </Button>
                ) : vendorApplication.status === 'PENDING_VERIFICATION' ? (
                  <Button
                    disabled
                    className='bg-blue-500 text-white cursor-not-allowed'
                  >
                    <Clock className='w-4 h-4 mr-2' />
                    Application Under Review
                  </Button>
                ) : vendorApplication.status === 'APPROVED' ? (
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className='bg-green-500 hover:bg-green-600 text-white'
                  >
                    <CheckCircle className='w-4 h-4 mr-2' />
                    Access Vendor Dashboard
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push('/vendor-application')}
                    className='bg-red-500 hover:bg-red-600 text-white'
                  >
                    <XCircle className='w-4 h-4 mr-2' />
                    Reapply as Vendor
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Profile Header */}
          <div className='mb-8'>
            <div className='flex items-center space-x-6'>
              <Avatar className='h-24 w-24'>
                <AvatarFallback className='bg-orange-500 text-white text-2xl font-bold'>
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                  {user.firstName} {user.lastName}
                </h1>
                <p className='text-gray-600 dark:text-gray-300 text-lg'>
                  {user.email}
                </p>
                <p className='text-gray-500 dark:text-gray-400'>
                  {t('common.role')}: {user.role}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  {t('profile.totalTickets')}
                </CardTitle>
                <Gamepad2 className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent className='py-3'>
                <div className='text-xl font-bold'>{totalTickets}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  {t('profile.totalSpent')}
                </CardTitle>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent className='py-3'>
                <div className='text-xl font-bold'>
                  {formatCurrency(totalSpent)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  {t('profile.totalWinnings')}
                </CardTitle>
                <Trophy className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent className='py-3'>
                <div className='text-xl font-bold text-green-600'>
                  {formatCurrency(totalWinnings)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  {t('profile.gamesPlayed')}
                </CardTitle>
                <Calendar className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent className='py-3'>
                <div className='text-xl font-bold'>{uniqueGames}</div>
              </CardContent>
            </Card>
          </div>

          {/* Game History Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.gameHistory')}</CardTitle>
              <CardDescription>
                {t('profile.gameHistoryDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500'></div>
                </div>
              ) : userTickets.length === 0 ? (
                <div className='text-center py-8'>
                  <p className='text-gray-500 dark:text-gray-400'>
                    {t('profile.noTickets')}
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('profile.game')}</TableHead>
                        <TableHead>{t('profile.ticketNumber')}</TableHead>
                        <TableHead>{t('profile.purchaseDate')}</TableHead>
                        <TableHead>{t('profile.price')}</TableHead>
                        <TableHead>{t('profile.status')}</TableHead>
                        <TableHead>{t('profile.result')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTickets.map(ticket => {
                        const game = userGames.find(
                          g => g.id === ticket.gameId
                        );
                        return (
                          <TableRow key={ticket.id}>
                            <TableCell className='font-medium'>
                              {game?.title || t('profile.unknownGame')}
                            </TableCell>
                            <TableCell>{ticket.ticketNumber}</TableCell>
                            <TableCell>
                              {formatDate(ticket.purchaseDate)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(ticket.price, ticket.currency)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  ticket.status === 'ACTIVE'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {ticket.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {ticket.isWinner ? (
                                <Badge
                                  variant='default'
                                  className='bg-green-500'
                                >
                                  {t('profile.winner')} -{' '}
                                  {formatCurrency(
                                    ticket.prizeAmount || 0,
                                    ticket.currency
                                  )}
                                </Badge>
                              ) : (
                                <Badge variant='outline'>
                                  {t('profile.notWinner')}
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className='flex items-center justify-between mt-4'>
                      <div className='text-sm text-gray-500 dark:text-gray-400'>
                        {t('profile.showing')} {startIndex + 1}-
                        {Math.min(endIndex, totalTickets)} {t('profile.of')}{' '}
                        {totalTickets}
                      </div>
                      <div className='flex space-x-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            setCurrentPage(prev => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                        >
                          {t('common.previous')}
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() =>
                            setCurrentPage(prev =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          {t('common.next')}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Footer */}
      <Footer isDark={isDark} />
    </>
  );
};
