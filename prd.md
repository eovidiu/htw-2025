# Product Requirements Document: Conference Capture

## Overview

A lightweight web application for quickly capturing and organizing text snippets and photos during conferences, enabling users to document insights, quotes, and visual content in real-time.

## Problem Statement

Conference attendees struggle to capture and organize valuable content during sessions. Switching between note-taking apps, camera apps, and organization tools disrupts focus and leads to fragmented, hard-to-review notes.

## Goals

- Enable rapid capture of text and photos with minimal friction
- Provide a unified interface for all conference content
- Allow easy review and export of captured content
- Work reliably on mobile devices and laptops

## Target Users

- Conference attendees
- Event participants
- Workshop learners
- Anyone needing quick content capture in live settings

## Core Features

### 1. Quick Capture Interface

**Priority: P0**

- Single-screen interface with prominent “Add Text” and “Add Photo” buttons
- Text input with auto-save functionality
- Direct camera access for photo capture
- Upload photos from device library
- Timestamp automatically added to each capture

### 2. Content Organization

**Priority: P0**

- Chronological feed of all captures
- Display text snippets and photo thumbnails
- Show timestamp for each item
- Optional manual reordering (drag and drop)

### 3. Content Management

**Priority: P0**

- Edit text snippets after creation
- Delete individual items
- Preview photos in full size on tap/click
- Add optional labels/tags to items

### 4. Session Management

**Priority: P1**

- Create named sessions (e.g., “Keynote”, “Workshop A”)
- Switch between active sessions
- View all items within a session
- Archive completed sessions

### 5. Data Persistence

**Priority: P0**

- Local storage in browser
- Automatic save on every action
- No account creation required for basic use

### 6. Export Capabilities

**Priority: P0** *(PDF export elevated to P0)*

- **Export session as PDF with text and photos** *(P0 - Primary export)*
  - Button positioned below first record in feed
  - Includes all text snippets and embedded photos
  - Header with session name, export date, and item count
  - Maintains chronological order with timestamps
  - Professional formatting with proper page breaks
  - Filename: `conference-captures-[session]-[date].pdf`
- Export as markdown file *(P1)*
- Download all photos as zip file *(P1)*
- Copy all text to clipboard *(P1)*

## Non-Goals (Out of Scope)

- Cloud sync across devices
- Real-time collaboration
- Audio recording
- Advanced text formatting
- Search functionality (v1)
- Social sharing features

## Technical Requirements

### Performance

- Capture action completes in < 1 second
- App loads in < 2 seconds on 4G connection
- Supports up to 500 items per session
- Photos compressed to max 2MB each
- PDF generation completes in < 10 seconds for typical session (20-30 items)

### Compatibility

- Works on iOS Safari, Android Chrome
- Responsive design for phones and tablets
- Desktop browser support (Chrome, Firefox, Safari, Edge)
- Works offline after initial load
- PDF download supported in all target browsers

### Storage

- Uses browser localStorage for text
- Uses IndexedDB for photos
- Graceful handling when storage quota reached

### Dependencies

- jsPDF or html2pdf.js for PDF generation
- Image compression library (browser-image-compression or canvas API)

## User Flow

### Primary Flow: Adding Content

1. User opens app
1. User taps “Add Text” or “Add Photo”
1. For text: Types content, automatically saved on blur
1. For photo: Camera opens → Take photo → Confirm → Saved
1. Item appears at top of feed with timestamp
1. User continues capturing

### Secondary Flow: Reviewing Content

1. User scrolls through feed
1. Taps photo to view full size
1. Taps text to edit
1. Uses session selector to view different sessions

### Tertiary Flow: Exporting Content

1. User scrolls past first record
1. Sees “Export to PDF” button
1. Taps export button
1. Loading indicator shows “Generating PDF…”
1. PDF downloads automatically to device
1. Success message confirms download

## Success Metrics

- Time from app open to first capture < 3 seconds
- 90% of users successfully capture at least 5 items
- 70% of users create multiple sessions
- < 5% data loss rate
- 60% of users export their content

## Design Principles

- **Speed over features**: Every interaction optimized for minimal taps/clicks
- **Forgiving**: Easy undo, auto-save everything
- **Distraction-free**: Minimal UI during capture mode
- **Mobile-first**: Design for one-handed phone use

## Open Questions

- Should we support voice-to-text for text captures?
- Do we need offline-first architecture or is local storage sufficient?
- Should photos be editable (crop, rotate)?
- What’s the optimal default photo compression level?

## Timeline (Suggested)

- **Week 1-2**: Core capture interface (text + photo)
- **Week 3**: Content feed and basic organization
- **Week 4**: Session management
- **Week 5**: Export functionality
- **Week 6**: Polish, testing, and bug fixes

## Future Considerations (v2+)

- Optional cloud backup
- Search within captures
- AI-generated summaries of text content
- Voice note support
- Desktop app version
- Template quick captures (e.g., “Key Quote”, “Action Item”)