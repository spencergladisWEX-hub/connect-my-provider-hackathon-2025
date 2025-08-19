/**
 * Main Application - WEX Benefits Portal
 * Core application logic and initialization
 * 
 * @author WEX Development Team
 * @version 2.0
 */

import { ModalManager } from './modalManager.js';
import { ProviderManager } from './providers.js';

class WEXBenefitsApp {
    constructor() {
        this.modalManager = null;
        this.providerManager = null;
        this.isInitialized = false;
        this.debugMode = false;
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🚀 Initializing WEX Benefits Portal...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupApplication());
            } else {
                this.setupApplication();
            }
            
        } catch (error) {
            console.error('❌ Error initializing application:', error);
        }
    }
    
    /**
     * Setup the application after DOM is ready
     */
    setupApplication() {
        try {
            // Initialize managers
            this.modalManager = new ModalManager();
            this.providerManager = new ProviderManager();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.initializeUI();
            
            // Setup development helpers
            this.setupDevelopmentHelpers();
            
            this.isInitialized = true;
            
            console.log('✅ WEX Benefits Portal initialized successfully');
            
        } catch (error) {
            console.error('❌ Error setting up application:', error);
        }
    }
    
    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        try {
            // Global click handlers
            document.addEventListener('click', (e) => {
                this.handleGlobalClick(e);
            });
            
            // Global keyboard handlers
            document.addEventListener('keydown', (e) => {
                this.handleGlobalKeydown(e);
            });
            
            // Window resize handler
            window.addEventListener('resize', () => {
                this.handleWindowResize();
            });
            
            console.log('✅ Global event listeners configured');
            
        } catch (error) {
            console.error('❌ Error setting up event listeners:', error);
        }
    }
    
    /**
     * Handle global click events
     */
    handleGlobalClick(e) {
        try {
            // Handle "Connect My Provider" button
            if (e.target.id === 'connectProviderBtn') {
                this.handleConnectProvider();
                return;
            }
            
            // Handle "Add Another Provider" button
            if (e.target.id === 'addAnotherProviderBtn') {
                this.handleAddAnotherProvider();
                return;
            }
            
            // Handle "Coming Soon" buttons
            if (e.target.onclick && e.target.onclick.toString().includes('showComingSoon')) {
                this.handleComingSoon(e.target);
                return;
            }
            
            // Handle alert close buttons
            if (e.target.classList.contains('alert-close')) {
                this.closeAlert(e.target);
                return;
            }
            
        } catch (error) {
            console.error('❌ Error handling global click:', error);
        }
    }
    
    /**
     * Handle global keyboard events
     */
    handleGlobalKeydown(e) {
        try {
            // Escape key - close active modal
            if (e.key === 'Escape') {
                if (this.modalManager && this.modalManager.activeModal) {
                    this.modalManager.hide(this.modalManager.activeModal);
                }
            }
            
            // Ctrl/Cmd + K - focus search (if implemented)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            
        } catch (error) {
            console.error('❌ Error handling global keydown:', error);
        }
    }
    
    /**
     * Handle window resize
     */
    handleWindowResize() {
        try {
            // Debounce resize events
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.updateResponsiveLayout();
            }, 250);
            
        } catch (error) {
            console.error('❌ Error handling window resize:', error);
        }
    }
    
    /**
     * Initialize the user interface
     */
    initializeUI() {
        try {
            // Initialize claims table
            this.initializeClaimsTable();
            
            // Initialize provider status
            this.initializeProviderStatus();
            
            // Initialize notifications
            this.initializeNotifications();
            
            // Setup accessibility features
            this.setupAccessibility();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            console.log('✅ User interface initialized');
            
        } catch (error) {
            console.error('❌ Error initializing UI:', error);
        }
    }
    
    /**
     * Initialize claims table
     */
    initializeClaimsTable() {
        try {
            const claimsTableBody = document.getElementById('claimsTableBody');
            if (!claimsTableBody) return;
            
            // Clear existing content
            claimsTableBody.innerHTML = '';
            
            // Add sample claim if no providers connected
            if (!this.providerManager || this.providerManager.getConnectedProviders().length === 0) {
                this.addSampleClaim();
            }
            
        } catch (error) {
            console.error('❌ Error initializing claims table:', error);
        }
    }
    
    /**
     * Add sample claim to table
     */
    addSampleClaim() {
        try {
            const claimsTableBody = document.getElementById('claimsTableBody');
            if (!claimsTableBody) return;
            
            const sampleClaim = {
                id: 'TX-001',
                provider: 'Downtown Dental Associates',
                dateOfService: '2025-08-19',
                patientResponsibility: 30.00,
                status: 'Pending',
                source: 'Pending Verification'
            };
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sampleClaim.id}</td>
                <td>${sampleClaim.provider}</td>
                <td>${sampleClaim.dateOfService}</td>
                <td>$${sampleClaim.patientResponsibility.toFixed(2)}</td>
                <td><span class="status-badge pending">${sampleClaim.status}</span></td>
                <td>${sampleClaim.source}</td>
                <td>
                    <button class="action-btn secondary" onclick="showComingSoon('View Details')">
                        View Details
                    </button>
                </td>
            `;
            
            claimsTableBody.appendChild(row);
            
        } catch (error) {
            console.error('❌ Error adding sample claim:', error);
        }
    }
    
    /**
     * Initialize provider status
     */
    initializeProviderStatus() {
        try {
            // Update claims count
            if (this.providerManager) {
                this.providerManager.updateClaimsCount();
            }
            
            // Update provider name display
            const providerNameElement = document.getElementById('providerName');
            if (providerNameElement) {
                const connectedProviders = this.providerManager ? this.providerManager.getConnectedProviders() : [];
                if (connectedProviders.length > 0) {
                    const firstProvider = connectedProviders[0];
                    const providerConfig = this.getProviderConfig(firstProvider);
                    if (providerConfig) {
                        providerNameElement.textContent = providerConfig.name;
                    }
                }
            }
            
        } catch (error) {
            console.error('❌ Error initializing provider status:', error);
        }
    }
    
    /**
     * Initialize notifications
     */
    initializeNotifications() {
        try {
            // Clear any existing notifications
            const existingNotifications = document.querySelectorAll('.notification');
            existingNotifications.forEach(notification => notification.remove());
            
        } catch (error) {
            console.error('❌ Error initializing notifications:', error);
        }
    }
    
    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        try {
            // Add ARIA labels to interactive elements
            const actionButtons = document.querySelectorAll('.action-btn, .btn-primary, .btn-secondary');
            actionButtons.forEach(button => {
                if (!button.getAttribute('aria-label')) {
                    button.setAttribute('aria-label', button.textContent.trim());
                }
            });
            
            // Add keyboard navigation to modals
            const modals = document.querySelectorAll('.workflow-modal');
            modals.forEach(modal => {
                modal.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        const closeButton = modal.querySelector('.modal-close');
                        if (closeButton) {
                            closeButton.click();
                        }
                    }
                });
            });
            
            console.log('✅ Accessibility features configured');
            
        } catch (error) {
            console.error('❌ Error setting up accessibility:', error);
        }
    }
    
    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        try {
            if ('performance' in window) {
                window.addEventListener('load', () => {
                    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    console.log(`🚀 Page loaded in ${loadTime}ms`);
                    
                    // Log performance metrics
                    if (loadTime > 3000) {
                        console.warn('⚠️ Page load time is slow (>3s)');
                    }
                });
            }
            
        } catch (error) {
            console.error('❌ Error setting up performance monitoring:', error);
        }
    }
    
    /**
     * Handle "Connect My Provider" button click
     */
    handleConnectProvider() {
        try {
            console.log('🔍 Connect My Provider clicked');
            
            if (this.modalManager) {
                this.modalManager.show('termsModal');
            }
            
        } catch (error) {
            console.error('❌ Error handling connect provider:', error);
        }
    }
    
    /**
     * Handle "Add Another Provider" button click
     */
    handleAddAnotherProvider() {
        try {
            console.log('🔍 Add Another Provider clicked');
            
            if (this.providerManager) {
                this.providerManager.handleAddAnotherProvider();
            }
            
        } catch (error) {
            console.error('❌ Error handling add another provider:', error);
        }
    }
    
    /**
     * Handle "Coming Soon" buttons
     */
    handleComingSoon(button) {
        try {
            const action = button.textContent.trim() || 'this feature';
            this.showComingSoon(action);
            
        } catch (error) {
            console.error('❌ Error handling coming soon:', error);
        }
    }
    
    /**
     * Show "Coming Soon" message
     */
    showComingSoon(action) {
        try {
            const message = `${action} is coming soon! We're working hard to bring you this feature.`;
            alert(message);
            
        } catch (error) {
            console.error('❌ Error showing coming soon:', error);
        }
    }
    
    /**
     * Close alert
     */
    closeAlert(closeButton) {
        try {
            const alert = closeButton.closest('.alert');
            if (alert) {
                alert.remove();
            }
            
        } catch (error) {
            console.error('❌ Error closing alert:', error);
        }
    }
    
    /**
     * Focus search (placeholder for future implementation)
     */
    focusSearch() {
        try {
            const searchInput = document.querySelector('input[type="search"], .search-input');
            if (searchInput) {
                searchInput.focus();
            } else {
                console.log('🔍 Search functionality not yet implemented');
            }
            
        } catch (error) {
            console.error('❌ Error focusing search:', error);
        }
    }
    
    /**
     * Update responsive layout
     */
    updateResponsiveLayout() {
        try {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Add responsive classes to body
            document.body.classList.toggle('mobile', width < 768);
            document.body.classList.toggle('tablet', width >= 768 && width < 1024);
            document.body.classList.toggle('desktop', width >= 1024);
            document.body.classList.toggle('landscape', height < width);
            
        } catch (error) {
            console.error('❌ Error updating responsive layout:', error);
        }
    }
    
    /**
     * Get provider configuration
     */
    getProviderConfig(providerKey) {
        try {
            if (!window.PROVIDER_CONFIG || !window.PROVIDER_CONFIG[providerKey]) {
                return null;
            }
            
            return window.PROVIDER_CONFIG[providerKey];
        } catch (error) {
            console.error('❌ Error getting provider config:', error);
            return null;
        }
    }
    
    /**
     * Setup development helper functions
     */
    setupDevelopmentHelpers() {
        try {
            // Development helper functions for debugging
            window.devHelpers = {
                // Check modal status
                checkModals: () => {
                    if (this.modalManager) {
                        this.modalManager.logModalStatus();
                    }
                },
                
                // Force hide all modals (emergency reset)
                resetModals: () => {
                    if (this.modalManager) {
                        this.modalManager.hideAll();
                    }
                },
                
                // Test specific modal
                testModal: (modalId) => {
                    if (this.modalManager) {
                        this.modalManager.show(modalId);
                        setTimeout(() => this.modalManager.hide(modalId), 2000);
                    }
                },
                
                // Check main content visibility
                checkMainContent: () => {
                    const mainContent = document.querySelector('.main-content');
                    console.log('Main Content:', {
                        element: !!mainContent,
                        visible: !mainContent?.classList?.contains('hidden'),
                        display: mainContent?.style?.display
                    });
                },
                
                // Emergency portal reset
                resetPortal: () => {
                    if (this.modalManager) {
                        this.modalManager.hideAll();
                    }
                    this.initializeUI();
                    console.log('✅ Portal reset completed');
                },
                
                // Check portal elements
                checkPortalElements: () => {
                    const elements = [
                        '.main-header',
                        '.alerts-section',
                        '.main-content',
                        '.card',
                        '.action-btn'
                    ];
                    
                    elements.forEach(selector => {
                        const element = document.querySelector(selector);
                        console.log(`${selector}:`, {
                            found: !!element,
                            visible: !element?.classList?.contains('hidden'),
                            display: element?.style?.display
                        });
                    });
                }
            };
            
            console.log('✅ Development helpers configured');
            
        } catch (error) {
            console.error('❌ Error setting up development helpers:', error);
        }
    }
    
    /**
     * Enable debug mode
     */
    enableDebug() {
        this.debugMode = true;
        
        if (this.modalManager) {
            this.modalManager.enableDebug();
        }
        
        if (this.providerManager) {
            this.providerManager.enableDebug();
        }
        
        console.log('🔍 Application debug mode enabled');
    }
    
    /**
     * Disable debug mode
     */
    disableDebug() {
        this.debugMode = false;
        
        if (this.modalManager) {
            this.modalManager.disableDebug();
        }
        
        if (this.providerManager) {
            this.providerManager.disableDebug();
        }
        
        console.log('🔍 Application debug mode disabled');
    }
    
    /**
     * Get application status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            debugMode: this.debugMode,
            modalManager: this.modalManager ? 'Active' : 'Inactive',
            providerManager: this.providerManager ? 'Active' : 'Inactive'
        };
    }
}

// Initialize the application
const app = new WEXBenefitsApp();

// Export for global access
window.wexApp = app;

// Export for ES6 modules
export default app;
