# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a lightweight, browser-only React application (bundled with Vite and styled with Tailwind CSS) for capturing and organizing text snippets and photos during conferences (specifically How to Web 2025). It stores captures and feedback locally in the browser (no backend), supports offline use after initial load, and can export captures and session feedback to PDF via `jsPDF`.

Key concepts:
- **Capture**: a single item in the feed, either text or photo, optionally tagged.
- **Feedback**: structured per-session ratings and comments for HTW 2025 sessions.
- **Sessions**: static metadata for How to Web 2025 agenda, used to drive the feedback UI.

## Commands

All commands are run from the repository root.

### Install dependencies

- Install Node dependencies (use npm because `package-lock.json` is present):
  - `npm install`

### Development server

- Start the Vite dev server with hot reload:
  - `npm run dev`

### Production build & preview

- Build the production bundle:
  - `npm run build`
- Preview the built app locally (serves the `dist` output):
  - `npm run preview`

### Linting & Tests

- There are currently **no lint or test scripts** defined in `package.json`, and no automated test framework is configured. If you add one (e.g. ESLint, Vitest, Jest), also add the appropriate `npm run` scripts and update this `WARP.md` with how to run the full suite and a single test file.

## High-Level Architecture

### Frontend stack

- **Bundler / dev server**: Vite (`vite.config.js`) with React plugin.
- **UI framework**: React 18 (`src/main.jsx`, `src/App.jsx`).
- **Styling**: Tailwind CSS (`tailwind.config.js`, `src/styles/main.css`), with custom utility classes for buttons, capture items, tags, and drag-and-drop states.
- **PDF export**: `jsPDF` (see `src/utils/exportHelpers.js`).

### Entry point and layout

- `index.html` defines the root DOM node and includes the Vite entry script.
- `src/main.jsx` renders `<App />` into `#root` and pulls in Tailwind styles.
- `src/App.jsx` is the main orchestrator:
  - Owns **global UI state**: list of captures, which modal is open (text capture, photo capture, photo viewer, session selector, feedback form), currently viewed photo, queue state, and error state.
  - Connects to **storage utilities** (`loadCaptures`, `addCapture`, `updateCapture`, `deleteCapture`, `reorderCaptures`) and **photo storage** (`savePhoto`, `deletePhoto`).
  - Uses **`captureQueue`** to throttle concurrent capture operations.
  - Manages the overall **capture → display → export** flow.

### Components (UI responsibilities)

All components live in `src/components/`. The main groups to be aware of:

- **Capture creation & feed**
  - `CaptureButtons`: sticky header with Add Text / Add Photo buttons and conference banner image.
  - `TextCapture`: modal for entering text captures.
  - `PhotoCapture`: modal for capturing or selecting images, enforcing the file-size rule via `validateFileSize` and showing a preview + confirmation flow.
  - `ContentFeed`: vertical list of captures with drag-and-drop reordering; delegates rendering of each item to `CaptureItem`.
  - `CaptureItem`: renders a single capture (text or photo), including inline edit/delete, tag editing, and human-readable timestamp.
  - `PhotoViewer`: full-screen overlay to view a single photo at full size.
  - `ProcessingIndicator`: floating indicator showing the number of active capture operations vs. the concurrent limit.

- **Export & sharing**
  - `ExportButton`: entry point for exporting; shows an "Export Options" menu:
    - "Export as PDF" → `exportToPDF(captures, onProgress)`.
    - "Copy All Text" → `copyAllTextToClipboard(captures)`.

- **Feedback & sessions**
  - `SessionSelector`: overlay to browse and filter HTW 2025 sessions (by day, stage, search query), backed by `HTW_2025_SESSIONS` and `STAGES` from `src/data/sessions.js`. Uses `hasFeedback` to indicate whether feedback already exists for the session.
  - `FeedbackForm`: modal for per-session feedback with star ratings (overall, speaker, content, presentation), recommend flag, and optional free-text comments. Reads/writes to `feedbackStorage`.
  - `FeedbackButton`: surface in the main view that opens the session selector and shows a badge with the total feedback count via `getFeedbackCount`.
  - `StarRating`: reusable rating control for 1–5 star input, used by `FeedbackForm`.

- **Error handling**
  - `ErrorModal`: generic modal used for queue limit and file validation errors (e.g., too many concurrent operations or too-large images), dismissible by button or `Escape` key.

### Data & domain layer

- `src/data/sessions.js`
  - Contains `HTW_2025_SESSIONS`: a static array describing How to Web 2025 sessions (id, title, speakers, stage, date/time, topics, type).
  - Contains `STAGES`: the list of stage names used for filtering in `SessionSelector`.
  - This file is the **single source of truth** for the agenda used by the feedback UI.

- `src/utils/storage.js`
  - Provides the **capture persistence layer** for text + capture metadata, backed by `localStorage` under the key `conference-captures`.
  - Key functions:
    - `loadCaptures()` → array of persisted captures.
    - `saveCaptures(captures)` → writes to `localStorage` and handles quota errors.
    - `addCapture(capture)` → creates a new capture (generates `id` from timestamp and sets `timestamp` field), prepends to the list, persists, and returns the new capture.
    - `updateCapture(id, updates)` → shallow merges updates onto an existing capture and persists; returns the updated capture.
    - `deleteCapture(id)` → removes a capture and persists; returns the new array.
    - `reorderCaptures(captures)` → persists a reordered list; the input ordering is treated as canonical.
  - Any new capture fields/types should be wired through here so persistence remains consistent.

