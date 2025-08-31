'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDeleteGame, useGames, useUpdateGame } from '@/hooks/useApi';
import { currencyService } from '@/lib/api/currencyService';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { LotteryGame } from '@/types';
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Download,
  Edit,
  Filter,
  Gamepad2,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function AdminGamesPage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // TanStack Query hooks
  const { data: games, isLoading: gamesLoading, refetch: fetchGames } = useGames({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    status: statusFilter === 'all' ? '' : statusFilter
  });
  
  // Provide default values for games data
  const gamesData = games || {
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false
  };
  
  const updateGameMutation = useUpdateGame();
  const deleteGameMutation = useDeleteGame();
  const [selectedGame, setSelectedGame] = useState<LotteryGame | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<
    'DRAFT' | 'ACTIVE' | 'DRAWING' | 'CLOSED'
  >('ACTIVE');
  const [processing, setProcessing] = useState(false);


  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
  }, [user, loading, router]);

  const handleStatusChange = async () => {
    if (!selectedGame) return;

    setProcessing(true);
    try {
      // TODO: need to implement real data for update game status
      // await adminService.updateGameStatus(selectedGame.id, newStatus);
      toast.success(t('admin.gameStatusUpdated'));
      setShowStatusDialog(false);
      setSelectedGame(null);
      void fetchGames();
    } catch (error) {
      console.error('Error updating game status:', error);
      toast.error(t('admin.failedToUpdateGameStatus'));
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteGame = async () => {
    if (!selectedGame) return;

    setProcessing(true);
    try {
      // TODO: need to implement real data for delete game
      // await adminService.deleteGame(selectedGame.id);
      toast.success(t('admin.gameDeletedSuccessfully'));
      setShowDeleteDialog(false);
      setSelectedGame(null);
      void fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error(t('admin.failedToDeleteGame'));
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      DRAFT: 'secondary',
      ACTIVE: 'default',
      DRAWING: 'destructive',
      CLOSED: 'outline',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getTimeRemaining = (endDate: number) => {
    const diff = endDate - Date.now();
    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Header */}
      <div className='bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center'>
              <Button variant='ghost' size='sm' asChild className='mr-2'>
                <Link href='/admin'>
                  <ArrowLeft className='w-4 h-4' />
                </Link>
              </Button>
              <Gamepad2 className='w-8 h-8 text-orange-500 mr-3' />
              <div>
                <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
                  {t('admin.gamesManagement')}
                </h1>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  {t('admin.manageLotteryGames')}
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Button onClick={() => void fetchGames()} variant='outline' size='sm'>
                <RefreshCw className='w-4 h-4 mr-2' />
                {t('common.refresh')}
              </Button>
              <Button asChild size='sm'>
                <Link href='/admin/create-game'>
                  <Plus className='w-4 h-4 mr-2' />
                  {t('admin.createGame')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Filters */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <Input
                    placeholder='Search games by title...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='w-full md:w-48'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='DRAFT'>Draft</SelectItem>
                    <SelectItem value='ACTIVE'>Active</SelectItem>
                    <SelectItem value='DRAWING'>Drawing</SelectItem>
                    <SelectItem value='CLOSED'>Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => void fetchGames()}>
                <Filter className='w-4 h-4 mr-2' />
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Games Table */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Games ({gamesData.total})</span>
              <Button variant='outline' size='sm'>
                <Download className='w-4 h-4 mr-2' />
                {t('common.export')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gamesLoading ? (
              <div className='text-center py-12'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4'></div>
                <p className='text-gray-600 dark:text-gray-300'>
                  Loading games...
                </p>
              </div>
            ) : gamesData.data.length > 0 ? (
              <>
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Game</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Time Left</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gamesData.data.map(game => (
                        <TableRow key={game.id}>
                          <TableCell>
                            <div>
                              <p className='font-medium text-gray-900 dark:text-white'>
                                {game.title}
                              </p>
                              <p className='text-sm text-gray-500 dark:text-gray-400 truncate max-w-48'>
                                {game.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline'>
                              {game.category.name}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(game.status)}</TableCell>
                          <TableCell>
                            <div className='flex items-center'>
                              <Users className='w-4 h-4 text-gray-400 mr-1' />
                              <span className='text-sm'>
                                {game.currentParticipants}/
                                {game.maxParticipants}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center'>
                              <DollarSign className='w-4 h-4 text-gray-400 mr-1' />
                              <span className='text-sm font-medium'>
                                {currencyService.formatCurrency(
                                  game.currentParticipants * game.ticketPrice,
                                  game.currency
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center'>
                              <Calendar className='w-4 h-4 text-gray-400 mr-1' />
                              <span className='text-sm'>
                                {getTimeRemaining(game.endDate)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex items-center justify-end space-x-1'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                  setSelectedGame(game);
                                  setNewStatus(game.status);
                                  setShowStatusDialog(true);
                                }}
                              >
                                {game.status === 'ACTIVE' ? (
                                  <PauseCircle className='w-4 h-4' />
                                ) : (
                                  <PlayCircle className='w-4 h-4' />
                                )}
                              </Button>
                              <Button variant='ghost' size='sm' asChild>
                                <Link href={`/admin/games/${game.id}/edit`}>
                                  <Edit className='w-4 h-4' />
                                </Link>
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                  setSelectedGame(game);
                                  setShowDeleteDialog(true);
                                }}
                                className='text-red-600 hover:text-red-800'
                              >
                                <Trash2 className='w-4 h-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {gamesData.totalPages > 1 && (
                  <div className='flex items-center justify-between mt-6'>
                    <div className='text-sm text-gray-500 dark:text-gray-400'>
                      Showing {(gamesData.page - 1) * gamesData.pageSize + 1} to{' '}
                      {Math.min(
                        gamesData.page * gamesData.pageSize,
                        gamesData.total
                      )}{' '}
                      of {gamesData.total} games
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setCurrentPage(prev => Math.max(1, prev - 1))
                        }
                        disabled={!gamesData.hasPrevious}
                      >
                        <ChevronLeft className='w-4 h-4' />
                      </Button>
                      <span className='text-sm font-medium'>
                        Page {gamesData.page} of {gamesData.totalPages}
                      </span>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!gamesData.hasNext}
                      >
                        <ChevronRight className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className='text-center py-12'>
                <Gamepad2 className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                  No games found
                </h3>
                <p className='text-gray-500 dark:text-gray-400 mb-4'>
                  {searchTerm || statusFilter
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first game'}
                </p>
                <Button asChild>
                  <Link href='/admin/create-game'>
                    <Plus className='w-4 h-4 mr-2' />
                        {t('admin.createGame')}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Game</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedGame?.title}&quot;?
              This action cannot be undone. All associated tickets and data will
              be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowDeleteDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteGame}
              disabled={processing}
            >
              {processing ? 'Deleting...' : 'Delete Game'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Game Status</DialogTitle>
            <DialogDescription>
              Change the status of &quot;{selectedGame?.title}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <Select
              value={newStatus}
              onValueChange={value => setNewStatus(value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='DRAFT'>Draft</SelectItem>
                <SelectItem value='ACTIVE'>Active</SelectItem>
                <SelectItem value='DRAWING'>Drawing</SelectItem>
                <SelectItem value='CLOSED'>Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setShowStatusDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={processing}>
              {processing ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
