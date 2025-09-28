# Intelligent Railway Section Controller Decision-Support System

A comprehensive frontend-only demo application for Smart India Hackathon, showcasing an advanced railway control system with real-time monitoring, conflict resolution, and decision support capabilities.

## 🚆 Features

### Authentication & Security
- Professional login system with demo credentials
- Theme persistence (Light/Dark/High-contrast)
- Role-based access simulation

### Core Functionality
- **Dashboard**: Real-time train monitoring with key performance indicators
- **Live Schedule**: Interactive Gantt timeline with conflict resolution
- **Conflict Management**: Automated detection and resolution recommendations
- **What-if Simulation**: Scenario testing with KPI impact analysis
- **Analytics & KPIs**: Comprehensive performance metrics and charts
- **Audit Logging**: Complete action tracking with CSV export
- **System Settings**: Configuration management and theme controls

### Technical Features
- Responsive design (desktop + tablet optimized)
- Real-time data simulation with automatic updates
- Smooth animations using Framer Motion
- Accessible design with keyboard shortcuts
- Professional Indian Railways visual theme
- Toast notifications for user feedback
- Local storage for persistence

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build Tool**: Vite

## 🚀 Quick Start

### Demo Credentials
```
Email: controller@indianrailways.gov.in
Password: railway123
```

### Installation & Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application will be available at `http://localhost:5173`

## 📊 Demo Data

The system uses static JSON files for demonstration:

- **trains.json**: 30+ sample trains with realistic data
- **conflicts.json**: Pre-configured conflict scenarios
- **auditLogs.json**: Sample controller actions

Real-time simulation updates data every 5-30 seconds to demonstrate live functionality.

## 🎯 Demo Script for Judges

1. **Login**: Use demo credentials to access the system
2. **Dashboard**: View real-time train status and alerts
3. **Live Schedule**: Monitor train timeline and resolve conflicts
4. **Conflict Resolution**: Accept recommendations or apply manual overrides
5. **Simulation**: Run delay scenarios and compare KPI impacts
6. **Theme Switching**: Demonstrate accessibility features
7. **Audit Export**: Show complete action logging and CSV export

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Sidebar)
│   └── ui/             # Basic UI elements (Button, Modal, etc.)
├── contexts/           # React contexts (Auth, Theme)
├── data/              # Demo JSON data files
├── hooks/             # Custom hooks (Toast notifications)
├── pages/             # Main application pages
├── types/             # TypeScript type definitions
└── App.tsx            # Main application component
```

## 🔧 Key Components

### Authentication System
- Simulated login with validation
- Session persistence in localStorage
- Protected routes with automatic redirection

### Real-time Simulation
- Automatic data updates using setInterval
- Realistic train movement calculations
- Dynamic conflict generation

### Conflict Resolution
- System recommendations with detailed analysis
- Manual override capabilities with reason tracking
- Impact assessment and logging

### What-if Simulation
- Multiple scenario types (delays, breakdowns, weather)
- Before/after KPI comparison
- Visual charts showing impact analysis

## 🎨 Design System

### Color Palette
- Primary: Blue (#3B82F6) - Trust and reliability
- Secondary: Teal (#14B8A6) - Modern technology
- Success: Green (#10B981) - On-time performance
- Warning: Yellow/Orange (#F59E0B) - Attention needed
- Error: Red (#EF4444) - Critical issues

### Typography
- Headers: 24px-32px, font-weight: 700
- Body: 14px-16px, line-height: 1.5
- Captions: 12px-14px for secondary information

### Spacing System
- Base unit: 8px
- Component spacing: 16px, 24px, 32px
- Section spacing: 48px, 64px

## 📱 Responsive Design

- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Collapsible sidebar, optimized layouts
- **Mobile**: Drawer navigation, stacked layouts (basic support)

## ♿ Accessibility Features

- High contrast theme for visual accessibility
- Keyboard navigation support
- ARIA labels and roles
- Color-blind friendly indicators
- Screen reader compatible structure

## 🔒 Security Considerations

- Client-side validation for demo purposes
- No real backend connections
- Simulated authentication tokens
- Safe localStorage usage

## 📋 Development Notes

### State Management
- React Context for global state (auth, theme)
- Local component state for UI interactions
- localStorage for persistence

### Performance Optimizations
- Code splitting with React.lazy (ready for implementation)
- Memoized components where appropriate
- Efficient re-render strategies

### Future Enhancements
- WebSocket integration for real-time updates
- PWA capabilities for offline usage
- Advanced analytics and ML predictions
- Integration with actual railway systems

## 🏆 Smart India Hackathon Ready

This demo application showcases:
- **Innovation**: Modern web technologies for railway management
- **User Experience**: Intuitive interface for controllers
- **Scalability**: Modular architecture for future expansion
- **Practicality**: Real-world applicable solution
- **Technical Excellence**: Clean code, best practices, comprehensive features

The system demonstrates how modern web technologies can enhance traditional railway operations, providing controllers with intelligent decision support while maintaining safety and efficiency standards.

## 📝 License

This project is developed for educational and demonstration purposes for Smart India Hackathon 2024.

---

**Built with ❤️ for Indian Railways modernization**