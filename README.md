# 🚀 Form Builder Web App

A modern, smooth, and animated form builder web application inspired by **Google Forms + Notion UI**, built using the **MERN stack**.

Users can create dynamic forms, share links, collect responses, and view analytics with a beautiful UI and smooth animations.

---

## ⭐ Features

### ✅ Form Builder (Main Highlight)
- Add questions dynamically
- Multiple question types:
  - Short Answer
  - Paragraph
  - Multiple Choice
  - Checkbox
  - Dropdown
- Required / Optional toggle
- Drag & drop question reorder
- **Live preview on the right side** while building the form

---

### 🎨 Stunning UI / UX
- Minimal & modern design
- Micro-animations using **Framer Motion**
- Smooth transitions
- Floating “Add Question” button
- Animated question cards
- Glassmorphism and soft gradients

---

### 📝 Form Filling Experience
- **One question per screen** (Typeform style)
- Keyboard navigation:
  - Enter → Next question
- Auto-save progress
- Success animation after submission 🎉

---

### 📊 Response Collection & Analytics
For form owners:
- Response count
- Pie charts / bar graphs
- CSV download
- Time-based submission analytics

---

### 🔐 Authentication
- Email + Password
- Google Login
- User dashboard:
  - My Forms
  - Responses
  - Edit / Delete forms

---

## 🗂️ Tech Stack

### Frontend
- React
- Tailwind CSS
- Framer Motion
- React Hook Form
- @dnd-kit/core (Drag & Drop)
- Recharts / Chart.js

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

---

## 🧱 Data Models

### Form Schema
```js
{
  title: String,
  description: String,
  createdBy: userId,
  questions: [
    {
      type: "mcq | text | checkbox | dropdown",
      questionText: String,
      options: [],
      required: Boolean
    }
  ],
  createdAt: 27/01/2026
}
