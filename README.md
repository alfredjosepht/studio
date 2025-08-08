# AnimalMoji

A web app where you upload a picture of your animal's face, and an AI identifies the animal's face and assigns a personality-matching emoji.

This is a Next.js project bootstrapped with `create-next-app` and configured for Firebase Studio.

---

## Getting Started

To run this project locally in an editor like VS Code, follow these steps:

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Visual Studio Code](https://code.visualstudio.com/) or another code editor

### 2. Set Up Environment Variables

The application uses the Google Gemini API to power its AI features. You'll need an API key to run it.

1.  Create a new file named `.env.local` in the root of your project.
2.  Add your Gemini API key to this file. You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

    ```
    # Get your key from Google AI Studio: https://aistudio.google.com/app/apikey
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```

### 3. Install Dependencies

Open a terminal in VS Code (`View` > `Terminal`) and run the following command to install the necessary packages:

```bash
npm install
```

### 4. Run the Development Servers

This project requires two separate development servers to run concurrently: one for the Next.js frontend and one for the Genkit AI service.

1.  **Start the Genkit AI service:** In your terminal, run:

    ```bash
    npm run genkit:watch
    ```

    This will start the AI service and watch for any changes in the AI flow files.

2.  **Start the Next.js frontend:** Open a *second* terminal in VS Code (you can click the "+" icon in the terminal panel) and run:

    ```bash
    npm run dev
    ```

    This command starts the Next.js application, which will connect to the Genkit service.

### 5. Open the App

Once both servers are running, you can view your application by navigating to [http://localhost:9002](http://localhost:9002) in your web browser.

You're all set! Any changes you make to the code will automatically reload the application.
