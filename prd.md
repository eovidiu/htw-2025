# Product Requirements Document: Conference Capture Web App

## Product Overview
A lightweight, mobile-first web application for quickly capturing and organizing text snippets and photos during conferences. The app prioritizes speed and minimal friction over complex features.

## Core Features (Priority Order)

### P0 - Must Have

#### 1. Quick Capture Interface
- Single-screen interface with prominent "Add Text" and "Add Photo" buttons
- Text input with auto-save functionality
- Direct camera access for photo capture
- Upload photos from device library
- Automatic timestamp on each capture

#### 2. Content Organization
- Chronological feed of all captures
- Display text snippets and photo thumbnails
- Show timestamp for each item
- Optional manual reordering (drag and drop)

#### 3. Content Management
- Edit text snippets after creation
- Delete individual items
- Preview photos in full size on tap/click
- Add optional labels/tags to items

#### 4. Data Persistence
- Local storage in browser (localStorage for text)
- IndexedDB for photos
- Automatic save on every action
- No account creation required

### P1 - Should Have

#### 5. Session Management
- Create named sessions (e.g., "Keynote", "Workshop A")
- Switch between active sessions
- View all items within a session
- Archive completed sessions

#### 6. Export Capabilities
- Export session as PDF with text and photos
- Export as markdown file
- Download all photos as zip file
- Copy all text to clipboard

## Technical Requirements

### Performance Targets
- Capture action completes in < 1 second
- App loads in < 2 seconds on 4G connection
- Supports up to 500 items per session
- Photos compressed to max 2MB each

### Compatibility
- Works on iOS Safari, Android Chrome (primary targets)
- Responsive design for phones and tablets
- Desktop browser support (Chrome, Firefox, Safari, Edge)
- Works offline after initial load

### Storage
- Browser localStorage for text data
- IndexedDB for photo storage
- Graceful handling when storage quota is reached

## User Flows

### Primary Flow - Adding Content
1. User opens app
2. User taps "Add Text" or "Add Photo"
3. For text: Types content, automatically saved on blur
4. For photo: Camera opens → Take photo → Confirm → Saved
5. Item appears at top of feed with timestamp

### Secondary Flow - Reviewing Content
1. User scrolls through chronological feed
2. Taps photo to view full size
3. Taps text snippet to edit
4. Uses session selector to switch between sessions

## Design Principles
- **Speed over features**: Every interaction optimized for minimal taps/clicks
- **Forgiving**: Easy undo, auto-save everything
- **Distraction-free**: Minimal UI during capture mode
- **Mobile-first**: Design for one-handed phone use

## Technology Stack

### UI Framework: Tailwind CSS
- Utility-first CSS framework for rapid development
- Built-in mobile-first responsive design
- Minimal learning curve
- Small production bundle (includes only used CSS)
- No component lock-in - full control over HTML

### Implementation Approach
- React with Vite for fast development
- Single-page application architecture
- Progressive Web App (PWA) capabilities for offline support
- Use native Web APIs for camera access
- Compress images client-side before storage

## Project Structure
```
/src
  /components
    - CaptureButtons.jsx
    - TextCapture.jsx
    - PhotoCapture.jsx
    - ContentFeed.jsx
    - CaptureItem.jsx
    - PhotoViewer.jsx
    - SessionSelector.jsx (P1)
    - ExportMenu.jsx (P1)
  /utils
    - storage.js (localStorage helpers)
    - indexedDB.js (photo storage)
    - imageCompression.js
    - exportHelpers.js (PDF, markdown, zip - P1)
  /styles
    - main.css (Tailwind setup)
  - App.jsx
  - main.jsx
- index.html
```

## Key Implementation Notes
1. Use HTML5 `<input type="file" accept="image/*" capture="camera">` for camera access
2. Implement image compression using Canvas API before storing
3. Use localStorage for app state and text content
4. Use IndexedDB for binary photo data
5. Add service worker for offline functionality (P1)
6. Use CSS Grid/Flexbox for responsive layouts
7. Implement drag-and-drop reordering with native HTML5 Drag and Drop API

## Success Criteria
- Time from app open to first capture < 3 seconds
- Smooth performance with 100+ captures
- Zero data loss during normal operation
- Works reliably on mobile devices without network

## Out of Scope (Don't Build)
- Cloud sync across devices
- User accounts or authentication
- Real-time collaboration
- Audio recording
- Advanced text formatting (rich text editor)
- Search functionality
- Social sharing features

## Implementation Status

### ✅ Completed (P0)
- Quick capture interface with Add Text and Add Photo buttons
- Text input with modal interface
- Photo capture with camera/library access
- Image compression to 2MB max
- Chronological content feed
- Timestamps with relative time display
- Edit text snippets
- Delete items with confirmation
- Full-size photo preview
- Tags/labels functionality
- localStorage for text data
- IndexedDB for photo storage
- Drag-and-drop reordering
- Mobile-first responsive design with Tailwind CSS

### 🔄 Pending (P1)
- Session management
- Export capabilities (PDF, markdown, zip)
- Service worker for offline functionality
- PWA manifest

## Version History
- **v1.0.0** - Initial release with all P0 features (2025-10-01)
