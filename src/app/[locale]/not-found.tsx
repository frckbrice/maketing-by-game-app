import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold mb-6'>
          <span className='bg-gradient-to-r from-[#FF5722] to-[#FF9800] bg-clip-text text-transparent'>
            404 - Page Not Found
          </span>
        </h1>
        <p className='text-xl text-gray-300 mb-8'>
          The page you're looking for doesn't exist
        </p>
        <Link href='/'>
          <button className='bg-[#FF5722] hover:bg-[#FF9800] text-white font-bold py-3 px-6 rounded-lg transition-colors'>
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
