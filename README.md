# Taskly — Smart Project Management Platform

Taskly is a modern, full-stack project management application designed for high-performance teams. It provides a seamless experience for planning, tracking, and executing projects with real-time collaboration and AI-powered task management.

## 🚀 Key Features

- **Dynamic Kanban Boards**: Drag-and-drop tasks through custom workflows (Todo, In Progress, Done).
- **AI Task Breakdown**: Automatically break down complex tasks into actionable subtasks using AI (powered by Groq).
- **Real-Time Collaboration**: Instant updates across all clients using Laravel Reverb.
- **Role-Based Access Control (RBAC)**: Granular permissions for Admins and Members to ensure data privacy.
- **Comprehensive Analytics**: Visual time distribution, task completion rates, and productivity charts.
- **Interactive Calendar**: Full-view calendar to manage deadlines and project timelines.
- **Team Management**: Organize users into teams with specific project assignments.
- **Activity Logs**: Track every change, comment, and attachment with a detailed audit trail.

## 🛠️ Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+)
- **Frontend**: React, TypeScript, Tailwind CSS
- **State Management**: Inertia.js (Modern monolith)
- **Database**: PostgreSQL (Serverless) / SQLite (Local)
- **Real-time**: Laravel Reverb
- **AI Integration**: Groq API
- **Deployment**: Laravel Cloud

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

## 📄 License

The Laravel framework is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
