# 🎨 Campus Marketplace - Assets

Static assets, stylesheets, and design resources for the Campus Marketplace platform.

## 📁 Directory Structure

```
assets/
├── css/                    # Compiled CSS files
│   ├── *.css              # Main stylesheets
│   └── *.css.map          # Source maps for debugging
├── images/                # Image assets (if any)
└── fonts/                 # Font files (if any)
```

## 🎨 Styling Architecture

The application uses a combination of:
- **SCSS** for component-specific styles
- **Compiled CSS** for production builds
- **Source maps** for development debugging

### CSS File Naming Convention

- `admin-*.css` - Admin dashboard styles
- `student-*.css` - Student-facing page styles
- `auth-*.css` - Authentication page styles
- `layout-*.css` - Layout component styles

### Source Maps

CSS source maps (`.css.map` files) are included for:
- Debugging styles in browser dev tools
- Mapping compiled CSS back to original SCSS sources
- Development workflow optimization

## 🚀 Usage

### Development

Styles are typically managed through the frontend build process in the `web/` directory. The `assets/css/` files are generated automatically during the build process.

### Production

The compiled CSS files in this directory are:
- Minified for optimal performance
- Cached by browsers for faster loading
- Served as static assets by the web server

## 🛠️ Build Process

### SCSS Compilation

```bash
# From the web directory
cd ../web

# Development build (with source maps)
npm run dev

# Production build (minified)
npm run build
```

### File Organization

- **Source SCSS**: Located in `web/src/style/`
- **Compiled CSS**: Generated in `assets/css/`
- **Source Maps**: Generated alongside CSS files

## 📊 File Management

### Adding New Styles

1. Create SCSS file in `web/src/style/`
2. Import in the corresponding component
3. Run build process to generate CSS

### Updating Existing Styles

1. Edit SCSS source files in `web/src/style/`
2. Rebuild the project
3. Deploy updated CSS files

## 🚨 Important Notes

### Do Not Edit CSS Files Directly

- **Never edit** the `.css` files in this directory directly
- All changes should be made to the source SCSS files in `web/src/style/`
- CSS files are auto-generated and will be overwritten

### Source Maps

- Keep source map files for debugging purposes
- They help map browser styles back to original SCSS sources
- Safe to include in production for debugging

### Performance Optimization

- CSS files are automatically minified in production builds
- Unused CSS is purged where possible
- Consider code splitting for large applications

## 📖 Related Documentation

For detailed styling information, see:
- [`web/README.md`](../web/README.md) - Frontend styling guide
- [`web/src/style/`](../web/src/style/) - Source SCSS files

For component-specific styling:
- Check component directories in `web/src/components/`
- Each component may have its own SCSS file
