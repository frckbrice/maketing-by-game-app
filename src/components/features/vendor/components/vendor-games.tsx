'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVendorGames } from '@/hooks/useApi';
import { useAuth } from '@/lib/contexts/AuthContext';
import type { LotteryGame, PaginatedResponse } from '@/types';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Edit,
  Eye,
  Filter,
  GamepadIcon,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function VendorGames() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'en';
  const { user } = useAuth();
  
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // TanStack Query hook
  const { data: gamesData = [], isLoading: loading, refetch } = useVendorGames(user?.id || '', { page: currentPage, limit: pageSize, status: statusFilter });
  const games = { data: gamesData, total: gamesData.length };

  useEffect(() => {
    if (user && (user.role === 'VENDOR' || user.role === 'ADMIN')) {
      loadGames();
    }
  }, [user, currentPage, statusFilter]);

  const loadGames = async () => {
    try {
      setLoading(true);
      const gamesData = await vendorService.getVendorGames(user!.id, {
        page: currentPage,
        limit: pageSize,
        status: statusFilter || undefined,
      });
      setGames(gamesData);
    } catch (error) {
      console.error('Error loading games:', error);
      // Set mock data for development
      setGames({
        data: [
          {
            id: '1',
            title: 'iPhone 15 Pro Max Contest',
            description: 'Win the latest iPhone 15 Pro Max with 256GB storage',
            type: 'daily',
            categoryId: 'tech',
            category: {
              id: 'tech',
              name: 'Tech & Phones',
              description: 'Latest technology products',
              color: '#2196F3',
              icon: '📱',
              isActive: true,
              sortOrder: 1,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ticketPrice: 5,
            currency: 'USD',
            maxParticipants: 500,
            currentParticipants: 456,
            totalPrizePool: 1200,
            totalTickets: 0,
            totalTicketsSold: 0,
            prizes: [
              {
                id: '1',
                name: 'iPhone 15 Pro Max',
                description: '256GB, Natural Titanium',
                type: 'product',
                value: 1200,
                currency: 'USD',
                image: `${locale}/images/iphone15promax.jpg`,
                quantity: 1,
                remaining: 1,
              },
            ],
            rules: [],
            images: [
              {
                id: '1',
                url: `${locale}/images/iphone15promax.jpg`,
                alt: 'iPhone 15 Pro Max',
                type: 'hero',
                order: 1,
              },
            ],
            startDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
            endDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
            drawDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
            status: 'ACTIVE',
            isActive: true,
            createdBy: user!.id,
            createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          },
          {
            id: '2',
            title: 'Nike Air Jordan Giveaway',
            description: 'Classic Nike Air Jordan sneakers',
            type: 'weekly',
            categoryId: 'fashion',
            category: {
              id: 'fashion',
              name: 'Fashion & Sneakers',
              description: 'Trendy fashion items',
              color: '#FF5722',
              icon: '👟',
              isActive: true,
              sortOrder: 2,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ticketPrice: 3,
            currency: 'USD',
            maxParticipants: 300,
            currentParticipants: 234,
            totalPrizePool: 180,
            totalTickets: 0,
            totalTicketsSold: 0,
            prizes: [
              {
                id: '2',
                name: 'Nike Air Jordan',
                description: 'Size 10, Red/Black colorway',
                type: 'product',
                value: 180,
                currency: 'USD',
                image: '/images/nikeairretro.webp',
                quantity: 1,
                remaining: 1,
              },
            ],
            rules: [],
            images: [
              {
                id: '2',
                url: '/images/nikeairretro.webp',
                alt: 'Nike Air Jordan',
                type: 'hero',
                order: 1,
              },
            ],
            startDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
            endDate: Date.now() + 4 * 24 * 60 * 60 * 1000,
            drawDate: Date.now() + 4 * 24 * 60 * 60 * 1000,
            status: 'DRAWING',
            isActive: true,
            createdBy: user!.id,
            createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          },
          {
            id: '3',
            title: 'MacBook Pro Bundle',
            description: 'MacBook Pro M3 with accessories',
            type: 'special',
            categoryId: 'tech',
            category: {
              id: 'tech',
              name: 'Tech & Phones',
              description: 'Latest technology products',
              color: '#2196F3',
              icon: '💻',
              isActive: true,
              sortOrder: 1,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ticketPrice: 15,
            currency: 'USD',
            maxParticipants: 200,
            currentParticipants: 0,
            totalPrizePool: 2500,
            totalTickets: 0,
            totalTicketsSold: 0,
            prizes: [
              {
                id: '3',
                name: 'MacBook Pro M3',
                description: '14-inch, 16GB RAM, 512GB SSD',
                type: 'product',
                value: 2500,
                currency: 'USD',
                image: `${locale}/images/macbookpro.jpg`,
                quantity: 1,
                remaining: 1,
              },
            ],
            rules: [],
            images: [
              {
                id: '3',
                url: `${locale}/images/macbookpro.jpg`,
                alt: 'MacBook Pro',
                type: 'hero',
                order: 1,
              },
            ],
            startDate: Date.now() + 1 * 24 * 60 * 60 * 1000,
            endDate: Date.now() + 8 * 24 * 60 * 60 * 1000,
            drawDate: Date.now() + 8 * 24 * 60 * 60 * 1000,
            status: 'DRAFT',
            isActive: false,
            createdBy: user!.id,
            createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          },
        ],
        total: 3,
        page: 1,
        pageSize: 12,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadGames();
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: <Badge className='bg-green-500 text-white'>Active</Badge>,
      PENDING: (
        <Badge className='bg-yellow-500 text-white'>Pending Approval</Badge>
      ),
      DRAWING: <Badge className='bg-blue-500 text-white'>Drawing</Badge>,
      CLOSED: <Badge className='bg-gray-500 text-white'>Closed</Badge>,
      DRAFT: <Badge className='bg-gray-400 text-white'>Draft</Badge>,
      REJECTED: <Badge className='bg-red-500 text-white'>Rejected</Badge>,
    };
    return badges[status as keyof typeof badges] || <Badge>Unknown</Badge>;
  };

  const getTimeRemaining = (endDate: number) => {
    const now = Date.now();
    const diff = endDate - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const filteredGames =
    games?.data.filter(
      game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse' />
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse'
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            {t('vendor.myGames')}
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Manage and track your lottery games
          </p>
        </div>
        <Button asChild>
          <Link href='/vendor-dashboard/create-game'>
            <Plus className='w-4 h-4 mr-2' />
            {t('vendor.createGame')}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <Input
                  placeholder='Search games...'
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
                  <SelectItem value=''>All Status</SelectItem>
                  <SelectItem value='ACTIVE'>Active</SelectItem>
                  <SelectItem value='PENDING'>Pending</SelectItem>
                  <SelectItem value='DRAWING'>Drawing</SelectItem>
                  <SelectItem value='CLOSED'>Closed</SelectItem>
                  <SelectItem value='DRAFT'>Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch}>
              <Filter className='w-4 h-4 mr-2' />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Games Grid */}
      {filteredGames.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredGames.map(game => (
            <Card
              key={game.id}
              className='overflow-hidden hover:shadow-lg transition-shadow'
            >
              <div className='aspect-video bg-gradient-to-r from-orange-400 to-red-500 p-6 text-white relative'>
                <div className='flex justify-between items-start mb-4'>
                  <div className='text-xs font-medium bg-white/20 px-2 py-1 rounded'>
                    {game.category.name}
                  </div>
                  {getStatusBadge(game.status)}
                </div>
                <div className='absolute bottom-4 left-6 right-6'>
                  <h3 className='text-lg font-bold truncate'>{game.title}</h3>
                  <p className='text-sm opacity-90 line-clamp-2'>
                    {game.description}
                  </p>
                </div>
              </div>

              <CardContent className='p-6'>
                <div className='space-y-4'>
                  {/* Stats */}
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div className='flex items-center text-gray-600 dark:text-gray-400'>
                      <DollarSign className='w-4 h-4 mr-1' />${game.ticketPrice}
                    </div>
                    <div className='flex items-center text-gray-600 dark:text-gray-400'>
                      <Users className='w-4 h-4 mr-1' />
                      {game.currentParticipants}/{game.maxParticipants}
                    </div>
                    <div className='flex items-center text-gray-600 dark:text-gray-400'>
                      <Clock className='w-4 h-4 mr-1' />
                      {getTimeRemaining(game.endDate)}
                    </div>
                    <div className='flex items-center text-gray-600 dark:text-gray-400'>
                      <Calendar className='w-4 h-4 mr-1' />
                      {new Date(game.drawDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className='flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1'>
                      <span>Participation</span>
                      <span>
                        {Math.round(
                          (game.currentParticipants / game.maxParticipants) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                      <div
                        className='bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full'
                        style={{
                          width: `${Math.min((game.currentParticipants / game.maxParticipants) * 100, 100)} % `,
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex space-x-2 pt-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1'
                      asChild
                    >
                      <Link href={`/vendor-dashboard/games/${game.id}`}>
                        <Eye className='w-4 h-4 mr-1' />
                        View
                      </Link>
                    </Button>
                    {(game.status === 'DRAFT' || game.status === 'CLOSED') && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1'
                        asChild
                      >
                        <Link
                          href={`/ vendor - dashboard / games / ${game.id} / edit`}
                        >
                          <Edit className='w-4 h-4 mr-1' />
                          Edit
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className='p-12 text-center'>
          <GamepadIcon className='w-16 h-16 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
            {searchTerm || statusFilter ? 'No games found' : 'No games yet'}
          </h3>
          <p className='text-gray-600 dark:text-gray-400 mb-6'>
            {searchTerm || statusFilter
              ? 'Try adjusting your search or filters'
              : 'Create your first game to start earning revenue.'}
          </p>
          {!searchTerm && !statusFilter && (
            <Button asChild>
              <Link href='/vendor-dashboard/create-game'>
                <Plus className='w-4 h-4 mr-2' />
                {t('vendor.createGame')}
              </Link>
            </Button>
          )}
        </Card>
      )}

      {/* Pagination */}
      {games && games.totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-500 dark:text-gray-400'>
            Showing {(games.page - 1) * games.pageSize + 1} to{' '}
            {Math.min(games.page * games.pageSize, games.total)} of{' '}
            {games.total} games
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!games.hasPrevious}
            >
              <ChevronLeft className='w-4 h-4' />
            </Button>
            <span className='text-sm font-medium'>
              Page {games.page} of {games.totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!games.hasNext}
            >
              <ChevronRight className='w-4 h-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
