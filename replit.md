# ComideX Restaurant System

## Overview
ComideX is a comprehensive management system for Japanese restaurants, designed to streamline operations from order placement to kitchen management. It features an administrative panel for full menu, table, and printer management, a Point of Sale (POS) system for waiters, and a robust REST API for integration with an Android tablet application. The system also includes an advanced printing management system with virtual printer capabilities and queue management. The project aims to provide an efficient and user-friendly solution for restaurant operations, leveraging modern web technologies. The MVP is already implemented and functional with real data.

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
- **POS System:** Grid-based table visualization with real-time status, session management (opening/closing), order management per table, and automatic value calculation.
- **Printing System:** Manages multiple printers, queues by sector (kitchen, bar, cash register), online/offline status, and automatic order formatting. Includes a professional virtual printer system for testing and development with PDF generation and advanced configurations (paper size, DPI, margins, charset, etc.).
- **Image Handling:** Optimized image upload system where images are saved only upon confirmation. Placeholder images for categories and products, with drag-and-drop and image enhancement features.
- **Error Handling:** Implemented retry mechanisms with exponential backoff for Supabase data loading, ensuring reliable page loads across all admin pages.
- **Data Management:** Expanded database with item duplication for different service models (e.g., Premium, Traditional).
- **Console Prompt System:** Integrated with a TypeScript server on port 3456.

## External Dependencies
- **Supabase:** Used for PostgreSQL database and authentication.
- **jsPDF:** Integrated for professional PDF generation, especially for virtual printer simulations.
- **Android App (External):** Expected to consume the exposed REST APIs for tablet-based operations.