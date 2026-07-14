<div align="center">

# ConvertFlow

### Convert Smarter. Organize Better. Access Anywhere.

A modern full-stack file conversion and management platform built with **Next.js**, **TypeScript**, and **MongoDB GridFS**.

Convert files across multiple formats, securely store them, track conversion history, and manage everything from one unified workspace.

</div>

---

## Overview

**ConvertFlow** simplifies file conversion by combining powerful conversion tools with secure personal file management.

Users can upload, convert, preview, download, and organize files through a clean and responsive dashboard. Original and converted files are securely stored using **MongoDB GridFS**, eliminating the need for external cloud-storage services.

---

## Core Features

- Multi-format file conversion
- PDF, document, image, spreadsheet, audio, and video tools
- Secure drag-and-drop file uploads
- Real-time conversion progress
- File preview and download
- Personal file-management dashboard
- Date-wise conversion history
- Search, filter, and organize files
- Favorites and trash management
- Secure user authentication
- Storage usage tracking
- Responsive light and dark interface

---

## Supported Conversions

| Category | Supported Operations |
|---|---|
| PDF | PDF ↔ Word, Excel, PowerPoint, JPG |
| Documents | DOCX, TXT, HTML, Markdown |
| Images | JPG, PNG, WebP, SVG |
| Spreadsheets | Excel, CSV, PDF |
| Presentations | PPT, PPTX, PDF |
| Audio | MP3, WAV, AAC, M4A |
| Video | MP4, AVI, MOV, MKV, WebM |

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS, ShadCN UI |
| Animations | Framer Motion |
| Backend | Next.js Route Handlers, Node.js |
| Database | MongoDB Atlas, Mongoose |
| File Storage | MongoDB GridFS |
| Authentication | Auth.js |
| Validation | Zod |
| File Processing | LibreOffice, FFmpeg, Sharp, PDF-lib |

---

## Storage Architecture

ConvertFlow uses **MongoDB GridFS** as its primary file-storage system.

```text
Original File
      ↓
MongoDB GridFS
      ↓
Conversion Engine
      ↓
Converted File
      ↓
Preview • Download • Manage

# Clone the repository
git clone https://github.com/YOUR_USERNAME/ConvertFlow.git

# Open the project
cd ConvertFlow

# Install dependencies
npm install

# Start the development server
npm run dev





