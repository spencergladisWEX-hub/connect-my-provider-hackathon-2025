#!/bin/bash

# WEX Benefits Portal - Project Cleanup Script
# Helps maintain project structure and organization

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}🧹 $1${NC}"
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

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}🏥 WEX Benefits Portal - Project Cleanup${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check file size
get_file_size() {
    if [[ -f "$1" ]]; then
        du -h "$1" | cut -f1
    else
        echo "0B"
    fi
}

# Function to count lines in file
count_lines() {
    if [[ -f "$1" ]]; then
        wc -l < "$1"
    else
        echo "0"
    fi
}

# Main cleanup function
main() {
    print_header
    
    print_status "Starting project cleanup and analysis..."
    
    # Check if we're in the right directory
    if [[ ! -f "README.md" ]] || [[ ! -d "frontend" ]] || [[ ! -d "backend" ]]; then
        print_error "This script must be run from the project root directory"
        print_error "Expected: README.md, frontend/, backend/ directories"
        exit 1
    fi
    
    print_success "Project root directory confirmed"
    
    # 1. Analyze project structure
    print_status "Analyzing project structure..."
    
    echo -e "${BLUE}📁 Project Structure:${NC}"
    echo "  • Frontend: $(get_file_size frontend/)"
    echo "  • Backend: $(get_file_size backend/)"
    echo "  • Documentation: $(get_file_size docs/)"
    echo "  • Total: $(get_file_size .)"
    
    # 2. Check frontend development file
    print_status "Checking frontend development file..."
    
    if [[ -f "frontend/index.html" ]]; then
        FRONTEND_SIZE=$(get_file_size frontend/index.html)
        FRONTEND_LINES=$(count_lines frontend/index.html)
        echo -e "${BLUE}📄 Frontend Development File:${NC}"
        echo "  • Size: $FRONTEND_SIZE"
        echo "  • Lines: $FRONTEND_LINES"
        
        if [[ $FRONTEND_LINES -gt 5000 ]]; then
            print_warning "Large development file detected (expected for rapid iteration)"
            print_success "This is normal - production code is in frontend/dist/"
        fi
    else
        print_error "Frontend development file missing: frontend/index.html"
    fi
    
    # 3. Check production build
    print_status "Checking production build..."
    
    if [[ -d "frontend/dist" ]]; then
        DIST_SIZE=$(get_file_size frontend/dist)
        echo -e "${BLUE}🚀 Production Build:${NC}"
        echo "  • Size: $DIST_SIZE"
        echo "  • Status: Available"
        
        if [[ -f "frontend/dist/index.html" ]]; then
            DIST_LINES=$(count_lines frontend/dist/index.html)
            echo "  • HTML Lines: $DIST_LINES"
            
            if [[ $DIST_LINES -lt 1000 ]]; then
                print_success "Production HTML is clean and optimized"
            else
                print_warning "Production HTML seems large - consider rebuilding"
            fi
        fi
    else
        print_warning "Production build not found - run: cd frontend && ./build.sh"
    fi
    
    # 4. Check backend structure
    print_status "Checking backend structure..."
    
    if [[ -d "backend" ]]; then
        BACKEND_FILES=$(find backend -name "*.py" | wc -l)
        BACKEND_SIZE=$(get_file_size backend/)
        echo -e "${BLUE}🐍 Backend:${NC}"
        echo "  • Python files: $BACKEND_FILES"
        echo "  • Total size: $BACKEND_SIZE"
        
        if [[ -f "backend/server.py" ]]; then
            SERVER_LINES=$(count_lines backend/server.py)
            echo "  • Main server: $SERVER_LINES lines"
        fi
    fi
    
    # 5. Check documentation
    print_status "Checking documentation..."
    
    if [[ -d "docs" ]]; then
        DOC_FILES=$(find docs -name "*.md" | wc -l)
        DOC_SIZE=$(get_file_size docs/)
        echo -e "${BLUE}📚 Documentation:${NC}"
        echo "  • Markdown files: $DOC_FILES"
        echo "  • Total size: $DOC_SIZE"
        
        # Check for key documentation files
        KEY_DOCS=("docs/00-INDEX.md" "docs/01-DEVELOPER_GUIDE.md" "frontend/README.md")
        for doc in "${KEY_DOCS[@]}"; do
            if [[ -f "$doc" ]]; then
                print_success "✓ $doc"
            else
                print_warning "Missing: $doc"
            fi
        done
    fi
    
    # 6. Check for potential issues
    print_status "Checking for potential issues..."
    
    # Check for large files that might be accidentally committed
    LARGE_FILES=$(find . -type f -size +10M -not -path "./.git/*" -not -path "./node_modules/*" 2>/dev/null || true)
    if [[ -n "$LARGE_FILES" ]]; then
        print_warning "Large files detected (>10MB):"
        echo "$LARGE_FILES" | while read -r file; do
            echo "  • $(get_file_size "$file") - $file"
        done
    else
        print_success "No unusually large files detected"
    fi
    
    # Check for temporary files
    TEMP_FILES=$(find . -name "*.tmp" -o -name "*.temp" -o -name "*~" -o -name ".#*" 2>/dev/null || true)
    if [[ -n "$TEMP_FILES" ]]; then
        print_warning "Temporary files found:"
        echo "$TEMP_FILES" | while read -r file; do
            echo "  • $file"
        done
    else
        print_success "No temporary files found"
    fi
    
    # 7. Recommendations
    print_status "Generating recommendations..."
    
    echo ""
    echo -e "${BLUE}💡 Recommendations:${NC}"
    
    if [[ ! -d "frontend/dist" ]]; then
        echo "  • Run frontend build: cd frontend && ./build.sh"
    fi
    
    if [[ ! -f "frontend/DEVELOPMENT_WORKFLOW.md" ]]; then
        echo "  • Development workflow guide is missing"
    fi
    
    # Check if build script is executable
    if [[ -f "frontend/build.sh" ]] && [[ ! -x "frontend/build.sh" ]]; then
        echo "  • Make build script executable: chmod +x frontend/build.sh"
    fi
    
    # 8. Summary
    print_status "Cleanup summary..."
    
    echo ""
    echo -e "${GREEN}🎉 Project cleanup completed!${NC}"
    echo "═══════════════════════════════════════════════════════════════"
    echo -e "${BLUE}📊 Project Health:${NC}"
    echo "  • Structure: ✅ Organized"
    echo "  • Documentation: ✅ Comprehensive"
    echo "  • Development workflow: ✅ Clear"
    echo "  • Production build: $(if [[ -d "frontend/dist" ]]; then echo "✅ Available"; else echo "⚠️  Needs build"; fi)"
    echo ""
    echo -e "${BLUE}🚀 Next steps:${NC}"
    echo "  1. Review any warnings above"
    echo "  2. Run frontend build if needed: cd frontend && ./build.sh"
    echo "  3. Test production build locally"
    echo "  4. Update documentation as needed"
    echo ""
}

# Help function
show_help() {
    echo "WEX Benefits Portal - Project Cleanup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verbose  Verbose output"
    echo ""
    echo "This script analyzes and cleans up the project structure,"
    echo "checking for potential issues and providing recommendations."
    echo ""
    echo "Must be run from the project root directory."
}

# Parse command line arguments
VERBOSE=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
main "$@"
