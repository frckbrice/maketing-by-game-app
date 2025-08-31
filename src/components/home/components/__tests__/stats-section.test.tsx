import { render, screen } from '@testing-library/react';
import { StatsSection } from '../stats-section';

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                'home.stats.totalUsers': 'Total Users',
                'home.stats.totalGames': 'Total Games',
                'home.stats.totalWinners': 'Total Winners',
            };
            return translations[key] || key;
        },
    }),
}));

// Mock the constants
jest.mock('@/lib/constants', () => ({
    HOME_STATS: [
        { number: '10,000+', labelKey: 'home.stats.totalUsers' },
        { number: '500+', labelKey: 'home.stats.totalGames' },
        { number: '1,000+', labelKey: 'home.stats.totalWinners' },
    ],
}));

describe('StatsSection', () => {
    it('renders with light theme', () => {
        render(<StatsSection isDark={false} />);

        expect(screen.getByText('10,000+')).toBeInTheDocument();
        expect(screen.getByText('500+')).toBeInTheDocument();
        expect(screen.getByText('1,000+')).toBeInTheDocument();
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('Total Games')).toBeInTheDocument();
        expect(screen.getByText('Total Winners')).toBeInTheDocument();
    });

    it('renders with dark theme', () => {
        render(<StatsSection isDark={true} />);

        expect(screen.getByText('10,000+')).toBeInTheDocument();
        expect(screen.getByText('500+')).toBeInTheDocument();
        expect(screen.getByText('1,000+')).toBeInTheDocument();
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('Total Games')).toBeInTheDocument();
        expect(screen.getByText('Total Winners')).toBeInTheDocument();
    });

    it('applies light theme styling correctly', () => {
        render(<StatsSection isDark={false} />);

        const section = screen.getByText('10,000+').closest('section');
        expect(section).toHaveClass('bg-gradient-to-r', 'from-gray-100', 'to-gray-50');
    });

    it('applies dark theme styling correctly', () => {
        render(<StatsSection isDark={true} />);

        const section = screen.getByText('10,000+').closest('section');
        expect(section).toHaveClass('bg-gradient-to-r', 'from-gray-900', 'to-black');
    });

    it('has correct base section styling', () => {
        render(<StatsSection isDark={false} />);

        const section = screen.getByText('10,000+').closest('section');
        expect(section).toHaveClass('py-16');
    });

    it('has correct container styling', () => {
        render(<StatsSection isDark={false} />);

        const container = document.querySelector('.max-w-4xl.mx-auto.px-4.lg\\:px-8');
        expect(container).toHaveClass('max-w-4xl', 'mx-auto', 'px-4', 'lg:px-8');
    });

    it('has correct grid layout', () => {
        render(<StatsSection isDark={false} />);

        const grid = document.querySelector('.grid.grid-cols-3.gap-8');
        expect(grid).toHaveClass('grid', 'grid-cols-3', 'gap-8');
    });

    it('has correct stat number styling for light theme', () => {
        render(<StatsSection isDark={false} />);

        const statNumbers = screen.getAllByText(/10,000\+|500\+|1,000\+/);
        statNumbers.forEach(number => {
            expect(number).toHaveClass(
                'text-3xl', 'sm:text-4xl', 'font-bold', 'mb-2',
                'transition-all', 'duration-300', 'group-hover:scale-110',
                'bg-gradient-to-r', 'from-orange-600', 'to-red-600',
                'bg-clip-text', 'text-transparent'
            );
        });
    });

    it('has correct stat number styling for dark theme', () => {
        render(<StatsSection isDark={true} />);

        const statNumbers = screen.getAllByText(/10,000\+|500\+|1,000\+/);
        statNumbers.forEach(number => {
            expect(number).toHaveClass(
                'text-3xl', 'sm:text-4xl', 'font-bold', 'mb-2',
                'transition-all', 'duration-300', 'group-hover:scale-110',
                'bg-gradient-to-r', 'from-orange-500', 'to-red-500',
                'bg-clip-text', 'text-transparent'
            );
        });
    });

    it('has correct stat label styling for light theme', () => {
        render(<StatsSection isDark={false} />);

        const statLabels = screen.getAllByText(/Total Users|Total Games|Total Winners/);
        statLabels.forEach(label => {
            expect(label).toHaveClass(
                'text-sm', 'transition-colors', 'duration-300',
                'group-hover:text-orange-400', 'text-gray-600'
            );
        });
    });

    it('has correct stat label styling for dark theme', () => {
        render(<StatsSection isDark={true} />);

        const statLabels = screen.getAllByText(/Total Users|Total Games|Total Winners/);
        statLabels.forEach(label => {
            expect(label).toHaveClass(
                'text-sm', 'transition-colors', 'duration-300',
                'group-hover:text-orange-400', 'text-gray-400'
            );
        });
    });

    it('renders correct number of stat items', () => {
        render(<StatsSection isDark={false} />);

        const statItems = document.querySelectorAll('.text-center.group');
        expect(statItems).toHaveLength(3);
    });

    it('has correct stat item styling', () => {
        render(<StatsSection isDark={false} />);

        const statItems = document.querySelectorAll('.text-center.group');
        statItems.forEach(item => {
            expect(item).toHaveClass('text-center', 'group');
        });
    });

    it('handles theme switching correctly', () => {
        const { rerender } = render(<StatsSection isDark={false} />);

        // Check light theme
        let section = screen.getByText('10,000+').closest('section');
        expect(section).toHaveClass('from-gray-100', 'to-gray-50');

        // Switch to dark theme
        rerender(<StatsSection isDark={true} />);
        section = screen.getByText('10,000+').closest('section');
        expect(section).toHaveClass('from-gray-900', 'to-black');
    });

    it('has proper accessibility structure', () => {
        render(<StatsSection isDark={false} />);

        // Each stat should be in its own container
        const statContainers = document.querySelectorAll('.text-center.group');
        expect(statContainers).toHaveLength(3);

        // Each container should have a number and label
        statContainers.forEach(container => {
            const number = container.querySelector('.text-3xl');
            const label = container.querySelector('.text-sm');
            expect(number).toBeInTheDocument();
            expect(label).toBeInTheDocument();
        });
    });

    it('has responsive design classes', () => {
        render(<StatsSection isDark={false} />);

        const statNumbers = screen.getAllByText(/10,000\+|500\+|1,000\+/);
        statNumbers.forEach(number => {
            expect(number).toHaveClass('text-3xl', 'sm:text-4xl');
        });
    });

    it('has hover effects and transitions', () => {
        render(<StatsSection isDark={false} />);

        const statNumbers = screen.getAllByText(/10,000\+|500\+|1,000\+/);
        const statLabels = screen.getAllByText(/Total Users|Total Games|Total Winners/);

        statNumbers.forEach(number => {
            expect(number).toHaveClass('group-hover:scale-110', 'transition-all', 'duration-300');
        });

        statLabels.forEach(label => {
            expect(label).toHaveClass('group-hover:text-orange-400', 'transition-colors', 'duration-300');
        });
    });

    it('renders all stats with correct data', () => {
        render(<StatsSection isDark={false} />);

        const expectedStats = [
            { number: '10,000+', label: 'Total Users' },
            { number: '500+', label: 'Total Games' },
            { number: '1,000+', label: 'Total Winners' },
        ];

        expectedStats.forEach(stat => {
            expect(screen.getByText(stat.number)).toBeInTheDocument();
            expect(screen.getByText(stat.label)).toBeInTheDocument();
        });
    });
});
