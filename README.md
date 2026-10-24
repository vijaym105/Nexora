# ✨ Nexora — AI-Powered Personal Assistant

<p align="center">
  <img src="https://img.shields.io/badge/AI-Powered-8B5CF6?style=for-the-badge" alt="AI Powered">
  <img src="https://img.shields.io/badge/Full--Stack-Application-6366F1?style=for-the-badge" alt="Full Stack Application">
</p>

<p align="center">
  <b>Your intelligent assistant for conversations, research, and email productivity.</b>
</p>

## 🚀 Features

- 🤖 **AI Chat:** Get AI-generated responses using Google Gemini.
- 🧠 **Recent Chat Memory:** Access recent conversations.
- 📧 **Email Assistant:** Generate email drafts and send emails.
- 🌐 **Internet Search:** Search the web through the integrated search tool.
- 🔐 **Authentication:** User authentication and application access.
- 🎨 **Modern UI:** Clean chat interface with a purple-gradient theme.

## 🛠️ Tech Stack

- **Frontend:** React, Redux Toolkit, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI:** Google Gemini, LangChain
- **Email:** Nodemailer
- **Validation:** Zod

## 📸 Screenshots

### AI Chat
![Nexora AI Chat](screenshots/chats.png)

### Email Assistant
![Nexora Email Assistant](screenshots/email.png)

> Keep these image files in the `screenshots/` folder. GitHub paths are case-sensitive, so filenames must match exactly.

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/vijaym105/Nexora.git
cd Nexora
```

### 2. Install dependencies

Run `npm install` in the frontend and backend directories that contain their respective `package.json` files.

```bash
cd backend
npm install
```

Open a second terminal and install the frontend dependencies:

```bash
cd frontend
npm install
```

### 3. Configure environment variables

Create the required `.env` files for your application. Add your MongoDB connection string, Gemini API key, email configuration, and any other variables your code uses.

**Never commit `.env` files or API keys to GitHub.**

### 4. Run the application

Start the backend and frontend in separate terminals using the scripts defined in their respective `package.json` files. For example:

```bash
npm run dev
```

## 🏗️ Architecture

```text
User
 │
 ▼
React Frontend
 │  HTTP / Axios
 ▼
Express Backend
 ├── MongoDB          (users and chat data)
 ├── LangChain/Gemini (AI responses)
 ├── Internet Search  (search integration)
 └── Nodemailer       (email delivery)
```

## 🔮 Future Enhancements

- Long-term conversational memory
- Support for additional AI models
- Document-based question answering
- Voice assistance

## 👨‍💻 Author

**Vijay Malusare**  
GitHub: [@vijaym105](https://github.com/vijaym105)

---

<p align="center">
  <b>Nexora — Your ideas. Your conversations. One intelligent assistant.</b>
</p>
