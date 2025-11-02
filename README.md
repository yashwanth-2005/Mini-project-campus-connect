# CampusConnect: The All-in-One Campus Platform

Welcome to the CampusConnect project repository. This application is a comprehensive, cloud-native platform designed to unify every aspect of a student's campus life.

## Core Features

*   **Centralized Hub:** A single source of truth for announcements, events, and resources.
*   **Discussion Forum:** A real-time, collaborative space for students and faculty.
*   **Placement Corner:** Curated roadmaps and resources for career preparation.
*   **Resource Hub:** Cloud-powered file sharing for notes, papers, and more, with real-time updates.
*   **AI Chatbot:** An intelligent assistant powered by Google's Gemini model to answer campus-related questions.
*   **Secure Authentication:** Robust login and profile management for students and faculty, powered by Firebase.

## Tech Stack

*   **Framework:** Next.js (App Router) with React
*   **Styling:** Tailwind CSS with ShadCN/UI components
*   **Backend:** Firebase (Authentication, Firestore Real-time Database, Cloud Storage)
*   **AI:** Google Genkit with the Gemini family of models

## Getting Started

To run the project locally, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

This will start the Next.js development server, and you can view the application by navigating to `http://localhost:9002` in your web browser. The application is fully configured to connect to a live Firebase backend, so all features will work out-of-the-box on your local machine.
