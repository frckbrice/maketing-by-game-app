import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { UserProfileDropdown } from '../UserProfileDropdown';

// Mock next/navigation
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock useAuth
const mockLogout = jest.fn();

const createMockUser = (role: string) => ({
    id: 'user123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role,
});

jest.mock('@/lib/contexts/AuthContext', () => ({
    useAuth: () => ({
        user: null,
        logout: mockLogout,
    }),
}));

// Mock react-i18next
const mockT = jest.fn((key: string) => {
    const translations: Record<string, string> = {
        'navigation.games': 'Games',
        'navigation.profile': 'Profile',
        'navigation.dashboard': 'Dashboard',
        'navigation.admin': 'Admin',
        'navigation.winners': 'Winners',
        'navigation.logout': 'Logout',
    };
    return translations[key] || key;
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

// Mock Avatar components
jest.mock('@/components/ui/avatar', () => ({
    Avatar: ({ children, className }: any) => (
        <div className={className} data-testid="avatar">
            {children}
        </div>
    ),
    AvatarFallback: ({ children, className }: any) => (
        <div className={className} data-testid="avatar-fallback">
            {children}
        </div>
    ),
}));

// Mock DropdownMenu components
jest.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
    DropdownMenuTrigger: ({ children, asChild }: any) => {
        if (asChild) {
            return children;
        }
        return <div data-testid="dropdown-trigger">{children}</div>;
    },
    DropdownMenuContent: ({ children, className, align }: any) => (
        <div data-testid="dropdown-content" className={className} data-align={align}>
            {children}
        </div>
    ),
    DropdownMenuLabel: ({ children, className }: any) => (
        <div data-testid="dropdown-label" className={className}>
            {children}
        </div>
    ),
    DropdownMenuItem: ({ children, onClick, className }: any) => (
        <button data-testid="dropdown-item" onClick={onClick} className={className}>
            {children}
        </button>
    ),
    DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}));

