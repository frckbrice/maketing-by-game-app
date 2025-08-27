# Lottery Images Setup Guide

## 🖼️ **Required Images**

To complete the lottery app design, you need to add the following images to the `public/images/` folder:

### **1. Hero Section Image (lottery_1)**

- **File**: `public/images/lottery_1.jpg`
- **Purpose**: Background image for the hero section
- **Size**: High resolution (1920x1080 or larger)
- **Content**: Lottery-themed hero image (similar to Zaiotto app)

### **2. Winner Profile Images (Optional)**

- **Files**:
  - `public/images/winner1.jpg`
  - `public/images/winner2.jpg`
  - `public/images/winner3.jpg`
  - `public/images/winner4.jpg`
- **Purpose**: Profile pictures for winners section
- **Size**: Square format (200x200 or larger)
- **Content**: Winner profile photos

## 🚀 **How to Add Images**

1. **Create the images folder** (if it doesn't exist):

   ```bash
   mkdir -p public/images
   ```

2. **Add your lottery images** to the folder

3. **Uncomment the Image component** in `src/components/home/components/home.tsx`:
   ```tsx
   {/* When lottery_1.jpg is available, uncomment this */}
   <Image
     src='/images/lottery_1.jpg'
     alt='Lottery Hero'
     fill
     className='object-cover'
     priority
   />
   <div className='absolute inset-0 bg-black/60'></div>
   ```

## 🎨 **Current Design Features**

- ✅ **Mobile-first responsive design**
- ✅ **Internationalization (English/French)**
- ✅ **PWA optimizations**
- ✅ **Hero section with gradient fallback**
- ✅ **How It Works section (4 steps)**
- ✅ **Winners showcase section**
- ✅ **Mobile navigation**
- ✅ **Touch-friendly buttons and interactions**

## 📱 **Mobile-First Features**

- Responsive breakpoints: `sm:`, `md:`, `lg:`
- Touch-friendly button sizes (44px minimum)
- Mobile-optimized navigation
- PWA meta tags and viewport settings
- Smooth animations and transitions

The app is now fully responsive and ready for mobile use as a PWA! 🎉
