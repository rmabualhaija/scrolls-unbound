# Scrolls Unbound - Character Builder

A web-based character builder for a custom D&D-inspired system with skill trees, traits, and persistent character saving.

## Features

### Character Creation
- **Point Buy System**: Allocate ability scores using a point buy system
- **Races & Birthsigns**: Choose from various races and birthsigns with unique bonuses
- **Skill Trees**: Invest points in red (combat), green (survival), and blue (magic) skill trees
- **Feats**: Select feats to customize your character further

### Character Management
- **Local Storage**: Automatic saving to browser localStorage
- **Export/Import**: Save characters as JSON files for backup and sharing
  - **Export**: Download your character as a JSON file with timestamp
  - **Import**: Load previously exported character files
- **Persistent Data**: Characters survive browser restarts and can be shared across devices

### Skill Tree System
- **Three Paths**: Red (combat focus), Green (survival/defense), Blue (magic)
- **Prerequisites**: Nodes require specific investments in other nodes
- **Choices**: Some nodes offer multiple options to choose from
- **Dynamic Effects**: Abilities and HP bonuses scale with your choices

### Special Features
- **Lord Birthsign**: Unique birthsign that provides HP bonus based on Constitution modifier (2 + CON mod)
- **Real-time Calculations**: All stats update automatically as you make changes
- **Visual Feedback**: Clear indication of available points and requirements

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**: Navigate to `http://localhost:5173`

## Character Saving

### Local Storage (Automatic)
- Characters are automatically saved to your browser's localStorage
- Data persists between browser sessions
- Limited to the current browser/device

### Export/Import (Recommended)
- **Export**: Click "Export Character" to download a JSON file
- **Import**: Click "Import Character" and select a previously exported file
- **Benefits**: 
  - Works across different browsers and devices
  - Survives browser data clearing
  - Can be shared with other players
  - Backup against data loss

## Development

### Tech Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Zustand** for state management
- **Tailwind CSS** for styling

### Project Structure
```
src/
├── components/          # React components
│   ├── CharacterSheet.tsx
│   ├── SkillNode.tsx
│   └── SkillTree.tsx
├── data/               # Game data
│   ├── skillNodes.ts   # Skill tree definitions
│   └── traits.ts       # Races, birthsigns, feats
├── store/              # State management
│   └── skillTreeStore.ts
└── types/              # TypeScript definitions
    └── skillTree.ts
```

### Adding New Content
- **Skill Nodes**: Add to `src/data/skillNodes.ts`
- **Traits**: Add races, birthsigns, or feats to `src/data/traits.ts`
- **Types**: Update `src/types/skillTree.ts` for new data structures

## License

This project is open source and available under the MIT License.
