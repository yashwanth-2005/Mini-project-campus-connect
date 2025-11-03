# How to Fix GitHub Authentication Errors

You are seeing a `fatal: Authentication failed` error because your environment is not correctly logged into your GitHub account. 

The most secure and reliable way to fix this is to use a **GitHub Personal Access Token (PAT)** instead of your regular password. Follow these steps exactly.

### Step 1: Generate a Personal Access Token (PAT) on GitHub

1.  **Go to GitHub's Token Settings page.** Open this link in a new browser tab: [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new)

2.  **Configure Your Token:**
    *   **Note:** Give your token a descriptive name, like `studio-auth-token`.
    *   **Expiration:** For simplicity, you can set it to `No expiration`, but a shorter duration (like 30 or 60 days) is more secure for production use.
    *   **Select Scopes:** This is the most important part. You **must** check the box next to `repo`. This gives the token permission to access and push to your repositories.

    

3.  **Generate and Copy the Token:**
    *   Scroll to the bottom and click the **"Generate token"** button.
    *   **IMPORTANT:** GitHub will show you the token **only once**. It will look something like `ghp_...`. **Copy this token immediately** and paste it somewhere safe, like a temporary text file. If you lose it, you will have to generate a new one.

### Step 2: Use the Token to Push Your Code

Now, come back to your Studio terminal and run the following commands.

1.  **Set the correct remote URL.** This command tells Git which repository to push to. Copy this command exactly.
    ```bash
    git remote set-url origin https://github.com/rishikeshgowdakk/CampusConnect.git
    ```

2.  **Push your code using the token.** This is the final step. When you run the command below, Git will ask for your `Username` and `Password`.

    *   For **Username**, type your GitHub username (`rishikeshgowdakk`) and press Enter.
    *   For **Password**, **PASTE THE PERSONAL ACCESS TOKEN** that you copied in Step 1. It will not show on the screen as you paste it. This is normal. Press Enter after pasting.

    Run this command now:
    ```bash
    git push origin main
    ```

This will successfully authenticate you and push all of your latest code to your GitHub repository.
