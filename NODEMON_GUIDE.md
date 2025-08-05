# Nodemon Development Guide

## Installation

\`\`\`bash

# Install nodemon as dev dependency

npm install --save-dev nodemon

# Or install globally

npm install -g nodemon
\`\`\`

## Configuration Options

### Basic Commands

- `npm run dev` - Start with nodemon
- `npm run dev:debug` - Start with debugging
- `npm run dev:verbose` - Verbose logging
- `rs` - Manual restart (type in terminal)

### File Watching

- Watches: `.js`, `.json`, `.env`, `.prisma` files
- Ignores: `node_modules`, `*.log`, `coverage`
- Delay: 1 second before restart

### Environment Variables

- `NODE_ENV=development` automatically set
- All `.env` variables loaded

## Troubleshooting

### Common Issues

1. **Too many restarts**
   \`\`\`bash
   npm run dev:delay # Increases delay to 2 seconds
   \`\`\`

2. **Files not being watched**
   \`\`\`bash
   npm run dev:legacy # Use legacy watch mode
   \`\`\`

3. **Performance issues**
   \`\`\`bash
   npm run dev:poll # Use polling instead of events
   \`\`\`

4. **Debugging not working**
   \`\`\`bash
   npm run dev:debug # Enables inspector on port 9229
   \`\`\`

### Manual Configuration

Create custom nodemon config:
\`\`\`json
{
"watch": ["src/**/*.js"],
"ignore": ["test/**/*"],
"ext": "js,json",
"delay": 2000
}
\`\`\`

## Best Practices

1. **Use .nodemonignore** for large projects
2. **Set appropriate delay** to avoid rapid restarts
3. **Use specific watch patterns** for better performance
4. **Enable verbose mode** for debugging watch issues
5. **Use rs command** for manual restarts during development
