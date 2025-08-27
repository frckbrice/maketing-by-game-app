#!/bin/bash

echo "🔍 Checking Vercel deployment status for lottery-app..."
echo ""

# Check current deployments
echo "📋 Recent Deployments:"
vercel ls

echo ""
echo "🌐 Project Information:"
vercel project ls | grep lottery-app

echo ""
echo "🔧 Environment Variables:"
vercel env ls

echo ""
echo "📊 Build Status:"
vercel project ls | grep lottery-app | awk '{print "Latest URL: " $2}'
