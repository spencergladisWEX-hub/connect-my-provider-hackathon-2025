/**
 * ProviderManager - Provider connection and workflow management
 * Handles provider selection, authentication, and connection workflows
 * 
 * @author WEX Development Team
 * @version 2.0
 */

export class ProviderManager {
    constructor() {
        this.connectedProviders = [];
        this.selectedProviderForWorkflow = null;
        this.isInitialized = false;
        this.debugMode = false;
        
        this.init();
    }
    
    /**
     * Initialize the provider manager
     */
    async init() {
        try {
            await this.loadConnectedProviders();
            this.setupEventListeners();
            this.isInitialized = true;
            
            if (this.debugMode) {
                console.log('✅ ProviderManager initialized successfully');
            }
        } catch (error) {
            console.error('❌ Error initializing ProviderManager:', error);
        }
    }
    
    /**
     * Load connected providers from backend session
     */
    async loadConnectedProviders() {
        try {
            // Check backend session for connected providers
            const backendUrl = window.APP_CONFIG?.API_BASE || 'http://localhost:4000';
            const response = await fetch(`${backendUrl}/api/expenses`, {
                method: 'HEAD',
                credentials: 'include'
            });

            if (response.ok) {
                // User is authenticated, check if they have connected providers
                const dataResponse = await fetch(`${backendUrl}/api/expenses`, {
                    credentials: 'include'
                });
                
                if (dataResponse.ok) {
                    const data = await dataResponse.json();
                    if (data.source && data.source !== 'none') {
                        // User has connected providers (Epic is connected)
                        this.connectedProviders = ['epic'];
                    }
                }
            }
            
            // Fallback to localStorage for demo purposes
            const stored = localStorage.getItem('connectedProviders');
            if (stored && this.connectedProviders.length === 0) {
                this.connectedProviders = JSON.parse(stored);
            }
            
            if (this.debugMode) {
                console.log('📱 Loaded connected providers:', this.connectedProviders);
            }
        } catch (error) {
            console.error('❌ Error loading connected providers:', error);
            this.connectedProviders = [];
        }
    }

    /**
     * Save connected providers to backend and localStorage
     */
    async saveConnectedProviders() {
        try {
            // Save to localStorage for demo purposes
            localStorage.setItem('connectedProviders', JSON.stringify(this.connectedProviders));
            
            // For Epic provider, the backend session already handles the connection
            // For other providers, we could implement backend storage here
            
            if (this.debugMode) {
                console.log('💾 Saved connected providers:', this.connectedProviders);
            }
        } catch (error) {
            console.error('❌ Error saving connected providers:', error);
        }
    }
    
