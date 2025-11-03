# CampusConnect: The All-In-One Campus Platform

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

1.  **Set Up AI Functionality (Required):**
    *   The AI chatbot in this project is powered by the Google Gemini model. To use it, you need a free API key.
    *   Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to create and copy your API key.
    *   In the root of this project, you will find a file named `.env`. Open it and replace the placeholder `"YOUR_API_KEY_HERE"` with the key you just copied. The line should look like this:
        ```
        GEMINI_API_KEY="AIzaSy...your...key..."
        ```
    *   Save the `.env` file.

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run the Development Servers:**
    You will need to run two servers in two separate terminals for the full application to work.

    *   **Terminal 1 (Next.js Web App):**
        ```bash
        npm run dev
        ```
    *   **Terminal 2 (Genkit AI Server):**
        ```bash
        npm run genkit:dev
        ```

This will start the Next.js and AI servers. You can view the application by navigating to `http://localhost:9002` in your web browser. The application is fully configured to connect to a live Firebase backend, so all features will work out-of-the-box on your local machine.
