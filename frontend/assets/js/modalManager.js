/**
 * ModalManager - Professional modal management system
 * Prevents modal visibility issues and provides debugging tools
 * 
 * @author WEX Development Team
 * @version 2.0
 */

export class ModalManager {
    constructor() {
        this.activeModal = null;
        this.modals = new Map();
        this.isInitialized = false;
        this.debugMode = false;
        
        this.init();
    }
    
    /**
     * Initialize the modal manager
     */
    init() {
        try {
            // Register all workflow modals on page load
            this.registerModals();
            this.setupEventListeners();
            this.isInitialized = true;
            
            if (this.debugMode) {
                console.log('✅ ModalManager initialized successfully');
            }
        } catch (error) {
            console.error('❌ Error initializing ModalManager:', error);
        }
    }
    
    /**
     * Register all workflow modals
     */
    registerModals() {
        const modalElements = document.querySelectorAll('.workflow-modal');
        
        modalElements.forEach(modal => {
            const modalId = modal.id;
            if (modalId) {
                this.modals.set(modalId, {
                    element: modal,
                    isVisible: false,
                    zIndex: 1000
                });
                
                if (this.debugMode) {
                    console.log(`📝 Registered modal: ${modalId}`);
                }
            }
        });
        
        if (this.debugMode) {
            console.log(`📊 Total modals registered: ${this.modals.size}`);
        }
    }
    
    /**
     * Setup event listeners for modal interactions
     */
    setupEventListeners() {
        // Close button handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close')) {
                const modalId = e.target.closest('.workflow-modal')?.id;
                if (modalId) {
                    this.hide(modalId);
                }
            }
        });
        
        // Escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.hide(this.activeModal);
            }
        });
        
        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('workflow-modal')) {
                const modalId = e.target.id;
                if (modalId) {
                    this.hide(modalId);
                }
            }
        });
    }
    
    /**
     * Show a specific modal
     * @param {string} modalId - The ID of the modal to show
     */
    show(modalId) {
        try {
            if (!this.modals.has(modalId)) {
                console.warn(`⚠️ Modal not found: ${modalId}`);
                return false;
            }
            
            // Hide any currently active modal
            if (this.activeModal) {
                this.hide(this.activeModal);
            }
            
            const modal = this.modals.get(modalId);
            const modalElement = modal.element;
            
            // Show the modal
            modalElement.classList.remove('hidden');
            modal.isVisible = true;
            this.activeModal = modalId;
            
            // Focus management
            this.focusModal(modalElement);
            
            if (this.debugMode) {
                console.log(`🎭 Modal shown: ${modalId}`);
                this.logModalStatus();
            }
            
            return true;
        } catch (error) {
            console.error(`❌ Error showing modal ${modalId}:`, error);
            return false;
        }
    }
    
    /**
     * Hide a specific modal
     * @param {string} modalId - The ID of the modal to hide
     */
    hide(modalId) {
        try {
            if (!this.modals.has(modalId)) {
                console.warn(`⚠️ Modal not found: ${modalId}`);
                return false;
            }
            
            const modal = this.modals.get(modalId);
            const modalElement = modal.element;
            
            // Hide the modal
            modalElement.classList.add('hidden');
            modal.isVisible = false;
            
            // Clear active modal if this was it
            if (this.activeModal === modalId) {
                this.activeModal = null;
            }
            
            // Return focus to main content
            this.returnFocus();
            
            if (this.debugMode) {
                console.log(`🎭 Modal hidden: ${modalId}`);
                this.logModalStatus();
            }
            
            return true;
        } catch (error) {
            console.error(`❌ Error hiding modal ${modalId}:`, error);
            return false;
        }
    }
    
    /**
     * Hide all modals
     */
    hideAll() {
        try {
            this.modals.forEach((modal, modalId) => {
                if (modal.isVisible) {
                    this.hide(modalId);
                }
            });
            
            if (this.debugMode) {
                console.log('🎭 All modals hidden');
            }
        } catch (error) {
            console.error('❌ Error hiding all modals:', error);
        }
    }
    
    /**
     * Toggle modal visibility
     * @param {string} modalId - The ID of the modal to toggle
     */
    toggle(modalId) {
        if (!this.modals.has(modalId)) {
            console.warn(`⚠️ Modal not found: ${modalId}`);
            return false;
        }
        
        const modal = this.modals.get(modalId);
        
        if (modal.isVisible) {
            return this.hide(modalId);
        } else {
            return this.show(modalId);
        }
    }
    
    /**
     * Check if a modal is visible
     * @param {string} modalId - The ID of the modal to check
     * @returns {boolean} - Whether the modal is visible
     */
    isVisible(modalId) {
        if (!this.modals.has(modalId)) {
            return false;
        }
        
        return this.modals.get(modalId).isVisible;
    }
    
    /**
     * Get the currently active modal
     * @returns {string|null} - The ID of the active modal or null
     */
    getActiveModal() {
        return this.activeModal;
    }
    
    /**
     * Focus management for modals
     * @param {HTMLElement} modalElement - The modal element to focus
     */
    focusModal(modalElement) {
        try {
            // Find focusable elements in the modal
            const focusableElements = modalElement.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length > 0) {
                // Focus the first focusable element
                focusableElements[0].focus();
            }
            
            // Trap focus within the modal
            this.trapFocus(modalElement, focusableElements);
        } catch (error) {
            console.error('❌ Error focusing modal:', error);
        }
    }
    
    /**
     * Trap focus within the modal
     * @param {HTMLElement} modalElement - The modal element
     * @param {NodeList} focusableElements - Focusable elements in the modal
     */
    trapFocus(modalElement, focusableElements) {
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        modalElement.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }
    
    /**
     * Return focus to main content
     */
    returnFocus() {
        try {
            // Focus the main content area
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.focus();
            }
        } catch (error) {
            console.error('❌ Error returning focus:', error);
        }
    }
    
    /**
     * Log modal status for debugging
     */
    logModalStatus() {
        if (!this.debugMode) return;
        
        console.log('📊 Modal Status:');
        this.modals.forEach((modal, modalId) => {
            console.log(`  • ${modalId}: ${modal.isVisible ? 'Visible' : 'Hidden'}`);
        });
        console.log(`  • Active Modal: ${this.activeModal || 'None'}`);
    }
    
    /**
     * Enable debug mode
     */
    enableDebug() {
        this.debugMode = true;
        console.log('🔍 ModalManager debug mode enabled');
    }
    
    /**
     * Disable debug mode
     */
    disableDebug() {
        this.debugMode = false;
        console.log('🔍 ModalManager debug mode disabled');
    }
    
    /**
     * Get modal information
     * @param {string} modalId - The ID of the modal
     * @returns {Object|null} - Modal information or null if not found
     */
    getModalInfo(modalId) {
        if (!this.modals.has(modalId)) {
            return null;
        }
        
        return {
            id: modalId,
            element: this.modals.get(modalId).element,
            isVisible: this.modals.get(modalId).isVisible,
            isActive: this.activeModal === modalId
        };
    }
    
    /**
     * Get all registered modals
     * @returns {Map} - Map of all registered modals
     */
    getAllModals() {
        return new Map(this.modals);
    }
    
    /**
     * Check if any modal is visible
     * @returns {boolean} - Whether any modal is visible
     */
    hasVisibleModals() {
        return Array.from(this.modals.values()).some(modal => modal.isVisible);
    }
}

// Create global instance for backward compatibility
window.modalManager = new ModalManager();

// Export for ES6 modules
export default window.modalManager;
