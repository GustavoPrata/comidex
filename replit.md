# ComideX Restaurant System

## Overview
ComideX is a comprehensive management system for Japanese restaurants, designed to streamline operations from order placement to kitchen management. It features an administrative panel for full menu, table, and printer management, a Point of Sale (POS) system for waiters, and a robust REST API for integration with an Android tablet application. The system also includes an advanced printing management system with virtual printer capabilities and queue management. The project includes a fully integrated tablet app for customer self-service ordering (similar to Goomer), with kiosk mode, idle screen, and password protection. The project aims to provide an efficient and user-friendly solution for restaurant operations, leveraging modern web technologies. The MVP is already implemented and functional with real data.

## User Preferences
I prefer detailed explanations.
I want iterative development.
Ask before making major changes.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
The system is built with a modern web stack. The frontend utilizes **Next.js 15** with the App Router, **React 19**, **TypeScript**, **Tailwind CSS** for styling, **shadcn/ui** for components, and **SWR** for data fetching. The backend leverages **Next.js API Routes** for RESTful APIs, with **Supabase** (PostgreSQL and authentication) as the database.

**UI/UX Decisions:**
- **Minimalist color palette:** Black, orange, and white.
- **Dark theme by default** to avoid flash of unstyled content.
- **Simplified interface** with two main cards (Admin and POS) for direct navigation.
- **Consistent visual design** across products and categories, including placeholder images.
- **Intuitive image upload** with drag & drop functionality, visual feedback, and image enhancement filters.

**Feature Specifications:**
- **Admin Panel:** Dashboard with real-time statistics, comprehensive CRUD operations for menu items (including image uploads, categorization, pricing), category management (ordering, activation/deactivation), table control (types, capacity, status), and printer configuration.
- **POS System:** Grid-based table visualization with real-time status, session management (opening/closing), order management per table, automatic value calculation, and complete checkout system.
- **Checkout System:** Professional bill closing interface with 3-column layout featuring grouped items summary, calculator with numeric keypad, multiple payment methods (cash, credit, debit, PIX), partial payment tracking, percentage or fixed discounts, split by people functionality, payment history with removal option, table reopen capability, and automatic order/table status updates. All payment data is persisted to database.
- **Printing System:** Manages multiple printers, queues by sector (kitchen, bar, cash register), online/offline status, and automatic order formatting. Includes a professional virtual printer system for testing and development with PDF generation and advanced configurations (paper size, DPI, margins, charset, etc.).
- **Image Handling:** Optimized image upload system where images are saved only upon confirmation. Placeholder images for categories and products, with drag-and-drop and image enhancement features.
- **Error Handling:** Implemented retry mechanisms with exponential backoff for Supabase data loading, ensuring reliable page loads across all admin pages.
- **Data Management:** Expanded database with item duplication for different service models (e.g., Premium, Traditional).
- **Console Prompt System:** Integrated with a TypeScript server on port 3456.

## Mobile App APIs
- **Complete REST API:** Full set of endpoints for mobile app integration at `/api/mobile/`
- **Configuration Endpoint:** Dynamic app configuration including features, themes, and settings
- **Categories API:** Active categories with custom ordering and icons
- **Products API:** Filtered products by category and mode (Rodízio/À La Carte)
- **Order Management:** Create orders with automatic kitchen printing integration
- **Session Control:** Table session management with bill tracking
- **Real-time Integration:** Orders sent directly to kitchen printers through existing queue system
- **Device Tracking:** Unique device ID support for order history

## Running Both Applications

### Main Application (Next.js)
The main restaurant management system runs on **port 5000** via the "Start application" workflow.
- URL: `http://localhost:5000`
- Includes: Admin panel, POS system, and REST APIs

### TABLET Application (Expo/React Native)
The tablet app runs on **port 8081** (Metro bundler with tunnel) and **port 8000** (web version).

**Best way to test:** Use **Expo Go** app on your phone and scan the QR code.

To start the TABLET app:
```bash
./start-tablet-app.sh
```

Or manually:
```bash
cd TABLET
npm install
npm start
```

Then:
- **Mobile (recommended):** Install Expo Go app and scan the QR code
- **Web:** Press `w` in terminal or access `http://0.0.0.0:8000`

See full instructions: `TABLET/COMO_RODAR_EXPO_REPLIT.md`

Both applications can run simultaneously without port conflicts.

## External Dependencies
- **Supabase:** Used for PostgreSQL database and authentication.
- **jsPDF:** Integrated for professional PDF generation, especially for virtual printer simulations.
- **Mobile App (External):** React Native/Expo app will consume the REST APIs at `/api/mobile/` for tablet-based operations.