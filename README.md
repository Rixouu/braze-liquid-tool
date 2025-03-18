# Liquid Syntax Editor for Braze CRM

## Last Updated

September,14th 2023
March, 18th 2025

## Overview

The Liquid Syntax Editor is an advanced web-based tool designed for marketers and developers to create and edit personalized messages using Liquid syntax for Braze CRM. This editor offers a sophisticated interface for template management, content editing with preserved Liquid syntax, and real-time preview functionality.

## Features

- **Template Library**: Browse and select from a categorized collection of pre-defined templates.
- **Syntax Highlighting**: Enhanced real-time highlighting of Liquid syntax for efficient editing.
- **Live Preview**: Instant rendering of messages with Liquid syntax applied.
- **Sample Data Editor**: Edit sample data in real-time to test different scenarios.
- **Enhanced Dark Mode**: Optimized dark theme with true black backgrounds and better contrast for reduced eye strain.
- **Responsive Design**: Fully functional across desktop and mobile devices.
- **Copy and Reset**: Quick actions to copy edited content or revert to the original template.
- **Documentation**: Integrated documentation for each template and general Liquid syntax guide.
- **Search Functionality**: Easily find templates with a built-in search feature.

## Technology Stack

- React 18
- Vite 4
- TypeScript 5
- Tailwind CSS 3
- shadcn/ui components
- next-themes for theme management
- LiquidJS for Liquid syntax parsing and rendering
- Luxon for advanced date and time handling

## Getting Started

### Prerequisites

- Node.js (version 16 or later recommended)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/liquid-syntax-editor.git
   cd liquid-syntax-editor
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

   or if you're using yarn:

   ```bash
   yarn install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   or with yarn:

   ```bash
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port specified in your console).

## Usage

1. Use the search bar to find specific templates or browse the categorized template library.
2. Select a template to load it into the editor.
3. Edit the content in the syntax-highlighted editor while preserving the Liquid syntax.
4. Modify sample data in the Sample Data Editor to test different scenarios.
5. View your changes in real-time in the preview pane.
6. Access template-specific documentation and general Liquid syntax guide using the documentation buttons.
7. Use the Copy button to copy your edited content to the clipboard.
8. Use the Reset button to revert to the original template content.
9. Toggle between light and dark modes using the theme switch.

## New Features and Optimizations (March 2025)

- **Modular Code Architecture**: Completely restructured codebase for better maintainability and performance.
- **Enhanced Dark Mode**: Redesigned dark theme with true black backgrounds and improved contrast.
- **Optimized Performance**: Reduced component re-renders and improved state management.
- **Improved Sample Data Editor**: More intuitive interface with better date picking capabilities.
- **Responsive Documentation Dialogs**: Redesigned documentation windows for better readability.
- **Type Safety**: Enhanced TypeScript interfaces and type definitions.
- **Organizational Structure**: Clear separation of templates, components, and utility functions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Braze CRM for inspiring this project
- The React and Vite communities for their excellent tools and documentation
- shadcn/ui for the beautiful UI components
- LiquidJS for the Liquid templating engine
- Luxon for powerful date and time manipulation

## Contact

Jonathan Rycx
<https://www.linkedin.com/in/jonathanrycx/>
