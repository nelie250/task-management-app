# Full-Stack Task Management System

A responsive task dashboard built with React.js on the client and Node.js + Express.js on the server, backed by MongoDB and Mongoose for structured persistence and efficient task updates.

## Project highlights

- Engineered a responsive web app using React.js for the client dashboard and Node.js with Express.js for backend processing.
- Modeled a clean document persistence layer using MongoDB and Mongoose ODM to manage fluid task schemas, queries, and updates efficiently.
- Built administrative access control layers utilizing JSON Web Tokens (JWT) and Role-Based Access Control (RBAC) to block unauthorized endpoints.
- Conducted end-to-end API stress tests and endpoint verifications to confirm server-side data validations.

## Tech stack

- Frontend: React, Vite
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- API validation: Express validation and server-side checks
- Client state: React hooks and local draft persistence

## Run locally

1. Install dependencies for the server and client.
2. Configure your MongoDB connection in the server environment.
3. Start the backend:
   npm --prefix server run dev
4. Start the frontend:
   npm --prefix client run dev

## App overview

This project provides a clean, modern task workflow with task creation, editing, filtering, searching, and completion tracking in a single dashboard interface.
