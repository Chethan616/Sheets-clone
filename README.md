# Sheets Clone 📊

A high-performance, pixel-perfect Google Sheets clone built with **Next.js 15**, **React 19**, and **Tailwind CSS**. This application features real-time collaboration, complex formula evaluation, virtualized rendering for large datasets, and a modern Material 3 design system.

![Dashboard Preview](./screenshots/dashboard.png)
*(Recommended: Add a screenshot of the dashboard here showing the document grid)*

## 🚀 Features

### Core Functionality
- **High Performance Grid**: Powered by `@tanstack/react-virtual`, rendering thousands of cells at 60fps.
- **Formula Engine**: Custom-built recursive descent parser supporting mathematical (`SUM`, `AVG`, `MAX`) and data quality (`TRIM`, `UPPER`, `LOWER`) functions.
- **Cell Dependencies**: Formulas automatically update when referenced cells change.
- **Rich Formatting**: Bold, Italic, Text Color, Background Color, and Alignment support.

### ⚡ Real-Time Collaboration
- **Multi-user Editing**: See changes from other users instantly using Firebase Firestore.
- **Presence System**: View active users and their selection cursors/avatars in real-time.
- **Conflict Resolution**: Optimistic UI updates with eventual consistency.

### 🎨 UI/UX Excellence
- **Drag & Drop**: Reorder columns intuitively by dragging headers.
- **Resize**: Interactive column width and row height resizing.
- **Selection**: Drag-to-select range support.
- **Keyboard Navigation**: Full Excel-like keyboard support (Arrow keys, Tab, Enter, Shift+Select).
- **Material Design 3**: Modern, accessible interface with light/dark mode support.
- **Haptic Feedback**: Subtle vibration feedback for interactions on supported devices.

![Editor Preview](./screenshots/editor.png)
*(Recommended: Add a screenshot of the editor with active selection and formulas)*

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, `clsx`, `tailwind-merge`
- **State/Backend**: Firebase (Auth, Firestore)
- **Virtualization**: `@tanstack/react-virtual`
- **Icons**: `lucide-react`
- **Animation**: `motion` (Framer Motion)

## 🏃‍♂️ Running Locally

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sheets-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000**

## 📸 Screenshots to Add

To make this README pop, please take screenshots of the following and save them in a `screenshots` folder (create it if it doesn't exist):

1. **`dashboard.png`**: The main screen showing the list of spreadsheets.
2. **`editor.png`**: The grid view, ideally with some data, a formula visible in the bar, and a selected range.
3. **`formatting.png`** (Optional): Showing the formatting toolbar and different cell styles.

## 🧪 Advanced Features Demonstrated

- **Recursive Recursive Descent Parser**: `src/lib/formula/parser.ts`
- **Optimistic Updates**: `src/hooks/useCells.ts`
- **Virtualized Grid**: `src/components/editor/Grid.tsx`
- **Custom Presence Hook**: `src/hooks/usePresence.ts`

---
*Built for the Trademarkia Frontend Engineering Assignment.*
