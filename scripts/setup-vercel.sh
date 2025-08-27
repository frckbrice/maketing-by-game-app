#!/bin/bash

# Vercel Deployment Setup Script for LotteryApp
# This script helps you set up the necessary environment variables and secrets

echo "🚀 LotteryApp Vercel Deployment Setup"
echo "======================================"
echo ""

# Check if required tools are installed
check_requirements() {
    echo "Checking requirements..."
    if ! command -v node &>/dev/null; then
        echo "❌ Node.js not found. Install from https://nodejs.org"
        exit 1
    fi
    if ! command -v npm &>/dev/null; then
        echo "❌ npm not found. Install Node.js which includes npm"
        exit 1
    fi
    if ! command -v vercel &>/dev/null; then
        echo "ℹ️ Vercel CLI not found. Using npx vercel@latest when needed."
        USE_NPX_VERCEL=1
    else
        echo "✅ Vercel CLI found"
    fi
    if ! command -v gh &>/dev/null; then
        echo "❌ GitHub CLI not found. Please install from: https://cli.github.com/"
        exit 1
    else
        echo "✅ GitHub CLI found"
    fi
    if ! command -v jq &>/dev/null; then
        echo "❌ jq not found. Please install: https://stedolan.github.io/jq/"
        exit 1
    else
        echo "✅ jq found"
    fi
    if ! command -v yarn &>/dev/null; then
        echo "ℹ️ yarn not found. Will use npm for build."
        USE_NPM_BUILD=1
    else
        echo "✅ yarn found"
    fi
    if ! command -v docker &>/dev/null; then
        echo "ℹ️ Docker not found. Docker build test will be skipped."
        SKIP_DOCKER_TEST=1
    else
        echo "✅ Docker found"
    fi
}

# Setup Vercel project
setup_vercel() {
    echo ""
    echo "🔧 Setting up Vercel project..."
    
    if [ ! -f ".vercel/project.json" ]; then
        echo "Creating new Vercel project..."
        vercel --yes
    else
        echo "Vercel project already exists"
    fi
    
    echo "✅ Vercel project configured"
}

# Get project information
get_project_info() {
    echo ""
    echo " Getting project information..."
    
    if [ -f ".vercel/project.json" ]; then
        ORG_ID=$(jq -r '.orgId // empty' .vercel/project.json)
        PROJECT_ID=$(jq -r '.projectId // empty' .vercel/project.json)
        if [ -z "${ORG_ID:-}" ] || [ -z "${PROJECT_ID:-}" ]; then
            echo "❌ Could not read orgId/projectId from .vercel/project.json"
            exit 1
        fi

        echo "Organization ID: $ORG_ID"
        echo "Project ID: $PROJECT_ID"
        
        # Save to file for easy access
        echo "VERCEL_ORG_ID=$ORG_ID" > .env.vercel
        echo "VERCEL_PROJECT_ID=$PROJECT_ID" >> .env.vercel
        echo "✅ Project info saved to .env.vercel"
    else
        echo "❌ Vercel project not found. Run setup_vercel first."
        exit 1
    fi
}

# Setup GitHub secrets
setup_github_secrets() {
    echo ""
    echo " Setting up GitHub secrets..."
    
    # Check if user is logged in to GitHub
    if ! gh auth status &> /dev/null; then
        echo "Please login to GitHub first:"
        gh auth login
    fi
    
    # Get current repository
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
    echo "Repository: $REPO"
    
    # Read Vercel info
    if [ -f ".env.vercel" ]; then
        source .env.vercel
        
        echo "Setting up GitHub secrets..."
        
        # Set Vercel secrets
        echo "Setting VERCEL_ORG_ID..."
        gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID" --repo "$REPO"
        
        echo "Setting VERCEL_PROJECT_ID..."
        gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID" --repo "$REPO"
        
        echo "✅ GitHub secrets configured"
        echo ""
        echo "⚠️  IMPORTANT: You still need to set private repo secrets (no NEXT_PUBLIC_):"
        echo "   - VERCEL_TOKEN (from Vercel dashboard)"
        echo "   - DOCKERHUB_USERNAME (your Docker Hub username)"
        echo "   - DOCKERHUB_TOKEN (a Docker Hub access token)"
        echo ""
        echo "You can set these in GitHub repository settings:"
        echo "https://github.com/$REPO/settings/secrets/actions"
        
        # Optional: auto-wire secrets if present in the environment
        if [ -n "${VERCEL_TOKEN:-}" ]; then
          echo "Setting VERCEL_TOKEN from current env..."
          gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN" --repo "$REPO"
        fi
        if [ -n "${DOCKERHUB_USERNAME:-}" ]; then
          echo "Setting DOCKERHUB_USERNAME from current env..."
          gh secret set DOCKERHUB_USERNAME --body "$DOCKERHUB_USERNAME" --repo "$REPO"
        fi
        if [ -n "${DOCKERHUB_TOKEN:-}" ]; then
          echo "Setting DOCKERHUB_TOKEN from current env..."
          gh secret set DOCKERHUB_TOKEN --body "$DOCKERHUB_TOKEN" --repo "$REPO"
        fi
    else
        echo "❌ .env.vercel not found. Run get_project_info first."
        exit 1
    fi
}

# Test deployment
test_deployment() {
    echo ""
    echo " Testing deployment..."
    
    echo "Building project..."
    yarn build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful"
        
        echo "Testing Docker build..."
        docker build -t lotteryapp:test .
        
        if [ $? -eq 0 ]; then
            echo "✅ Docker build successful"
            echo "Cleaning up test image..."
            docker rmi lotteryapp:test
        else
            echo "❌ Docker build failed"
        fi
    else
        echo "❌ Build failed"
        exit 1
    fi
}

# Main execution
main() {
    check_requirements
    setup_vercel
    get_project_info
    setup_github_secrets
    test_deployment
    
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Set VERCEL_TOKEN in GitHub secrets"
    echo "2. Set Docker credentials in GitHub secrets"
    echo "3. Push to main branch to trigger deployment"
    echo ""
    echo "For detailed instructions, see: docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md"
}

# Run main function
main "$@"

