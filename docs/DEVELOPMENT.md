# Development Guide

## Quality Assurance Workflow

This project uses a comprehensive quality assurance workflow to ensure code quality and consistency.

### Pre-commit Hooks

- **ESLint**: Automatically fixes linting issues
- **Prettier**: Formats code according to project standards
- **TypeScript**: Checks for type errors

### Pre-push Hooks

- **Quality Check**: Runs linting, formatting, type checking, tests, and build
- **Prevents**: Pushing code that doesn't meet quality standards

## Available Scripts

```bash
# Development
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server

# Quality Assurance
yarn lint         # Run ESLint with auto-fix
yarn lint:check   # Check for linting issues
yarn format       # Format code with Prettier
yarn format:check # Check formatting
yarn type-check   # Run TypeScript type checking
yarn quality-check # Run all quality checks

# Testing
yarn test         # Run tests
yarn test:watch   # Run tests in watch mode
yarn test:coverage # Run tests with coverage

# PWA
yarn pwa          # Build and start PWA
```

## Code Quality Standards

### ESLint Rules

- TypeScript strict mode enabled
- No unused variables
- Prefer const over let/var
- Console warnings (use logger instead)
- Prettier integration

### Prettier Configuration

- Single quotes
- 2 spaces indentation
- 80 character line length
- Trailing commas
- Semicolons required

### Testing Requirements

- 70% code coverage minimum
- Component testing with React Testing Library
- User interaction testing
- Mock external dependencies

## Git Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches
- `hotfix/*`: Hotfix branches

### Commit Standards

- Use conventional commits
- Include issue numbers
- Write descriptive messages

### Pull Request Process

1. Create feature branch from `develop`
2. Implement changes with tests
3. Ensure all quality checks pass
4. Create PR to `develop`
5. Code review required
6. Merge after approval

## Deployment

### Vercel Deployment

- Automatic deployment on push to `main`
- Preview deployments for PRs
- Quality checks run before deployment
- Environment-specific configurations

### Required Secrets

- `VERCEL_TOKEN`: Vercel API token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `CODECOV_TOKEN`: Code coverage token (optional)

## Environment Setup

### Local Development

1. Install dependencies: `yarn install`
2. Copy `.env.example` to `.env.local`
3. Configure Firebase credentials
4. Start development: `yarn dev`

### CI/CD Environment

- Node.js 22
- Yarn package manager
- Ubuntu latest runner
- Automatic dependency caching

## Troubleshooting

### Common Issues

- **Husky hooks not working**: Run `yarn prepare`
- **ESLint errors**: Run `yarn lint` to auto-fix
- **Formatting issues**: Run `yarn format`
- **Type errors**: Run `yarn type-check`

### Quality Check Failures

1. Fix linting issues: `yarn lint`
2. Fix formatting: `yarn format`
3. Fix type errors: Check TypeScript output
4. Fix test failures: Check test output
5. Fix build errors: Check build output

## Performance Monitoring

### Build Metrics

- Bundle size analysis
- Lighthouse scores
- Core Web Vitals
- PWA compliance

### Testing Coverage

- Unit test coverage
- Integration test coverage
- E2E test coverage (future)
- Performance test coverage (future)

**Last Updated:** $(date)
**Author:** Avom brice
**Version:** 1.0.0
**Status:** ✅ Active