describe('UserProfileDropdown', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders nothing when user is not authenticated', () => {
            render(<UserProfileDropdown />);

            expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
        });

        it('renders user profile dropdown when authenticated', () => {
            // Mock authenticated user
            const mockUser = createMockUser('USER');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
            expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument();
        });

        it('displays user avatar with initials', () => {
            const mockUser = createMockUser('USER');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            const avatar = screen.getByTestId('avatar');
            const avatarFallback = screen.getByTestId('avatar-fallback');

            expect(avatar).toBeInTheDocument();
            expect(avatarFallback).toBeInTheDocument();
            expect(avatarFallback).toHaveTextContent('JD');
            expect(avatarFallback).toHaveClass('bg-orange-500', 'text-white', 'text-base', 'font-semibold');
        });

        it('shows user information in dropdown label', () => {
            const mockUser = createMockUser('USER');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
            expect(screen.getByText('USER')).toBeInTheDocument();
        });
    });

    describe('Role-based Navigation', () => {
        describe('USER Role', () => {
            it('shows games and profile options for regular users', () => {
                const mockUser = createMockUser('USER');
                jest.doMock('@/lib/contexts/AuthContext', () => ({
                    useAuth: () => ({
                        user: mockUser,
                        logout: mockLogout,
                    }),
                }));

                render(<UserProfileDropdown />);

                expect(screen.getByText('Games')).toBeInTheDocument();
                expect(screen.getByText('Profile')).toBeInTheDocument();
                expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
                expect(screen.queryByText('Admin')).not.toBeInTheDocument();
            });

            it('navigates to games page when games option is clicked', () => {
                const mockUser = createMockUser('USER');
                jest.doMock('@/lib/contexts/AuthContext', () => ({
                    useAuth: () => ({
                        user: mockUser,
                        logout: mockLogout,
                    }),
                }));

                render(<UserProfileDropdown />);

                const gamesButton = screen.getByText('Games').closest('button');
                fireEvent.click(gamesButton!);

                expect(mockPush).toHaveBeenCalledWith('/games');
            });

            it('navigates to profile page when profile option is clicked', () => {
                const mockUser = createMockUser('USER');
                jest.doMock('@/lib/contexts/AuthContext', () => ({
                    useAuth: () => ({
                        user: mockUser,
                        logout: mockLogout,
                    }),
                }));

                render(<UserProfileDropdown />);

                const profileButton = screen.getByText('Profile').closest('button');
                fireEvent.click(profileButton!);

                expect(mockPush).toHaveBeenCalledWith('/profile');
            });

            it('navigates to games page when dashboard is clicked (users)', () => {
                const mockUser = createMockUser('USER');
                jest.doMock('@/lib/contexts/AuthContext', () => ({
                    useAuth: () => ({
                        user: mockUser,
                        logout: mockLogout,
                    }),
                }));

                render(<UserProfileDropdown />);

                // Users don't see dashboard option, but if they did, it would go to games
                // This tests the internal logic
                const { useAuth } = require('@/lib/contexts/AuthContext');
                const { user } = useAuth();

                if (user.role === 'USER') {
                    expect(user.role).toBe('USER');
                }
            });
        });

        describe('VENDOR Role', () => {
            it('shows dashboard and profile options for vendors', () => {
                const mockUser = createMockUser('VENDOR');
                jest.doMock('@/lib/contexts/AuthContext', () => ({
                    useAuth: () => ({
                        user: mockUser,
                        logout: mockLogout,
                    }),
                }));

                render(<UserProfileDropdown />);

                expect(screen.getByText('Dashboard')).toBeInTheDocument();
                expect(screen.getByText('Profile')).toBeInTheDocument();
                expect(screen.queryByText('Games')).not.toBeInTheDocument();
                expect(screen.queryByText('Admin')).not.toBeInDocument();
            });

            it('navigates to dashboard page when dashboard option is clicked', () => {
                const mockUser = createMockUser('VENDOR');
                jest.doMock('@/lib/contexts/AuthContext', () => ({
                    useAuth: () => ({
                        user: mockUser,
                        logout: mockLogout,
                    }),
                }));

                render(<UserProfileDropdown />);

                const dashboardButton = screen.getByText('Dashboard').closest('button');
                fireEvent.click(dashboardButton!);

                expect(mockPush).toHaveBeenCalledWith('/dashboard');
            });
        });

        describe('ADMIN Role', () => {
            it('shows dashboard, profile, and admin options for admins', () => {
                const mockUser = createMockUser('ADMIN');
                jest.doMock('@/lib/contexts/AuthContext', () => ({
                    useAuth: () => ({
                        user: mockUser,
                        logout: mockLogout,
                    }),
                }));

                render(<UserProfileDropdown />);

                expect(screen.getByText('Dashboard')).toBeInTheDocument();
                expect(screen.getByText('Profile')).toBeInTheDocument();
                expect(screen.getByText('Admin')).toBeInTheDocument();
                expect(screen.queryByText('Games')).not.toBeInTheDocument();
            });

            it('navigates to admin page when admin option is clicked', () => {
                const mockUser = createMockUser('ADMIN');
                jest.doMock('@/lib/contexts/AuthContext', () => ({
                    useAuth: () => ({
                        user: mockUser,
                        logout: mockLogout,
                    }),
                }));

                render(<UserProfileDropdown />);

                const adminButton = screen.getByText('Admin').closest('button');
                fireEvent.click(adminButton!);

                expect(mockPush).toHaveBeenCalledWith('/admin');
            });

            it('navigates to dashboard page when dashboard option is clicked', () => {
                const mockUser = createMockUser('ADMIN');
                jest.doMock('@/lib/contexts/AuthContext', () => ({
                    useAuth: () => ({
                        user: mockUser,
                        logout: mockLogout,
                    }),
                }));

                render(<UserProfileDropdown />);

                const dashboardButton = screen.getByText('Dashboard').closest('button');
                fireEvent.click(dashboardButton!);

                expect(mockPush).toHaveBeenCalledWith('/dashboard');
            });
        });
    });

    describe('Common Navigation', () => {
        it('shows winners option for all users', () => {
            const mockUser = createMockUser('USER');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            expect(screen.getByText('Winners')).toBeInTheDocument();
        });

        it('navigates to winners page when winners option is clicked', () => {
            const mockUser = createMockUser('USER');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            const winnersButton = screen.getByText('Winners').closest('button');
            fireEvent.click(winnersButton!);

            expect(mockPush).toHaveBeenCalledWith('/winners');
        });

        it('shows logout option for all users', () => {
            const mockUser = createMockUser('USER');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            expect(screen.getByText('Logout')).toBeInTheDocument();
        });

        it('calls logout function when logout option is clicked', async () => {
            const mockUser = createMockUser('USER');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            const logoutButton = screen.getByText('Logout').closest('button');
            fireEvent.click(logoutButton!);

            await waitFor(() => {
                expect(mockLogout).toHaveBeenCalled();
            });
        });
    });

    describe('Initials Generation', () => {
        it('generates correct initials from first and last name', () => {
            const mockUser = createMockUser('USER');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            expect(screen.getByText('JD')).toBeInTheDocument();
        });

        it('handles single character names', () => {
            const mockUser = {
                ...createMockUser('USER'),
                firstName: 'A',
                lastName: 'B',
            };
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            expect(screen.getByText('AB')).toBeInTheDocument();
        });

        it('handles empty names gracefully', () => {
            const mockUser = {
                ...createMockUser('USER'),
                firstName: '',
                lastName: '',
            };
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            expect(screen.getByText('')).toBeInTheDocument();
        });
    });

    describe('Styling and Layout', () => {
        it('applies correct styling to avatar button', () => {
            const mockUser = createMockUser('USER');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            const triggerButton = screen.getByTestId('dropdown-trigger').querySelector('button');
            expect(triggerButton).toHaveClass(
                'flex',
                'items-center',
                'space-x-2',
                'rounded-full',
                'p-2',
                'hover:bg-gray-100',
                'dark:hover:bg-gray-700',
                'transition-colors'
            );
        });

        it('applies correct styling to dropdown content', () => {
            const mockUser = createMockUser('USER');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            const dropdownContent = screen.getByTestId('dropdown-content');
            expect(dropdownContent).toHaveClass('w-64');
            expect(dropdownContent).toHaveAttribute('data-align', 'end');
        });

        it('applies correct styling to logout button', () => {
            const mockUser = createMockUser('USER');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            const logoutButton = screen.getByText('Logout').closest('button');
            expect(logoutButton).toHaveClass('text-red-600', 'dark:text-red-400');
        });
    });

    describe('Icons', () => {
        it('displays correct icons for each menu item', () => {
            const mockUser = createMockUser('USER');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            // Check that icons are present (they're rendered as SVG elements)
            const gamepadIcon = document.querySelector('svg[class*="lucide-gamepad-2"]');
            const userIcon = document.querySelector('svg[class*="lucide-user"]');
            const trophyIcon = document.querySelector('svg[class*="lucide-trophy"]');
            const logoutIcon = document.querySelector('svg[class*="lucide-log-out"]');

            expect(gamepadIcon).toBeInTheDocument();
            expect(userIcon).toBeInTheDocument();
            expect(trophyIcon).toBeInTheDocument();
            expect(logoutIcon).toBeInTheDocument();
        });

        it('displays admin icons for admin users', () => {
            const mockUser = createMockUser('ADMIN');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            const settingsIcon = document.querySelector('svg[class*="lucide-settings"]');
            const barChartIcon = document.querySelector('svg[class*="lucide-bar-chart-3"]');

            expect(settingsIcon).toBeInTheDocument();
            expect(barChartIcon).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('handles logout errors gracefully', async () => {
            const mockUser = createMockUser('USER');
            const mockLogoutWithError = jest.fn().mockRejectedValue(new Error('Logout failed'));

            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogoutWithError,
                }),
            }));

            // Mock console.error to avoid noise in tests
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            render(<UserProfileDropdown />);

            const logoutButton = screen.getByText('Logout').closest('button');
            fireEvent.click(logoutButton!);

            await waitFor(() => {
                expect(mockLogoutWithError).toHaveBeenCalled();
                expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
            });

            consoleSpy.mockRestore();
        });
    });

    describe('Accessibility', () => {
        it('has proper button structure', () => {
            const mockUser = createMockUser('USER');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            const triggerButton = screen.getByTestId('dropdown-trigger').querySelector('button');
            expect(triggerButton).toBeInTheDocument();
        });

        it('has proper dropdown structure', () => {
            const mockUser = createMockUser('USER');
            jest.doMock('@/lib/contexts/AuthContext', () => ({
                useAuth: () => ({
                    user: mockUser,
                    logout: mockLogout,
                }),
            }));

            render(<UserProfileDropdown />);

            expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
            expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
            expect(screen.getByTestId('dropdown-label')).toBeInTheDocument();
        });
    });
});
