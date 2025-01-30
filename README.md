# Universal Novel Reader

A cross-platform novel reader application that supports full-web novel search, online reading, and local file import.

## Main Features

### 1. Book Management
- Online book search
- Local book import (supports txt, epub, pdf formats)
- Bookshelf management
- Reading progress synchronization
- Book category management

### 2. Reading Features
- Multiple format support (txt, epub, pdf)
- Font size adjustment
- Background color switching
- Reading progress saving
- Bookmark functionality
- Table of contents navigation

### 3. Online Features
- Full-web novel search
- Smart recommendations
- Reading history synchronization
- Cloud backup for bookshelf

## Technical Architecture

### Frontend (UniApp)
- Vue.js 3
- uni-app framework
- epub.js (E-book parsing)
- pdf.js (PDF parsing)

### Backend (ASP.NET Core)
- .NET 8.0
- Entity Framework Core
- SignalR (Real-time communication)
- Redis (Caching)
- MongoDB (Data storage)

## Project Structure

```
BookReader/
├── src/
│   ├── BookReader.Web/          # ASP.NET Core backend
│   │   ├── Controllers/         # API controllers
│   │   ├── Properties/          # Project properties
│   │   ├── Program.cs          # Application entry point
│   │   └── BookReader.Web.csproj # Project file
│   │
│   ├── BookReader.Core/         # Core business logic
│   │   ├── Interfaces/         # Interface definitions
│   │   ├── Services/          # Service implementations
│   │   └── BookReader.Core.csproj
│   │
│   ├── BookReader.Data/         # Data access layer
│   │   ├── Repositories/      # Data repositories
│   │   ├── Context/          # Database context
│   │   └── BookReader.Data.csproj
│   │
│   ├── BookReader.Common/       # Common class library
│   │   ├── Models/           # Data models
│   │   └── BookReader.Common.csproj
│   │
│   └── BookReader.UniApp/       # UniApp frontend
│       ├── pages/             # Page files
│       │   ├── index/        # Bookshelf page
│       │   │   └── index.vue # Bookshelf implementation
│       │   ├── reader/       # Reader page
│       │   │   └── reader.vue # Reader implementation
│       │   └── bookstore/    # Bookstore page
│       ├── static/           # Static resources
│       ├── App.vue           # Application entry
│       ├── manifest.json     # Application configuration
│       ├── pages.json       # Page configuration
│       └── package.json     # Dependency configuration
│
└── tests/                    # Test projects
    ├── BookReader.Core.Tests/  # Core layer tests
    ├── BookReader.Data.Tests/  # Data layer tests
    └── BookReader.Web.Tests/   # API tests
```

### Frontend Page Explanation

#### 1. Bookshelf Page (pages/index/index.vue)
- Displays user's book list
- Supports local and network book import
- Book editing functionality (delete, select all)
- Displays reading progress
- Clicking on a book jumps to the reader

#### 2. Reader Page (pages/reader/reader.vue)
- Chapter content display
- Previous/next chapter navigation
- Table of contents functionality
- Reading settings (font size, theme, line height)
- Reading progress saving
- Smart toolbar (auto-hide)
- Touchscreen control

### Reader Functionality Explanation

#### 1. Reading Progress Management
- Automatically saves reading progress
- Multi-device progress synchronization
- Precise to specific reading position
- Supports offline reading progress saving

#### 2. Bookmark Functionality
- Add/delete bookmarks
- Bookmark content excerpt
- Add notes
- Bookmark list management
- Quick jump to bookmark position

#### 3. Reading Settings
- Font size adjustment (12-32px)
- Line height adjustment (1.0-2.0)
- Page margin adjustment (0-32rpx)
- Multiple theme switching
  - Default theme (white background, black text)
  - Eye protection theme (green background, black text)
  - Night mode (black background, gray text)
  - Paper theme (beige background, black text)
- Brightness adjustment
- Font selection
- Night mode

#### 4. Reader Operations
- Previous/next chapter navigation
- Table of contents quick jump
- Screen click area division
  - Upper area: previous page
  - Middle area: show/hide toolbar
  - Lower area: next page
- Auto-hide toolbar
- Reading progress display

### Technical Implementation

#### 1. Component Structure
- `ReadingSettingsPanel.vue`: Reading settings panel
- `BookmarkList.vue`: Bookmark list panel
- `reader.vue`: Reader main page

#### 2. Data Model
- `ReadingProgress.js`: Reading progress model
- `Bookmark.js`: Bookmark model
- `ReadingSettings.js`: Reading settings model

