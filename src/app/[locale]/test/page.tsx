export default function TestPage() {
  return (
    <div className='min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold mb-6'>
          <span className='bg-gradient-to-r from-[#FF5722] to-[#FF9800] bg-clip-text text-transparent'>
            Test Page
          </span>
        </h1>
        <p className='text-xl text-gray-300 mb-8'>
          This is a test page to debug the blank page issue
        </p>
      </div>
    </div>
  );
}
