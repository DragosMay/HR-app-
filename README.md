# 🚀 IT E-Business & ERP Management System

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)

Welcome to the **IT E-Business Management System**! This is a modern, lightweight, full-stack Enterprise Resource Planning (ERP) application designed specifically for IT companies. It centralizes Human Resources, Time Tracking, Project Management, and Financial Analysis into one seamless platform.

---

## ✨ Key Features

This system is divided into four main interconnected modules, governed by a strict **Role-Based Access Control (RBAC)** architecture (Admin, Manager, Employee).

* 👥 **HR & Identity Management:** Secure authentication and conditional UI rendering. Admins can manage the team, while employees have a restricted "Self-Service" view.
* 📅 **Interactive Time Tracking:** A dynamic calendar view where employees can log their daily hours. The system automatically calculates total hours per month.
* 📋 **Kanban Project Board:** Visual project management using Kanban methodologies. Move projects through `Planning`, `In Progress`, and `Completed` states instantly without page reloads.
* 💰 **Financial Dashboard:** Real-time Business Intelligence. Calculates net profit based on registered transactions and displays a visual bi-chromatic health bar (Income vs. Expenses).

---

## 🛠️ Tech Stack

This project uses a decoupled (headless) architecture, ensuring high performance and scalability:

**Frontend (Client-Side)**
* **React.js** (Component-based UI)
* **Vite** (Next-generation build tool)
* **Axios** (Promise-based HTTP client for API requests)

**Backend (Server-Side)**
* **Python 3.x**
* **FastAPI** (High-performance, asynchronous REST API framework)
* **SQLAlchemy** (Object-Relational Mapping for database queries)
* **Uvicorn** (Lightning-fast ASGI server)

**Database**
* **SQLite** (Serverless, relational database for rapid deployment)

---

## 🛡️ Architecture & Security
* **CORS Enabled:** Cross-Origin Resource Sharing is configured to allow seamless communication between the React port and the Python port.
* **Pydantic Validation:** All incoming data to the server is strictly typed and validated before reaching the SQL database to prevent malicious injections.
* **DOM Security:** UI elements meant for Admins are completely removed from the Virtual DOM for regular employees, ensuring front-end safety.

---
*Developed as an E-Business implementation project.* 💻
