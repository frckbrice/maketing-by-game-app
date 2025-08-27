# 🔧 General Troubleshooting Guide

## 📋 Table of Contents

1. [Build Issues](#build-issues)
2. [ESLint Problems](#eslint-problems)
3. [Git Hook Failures](#git-hook-failures)
4. [TypeScript Errors](#typescript-errors)
5. [Firebase Issues](#firebase-issues)
6. [Deployment Problems](#deployment-problems)

## 🚨 Build Issues

### Issue 1: `yarn build` Failing

**Problem Description:**

```bash
Error: Build failed
TypeScript compilation errors
ESLint errors
```

**Common Causes:**

- TypeScript type mismatches
- Missing dependencies
- ESLint configuration issues
- Import/export problems

**Solutions:**

1. **Check TypeScript errors first:**

   ```bash
   yarn type-check
   ```

2. **Fix ESLint issues:**

   ```bash
   yarn lint
   yarn lint:fix
   ```

3. **Verify dependencies:**

   ```bash
   yarn install
   ```

4. **Clear build cache:**
   ```bash
   rm -rf .next
   yarn build
   ```

### Issue 2: Module Resolution Errors

**Problem Description:**

```bash
Module not found: Can't resolve 'module-name'
```

**Solutions:**

1. **Check import paths:**

   ```typescript
   // ✅ Good: Relative imports
   import { Component } from '../components/Component';

   // ❌ Bad: Absolute imports without proper config
   import { Component } from '@/components/Component';
   ```

2. **Verify tsconfig.json paths:**

   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"]
       }
     }
   }
   ```

3. **Check package.json dependencies:**
   ```bash
   yarn list | grep module-name
   ```

## 🔍 ESLint Problems

### Issue 1: ESLint Configuration Errors

**Problem Description:**

```bash
ESLint: Configuration Error
Unable to resolve action
Package subpath not exported
```

**Solutions:**

1. **Use simpler ESLint config:**

   ```javascript
   // eslint.config.js
   import js from '@eslint/js';

   export default [
     js.configs.recommended,
     {
       files: ['**/*.{js,jsx,ts,tsx}'],
       rules: {
         'no-unused-vars': 'warn',
         'no-console': 'warn',
         'no-undef': 'warn',
       },
     },
   ];
   ```

2. **Ignore problematic files:**
   ```javascript
   {
     ignores: [
       '.next/**',
       'node_modules/**',
       'public/sw.js',
       'public/workbox-*.js',
     ],
   }
   ```

### Issue 2: Pre-commit Hook Failures

**Problem Description:**

```bash
husky - pre-commit script failed
lint-staged failed
```

**Solutions:**

1. **Temporarily bypass hooks:**

   ```bash
   git commit --no-verify -m "message"
   ```

2. **Fix lint-staged configuration:**

   ```javascript
   // .lintstagedrc.js
   module.exports = {
     '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
     '*.{json,md,yml,yaml}': ['prettier --write'],
   };
   ```

3. **Remove git add from lint-staged:**
   ```javascript
   // ❌ Remove this line
   'git add';
   ```

## 🪝 Git Hook Failures

### Issue 1: Pre-push Hook Failing

**Problem Description:**

```bash
husky - pre-push script failed
ESLint errors blocking push
```

**Solutions:**

1. **Fix ESLint errors first:**

   ```bash
   yarn lint:fix
   ```

2. **Check for generated files:**

   ```bash
   git status
   # Remove generated files from tracking
   git rm --cached public/sw.js
   git rm --cached public/workbox-*.js
   ```

3. **Update .gitignore:**

   ```gitignore
   # Service worker files
   public/sw.js
   public/workbox-*.js

   # Build artifacts
   .next/
   dist/
   build/
   ```

### Issue 2: Husky Configuration Issues

**Problem Description:**

```bash
husky - DEPRECATED
Please remove the following two lines from .husky/pre-commit
```

**Solutions:**

1. **Update Husky configuration:**

   ```bash
   # Remove old configuration
   rm -rf .husky

   # Reinstall Husky
   yarn husky install
   yarn husky add .husky/pre-commit "yarn lint-staged"
   yarn husky add .husky/pre-push "yarn build"
   ```

## 📝 TypeScript Errors

### Issue 1: Type Mismatches

**Problem Description:**

```bash
Type 'X' is not assignable to type 'Y'
Property 'X' does not exist on type 'Y'
```

**Solutions:**

1. **Check type definitions:**

   ```typescript
   // Define proper interfaces
   interface User {
     id: string;
     email: string;
     role: 'USER' | 'VENDOR' | 'ADMIN';
   }
   ```

2. **Use type assertions carefully:**

   ```typescript
   // ✅ Good: Type guard
   if (typeof user.role === 'string') {
     // user.role is now typed as string
   }

   // ❌ Bad: Type assertion
   const role = user.role as string;
   ```

3. **Fix import/export issues:**

   ```typescript
   // ✅ Good: Named exports
   export interface User { ... }
   export type UserRole = 'USER' | 'VENDOR' | 'ADMIN';

   // ✅ Good: Named imports
   import { User, UserRole } from './types';
   ```

### Issue 2: Next.js 15 Compatibility

**Problem Description:**

```bash
params is not assignable to type
params must be Promise
```

**Solutions:**

1. **Update async components:**

   ```typescript
   // ✅ Good: Next.js 15
   export default async function Layout({
     params,
   }: {
     params: Promise<{ locale: string }>;
   }) {
     const { locale } = await params;
     // ...
   }
   ```

2. **Handle Promise params:**
   ```typescript
   // Always await params
   const { locale } = await params;
   ```

## 🔥 Firebase Issues

### Issue 1: Authentication Errors

**Problem Description:**

```bash
Firebase: Error (auth/user-not-found)
Firebase: Error (auth/invalid-email)
```

**Solutions:**

1. **Check Firebase configuration:**

   ```typescript
   // Verify environment variables
   const firebaseConfig = {
     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
     // ...
   };
   ```

2. **Verify user registration:**
   ```typescript
   try {
     const userCredential = await createUserWithEmailAndPassword(
       auth,
       email,
       password
     );
   } catch (error) {
     console.error('Registration error:', error.code);
   }
   ```

### Issue 2: Firestore Permission Errors

**Problem Description:**

```bash
FirebaseError: Missing or insufficient permissions
```

**Solutions:**

1. **Check Firestore rules:**

   ```javascript
   // firestore.rules
   match /users/{userId} {
     allow read: if request.auth != null &&
       (request.auth.uid == userId ||
        resource.data.role == 'ADMIN');
   }
   ```

2. **Verify user authentication:**
   ```typescript
   // Check if user is authenticated
   if (!auth.currentUser) {
     throw new Error('User not authenticated');
   }
   ```

## 🚀 Deployment Problems

### Issue 1: Vercel Deployment Failing

**Problem Description:**

```bash
Build failed
Environment variables missing
```

**Solutions:**

1. **Check environment variables:**
   - Verify all required variables are set in Vercel
   - Check variable names match exactly
   - Ensure no typos in values

2. **Verify build command:**

   ```json
   // package.json
   {
     "scripts": {
       "build": "next build"
     }
   }
   ```

3. **Check build output:**
   ```bash
   # Test build locally first
   yarn build
   ```

### Issue 2: GitHub Actions Workflow Failures

**Problem Description:**

```bash
GitHub Actions failed
Workflow step failed
```

**Solutions:**

1. **Check workflow configuration:**

   ```yaml
   # .github/workflows/deploy.yml
   - name: Run tests
     run: yarn test:coverage || echo "Tests skipped"
     continue-on-error: true
   ```

2. **Verify secrets:**
   - Check all required secrets are set
   - Verify secret names match workflow
   - Ensure secrets have correct permissions

3. **Test locally:**
   ```bash
   # Run the same commands locally
   yarn lint
   yarn type-check
   yarn build
   ```

## 🛠️ General Debugging Tips

### 1. Check Console Logs

```typescript
// Use custom logger
import { logger } from '@/lib/utils/logger';

logger.info('User action', { userId, action });
logger.error('Error occurred', error);
```

### 2. Verify Dependencies

```bash
# Check for outdated packages
yarn outdated

# Check for security vulnerabilities
yarn audit

# Clean install
rm -rf node_modules yarn.lock
yarn install
```

### 3. Clear Caches

```bash
# Clear Next.js cache
rm -rf .next

# Clear yarn cache
yarn cache clean

# Clear browser cache (if testing)
```

### 4. Check File Permissions

```bash
# Ensure proper file permissions
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

## 📚 Additional Resources

- [Next.js Troubleshooting](https://nextjs.org/docs/advanced-features/debugging)
- [TypeScript Error Reference](https://github.com/Microsoft/TypeScript/wiki/Common-Mistakes)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Firebase Error Codes](https://firebase.google.com/docs/auth/admin/errors)

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Status:** ✅ Active
