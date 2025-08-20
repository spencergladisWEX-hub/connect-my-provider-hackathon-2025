#!/bin/bash

# WEX Benefits Portal - Build Script
# Optimizes CSS and JavaScript files for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}🏗️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [[ ! -f "index.html" ]]; then
    print_error "Build script must be run from the frontend directory"
    print_error "Current directory: $(pwd)"
    print_error "Expected files: index.html, config.js, assets/"
    exit 1
fi

print_status "Building WEX Benefits Portal for production..."

# Validate source files exist
print_status "Validating source files..."
REQUIRED_FILES=("index.html" "config.js" "assets/css/main.css" "assets/js/main.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        print_error "Required file missing: $file"
        exit 1
    fi
done

# Create build directory
BUILD_DIR="dist"
if [[ -d "$BUILD_DIR" ]]; then
    print_status "Cleaning existing build directory..."
    rm -rf "$BUILD_DIR"
fi

mkdir -p "$BUILD_DIR"
print_success "Created build directory: $BUILD_DIR"

# Copy HTML file
print_status "Copying HTML files..."
if [[ -f "index-new.html" ]]; then
    cp index-new.html "$BUILD_DIR/index.html"
    print_success "Copied index-new.html → index.html"
else
    print_warning "index-new.html not found, using index.html"
    cp index.html "$BUILD_DIR/index.html"
fi

# Create optimized CSS bundle
print_status "Bundling CSS files..."
CSS_FILES=("assets/css/main.css" "assets/css/components.css" "assets/css/modals.css" "assets/css/responsive.css")
CSS_BUNDLE="$BUILD_DIR/main.css"

# Check which CSS files exist and bundle them
EXISTING_CSS=()
for css_file in "${CSS_FILES[@]}"; do
    if [[ -f "$css_file" ]]; then
        EXISTING_CSS+=("$css_file")
    fi
done

if [[ ${#EXISTING_CSS[@]} -eq 0 ]]; then
    print_error "No CSS files found to bundle!"
    exit 1
fi

cat "${EXISTING_CSS[@]}" > "$CSS_BUNDLE"
print_success "Bundled ${#EXISTING_CSS[@]} CSS files → main.css"

# Minify CSS (basic minification)
print_status "Minifying CSS..."
if command -v css-minify &> /dev/null; then
    css-minify "$CSS_BUNDLE" -o "$BUILD_DIR/main.min.css"
    print_success "CSS minified using css-minify tool"
elif command -v cleancss &> /dev/null; then
    cleancss -o "$BUILD_DIR/main.min.css" "$CSS_BUNDLE"
    print_success "CSS minified using cleancss tool"
else
    # Basic minification using sed
    sed 's/\/\*.*\*\///g' "$CSS_BUNDLE" | \
    sed '/^[[:space:]]*$/d' | \
    sed 's/[[:space:]]\+/ /g' > "$BUILD_DIR/main.min.css"
    print_warning "Using basic CSS minification (install css-minify or cleancss for better results)"
fi

# Copy JavaScript files
print_status "Copying JavaScript files..."
mkdir -p "$BUILD_DIR/assets/js"
if [[ -d "assets/js" ]]; then
    cp assets/js/*.js "$BUILD_DIR/assets/js/" 2>/dev/null || true
    JS_COUNT=$(ls -1 "$BUILD_DIR/assets/js/"*.js 2>/dev/null | wc -l)
    print_success "Copied $JS_COUNT JavaScript files"
else
    print_warning "No JavaScript files found to copy"
fi

# Copy configuration files
print_status "Copying configuration files..."
mkdir -p "$BUILD_DIR/config"
if [[ -d "config" ]]; then
    cp config/*.js "$BUILD_DIR/config/" 2>/dev/null || true
    CONFIG_COUNT=$(ls -1 "$BUILD_DIR/config/"*.js 2>/dev/null | wc -l)
    print_success "Copied $CONFIG_COUNT configuration files"
else
    print_warning "No configuration files found to copy"
fi

# Create asset manifest
print_status "Creating asset manifest..."
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > "$BUILD_DIR/manifest.json" << EOF
{
  "version": "2.0.0",
  "buildDate": "$BUILD_DATE",
  "buildEnvironment": {
    "node": "$(node --version 2>/dev/null || echo 'not available')",
    "npm": "$(npm --version 2>/dev/null || echo 'not available')",
    "platform": "$(uname -s)"
  },
  "files": {
    "css": [
      "main.min.css"
    ],
    "js": [
      "assets/js/main.js",
      "assets/js/modalManager.js",
      "assets/js/providers.js"
    ],
    "config": [
      "config/app.js",
      "config/providers.js"
    ]
  },
  "optimizations": {
    "cssMinified": true,
    "jsModularized": true,
    "externalAssets": true,
    "buildTime": "$(date +%s)"
  }
}
EOF
print_success "Created asset manifest"

# Create optimized HTML with minified CSS
print_status "Creating optimized HTML..."
if [[ -f "$BUILD_DIR/index.html" ]]; then
    sed 's/assets\/css\/main.css/main.min.css/' "$BUILD_DIR/index.html" > "$BUILD_DIR/index.html.tmp"
    mv "$BUILD_DIR/index.html.tmp" "$BUILD_DIR/index.html"
    print_success "Updated HTML to use minified CSS"
fi

# Calculate file sizes and build statistics
print_status "Calculating build statistics..."
HTML_SIZE=$(wc -c < "$BUILD_DIR/index.html")
CSS_SIZE=$(wc -c < "$CSS_BUNDLE")
CSS_MIN_SIZE=$(wc -c < "$BUILD_DIR/main.min.css")
JS_SIZE=$(du -sh "$BUILD_DIR/assets/js" 2>/dev/null | cut -f1 || echo "0")
TOTAL_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)

# Calculate compression ratio
if [[ $CSS_SIZE -gt 0 ]]; then
    COMPRESSION_RATIO=$((100 - (CSS_MIN_SIZE * 100 / CSS_SIZE)))
else
    COMPRESSION_RATIO=0
fi

# Print build summary
echo ""
echo -e "${GREEN}🎉 Build completed successfully!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo -e "${BLUE}📁 Production files:${NC} $BUILD_DIR/"
echo -e "${BLUE}📄 HTML:${NC} $HTML_SIZE bytes"
echo -e "${BLUE}🎨 CSS (original):${NC} $CSS_SIZE bytes"
echo -e "${BLUE}🔧 CSS (minified):${NC} $CSS_MIN_SIZE bytes"
echo -e "${BLUE}📊 Compression:${NC} ${COMPRESSION_RATIO}% smaller"
echo -e "${BLUE}⚡ JavaScript:${NC} $JS_SIZE"
echo -e "${BLUE}📦 Total build:${NC} $TOTAL_SIZE"
echo "═══════════════════════════════════════════════════════════════"

# Create deployment instructions
print_status "Creating deployment instructions..."
cat > "$BUILD_DIR/DEPLOYMENT.md" << EOF
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

- **CSS**: Minified and bundled (${COMPRESSION_RATIO}% compression)
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

## 🔄 Build Information

- **Build Date**: $BUILD_DATE
- **Build Time**: $(date)
- **CSS Compression**: ${COMPRESSION_RATIO}%
- **Total Size**: $TOTAL_SIZE
EOF

print_success "Created deployment instructions"

# Provide next steps
echo ""
echo -e "${GREEN}🚀 Ready for deployment!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Test the build: cd $BUILD_DIR && python3 -m http.server 8000"
echo "  2. Open http://localhost:8000 in your browser"
echo "  3. Upload contents of $BUILD_DIR/ to your web server"
echo ""
echo -e "${BLUE}Build artifacts:${NC}"
echo "  • HTML: $BUILD_DIR/index.html"
echo "  • CSS: $BUILD_DIR/main.min.css (${COMPRESSION_RATIO}% compressed)"
echo "  • JS: $BUILD_DIR/assets/js/"
echo "  • Config: $BUILD_DIR/config/"
echo "  • Manifest: $BUILD_DIR/manifest.json"
echo "  • Deployment guide: $BUILD_DIR/DEPLOYMENT.md"
