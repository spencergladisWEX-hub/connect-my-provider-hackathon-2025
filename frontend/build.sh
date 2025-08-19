#!/bin/bash

# WEX Benefits Portal - Build Script
# Optimizes CSS and JavaScript files for production

echo "🏗️  Building WEX Benefits Portal for production..."

# Create build directory
BUILD_DIR="dist"
mkdir -p $BUILD_DIR

# Copy HTML file
echo "📄 Copying HTML files..."
cp index-new.html $BUILD_DIR/index.html

# Create optimized CSS bundle
echo "🎨 Bundling CSS files..."
cat assets/css/main.css assets/css/components.css assets/css/modals.css assets/css/responsive.css > $BUILD_DIR/main.css

# Minify CSS (basic minification)
echo "🔧 Minifying CSS..."
sed 's/\/\*.*\*\///g' $BUILD_DIR/main.css | \
sed '/^[[:space:]]*$/d' | \
sed 's/[[:space:]]\+/ /g' > $BUILD_DIR/main.min.css

# Copy JavaScript files
echo "⚡ Copying JavaScript files..."
mkdir -p $BUILD_DIR/assets/js
cp assets/js/*.js $BUILD_DIR/assets/js/

# Copy configuration files
echo "⚙️  Copying configuration files..."
mkdir -p $BUILD_DIR/config
cp config/*.js $BUILD_DIR/config/

# Create asset manifest
echo "📋 Creating asset manifest..."
cat > $BUILD_DIR/manifest.json << EOF
{
  "version": "2.0.0",
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "files": {
    "css": [
      "main.min.css"
    ],
    "js": [
      "assets/js/modalManager.js",
      "assets/js/providers.js",
      "assets/js/main.js"
    ],
    "config": [
      "config/providers.js",
      "config/app.js"
    ]
  },
  "optimizations": {
    "cssMinified": true,
    "jsModularized": true,
    "externalAssets": true
  }
}
EOF

# Create optimized HTML with minified CSS
echo "🔧 Creating optimized HTML..."
sed 's/assets\/css\/main.css/main.min.css/' $BUILD_DIR/index.html > $BUILD_DIR/index.html.tmp
mv $BUILD_DIR/index.html.tmp $BUILD_DIR/index.html

# Calculate file sizes
echo "📊 Build Summary:"
echo "  • HTML: $(wc -c < $BUILD_DIR/index.html) bytes"
echo "  • CSS (original): $(wc -c < $BUILD_DIR/main.css) bytes"
echo "  • CSS (minified): $(wc -c < $BUILD_DIR/main.min.css) bytes"
echo "  • JavaScript: $(du -sh $BUILD_DIR/assets/js | cut -f1)"
echo "  • Total build size: $(du -sh $BUILD_DIR | cut -f1)"

# Create deployment instructions
echo "📚 Creating deployment instructions..."
cat > $BUILD_DIR/DEPLOYMENT.md << EOF
# WEX Benefits Portal - Production Deployment

## 🚀 Quick Deploy

1. **Upload all files** from the \`dist\` directory to your web server
2. **Ensure your server supports ES6 modules** (modern browsers)
3. **Test the application** in production environment

## 📁 File Structure

\`\`\`
dist/
├── index.html              # Main application
├── main.min.css            # Minified CSS bundle
├── main.css                # Original CSS (for reference)
├── assets/js/              # JavaScript modules
├── config/                 # Configuration files
├── manifest.json           # Build manifest
└── DEPLOYMENT.md           # This file
\`\`\`

## 🔧 Server Requirements

- **ES6 Module Support**: Required for JavaScript functionality
- **MIME Types**: Ensure .js files are served with correct MIME type
- **CORS**: Configure if serving from different domain

## 🧪 Testing

1. **Check Console**: No JavaScript errors
2. **Test Modals**: Provider connection workflow
3. **Test Responsiveness**: Different screen sizes
4. **Test Accessibility**: Keyboard navigation

## 📈 Performance

- **CSS**: Minified and bundled
- **JavaScript**: Modular and optimized
- **Assets**: External references for caching
- **Loading**: Progressive enhancement

## 🆘 Troubleshooting

- **Modules not loading**: Check server MIME types
- **CSS not applying**: Verify file paths
- **JavaScript errors**: Check browser console
- **Modals not working**: Verify ModalManager initialization

## 📞 Support

For technical support, check the console logs and refer to the development documentation.
EOF

echo ""
echo "✅ Build completed successfully!"
echo "📁 Production files are in: $BUILD_DIR/"
echo "🚀 Ready for deployment!"
echo ""
echo "To test the build:"
echo "  cd $BUILD_DIR"
echo "  python3 -m http.server 8000"
echo "  open http://localhost:8000"