    /**
     * Setup event listeners for provider interactions
     */
    setupEventListeners() {
        // Provider selection change handler
        document.addEventListener('change', (e) => {
            if (e.target.id === 'providerSelect') {
                this.handleProviderSelection(e.target.value);
            }
        });
        
        // Terms checkbox change handler
        document.addEventListener('change', (e) => {
            if (e.target.id === 'termsCheckbox') {
                this.handleTermsChange(e.target.checked);
            }
        });
        
        // Form submission handlers
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'authForm') {
                e.preventDefault();
                this.handleAuthSubmit(e);
            }
        });
    }
    
    /**
     * Handle provider selection change
     * @param {string} providerKey - The selected provider key
     */
    handleProviderSelection(providerKey) {
        try {
            if (this.debugMode) {
                console.log('🔍 Provider selection changed to:', providerKey);
            }
            
            if (providerKey) {
                this.selectedProviderForWorkflow = providerKey;
                this.updateTermsDisplay();
                this.updateSubmitButtonState();
                
                if (this.debugMode) {
                    console.log('✅ Workflow provider set to:', providerKey);
                }
            } else {
                // Reset workflow state if no provider selected
                this.selectedProviderForWorkflow = null;
                this.updateTermsDisplay();
                this.updateSubmitButtonState();
                
                if (this.debugMode) {
                    console.log('🔄 Workflow provider reset');
                }
            }
        } catch (error) {
            console.error('❌ Error handling provider selection:', error);
        }
    }
    
    /**
     * Handle terms checkbox change
     * @param {boolean} isChecked - Whether the checkbox is checked
     */
    handleTermsChange(isChecked) {
        try {
            if (this.debugMode) {
                console.log('🔍 Terms checkbox changed:', isChecked);
            }
            
            this.updateSubmitButtonState();
            
            // Visual feedback
            const checkbox = document.getElementById('termsCheckbox');
            if (checkbox) {
                const label = checkbox.closest('.checkbox-label');
                if (label) {
                    label.style.color = isChecked ? '#10b981' : '#4a5568';
                }
            }
        } catch (error) {
            console.error('❌ Error handling terms change:', error);
        }
    }
    
    /**
     * Update terms display based on selected provider
     */
    updateTermsDisplay() {
        try {
            const termsSection = document.getElementById('termsSection');
            const termsLink = document.getElementById('termsLink');
            const submitReadyHelp = document.getElementById('submitReadyHelp');
            
            if (!termsSection || !termsLink || !submitReadyHelp) {
                console.warn('⚠️ Terms elements not found');
                return;
            }
            
            if (this.selectedProviderForWorkflow) {
                const providerConfig = this.getProviderConfig(this.selectedProviderForWorkflow);
                
                if (providerConfig) {
                    // Update terms link
                    termsLink.textContent = `${providerConfig.name} Terms and Conditions`;
                    termsLink.onclick = () => this.showTerms(providerConfig);
                    
                    // Show terms section
                    termsSection.style.display = 'block';
                    
                    // Update help text
                    submitReadyHelp.textContent = `Please review and accept the ${providerConfig.name} terms to continue`;
                    submitReadyHelp.style.display = 'block';
                    
                    if (this.debugMode) {
                        console.log('✅ Terms display updated for provider:', this.selectedProviderForWorkflow);
                    }
                }
            } else {
                // Hide terms section
                termsSection.style.display = 'none';
                
                // Update help text
                submitReadyHelp.textContent = 'Please select a provider to continue';
                submitReadyHelp.style.display = 'block';
                
                if (this.debugMode) {
                    console.log('🔄 Terms display reset');
                }
            }
        } catch (error) {
            console.error('❌ Error updating terms display:', error);
        }
    }
    
    /**
     * Update submit button state
     */
    updateSubmitButtonState() {
        try {
            const submitBtn = document.getElementById('submitTermsBtn');
            const termsCheckbox = document.getElementById('termsCheckbox');
            
            if (!submitBtn || !termsCheckbox) {
                console.warn('⚠️ Submit button or terms checkbox not found');
                return;
            }
            
            const isReady = this.selectedProviderForWorkflow && termsCheckbox.checked;
            
            submitBtn.disabled = !isReady;
            
            if (this.debugMode) {
                console.log('🔧 Submit button state updated:', {
                    provider: this.selectedProviderForWorkflow,
                    termsAccepted: termsCheckbox.checked,
                    isReady: isReady
                });
            }
        } catch (error) {
            console.error('❌ Error updating submit button state:', error);
        }
    }
    
    /**
     * Handle authentication form submission
     * @param {Event} event - The form submission event
     */
    async handleAuthSubmit(event) {
        try {
            if (this.debugMode) {
                console.log('🔍 Debug: handleAuthSubmit called');
            }
            
            // Check if configs are loaded
            if (!window.PROVIDER_CONFIG || !window.APP_CONFIG) {
                console.error('❌ Config not loaded! PROVIDER_CONFIG:', window.PROVIDER_CONFIG, 'APP_CONFIG:', window.APP_CONFIG);
                alert('Configuration not loaded. Please refresh the page and try again.');
                return;
            }
            
            // Validate form
            if (!this.validateForm(event.target)) {
                return;
            }
            
            // Get selected provider
            const providerKey = this.selectedProviderForWorkflow;
            if (!providerKey) {
                alert('Please select a provider first.');
                return;
            }
            
            const providerConfig = this.getProviderConfig(providerKey);
            if (!providerConfig) {
                alert('Invalid provider configuration.');
                return;
            }
            
            // Show authentication modal
            this.showAuthModal(providerConfig);
            
            // Initiate real OAuth flow for Epic provider
            if (providerKey === 'epic') {
                await this.initiateEpicOAuth();
            } else {
                // For other providers, use mock authentication for now
                await this.simulateAuthentication(providerKey);
            }
            
        } catch (error) {
            console.error('❌ Error in handleAuthSubmit:', error);
            alert('An error occurred during authentication. Please try again.');
        }
    }

    /**
     * Initiate Epic OAuth flow
     */
    async initiateEpicOAuth() {
        try {
            if (this.debugMode) {
                console.log('🔐 Initiating Epic OAuth flow...');
            }
            
            // Redirect to backend OAuth endpoint
            const backendUrl = window.APP_CONFIG.API_BASE || 'http://localhost:4000';
            window.location.href = `${backendUrl}/auth/epic`;
            
        } catch (error) {
            console.error('❌ Epic OAuth initiation failed:', error);
            alert('Failed to initiate Epic authentication. Please try again.');
        }
    }
    
    /**
     * Validate form inputs
     * @param {HTMLElement} formElement - The form element to validate
     * @returns {boolean} - Whether the form is valid
     */
    validateForm(formElement) {
        try {
            const inputs = formElement.querySelectorAll('input[required], select[required]');
            let isValid = true;
            let firstInvalidInput = null;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                    
                    if (!firstInvalidInput) {
                        firstInvalidInput = input;
                    }
                } else {
                    input.classList.remove('error');
                }
            });
            
            if (!isValid && firstInvalidInput) {
                firstInvalidInput.focus();
                this.showNotification('Please fill in all required fields.', 'warning');
            }
            
            return isValid;
        } catch (error) {
            console.error('❌ Error validating form:', error);
            return false;
        }
    }
    
    /**
     * Show authentication modal
     * @param {Object} providerConfig - The provider configuration
     */
    showAuthModal(providerConfig) {
        try {
            // Hide terms modal
            if (window.modalManager) {
                window.modalManager.hide('termsModal');
            }
            
            // Show authentication modal
            setTimeout(() => {
                if (window.modalManager) {
                    window.modalManager.show('authModal');
                }
            }, 300);
            
            if (this.debugMode) {
                console.log('🎭 Authentication modal shown for:', providerConfig.name);
            }
        } catch (error) {
            console.error('❌ Error showing authentication modal:', error);
        }
    }
    
    /**
     * Simulate authentication process
     * @param {string} providerKey - The provider key
     */
    async simulateAuthentication(providerKey) {
        try {
            if (this.debugMode) {
                console.log('🔐 Simulating authentication for:', providerKey);
            }
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success modal
            if (window.modalManager) {
                window.modalManager.hide('authModal');
                window.modalManager.show('successModal');
            }
            
            // Add provider to connected list
            await this.addConnectedProvider(providerKey);
            
            // Update UI
            this.updateProviderUI(providerKey);
            
            if (this.debugMode) {
                console.log('✅ Authentication completed for:', providerKey);
            }
            
        } catch (error) {
            console.error('❌ Error during authentication simulation:', error);
        }
    }

    /**
     * Add provider to connected list with backend integration
     */
    async addConnectedProvider(providerKey) {
        try {
            if (!this.connectedProviders.includes(providerKey)) {
                this.connectedProviders.push(providerKey);
                
                // For Epic provider, the OAuth flow already established the connection
                // For other providers, we could call a backend API here
                if (providerKey !== 'epic') {
                    await this.linkProviderAccount(providerKey);
                }
                
                await this.saveConnectedProviders();
                
                if (this.debugMode) {
                    console.log('✅ Provider added to connected list:', providerKey);
                }
            }
        } catch (error) {
            console.error('❌ Error adding connected provider:', error);
        }
    }

    /**
     * Link provider account via backend API
     */
    async linkProviderAccount(providerKey) {
        try {
            const backendUrl = window.APP_CONFIG?.API_BASE || 'http://localhost:4000';
            const response = await fetch(`${backendUrl}/link-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    provider: providerKey,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Provider account linked:', result);
            } else {
                console.warn('⚠️ Provider account linking failed:', response.status);
            }
        } catch (error) {
            console.error('❌ Error linking provider account:', error);
        }
    }
    
    /**
     * Update provider UI after connection
     * @param {string} providerKey - The connected provider key
     */
    updateProviderUI(providerKey) {
        try {
            const providerConfig = this.getProviderConfig(providerKey);
            if (!providerConfig) return;
            
            // Update provider name display
            const providerNameElement = document.getElementById('providerName');
            if (providerNameElement) {
                providerNameElement.textContent = providerConfig.name;
            }
            
            // Show success message
            const successMessage = document.getElementById('successMessage');
            if (successMessage) {
                successMessage.classList.remove('hidden');
            }
            
            // Update claims count
            this.updateClaimsCount();
            
            if (this.debugMode) {
                console.log('✅ Provider UI updated for:', providerKey);
            }
            
        } catch (error) {
            console.error('❌ Error updating provider UI:', error);
        }
    }
    
    /**
     * Update claims count display
     */
    updateClaimsCount() {
        try {
            const claimsCount = this.connectedProviders.length;
            const claimsCountElement = document.getElementById('claimsCount');
            
            if (claimsCountElement) {
                claimsCountElement.textContent = claimsCount;
            }
            
            if (this.debugMode) {
                console.log('📊 Claims count updated:', claimsCount);
            }
            
        } catch (error) {
            console.error('❌ Error updating claims count:', error);
        }
    }
    
    /**
     * Get provider configuration
     * @param {string} providerKey - The provider key
     * @returns {Object|null} - Provider configuration or null
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
     * Show terms and conditions
     * @param {Object} providerConfig - The provider configuration
     */
    showTerms(providerConfig) {
        try {
            const terms = providerConfig.terms || 'Terms and conditions not available.';
            alert(terms);
            
            if (this.debugMode) {
                console.log('📜 Terms shown for:', providerConfig.name);
            }
        } catch (error) {
            console.error('❌ Error showing terms:', error);
        }
    }
    
    /**
     * Show notification
     * @param {string} message - The notification message
     * @param {string} type - The notification type (success, error, warning, info)
     */
    showNotification(message, type = 'info') {
        try {
            // This would integrate with a notification system
            console.log(`📢 ${type.toUpperCase()}: ${message}`);
            
            if (this.debugMode) {
                console.log('🔔 Notification shown:', { message, type });
            }
        } catch (error) {
            console.error('❌ Error showing notification:', error);
        }
    }
    
    /**
     * Handle add another provider
     */
    handleAddAnotherProvider() {
        try {
            if (this.debugMode) {
                console.log('🔍 Add Another Provider clicked');
            }
            
            // Check if terms modal exists
            const termsModal = document.getElementById('termsModal');
            if (!termsModal) {
                console.error('❌ Terms modal not found');
                alert('Terms modal not found. Please refresh the page.');
                return;
            }
            
            if (this.debugMode) {
                console.log('✅ Terms modal found');
            }
            
            // Reset workflow state for new provider
            this.selectedProviderForWorkflow = null;
            
            if (this.debugMode) {
                console.log('✅ Workflow state reset for new provider');
            }
            
            // Reset form elements
            this.resetProviderForm();
            
            // Update terms display
            this.updateTermsDisplay();
            
            // Show the terms modal
            if (window.modalManager) {
                window.modalManager.show('termsModal');
            }
            
            if (this.debugMode) {
                console.log('✅ Modal should be visible now for additional provider');
            }
            
        } catch (error) {
            console.error('❌ Error in handleAddAnotherProvider:', error);
            alert('An error occurred while opening the additional provider connection. Check the console for details.');
        }
    }
    
    /**
     * Reset provider form
     */
    resetProviderForm() {
        try {
            const providerSelect = document.getElementById('providerSelect');
            const termsCheckbox = document.getElementById('termsCheckbox');
            const submitTermsBtn = document.getElementById('submitTermsBtn');
            
            if (providerSelect) {
                // Filter out already connected providers
                const availableProviders = Object.keys(window.PROVIDER_CONFIG || {}).filter(
                    providerKey => !this.connectedProviders.includes(providerKey)
                );
                
                if (availableProviders.length === 0) {
                    alert('All available providers are already connected!');
                    return;
                }
                
                // Clear existing options and add filtered ones
                providerSelect.innerHTML = '<option value="">Select My Provider</option>';
                availableProviders.forEach(providerKey => {
                    const provider = window.PROVIDER_CONFIG[providerKey];
                    const option = document.createElement('option');
                    option.value = providerKey;
                    option.textContent = provider.name;
                    providerSelect.appendChild(option);
                });
                
                if (this.debugMode) {
                    console.log('✅ Provider select filtered to available providers:', availableProviders);
                }
            }
            
            if (termsCheckbox) {
                termsCheckbox.checked = false;
                if (this.debugMode) {
                    console.log('✅ Terms checkbox reset');
                }
            }
            
            if (submitTermsBtn) {
                submitTermsBtn.disabled = true;
                if (this.debugMode) {
                    console.log('✅ Submit button reset');
                }
            }
            
        } catch (error) {
            console.error('❌ Error resetting provider form:', error);
        }
    }
    
    /**
     * Enable debug mode
     */
    enableDebug() {
        this.debugMode = true;
        console.log('🔍 ProviderManager debug mode enabled');
    }
    
    /**
     * Disable debug mode
     */
    disableDebug() {
        this.debugMode = false;
        console.log('🔍 ProviderManager debug mode disabled');
    }
    
    /**
     * Get connected providers
     * @returns {Array} - Array of connected provider keys
     */
    getConnectedProviders() {
        return [...this.connectedProviders];
    }
    
    /**
     * Check if provider is connected
     * @param {string} providerKey - The provider key to check
     * @returns {boolean} - Whether the provider is connected
     */
    isProviderConnected(providerKey) {
        return this.connectedProviders.includes(providerKey);
    }
    
    /**
     * Get available providers (not yet connected)
     * @returns {Array} - Array of available provider keys
     */
    getAvailableProviders() {
        if (!window.PROVIDER_CONFIG) return [];
        
        return Object.keys(window.PROVIDER_CONFIG).filter(
            providerKey => !this.connectedProviders.includes(providerKey)
        );
    }
}

// Create global instance for backward compatibility
window.providerManager = new ProviderManager();

// Export for ES6 modules
export default window.providerManager;
