# Senior Developer Code Review - WealthSquad

This review evaluates the current state of the WealthSquad repository based on Security, Code Quality, Performance, and Project Structure.

---

## 1. Security Faults

### 🚨 Hardcoded Credentials
- **Issue**: The Supabase URL and Anonymous Key are hardcoded in `App.js` and `supabaseClient.js`.
- **Risk**: These keys are exposed in the source code. While the `anon` key is intended for client-side use, hardcoding them makes it difficult to manage different environments (dev, staging, prod) and increases the risk of accidental exposure.
- **Recommendation**: Use `expo-constants` or `react-native-dotenv` to manage environment variables.

### 🔐 Insecure User Data Flow
- **Issue**: In `src/Screens/Signup.jsx`, the app manually inserts a record into a custom `Users` table after calling `supabase.auth.signUp`.
- **Risk**: This is prone to failure (race conditions, network errors). If the auth succeeds but the table insert fails, you have an inconsistent state.
- **Recommendation**: Use a Supabase **Database Trigger** (PostgreSQL) to automatically create a profile record in the `public.profiles` table when a new user is created in `auth.users`.

### 🛡️ Exposure of Sensitive Logic
- **Issue**: Client-side calculation of sensitive financial data without server-side validation.
- **Risk**: While fine for a calculator, any data that is *saved* should be validated on the backend.

---

## 2. Code Quality & Maintainability

### 🧩 Redundancy & Fragmentation
- **Duplicate Supabase Clients**: The Supabase client is initialized in `App.js` and again in `supabaseClient.js`. Components are inconsistently importing from one or the other.
- **Duplicate Navigation**: `src/Navigation/AppNavigator.jsx` and `src/Navigation/appNavigation.jsx` both exist. `App.js` imports from the latter, leaving the former as "dead code."
- **Typo Files**: `src/Screens/SeTTTings.jsx` exists alongside `Settings.jsx`. `StudentLoanCalcualtor.jsx` (typo) exists alongside `StudentLoanCalculator.jsx`.

### 🏗️ Inconsistent Architecture
- **Mixed Languages**: The project uses a mix of `.js`, `.jsx`, and `.tsx`. For a new project, committing to TypeScript (TSX) early is a "Senior" best practice to avoid type-related bugs.
- **Misplaced Components**: Several files that function as Screens are located in `src/Components/` (e.g., `StudentLoanCalculator.jsx`, `transactionScreen.jsx`). Conversely, some UI fragments are in `src/Screens/`.
- **Styling**: Styles are heavily duplicated using `StyleSheet.create` with hardcoded hex codes.

### 📝 Logic in UI Components
- **Issue**: Complex business logic (like loan amortization and budget calculations) is embedded directly inside the `render` functions or `useEffect` hooks of components.
- **Recommendation**: Move calculation logic to dedicated utility functions or custom hooks (e.g., `useLoanCalculator`) to make them testable and reusable.

---

## 3. Performance Faults

### 🚀 List Rendering
- **Issue**: `Home.jsx` and `Settings.jsx` use `.map()` inside a `ScrollView` to render lists of accounts and options.
- **Impact**: For small lists, this is fine. However, as data scales (e.g., a long list of transactions), this causes performance degradation because all items are rendered at once.
- **Recommendation**: Use `FlatList` or `SectionList` for better memory management and "windowing."

### 🔄 State Management
- **Issue**: Heavy use of local state for data that might be needed globally.
- **Recommendation**: While `SessionContextProvider` is used for Auth, consider using a dedicated state manager (like Zustand or TanStack Query) for caching and synchronizing financial data across screens.

---

## 4. Project Structure Faults

### 📂 Folder Organization
- **Inconsistent Naming**: Folder names are mixed between PascalCase (`Screens`, `Components`) and camelCase (`hooks`, `assets`). Standardizing on one (usually kebab-case or PascalCase) is preferred.
- **Dead Assets**: There are several unused dependencies in `package.json` (like `@shadcn/ui`, which doesn't natively work in React Native without specific setup like `gluestack-ui` or `nativewind`).

---

## Summary of Priority Fixes
1. **Unify Supabase Client**: Delete one and use a single export.
2. **Environment Variables**: Move keys to a `.env` file.
3. **Clean Dead Code**: Delete the duplicate settings/navigator files.
4. **Standardize Components**: Move all screens to `src/Screens` and UI atoms to `src/Components`.
5. **TS Migration**: Convert core logic to TypeScript.

Would you like me to start implementing any of these fixes for you?
