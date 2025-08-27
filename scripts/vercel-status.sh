#!/usr/bin/env bash

set -Eeuo pipefail
IFS=

# Check current deployments
echo " Recent Deployments:"
vercel ls

echo ""
echo " Project Information:"
vercel project ls | grep lottery-app

echo ""
echo " Environment Variables:"
vercel env ls 

echo ""
echo " Build Status:"
vercel project ls | grep lottery-app | awk '{print "Latest URL: " $2}'
\n\t'

echo " Checking Vercel deployment status for lottery-app..."
echo ""

# Check current deployments
echo " Recent Deployments:"
vercel ls

echo ""
echo " Project Information:"
vercel project ls | grep lottery-app

echo ""
# Show only public client-side vars; skip secrets in CI logs
vercel env ls $SCOPE_OPT $TOKEN_OPT 2>/dev/null | awk 'NR==1 || $1 ~ /^NEXT_PUBLIC_/'
# Uncomment below for full listing only when safe:
vercel env ls $SCOPE_OPT $TOKEN_OPT


echo ""
echo " Build Status:"
vercel project ls | grep lottery-app | awk '{print "Latest URL: " $2}'
echo "📊 Build Status:"
vercel project ls | grep lottery-app | awk '{print "Latest URL: " $2}'
