'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from './Button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant='outline' size='sm' className='w-10 h-10 p-0'>
        <div className='w-4 h-4 bg-current rounded-full animate-pulse' />
      </Button>
    );
  }

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className='w-10 h-10 p-0'
      aria-label='Toggle theme'
    >
      {theme === 'dark' ? (
        <Sun className='w-4 h-4' />
      ) : (
        <Moon className='w-4 h-4' />
      )}
    </Button>
  );
}
