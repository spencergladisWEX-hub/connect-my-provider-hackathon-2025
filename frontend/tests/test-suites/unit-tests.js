// Unit Tests for WEX Frontend Core Functionality
// Testing individual functions and components in isolation

describe('Core Utility Functions', () => {
    it('should validate provider configuration correctly', () => {
        // Mock provider config
        window.PROVIDER_CONFIG = {
            trellis: {
                name: 'Trellis Healthcare',
                displayName: 'trellishealth',
                terms: 'Test terms'
            }
        };
        
        const result = getProviderConfig('trellis');
        expect(result).toBeDefined();
        expect(result.name).toBe('Trellis Healthcare');
        expect(result.displayName).toBe('trellishealth');
    });
    
    it('should return null for invalid provider keys', () => {
        const result = getProviderConfig('invalid-provider');
        expect(result).toBeNull();
    });
    
    it('should handle missing PROVIDER_CONFIG gracefully', () => {
        delete window.PROVIDER_CONFIG;
        const result = getProviderConfig('trellis');
        expect(result).toBeNull();
    });
    
    it('should get app configuration correctly', () => {
        window.APP_CONFIG = {
            API_BASE: 'http://localhost:4000',
            DEFAULT_PROVIDER: 'trellis'
        };
        
        const result = getAppConfig();
        expect(result).toBeDefined();
        expect(result.API_BASE).toBe('http://localhost:4000');
        expect(result.DEFAULT_PROVIDER).toBe('trellis');
    });
    
    it('should get default transaction data', () => {
        window.APP_CONFIG = {
            DEFAULT_TRANSACTION: {
                id: 'TX-001',
                provider: 'Test Provider',
                amount: 100
            }
        };
        
        const result = getDefaultTransaction();
        expect(result).toBeDefined();
        expect(result.id).toBe('TX-001');
        expect(result.provider).toBe('Test Provider');
    });
    
    it('should create fallback transaction when config is missing', () => {
        delete window.APP_CONFIG;
        
        const result = getDefaultTransaction();
        expect(result).toBeDefined();
        expect(result.id).toBe('TX-FALLBACK');
        expect(result.provider).toBe('Provider Service');
    });
});

describe('Form Validation Functions', () => {
    it('should validate complete forms successfully', () => {
        const mockForm = document.createElement('form');
        mockForm.innerHTML = `
            <input type="text" required value="test" />
            <select required><option selected value="test">Test</option></select>
        `;
        
        const result = validateForm(mockForm);
        expect(result).toBe(true);
    });
    
    it('should fail validation for incomplete forms', () => {
        const mockForm = document.createElement('form');
        mockForm.innerHTML = `
            <input type="text" required value="" />
            <select required><option value="">Select</option></select>
        `;
        
        const result = validateForm(mockForm);
        expect(result).toBe(false);
    });
    
    it('should handle forms with no required fields', () => {
        const mockForm = document.createElement('form');
        mockForm.innerHTML = `
            <input type="text" value="test" />
            <select><option value="test">Test</option></select>
        `;
        
        const result = validateForm(mockForm);
        expect(result).toBe(true);
    });
    
    it('should add error class to invalid inputs', () => {
        const mockForm = document.createElement('form');
        mockForm.innerHTML = `
            <input type="text" required value="" />
        `;
        
        validateForm(mockForm);
        const input = mockForm.querySelector('input');
        expect(input.classList.contains('error')).toBe(true);
    });
    
    it('should remove error class from valid inputs', () => {
        const mockForm = document.createElement('form');
        mockForm.innerHTML = `
            <input type="text" required value="test" />
        `;
        
        validateForm(mockForm);
        const input = mockForm.querySelector('input');
        expect(input.classList.contains('error')).toBe(false);
    });
});

describe('Notification System', () => {
    beforeEach(() => {
        // Clear existing notifications
        document.querySelectorAll('.notification-toast').forEach(n => n.remove());
    });
    
    it('should create notification elements correctly', () => {
        showNotification('Test message', 'success');
        
        const notification = document.querySelector('.notification-toast');
        expect(notification).toBeDefined();
        expect(notification.classList.contains('notification-success')).toBe(true);
    });
    
    it('should display correct notification types', () => {
        const types = ['success', 'error', 'warning', 'info'];
        
        types.forEach(type => {
            showNotification(`Test ${type}`, type);
            const notification = document.querySelector(`.notification-${type}`);
            expect(notification).toBeDefined();
        });
    });
    
    it('should show correct notification icons', () => {
        const iconTests = [
            { type: 'success', expected: '✅' },
            { type: 'error', expected: '❌' },
            { type: 'warning', expected: '⚠️' },
            { type: 'info', expected: 'ℹ️' }
        ];
        
        iconTests.forEach(test => {
            const icon = getNotificationIcon(test.type);
            expect(icon).toBe(test.expected);
        });
    });
    
    it('should handle unknown notification types gracefully', () => {
        const icon = getNotificationIcon('unknown');
        expect(icon).toBe('ℹ️');
    });
    
    it('should auto-remove notifications after duration', async () => {
        showNotification('Test message', 'info', 100);
        
        const notification = document.querySelector('.notification-toast');
        expect(notification).toBeDefined();
        
        // Wait for auto-removal
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const remainingNotification = document.querySelector('.notification-toast');
        expect(remainingNotification).toBeNull();
    });
    
    it('should allow manual notification removal', () => {
        showNotification('Test message', 'info', 0); // No auto-removal
        
        const notification = document.querySelector('.notification-toast');
        const closeButton = notification.querySelector('.notification-close');
        
        closeButton.click();
        
        const remainingNotification = document.querySelector('.notification-toast');
        expect(remainingNotification).toBeNull();
    });
});

