'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/contexts/AuthContext';
import { currencyService } from '@/lib/api/currencyService';
import { useGameWinners } from '@/hooks/useApi';
import {
  Calendar,
  Crown,
  Download,
  Eye,
  Filter,
  Gift,
  Search,
  Trophy,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Winner {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  gameId: string;
  gameTitle: string;
  ticketNumber: string;
  prizeValue: number;
  prizeCurrency: string;
  prizeDescription: string;
  winDate: number;
  claimedDate?: number;
  status: 'PENDING' | 'CLAIMED' | 'EXPIRED';
  category: string;
  drawNumber: number;
}

export function AdminWinnersPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data: winners = [], isLoading: loadingWinners } = useGameWinners();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'PENDING' | 'CLAIMED' | 'EXPIRED'
  >('ALL');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && user && user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const handleExportWinners = async () => {
    try {
      const csvData = filteredWinners.map(winner => ({
        'Winner Name': winner.userName,
        'Winner Email': winner.userEmail,
        'Game Title': winner.gameTitle,
        'Ticket Number': winner.ticketNumber,
        'Prize Value': `${currencyService.formatCurrency(winner.prizeValue, winner.prizeCurrency)}`,
        'Prize Description': winner.prizeDescription,
        'Win Date': new Date(winner.winDate).toLocaleDateString(),
        Status: winner.status,
        Category: winner.category,
      }));

      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `winners-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Winners data exported successfully');
    } catch (error) {
      console.error('Error exporting winners:', error);
      toast.error('Failed to export winners data');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className='bg-yellow-500 text-white'>Pending Claim</Badge>
        );
      case 'CLAIMED':
        return <Badge className='bg-green-500 text-white'>Claimed</Badge>;
      case 'EXPIRED':
        return <Badge className='bg-red-500 text-white'>Expired</Badge>;
      default:
        return <Badge className='bg-gray-500 text-white'>Unknown</Badge>;
    }
  };

  const filteredWinners = winners.filter(winner => {
    const matchesSearch =
      winner.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.gameTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      winner.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || winner.status === statusFilter;

    let matchesDate = true;
    if (dateRange.from && dateRange.to) {
      const winDate = new Date(winner.winDate);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      matchesDate = winDate >= fromDate && winDate <= toDate;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPrizeValue = filteredWinners.reduce((sum, winner) => {
    return sum + winner.prizeValue;
  }, 0);

  if (!mounted) {
    return null;
  }

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className='min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-300'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0'>
            <div className='flex items-center space-x-4'>
              <div className='w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center'>
                <Trophy className='w-6 h-6 text-white' />
              </div>
              <div>
                <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white'>
                  Winners Management
                </h1>
                <p className='text-gray-600 dark:text-gray-400'>
                  Track and manage lottery winners and prize claims
                </p>
              </div>
            </div>

            <Button
              onClick={handleExportWinners}
              className='flex items-center space-x-2'
            >
              <Download className='w-4 h-4' />
              <span>Export Data</span>
            </Button>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <Card className='p-4 text-center'>
              <div className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white'>
                {winners.length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Total Winners
              </div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-xl sm:text-2xl font-bold text-yellow-600'>
                {winners.filter(w => w.status === 'PENDING').length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Pending Claims
              </div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-xl sm:text-2xl font-bold text-green-600'>
                {winners.filter(w => w.status === 'CLAIMED').length}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Claimed Prizes
              </div>
            </Card>
            <Card className='p-4 text-center'>
              <div className='text-xl sm:text-2xl font-bold text-orange-600'>
                ${totalPrizeValue.toLocaleString()}
              </div>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Total Prize Value
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className='p-4 mb-6'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <Label htmlFor='search'>Search</Label>
                <div className='relative'>
                  <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                  <Input
                    id='search'
                    type='text'
                    placeholder='Search winners...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-9'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='status'>Status</Label>
                <select
                  id='status'
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm'
                >
                  <option value='ALL'>All Status</option>
                  <option value='PENDING'>Pending</option>
                  <option value='CLAIMED'>Claimed</option>
                  <option value='EXPIRED'>Expired</option>
                </select>
              </div>

              <div>
                <Label htmlFor='dateFrom'>From Date</Label>
                <Input
                  id='dateFrom'
                  type='date'
                  value={dateRange.from}
                  onChange={e =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor='dateTo'>To Date</Label>
                <Input
                  id='dateTo'
                  type='date'
                  value={dateRange.to}
                  onChange={e =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                />
              </div>
            </div>

            <div className='flex justify-between items-center mt-4'>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Showing {filteredWinners.length} of {winners.length} winners
              </p>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setDateRange({ from: '', to: '' });
                }}
              >
                <Filter className='w-4 h-4 mr-2' />
                Clear Filters
              </Button>
            </div>
          </Card>
        </div>

        {/* Winners List */}
        {loadingWinners ? (
          <div className='text-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4'></div>
            <p className='text-gray-600 dark:text-gray-400'>
              Loading winners...
            </p>
          </div>
        ) : filteredWinners.length === 0 ? (
          <Card className='p-8 text-center'>
            <Trophy className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              No winners found
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              {winners.length === 0
                ? 'No winners have been recorded yet.'
                : 'No winners match your current filters.'}
            </p>
          </Card>
        ) : (
          <div className='space-y-4'>
            {filteredWinners.map(winner => (
              <Card key={winner.id} className='p-4 sm:p-6'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0'>
                  <div className='flex items-center space-x-4 flex-1'>
                    <div className='w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0'>
                      <Crown className='w-6 h-6 text-white' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-lg font-semibold text-gray-900 dark:text-white truncate'>
                        {winner.userName}
                      </h3>
                      <p className='text-sm text-gray-600 dark:text-gray-400 truncate'>
                        {winner.userEmail}
                      </p>
                      <div className='flex flex-wrap items-center gap-2 mt-2'>
                        {getStatusBadge(winner.status)}
                        <Badge variant='outline' className='text-xs'>
                          Ticket: {winner.ticketNumber}
                        </Badge>
                        <Badge variant='outline' className='text-xs'>
                          Draw #{winner.drawNumber}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-4 w-full sm:w-auto'>
                    <div className='text-right flex-1 sm:flex-initial'>
                      <div className='text-xl font-bold text-green-600'>
                        {currencyService.formatCurrency(
                          winner.prizeValue,
                          winner.prizeCurrency
                        )}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {new Date(winner.winDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm'>
                    <div className='flex items-center space-x-2'>
                      <Gift className='w-4 h-4 text-gray-400 flex-shrink-0' />
                      <span className='text-gray-600 dark:text-gray-400 truncate'>
                        {winner.gameTitle}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Trophy className='w-4 h-4 text-gray-400 flex-shrink-0' />
                      <span className='text-gray-600 dark:text-gray-400 truncate'>
                        {winner.prizeDescription}
                      </span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4 text-gray-400 flex-shrink-0' />
                      <span className='text-gray-600 dark:text-gray-400'>
                        {winner.category}
                      </span>
                    </div>
                    {winner.claimedDate && (
                      <div className='flex items-center space-x-2'>
                        <Users className='w-4 h-4 text-gray-400 flex-shrink-0' />
                        <span className='text-gray-600 dark:text-gray-400'>
                          Claimed:{' '}
                          {new Date(winner.claimedDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