#### 3. Service Layer
- `ReadingProgressService.js`: Reading progress management
- `BookmarkService.js`: Bookmark management
- `ReadingSettingsService.js`: Reading settings management

#### 4. Storage Scheme
- Local storage
  - Reading settings
  - Reading progress
  - Bookmark data
- Online synchronization
  - Reading progress synchronization
  - Bookmark cloud backup
  - Settings synchronization

#### 5. API Interface
- `/api/reading-progress`: Reading progress interface
- `/api/bookmarks`: Bookmark management interface
- `/api/books/{id}/chapters`: Chapter content interface

### Backend Project Explanation

#### 1. BookReader.Web
- REST API interface
- SignalR real-time communication
- Swagger API documentation
- Cross-domain configuration

#### 2. BookReader.Core
- File processing service
- Book parsing service (txt, epub, pdf)
- Reading progress management
- Bookshelf management

#### 3. BookReader.Data
- Entity Framework Core
- MongoDB integration
- Redis caching
- Data repository pattern

#### 4. BookReader.Common
- Common data model
- Utility classes
- Constant definitions

## Testing Explanation

### Frontend Testing
1. Unit testing
   - Using Jest + Vue Test Utils for component testing
   - Test files located in `tests/unit/` directory
   - Run tests: `npm run test:unit`
   - Main test content:
     - Component rendering
     - User interaction
     - Business logic
     - API calls

2. Testing specification
   - Test file naming: `*.spec.js`
   - Each component corresponds to a test file
   - Using Mock to simulate external dependencies (such as uni-app API)
   - Using dependency injection to handle global objects

3. Mock example
```javascript
// Create uni mock object
const mockUni = {
  request: jest.fn(),
  showToast: jest.fn(),
  navigateTo: jest.fn()
};

// Use in testing
const wrapper = shallowMount(YourComponent, {
  global: {
    provide: {
      uni: mockUni
    }
  }
});
```

4. Asynchronous testing
```javascript
it('Asynchronous operation testing', async () => {
  // Set mock response
  mockUni.request.mockResolvedValue({
    data: { /* Response data */ }
  });

  await wrapper.vm.yourMethod();
  
  // Verify result
  expect(mockUni.showToast).toHaveBeenCalled();
});
```

5. Timer testing
```javascript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

it('Timer testing', () => {
  // Trigger operation containing timer
  wrapper.vm.methodWithTimer();
  
  // Advance time
  jest.advanceTimersByTime(1000);
  
  // Verify result
  expect(mockFunction).toHaveBeenCalled();
});
```

### Backend Testing
1. Unit testing
   - Using xUnit for testing
   - Test files located in each test project
   - Using Mock framework to simulate dependencies

2. Integration testing
   - Testing API interfaces
   - Testing database operations
   - Testing caching functionality

## Development Environment Requirements

### Backend Environment
- .NET 8.0 SDK
- Visual Studio 2022 or VS Code
- MongoDB
- Redis

### Frontend Environment
- HBuilderX (3.8.0+)
- Node.js (18.0.0+)
- WeChat developer tool (if developing WeChat mini-program)

## Running Explanation

### Backend Service
1. Open `BookReader.sln` in Visual Studio
2. Ensure `BookReader.Web` is the startup project
3. Press F5 to run the project
4. API service will start at http://localhost:5125
5. Can access http://localhost:5125/swagger to view API documentation

### UniApp Frontend
1. Open `src/BookReader.UniApp` directory in HBuilderX
2. Execute the following command to install dependencies:
   ```bash
   cd src/BookReader.UniApp
   npm install
   ```
3. Running methods:
   - H5 version: Click "Run -> Run in browser" in HBuilderX
   - App version: Click "Run -> Run on mobile or simulator" in HBuilderX
   - WeChat mini-program version: Click "Run -> Run on WeChat mini-program simulator" in HBuilderX

### Development Notes
1. Frontend API configuration is in `BookReader.UniApp/utils/request.js`
2. Backend configuration is in `BookReader.Web/appsettings.json`
3. Database connection string is configured in `BookReader.Web/appsettings.json`

## Deployment Explanation

### Backend Deployment
1. Configure appsettings.json
2. Run database migrations
3. Start ASP.NET Core application

### Frontend Deployment
1. Install dependencies: `npm install`
2. Development running: `npm run dev`
3. Packaging:
   - H5: `npm run build:h5`
   - Android: Package through HBuilderX
   - iOS: Package through HBuilderX

## Update Log

### 2025-01-26
- Initialize project structure
- Create basic framework
- Design database architecture
- Implement basic API design

## Contributing

Please read our contribution guidelines before submitting pull requests.

## License

This project is licensed under the MIT License.