describe('Loading State Management', () => {
    it('should set loading state correctly', () => {
        const mockButton = document.createElement('button');
        mockButton.textContent = 'Submit';
        
        setLoadingState(mockButton, true);
        
        expect(mockButton.classList.contains('loading')).toBe(true);
        expect(mockButton.disabled).toBe(true);
        expect(mockButton.textContent).toBe('Loading...');
        expect(mockButton.dataset.originalText).toBe('Submit');
    });
    
    it('should restore original state after loading', () => {
        const mockButton = document.createElement('button');
        mockButton.textContent = 'Submit';
        
        setLoadingState(mockButton, true);
        setLoadingState(mockButton, false);
        
        expect(mockButton.classList.contains('loading')).toBe(false);
        expect(mockButton.disabled).toBe(false);
        expect(mockButton.textContent).toBe('Submit');
    });
    
    it('should handle elements without original text', () => {
        const mockButton = document.createElement('button');
        
        setLoadingState(mockButton, true);
        setLoadingState(mockButton, false);
        
        expect(mockButton.classList.contains('loading')).toBe(false);
        expect(mockButton.disabled).toBe(false);
    });
});

describe('Error Handling', () => {
    it('should show user-friendly network errors', () => {
        const networkError = new Error('Network request failed');
        showUserFriendlyError(networkError, 'network');
        
        const notification = document.querySelector('.notification-toast');
        expect(notification).toBeDefined();
        expect(notification.classList.contains('notification-error')).toBe(true);
    });
    
    it('should show user-friendly timeout errors', () => {
        const timeoutError = new Error('Request timeout');
        showUserFriendlyError(timeoutError, 'timeout');
        
        const notification = document.querySelector('.notification-toast');
        expect(notification).toBeDefined();
        expect(notification.classList.contains('notification-error')).toBe(true);
    });
    
    it('should show user-friendly provider errors', () => {
        const providerError = new Error('Provider configuration error');
        showUserFriendlyError(providerError, 'provider');
        
        const notification = document.querySelector('.notification-toast');
        expect(notification).toBeDefined();
        expect(notification.classList.contains('notification-error')).toBe(true);
    });
    
    it('should show generic error for unknown error types', () => {
        const unknownError = new Error('Unknown error');
        showUserFriendlyError(unknownError, 'unknown');
        
        const notification = document.querySelector('.notification-toast');
        expect(notification).toBeDefined();
        expect(notification.classList.contains('notification-error')).toBe(true);
    });
    
    it('should handle errors without message property', () => {
        const errorWithoutMessage = {};
        showUserFriendlyError(errorWithoutMessage, 'test');
        
        const notification = document.querySelector('.notification-toast');
        expect(notification).toBeDefined();
        expect(notification.classList.contains('notification-error')).toBe(true);
    });
});

describe('OAuth Step Management', () => {
    beforeEach(() => {
        // Create mock OAuth steps container
        const mockContainer = document.createElement('div');
        mockContainer.id = 'oauthSteps';
        mockContainer.innerHTML = `
            <div class="oauth-step">Step 1</div>
            <div class="oauth-step">Step 2</div>
            <div class="oauth-step">Step 3</div>
            <div class="oauth-step">Step 4</div>
        `;
        document.body.appendChild(mockContainer);
    });
    
    afterEach(() => {
        // Clean up
        const container = document.getElementById('oauthSteps');
        if (container) container.remove();
    });
    
    it('should mark steps as completed correctly', () => {
        updateOAuthStep(1, 'completed');
        
        const step1 = document.querySelector('#oauthSteps .oauth-step:nth-child(1)');
        expect(step1.classList.contains('completed')).toBe(true);
        expect(step1.innerHTML).toContain('✅ completed');
    });
    
    it('should mark steps as active correctly', () => {
        updateOAuthStep(2, 'active');
        
        const step2 = document.querySelector('#oauthSteps .oauth-step:nth-child(2)');
        expect(step2.classList.contains('active')).toBe(true);
        expect(step2.innerHTML).toContain('⏳ active');
    });
    
    it('should reset steps to pending state', () => {
        updateOAuthStep(3, 'pending');
        
        const step3 = document.querySelector('#oauthSteps .oauth-step:nth-child(3)');
        expect(step3.classList.contains('active')).toBe(false);
        expect(step3.classList.contains('completed')).toBe(false);
        expect(step3.innerHTML).toContain('⏳ pending');
    });
    
    it('should handle invalid step numbers gracefully', () => {
        // Should not throw error for invalid step numbers
        expect(() => {
            updateOAuthStep(99, 'completed');
        }).not.toThrow();
    });
    
    it('should apply smooth transitions to steps', () => {
        updateOAuthStep(1, 'completed');
        
        const step1 = document.querySelector('#oauthSteps .oauth-step:nth-child(1)');
        expect(step1.style.transition).toBe('all 0.5s ease');
    });
});

