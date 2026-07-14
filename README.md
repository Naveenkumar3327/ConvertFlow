# ConvertFlow — All-in-One Online File Converter and Personal File Manager

ConvertFlow is a full-stack SaaS platform built with **Next.js 15+ App Router**, **TypeScript**, and **Tailwind CSS**, using **MongoDB Atlas & GridFS** as the exclusive database and file-storage mechanism. It lets users upload files, queue conversions, view inline previews, download output formats, and manage files in an isolated personal drive.

---

## 1. Features
- **MongoDB GridFS Exclusive Storage**: Avoids public AWS S3/Cloudinary links. Chunks and streams original files, converted files, and previews natively inside database collections.
- **Modular Conversion Engine**: Built with native Node extensions (`sharp` for images, `pdf-lib` for merging/splitting/rotating PDFs, SheetJS `xlsx` for spreadsheet parsing, and `mammoth` for Word extraction) along with seamless child-process CLI fallbacks.
- **Role-Based Access**: Guest users (10MB limits, 1-hour automatic expiry), Registered users (500MB free quota), and Premium tier options.
- **Route Guard Middleware**: Enforces session validations and admin permissions.
- **Recycling Bin (Trash)**: Move files to trash, restore them, or permanently delete items to reclaim quota instantly.
- **Admin Control Panel**: Real-time system health parameters, user permission locking (suspend/activate), and live logs of conversion backlogs.
- **Garbage Collector Daemon**: API hook to scan and clean expired guest files and orphaned chunks.

---

## 2. Environment Variables (.env)
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/convertflow?retryWrites=true&w=majority
MONGODB_DATABASE_NAME=convertflow

AUTH_SECRET=a_random_hash_at_least_32_characters_long
AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=google_oauth_client_id
GOOGLE_CLIENT_SECRET=google_oauth_client_secret

MAX_GUEST_FILE_SIZE=10485760
MAX_FREE_FILE_SIZE=26214400
MAX_PRO_FILE_SIZE=262144000
GUEST_FILE_EXPIRY_HOURS=1
TEMP_FILE_EXPIRY_HOURS=24
TRASH_RETENTION_DAYS=30
```

---

## 3. Installation Guide

### Step 1: Install Node Dependencies
Extract/clone the project folder, open your terminal inside the directory, and run:
```bash
npm install --legacy-peer-deps
```

### Step 2: Configure System CLI Dependencies (Optional, for Office/Video tools)
To execute audio/video formats or compile PPTX/DOCX to PDF layouts, the conversion engine will spawn system processes. Install these on Windows using **Winget** or **Scoop** and add them to your system **PATH**:

#### A. FFmpeg Setup (Audio & Video Converter)
- **Winget**:
  ```bash
  winget install -e --id Gyan.FFmpeg
  ```
- **Manual**: Download the stable release from [ffmpeg.org](https://ffmpeg.org/download.html), extract the zip, and add the `bin` path to your System Environment variables.

#### B. LibreOffice Headless (Office to PDF Layouts)
- **Winget**:
  ```bash
  winget install -e --id TheDocumentFoundation.LibreOffice
  ```
- **Manual**: Download and run the installer from [libreoffice.org](https://www.libreoffice.org/download/download/). Ensure `soffice.exe` (located in `C:\Program Files\LibreOffice\program`) is added to the system PATH.

#### C. Pandoc Setup (Markdown Documents)
- **Winget**:
  ```bash
  winget install -e --id JohnMacFarlane.Pandoc
  ```
- **Manual**: Download and install from [pandoc.org](https://pandoc.org/installing.html).

---

## 4. Development & Production Scripts

### Start Local Development Server
Starts the Next.js development server on `http://localhost:3000`:
```bash
npm run dev
```

### Compile Production Build
Compiles TypeScript assets, generates static optimization layers, and verifies Next.js routes:
```bash
npm run build
```

### Start Production Server
Runs the compiled server instance:
```bash
npm run start
```

---

## 5. MongoDB GridFS Architecture Details
ConvertFlow connects via Mongoose to manage normal collections and uses the official `GridFSBucket` API for files. It splits uploaded files into binary chunks (255KB each) and streams them through three segregated buckets:
- `originalFiles.files` / `originalFiles.chunks` (for raw uploads)
- `convertedFiles.files` / `convertedFiles.chunks` (for successfully converted outputs)
- `previewFiles.files` / `previewFiles.chunks` (for image previews and thumbnails)

When you trigger a deletion, the engine calls `GridFSBucket.delete()` to safely clear chunks and matches database indexes to ensure zero orphaned data.
