#!/usr/bin/env bash

set -Eeuo pipefail
# Restrictive splitting: newline + tab
IFS=

command -v vercel >/dev/null || { echo "vercel CLI not found" >&2; exit 127; }
vercel whoami $TOKEN_OPT >/dev/null 2>&1 || { echo "Not authenticated to Vercel" >&2; exit 1; }

echo "Recent Deployments:"
vercel ls $SCOPE_OPT $TOKEN_OPT

echo ""
echo "Project Information:"
echo "Environment Variables (public only):"
vercel env ls $SCOPE_OPT $TOKEN_OPT 2>/dev/null | awk 'NR==1 || $1 ~ /^NEXT_PUBLIC_/'

echo ""
echo "Build Status:"
if command -v jq >/dev/null; then
  latest_url=$(vercel ls $SCOPE_OPT $TOKEN_OPT --json | jq -r '.[0].url // empty')
  [[ -n "$latest_url" ]] && echo "Latest URL: https://$latest_url"
else
  vercel project ls $SCOPE_OPT $TOKEN_OPT | grep lottery-app | awk '{print "Latest URL: " $2}'
fi
fi
    | jq -r '.projects[] | select(.name=="lottery-app") | [.name, .link] | @tsv' \
    | awk '{printf "Name: %s\nURL: %s\n", $1, $2}'
else
  vercel project ls $SCOPE_OPT $TOKEN_OPT | grep -E '(^Name|lottery-app)'
fi

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
\n\t'

# Optional flags derived from environment
: "${VERCEL_ORG_ID:=}"
: "${VERCEL_TOKEN:=}"
SCOPE_OPT=${VERCEL_ORG_ID:+--scope "$VERCEL_ORG_ID"}
TOKEN_OPT=${VERCEL_TOKEN:+--token "$VERCEL_TOKEN"}

# Optional flags derived from environment
: "${VERCEL_ORG_ID:=}"

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
