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
    async setupApplication() {
        try {
            // Initialize managers
            this.modalManager = new ModalManager();
            this.providerManager = new ProviderManager();
            
            // Wait for provider manager to initialize
            await this.providerManager.init();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI
            await this.initializeUI();
            
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
    async initializeUI() {
        try {
            // Initialize claims table
            await this.initializeClaimsTable();
            
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
    async initializeClaimsTable() {
        try {
            const claimsTableBody = document.getElementById('claimsTableBody');
            if (!claimsTableBody) return;
            
            // Clear existing content
            claimsTableBody.innerHTML = '';
            
            // Load real claims data from backend
            await this.loadRealClaimsData();
            
        } catch (error) {
            console.error('❌ Error initializing claims table:', error);
            // Fallback to sample claim if real data fails
            this.addSampleClaim();
        }
    }

    /**
     * Load real claims data from backend API
     */
    async loadRealClaimsData() {
        try {
            const backendUrl = window.APP_CONFIG?.API_BASE || 'http://localhost:4000';
            const response = await fetch(`${backendUrl}/api/expenses`, {
                credentials: 'include' // Include cookies for session
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('🔐 User not authenticated, showing sample data');
                    this.addSampleClaim();
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Real claims data loaded:', data);

            if (data.expenses && data.expenses.length > 0) {
                this.displayRealClaims(data.expenses);
            } else {
                console.log('📝 No real claims found, showing sample data');
                this.addSampleClaim();
            }

        } catch (error) {
            console.error('❌ Failed to load real claims:', error);
            // Fallback to sample claim
            this.addSampleClaim();
        }
    }

    /**
     * Display real claims from FHIR EOB data
     */
    displayRealClaims(expenses) {
        try {
            const claimsTableBody = document.getElementById('claimsTableBody');
            if (!claimsTableBody) return;

            expenses.forEach(expense => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${expense.id || 'N/A'}</td>
                    <td>${expense.provider || 'Unknown Provider'}</td>
                    <td>${expense.date || 'N/A'}</td>
                    <td>$${expense.amount ? expense.amount.toFixed(2) : '0.00'}</td>
                    <td><span class="status-badge ${expense.status?.toLowerCase() || 'pending'}">${expense.status || 'Pending'}</span></td>
                    <td>${expense.service || 'N/A'}</td>
                    <td>
                        <button class="action-btn secondary" onclick="window.wexApp.viewTransactionDetails('${expense.id}')">
                            View Details
                        </button>
                    </td>
                `;
                
                claimsTableBody.appendChild(row);
            });

            console.log(`✅ Displayed ${expenses.length} real claims`);

        } catch (error) {
            console.error('❌ Error displaying real claims:', error);
            this.addSampleClaim();
        }
    }

    /**
     * View transaction details using real backend API
     */
    async viewTransactionDetails(transactionId) {
        try {
            console.log('🔍 Viewing transaction details for:', transactionId);
            
            const backendUrl = window.APP_CONFIG?.API_BASE || 'http://localhost:4000';
            const response = await fetch(`${backendUrl}/transaction-status/${transactionId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 404) {
                    alert('Transaction not found. It may have been processed or removed.');
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const transaction = await response.json();
            this.showTransactionDetails(transaction);

        } catch (error) {
            console.error('❌ Error fetching transaction details:', error);
            alert('Failed to load transaction details. Please try again.');
        }
    }

    /**
     * Show transaction details in a modal
     */
    showTransactionDetails(transaction) {
        try {
            const detailsHtml = `
                <div class="transaction-details">
                    <h3>Transaction Details</h3>
                    <div class="detail-row">
                        <strong>Transaction ID:</strong> ${transaction.id}
                    </div>
                    <div class="detail-row">
                        <strong>Provider:</strong> ${transaction.provider}
                    </div>
                    <div class="detail-row">
                        <strong>Date of Service:</strong> ${transaction.dateOfService}
                    </div>
                    <div class="detail-row">
                        <strong>Patient Responsibility:</strong> $${transaction.patientResponsibility?.toFixed(2) || '0.00'}
                    </div>
                    <div class="detail-row">
                        <strong>Status:</strong> <span class="status-badge ${transaction.status?.toLowerCase()}">${transaction.status}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Source:</strong> ${transaction.source}
                    </div>
                    ${transaction.eob ? `
                        <div class="detail-row">
                            <strong>EOB ID:</strong> ${transaction.eob.id}
                        </div>
                        <div class="detail-row">
                            <strong>EOB Status:</strong> ${transaction.eob.status}
                        </div>
                    ` : ''}
                </div>
            `;

            // Create and show modal
            const modal = document.createElement('div');
            modal.className = 'workflow-modal';
            modal.id = 'transactionDetailsModal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Transaction Details</h2>
                        <button class="modal-close" onclick="this.closest('.workflow-modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${detailsHtml}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closest('.workflow-modal').remove()">Close</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.classList.remove('hidden');

        } catch (error) {
            console.error('❌ Error showing transaction details:', error);
            alert('Failed to display transaction details.');
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
     * Focus search and implement real search functionality
     */
    async focusSearch() {
        try {
            const searchInput = document.querySelector('input[type="search"], .search-input');
            if (searchInput) {
                searchInput.focus();
                
                // Add event listener for real-time search
                if (!searchInput.dataset.searchInitialized) {
                    searchInput.addEventListener('input', (e) => {
                        this.performSearch(e.target.value);
                    });
                    searchInput.dataset.searchInitialized = 'true';
                }
            } else {
                console.log('🔍 Search functionality not yet implemented');
            }
            
        } catch (error) {
            console.error('❌ Error focusing search:', error);
        }
    }

    /**
     * Perform real search using backend API
     */
    async performSearch(query) {
        try {
            if (!query || query.trim().length < 2) {
                // Clear search results if query is too short
                this.clearSearchResults();
                return;
            }

            console.log('🔍 Performing search for:', query);
            
            const backendUrl = window.APP_CONFIG?.API_BASE || 'http://localhost:4000';
            const response = await fetch(`${backendUrl}/api/expenses?search=${encodeURIComponent(query)}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('🔐 User not authenticated for search');
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.displaySearchResults(data.expenses || [], query);

        } catch (error) {
            console.error('❌ Error performing search:', error);
            this.showSearchError();
        }
    }

    /**
     * Display search results
     */
    displaySearchResults(expenses, query) {
        try {
            const searchResultsContainer = document.getElementById('searchResults') || this.createSearchResultsContainer();
            
            if (expenses.length === 0) {
                searchResultsContainer.innerHTML = `
                    <div class="search-no-results">
                        <p>No expenses found matching "${query}"</p>
                    </div>
                `;
                return;
            }

            const resultsHtml = expenses.map(expense => `
                <div class="search-result-item" onclick="window.wexApp.viewTransactionDetails('${expense.id}')">
                    <div class="result-header">
                        <span class="result-provider">${expense.provider || 'Unknown Provider'}</span>
                        <span class="result-amount">$${expense.amount ? expense.amount.toFixed(2) : '0.00'}</span>
                    </div>
                    <div class="result-details">
                        <span class="result-service">${expense.service || 'N/A'}</span>
                        <span class="result-date">${expense.date || 'N/A'}</span>
                    </div>
                    <div class="result-status">
                        <span class="status-badge ${expense.status?.toLowerCase() || 'pending'}">${expense.status || 'Pending'}</span>
                    </div>
                </div>
            `).join('');

            searchResultsContainer.innerHTML = `
                <div class="search-results">
                    <div class="search-results-header">
                        <h3>Search Results for "${query}"</h3>
                        <span class="result-count">${expenses.length} result${expenses.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="search-results-list">
                        ${resultsHtml}
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('❌ Error displaying search results:', error);
        }
    }

    /**
     * Create search results container if it doesn't exist
     */
    createSearchResultsContainer() {
        const container = document.createElement('div');
        container.id = 'searchResults';
        container.className = 'search-results-container';
        
        // Insert after the main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.parentNode.insertBefore(container, mainContent.nextSibling);
        }
        
        return container;
    }

    /**
     * Clear search results
     */
    clearSearchResults() {
        const searchResultsContainer = document.getElementById('searchResults');
        if (searchResultsContainer) {
            searchResultsContainer.innerHTML = '';
        }
    }

    /**
     * Show search error
     */
    showSearchError() {
        const searchResultsContainer = document.getElementById('searchResults') || this.createSearchResultsContainer();
        searchResultsContainer.innerHTML = `
            <div class="search-error">
                <p>Failed to perform search. Please try again.</p>
            </div>
        `;
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
