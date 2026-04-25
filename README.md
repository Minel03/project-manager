# Taskly — Smart Project Management Platform

## 🖥️ Demo

Live Demo: [https://project-manager-main-wl3v0k.free.laravel.cloud/](https://project-manager-main-wl3v0k.free.laravel.cloud/)


Taskly is a modern, full-stack project management application designed for high-performance teams. It provides a seamless experience for planning, tracking, and executing projects with real-time collaboration and AI-powered task management.

## 🚀 Features

### 📌 Smart Task Management
- **Dynamic Kanban Boards**: Drag-and-drop tasks through custom workflows (Todo, In Progress, Done).
- **AI Task Breakdown**: AI-generated subtasks for complex projects (powered by Groq).
- **Interactive Calendar**: Full-view calendar to manage deadlines and project timelines.

### 👥 Team Collaboration
- **Real-Time Updates**: Instant synchronization across all clients using Laravel Reverb (WebSockets).
- **Role-Based Permissions**: Admin & Member roles with secure project access control.
- **Activity Logs**: Detailed audit trails for transparency and accountability.

### 📊 Productivity Analytics
- **Task Metrics**: Visual completion rates and productivity tracking.
- **Time Distribution**: Insightful charts showing team focus and time allocation.
- **Project Progress**: Real-time visualization of overall project health.


## 🛠 Tech Stack

| Layer | Technology |
|------|-------------|
| Backend | Laravel 12 (PHP 8.2+) |
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| State Management | Inertia.js |
| Database | PostgreSQL / SQLite |
| Realtime | Laravel Reverb |
| AI | Groq API |
| Deployment | Laravel Cloud |


## 📂 Project Structure

```text
├── app/
│   ├── Http/Controllers/    # Core logic (Projects, Tasks, Teams, etc.)
│   ├── Models/              # Database models & relationships
│   └── Notifications/       # System & Task notifications
├── config/                  # Application configuration files
├── database/
│   ├── migrations/          # Database schema definitions
│   └── seeders/             # Initial data & Admin setup
├── public/                  # Static assets & entry point
├── resources/
│   ├── js/
│   │   ├── components/      # Reusable UI components
│   │   ├── layouts/         # Page layout wrappers
│   │   ├── lib/             # Utility functions (AI, formatting)
│   │   └── pages/           # React views (Projects, Tasks, etc.)
│   └── views/               # Main Blade template (app.blade.php)
├── routes/
│   ├── web.php              # Web routes & Inertia endpoints
│   └── channels.php         # Real-time WebSocket channels
└── tests/                   # Feature and Unit tests
```

## 📦 Installation & Setup

### Prerequisites

- PHP 8.2+
- Node.js & NPM
- Composer

### Local Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/Minel03/project-manager.git
    cd project-manager
    ```

2. **Install dependencies:**

    ```bash
    composer install
    npm install
    ```

3. **Environment Setup:**

    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

4. **Database Migration:**

    ```bash
    php artisan migrate --seed
    ```

5. **Start the Development Servers:**

    ```bash
    # Terminal 1: Run Laravel server & Vite
    composer run dev

    # Terminal 2: Run WebSocket server (Local only)
    php artisan reverb:start
    ```

## ☁️ Deployment (Laravel Cloud)

Taskly is optimized for **Laravel Cloud**. To deploy:

1. Connect your repository to [cloud.laravel.com](https://cloud.laravel.com).
2. Provision a **Serverless Postgres** database resource.
3. Configure your Environment Variables in the dashboard (refer to `.env.example`).
4. Set your **Deploy Commands**:
    ```bash
    php artisan migrate --force && php artisan db:seed --class=AdminSeeder --force && php artisan optimize
    ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🎯 Purpose of the Project

Taskly was built as a portfolio project to demonstrate full-stack development skills using Laravel and React, including real-time communication, AI integration, and scalable project architecture.

## 📄 License

The Laravel framework is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).