- `src/utils/indexedDB.js`
  - Manages **binary photo storage** in IndexedDB:
    - Database: `ConferenceCaptureDB`, version `1`.
    - Store: `photos`, keyPath `id`.
  - Exposes `savePhoto(id, blob)`, `getPhoto(id)`, `deletePhoto(id)`, and `getAllPhotos()`.
  - `savePhoto` handles `QuotaExceededError` and alerts the user when storage is full.
  - `CaptureItem` and `exportHelpers` consume `getPhoto` to display or embed images.

- `src/utils/feedbackStorage.js`
  - Stores **session feedback** in `localStorage` under the key `htw-session-feedback`.
  - Core operations:
    - `getAllFeedback()` → array of all feedback objects.
    - `saveFeedback(feedbackData)` → upserts feedback for a given `sessionId`, adding `createdAt` or `updatedAt` timestamps.
    - `getFeedbackForSession(sessionId)` → returns a single session's feedback or `null`.
    - `deleteFeedback(sessionId)` → removes feedback for a session.
    - `hasFeedback(sessionId)` → convenience wrapper used in `SessionSelector`.
    - `getFeedbackCount()` → used to show the badge count on `FeedbackButton`.
  - The feedback schema fields (ratings, recommend flag, free-text comments, session metadata) are defined in `FeedbackForm` when constructing the `feedbackData` object.

- `src/utils/captureQueue.js`
  - Implements a **client-side concurrency limiter** for capture operations.
  - `CaptureQueue` tracks `activeCaptures` and enforces a maximum concurrent limit (`maxConcurrent`, default 5).
  - `addCapture(asyncFn)` increments `activeCaptures`, notifies listeners, runs `asyncFn`, then decrements and re-notifies; if the limit is already reached it throws an error.
  - `addListener(callback)` / `removeListener(callback)` allow `App` to observe queue state (`{ active, max, canAddMore }`) and drive UI (e.g., disable capture buttons, show error modal, update `ProcessingIndicator`).
  - Exported as a singleton `captureQueue` configured with a `maxConcurrent` of 5.

- `src/utils/imageCompression.js`
  - Handles **client-side image compression** using the Canvas API.
  - Enforces maximum dimensions (`MAX_WIDTH` and `MAX_HEIGHT`, both 1920) while preserving aspect ratio.
  - Iteratively reduces JPEG quality until the resulting blob is under a **2 MB** size target or the quality reaches a minimum.
  - `compressImage(file)` is used in `App`'s photo-capture path before persisting images to IndexedDB.
  - Also provides `createThumbnail(blob)` to generate smaller preview URLs, though the main app currently relies on the full-size images for display.

- `src/utils/validation.js`
  - Centralizes **file size validation** logic:
    - `MAX_FILE_SIZE` is set to 15 MB.
    - `validateFileSize(file)` returns `{ valid, error, sizeMB }`, used by `PhotoCapture` before creating any previews.
    - `formatFileSize(bytes)` returns a human-readable string for display.
  - This module enforces the 15 MB per-image requirement from the product spec.

- `src/utils/exportHelpers.js`
  - Implements **PDF export** and **"copy all text"** behavior.
  - `exportToPDF(captures, onProgress, includeFeedback = true)`:
    - Uses `jsPDF` to create an A4 portrait document.
    - Adds a header with export timestamp and total counts.
    - Iterates over captures in chronological order, writing text captures as paragraphs and embedding photos loaded via `getPhoto(photoId)` from IndexedDB (converted to data URLs and scaled to fit the page).
    - Optionally appends a "Session Feedback" section for all feedback items from `getAllFeedback()`, including star ratings and free-text comments.
    - Calls `onProgress(percent)` as it processes captures.
    - Saves the PDF with filename `htw-2025-captures-[YYYY-MM-DD].pdf`.
  - `copyAllTextToClipboard(captures)`:
    - Filters text captures, formats them with timestamp and optional tags, joins them with `---` separators, and writes to `navigator.clipboard`.

### Styling and Tailwind

- `tailwind.config.js` includes `index.html` and all `src/**/*.js,jsx` files, so Tailwind classes used in React components are compiled correctly.
- `src/styles/main.css`:
  - Sets up Tailwind layers (`base`, `components`, `utilities`).
  - Defines semantic utility classes (`.btn-primary`, `.btn-secondary`, `.btn-danger`, `.capture-item`, `.tag-badge`) used across components.
  - Includes drag-and-drop classes (`.dragging`, `.drag-over`) that `ContentFeed` applies via `className` depending on drag state.

## Product Requirements Reference

The `prd.md` file at the repo root documents the product requirements for "Conference Capture". Key constraints that are already enforced in code and should be kept in sync when modifying behavior:

- **Image file size limit**: 15 MB per image (`MAX_FILE_SIZE` in `src/utils/validation.js`, used by `PhotoCapture`).
- **Concurrent capture limit**: maximum of 5 simultaneous capture operations (`CaptureQueue` in `src/utils/captureQueue.js`, surfaced via `ProcessingIndicator` and button disabling).
- **Photo compression**: images compressed to approximately 2 MB using `compressImage` in `src/utils/imageCompression.js` before storing in IndexedDB.
- **Local persistence only**: text, captures, and feedback in `localStorage`; photos in IndexedDB. No backend calls.
- **PDF export as primary export path**: implemented via `exportToPDF` in `src/utils/exportHelpers.js`, including both captures and session feedback.

When making changes to capture limits, storage keys, or export formats, update both the relevant utility modules and `prd.md` (if the product spec changes), and then refresh this `WARP.md` to keep future agents aligned with the intended behavior.
