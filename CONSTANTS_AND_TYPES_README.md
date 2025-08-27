# Constants and Types Documentation

## 🎯 **Overview**

This project uses centralized constants and types to maintain consistency, reduce duplication, and make changes easier to manage. All constants and types are defined in single source files and imported where needed.

## 📁 **File Structure**

```
src/
├── lib/
│   ├── constants/
│   │   └── index.ts          # All project constants
│   └── types/
│       └── index.ts          # All project types and interfaces
```

## 🔧 **Constants Usage**

### **Importing Constants**

```typescript
import {
  THEME_CONFIG,
  STATS_CONFIG,
  LOTTERY_CONFIG,
  I18N_CONFIG,
  API_CONFIG,
} from '@/lib/constants';
```

### **Available Constants**

#### **1. Theme Constants (`THEME_CONFIG`)**

```typescript
// Colors
THEME_CONFIG.colors.primary; // '#FF5722'
THEME_CONFIG.colors.secondary; // '#FF9800'
THEME_CONFIG.colors.background.dark; // '#1a1a1a'

// Breakpoints
THEME_CONFIG.breakpoints.sm; // '640px'
THEME_CONFIG.breakpoints.md; // '768px'
```

#### **2. Stats Constants (`STATS_CONFIG`)**

```typescript
// Default stats
STATS_CONFIG.defaultStats[0].number; // '1000+'
STATS_CONFIG.defaultStats[0].label; // 'Active Games'
STATS_CONFIG.refreshInterval; // 30000 (30 seconds)
```

#### **3. Lottery Game Constants (`LOTTERY_CONFIG`)**

```typescript
// Game types
LOTTERY_CONFIG.gameTypes.DAILY; // 'daily'
LOTTERY_CONFIG.gameTypes.WEEKLY; // 'weekly'

// Ticket prices
LOTTERY_CONFIG.ticketPrices.MIN; // 1
LOTTERY_CONFIG.ticketPrices.MAX; // 100
```

#### **4. Internationalization (`I18N_CONFIG`)**

```typescript
I18N_CONFIG.defaultLocale; // 'en'
I18N_CONFIG.supportedLocales; // ['en', 'fr']
I18N_CONFIG.fallbackLocale; // 'en'
```

#### **5. API Configuration (`API_CONFIG`)**

```typescript
API_CONFIG.baseUrl; // '/api'
API_CONFIG.endpoints.auth.login; // '/auth/login'
API_CONFIG.timeout; // 10000
```

#### **6. Validation Rules (`VALIDATION_CONFIG`)**

```typescript
VALIDATION_CONFIG.password.minLength; // 8
VALIDATION_CONFIG.username.maxLength; // 30
VALIDATION_CONFIG.email.maxLength; // 254
```

#### **7. Error Messages (`ERROR_MESSAGES`)**

```typescript
ERROR_MESSAGES.common.somethingWentWrong; // 'Something went wrong...'
ERROR_MESSAGES.auth.invalidCredentials; // 'Invalid email or password'
```

## 🏷️ **Types Usage**

### **Importing Types**

```typescript
import type {
  User,
  LotteryGame,
  LotteryTicket,
  ApiResponse,
  PaginationParams,
} from '@/types';
```

### **Available Types**

#### **1. Core Types**

```typescript
type ID = string;
type Status = 'active' | 'inactive' | 'pending' | 'suspended';
type SortOrder = 'asc' | 'desc';
```

#### **2. User & Authentication**

```typescript
interface User {
  id: ID;
  email: string;
  role: Role;
  status: UserStatus;
  // ... more properties
}

type Role = 'USER' | 'ADMIN' | 'MODERATOR';
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
```

#### **3. Lottery Game Types**

```typescript
interface LotteryGame {
  id: ID;
  name: string;
  type: GameType;
  status: GameStatus;
  ticketPrice: number;
  // ... more properties
}

type GameStatus = 'DRAFT' | 'ACTIVE' | 'DRAWING' | 'CLOSED';
type GameType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL';
```

#### **4. API Response Types**

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationParams;
}

interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}
```

#### **5. UI Component Types**

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

## 💡 **Best Practices**

### **1. Always Use Constants Instead of Magic Values**

❌ **Don't do this:**

```typescript
const primaryColor = '#FF5722';
const maxParticipants = 1000;
```

✅ **Do this instead:**

```typescript
import { THEME_CONFIG, LOTTERY_CONFIG } from '@/lib/constants';

const primaryColor = THEME_CONFIG.colors.primary;
const maxParticipants = LOTTERY_CONFIG.maxParticipants.DEFAULT;
```

### **2. Use TypeScript Types for Better IntelliSense**

❌ **Don't do this:**

```typescript
const user: any = { id: '123', email: 'user@example.com' };
```

✅ **Do this instead:**

```typescript
import type { User } from '@/types';

const user: User = { id: '123', email: 'user@example.com' };
```

### **3. Extend Existing Types Instead of Creating New Ones**

❌ **Don't do this:**

```typescript
interface CustomUser {
  id: string;
  email: string;
  // ... duplicating User interface
}
```

✅ **Do this instead:**

```typescript
import type { User } from '@/types';

interface CustomUser extends User {
  customField: string;
}
```

## 🔄 **Making Changes**

### **Adding New Constants**

1. **Add to the appropriate section in `src/lib/constants/index.ts`**
2. **Export the constant**
3. **Update this documentation**

### **Adding New Types**

1. **Add to the appropriate section in `src/types/index.ts`**
2. **Export the type**
3. **Update this documentation**

### **Updating Existing Values**

1. **Change the value in the constants file**
2. **All components using that constant will automatically use the new value**
3. **No need to search and replace throughout the codebase**

## 📱 **Example: Using Constants in Components**

```typescript
import { THEME_CONFIG, STATS_CONFIG } from '@/lib/constants';
import type { User, LotteryGame } from '@/types';

export function GameCard({ game }: { game: LotteryGame }) {
  return (
    <div
      className={`bg-${THEME_CONFIG.colors.background.light}
                 border-${THEME_CONFIG.colors.border.primary}/20`}
    >
      <h3 className={`text-${THEME_CONFIG.colors.text.primary}`}>
        {game.name}
      </h3>
      <p className={`text-${THEME_CONFIG.colors.text.secondary}`}>
        Max Participants: {game.maxParticipants}
      </p>
    </div>
  );
}
```

## 🚀 **Benefits**

- ✅ **Single Source of Truth**: All constants and types in one place
- ✅ **Easy Maintenance**: Change once, updates everywhere
- ✅ **Type Safety**: Full TypeScript support with IntelliSense
- ✅ **Consistency**: Ensures consistent values across the app
- ✅ **Documentation**: Self-documenting code with clear constants
- ✅ **Refactoring**: Easy to rename or restructure

## 🔍 **Finding Constants and Types**

- **Constants**: Look in `src/lib/constants/index.ts`
- **Types**: Look in `src/types/index.ts`
- **Search**: Use VS Code search to find usage of specific constants
- **IntelliSense**: Hover over imports to see available constants and types

---

**Remember**: Always import constants and types from the centralized files instead of defining them locally in components!