describe('Modal Animation Functions', () => {
    beforeEach(() => {
        // Create mock modal
        const mockModal = document.createElement('div');
        mockModal.id = 'testModal';
        mockModal.className = 'workflow-modal hidden';
        document.body.appendChild(mockModal);
    });
    
    afterEach(() => {
        // Clean up
        const modal = document.getElementById('testModal');
        if (modal) modal.remove();
    });
    
    it('should show modal with animation', () => {
        showModalWithAnimation('testModal');
        
        const modal = document.getElementById('testModal');
        expect(modal.classList.contains('hidden')).toBe(false);
    });
    
    it('should hide modal with animation', async () => {
        const modal = document.getElementById('testModal');
        modal.classList.remove('hidden');
        
        hideModalWithAnimation('testModal');
        
        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        expect(modal.classList.contains('hidden')).toBe(true);
    });
    
    it('should handle non-existent modals gracefully', () => {
        expect(() => {
            showModalWithAnimation('nonExistentModal');
        }).not.toThrow();
        
        expect(() => {
            hideModalWithAnimation('nonExistentModal');
        }).not.toThrow();
    });
});

describe('Provider Selection Enhancement', () => {
    beforeEach(() => {
        // Create mock provider select
        const mockSelect = document.createElement('select');
        mockSelect.id = 'providerSelect';
        mockSelect.innerHTML = `
            <option value="">Select Provider</option>
            <option value="trellis">Trellis Healthcare</option>
            <option value="epic">Epic Systems</option>
        `;
        document.body.appendChild(mockSelect);
    });
    
    afterEach(() => {
        // Clean up
        const select = document.getElementById('providerSelect');
        if (select) select.remove();
    });
    
    it('should add visual feedback on provider selection', () => {
        const select = document.getElementById('providerSelect');
        select.value = 'trellis';
        
        // Trigger change event
        const event = new Event('change');
        select.dispatchEvent(event);
        
        // Check if visual feedback was applied
        expect(select.style.borderColor).toBe('#10b981');
        expect(select.style.boxShadow).toContain('rgba(16, 185, 129, 0.1)');
    });
    
    it('should remove visual feedback after animation', async () => {
        const select = document.getElementById('providerSelect');
        select.value = 'epic';
        
        // Trigger change event
        const event = new Event('change');
        select.dispatchEvent(event);
        
        // Wait for feedback to be removed
        await new Promise(resolve => setTimeout(resolve, 1100));
        
        expect(select.style.borderColor).toBe('');
        expect(select.style.boxShadow).toBe('');
    });
    
    it('should not apply feedback for empty selection', () => {
        const select = document.getElementById('providerSelect');
        select.value = '';
        
        // Trigger change event
        const event = new Event('change');
        select.dispatchEvent(event);
        
        expect(select.style.borderColor).toBe('');
        expect(select.style.boxShadow).toBe('');
    });
});

describe('Form Submission Enhancement', () => {
    beforeEach(() => {
        // Create mock form
        const mockForm = document.createElement('form');
        mockForm.innerHTML = `
            <input type="text" required value="test" />
            <button type="submit">Submit</button>
        `;
        document.body.appendChild(mockForm);
    });
    
    afterEach(() => {
        // Clean up
        const form = document.querySelector('form');
        if (form) form.remove();
    });
    
    it('should validate form before submission', () => {
        const form = document.querySelector('form');
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Mock validateForm to return false
        const originalValidateForm = window.validateForm;
        window.validateForm = () => false;
        
        const event = new Event('submit');
        form.dispatchEvent(event);
        
        // Restore original function
        window.validateForm = originalValidateForm;
        
        // Form submission should be prevented
        expect(event.defaultPrevented).toBe(true);
    });
    
    it('should show loading state on valid form submission', () => {
        const form = document.querySelector('form');
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Mock validateForm to return true
        const originalValidateForm = window.validateForm;
        window.validateForm = () => true;
        
        const event = new Event('submit');
        form.dispatchEvent(event);
        
        // Restore original function
        window.validateForm = originalValidateForm;
        
        // Loading state should be applied
        expect(submitButton.classList.contains('loading')).toBe(true);
        expect(submitButton.disabled).toBe(true);
    });
    
    it('should handle forms without submit buttons gracefully', () => {
        const form = document.querySelector('form');
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.remove();
        
        // Mock validateForm to return true
        const originalValidateForm = window.validateForm;
        window.validateForm = () => true;
        
        const event = new Event('submit');
        form.dispatchEvent(event);
        
        // Restore original function
        window.validateForm = originalValidateForm;
        
        // Should not throw error
        expect(event.defaultPrevented).toBe(false);
    });
});
