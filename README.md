# Bloom - Your Personal Cycle Companion 🌸

Bloom is a sophisticated, privacy-focused menstrual cycle tracker designed to provide clear insights into your health. Whether you're tracking your period, monitoring fertility windows, or simply staying informed about your body's patterns, Bloom offers a premium, intuitive experience.

---

## ✨ Features

### 📅 Smart Dashboard
*   **Cycle Overview**: Instantly see where you are in your cycle with a beautiful circular visualization.
*   **Predictions**: Get accurate predictions for your next period and fertile window.
*   **Daily Insights**: View personalized health tips based on your current cycle phase.

### 🗓 Interactive Calendar
*   **Visual History**: A comprehensive calendar view of past and predicted periods.
*   **Fertility Tracking**: Highlights ovulation days and high-fertility windows.
*   **Quick Logging**: Tap any day to log symptoms, mood, or period flow.

### 📊 History & Analytics
*   **Detailed Logs**: Review your cycle history at a glance.
*   **Trend Analysis**: Understand your average cycle and period lengths over time.

### ⚙️ Personalized Settings
*   **Custom Notifications**: Set reminders for upcoming periods or fertility windows.
*   **Theme Customization**: Support for Light, Dark, and System modes with a refined aesthetic.
*   **Data Portability**: Export or import your tracking data as JSON.

---

## 🛠 Technology Stack

Bloom is built with modern, high-performance web technologies:

*   **Frontend**: [React 18](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/) for robust, type-safe development.
*   **Build Tool**: [Vite](https://vitejs.dev/) for lightning-fast development and optimized production builds.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a sleek, responsive design with custom animations.
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) built on [Radix UI](https://www.radix-ui.com/) primitives for accessibility and premium feel.
*   **State Management**: React Hooks and Local Storage for privacy-first, client-side data persistence.
*   **Backend Integration**: [Supabase](https://supabase.com/) for potential cloud sync and authentication features.
*   **Icons**: [Lucide React](https://lucide.dev/) for clean, consistent iconography.
*   **Date Handling**: [date-fns](https://date-fns.org/) for precise cycle calculations.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   Yarn (preferred package manager)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd cycle-sense
    ```

2.  **Install dependencies:**
    ```bash
    yarn install
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the root directory and add your Supabase credentials (if applicable):
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    yarn dev
    ```
    The application will be available at `http://localhost:8080`.

---

## 📖 Usage Guide

### 1. Onboarding
The first time you open Bloom, you'll be guided through a quick setup:
*   **Last Period**: Select the first day of your most recent period.
*   **Cycle Length**: Set your average cycle length (usually 28 days).
*   **Period Length**: Set how many days your period typically lasts.

### 2. Daily Tracking
Tap the **"+"** button or any day on the **Calendar** to log:
*   **Flow Intensity**: Light, Medium, Heavy, or Spotting.
*   **Symptoms**: Log how you're feeling to identify patterns.

### 3. Data Privacy
Bloom prioritizes your privacy. By default, all tracking data is stored **locally on your device**. You can reset, export, or import your data at any time from the **Settings** page.

---

## 🧪 Development & Testing

*   **Linting**: `yarn lint`
*   **Formatting**: Uses Prettier through ESLint.
*   **Production Build**: `yarn build`

---
