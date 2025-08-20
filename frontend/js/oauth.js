/**
 * Epic FHIR OAuth Integration
 * Handles OAuth flow with Epic's FHIR sandbox
 */

class EpicOAuthHandler {
    constructor() {
        this.backendUrl = 'http://localhost:4000';
        this.frontendUrl = 'http://localhost:3000';
    }

    /**
     * Initiate Epic OAuth flow
     */
    async initiateAuth() {
        try {
            console.log('🔐 Initiating Epic OAuth flow...');
            
            // Redirect to backend OAuth endpoint
            window.location.href = `${this.backendUrl}/auth/epic`;
            
        } catch (error) {
            console.error('❌ OAuth initiation failed:', error);
            throw error;
        }
    }

    /**
     * Handle OAuth callback
     */
    async handleCallback() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const error = urlParams.get('error');

            if (error) {
                console.error('❌ OAuth error:', error);
                this.showError(`OAuth error: ${error}`);
                return;
            }

            if (code && state) {
                console.log('🔐 OAuth callback received, redirecting to backend...');
                // Backend will handle the token exchange
                // Frontend just needs to redirect to dashboard
                window.location.href = `${this.frontendUrl}/dashboard`;
            }
        } catch (error) {
            console.error('❌ OAuth callback handling failed:', error);
            this.showError('OAuth callback failed');
        }
    }

    /**
     * Load expense tracker data
     */
    async loadExpenseTracker() {
        try {
            console.log('📊 Loading expense tracker...');
            
            const response = await fetch(`${this.backendUrl}/api/expenses`, {
                credentials: 'include' // Include cookies for session
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('🔐 User not authenticated, redirecting to OAuth...');
                    await this.initiateAuth();
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Expense data loaded:', data);

            this.displayExpenses(data.expenses);
            this.displayPatientInfo(data.patient);
            this.displayCoverageInfo(data.coverage);

        } catch (error) {
            console.error('❌ Failed to load expenses:', error);
            
            // Fallback to mock data
            console.log('🔄 Falling back to mock data...');
            await this.loadMockExpenses();
        }
    }

    /**
     * Load mock expense data as fallback
     */
    async loadMockExpenses() {
        try {
            const response = await fetch(`${this.backendUrl}/api/mock-expenses`);
            const data = await response.json();
            
            this.displayExpenses(data.expenses);
            this.displayPatientInfo(data.patient);
            
        } catch (error) {
            console.error('❌ Failed to load mock expenses:', error);
            this.showError('Failed to load expense data');
        }
    }

    /**
     * Display expenses in the UI
     */
    displayExpenses(expenses) {
        const container = document.getElementById('expense-list');
        if (!container) {
            console.warn('⚠️ Expense list container not found');
            return;
        }

        if (!expenses || expenses.length === 0) {
            container.innerHTML = `
                <div class="no-expenses">
                    <p>No expenses found</p>
                    <p>Connect your provider to see your healthcare expenses</p>
                </div>
            `;
            return;
        }

        container.innerHTML = expenses.map(expense => `
            <div class="expense-item" data-expense-id="${expense.id}">
                <div class="expense-header">
                    <div class="expense-date">${this.formatDate(expense.date)}</div>
                    <div class="expense-status ${expense.status.toLowerCase()}">${expense.status}</div>
                </div>
                <div class="expense-details">
                    <div class="expense-provider">${expense.provider}</div>
                    <div class="expense-service">${expense.service}</div>
                    <div class="expense-category">${expense.category}</div>
                </div>
                <div class="expense-amount">
                    $${expense.amount.toFixed(2)} ${expense.currency}
                </div>
            </div>
        `).join('');
    }

    /**
     * Display patient information
     */
    displayPatientInfo(patient) {
        const container = document.getElementById('patient-info');
        if (!container) return;

        container.innerHTML = `
            <div class="patient-card">
                <h3>Patient Information</h3>
                <div class="patient-details">
                    <p><strong>Name:</strong> ${patient.name || 'Unknown'}</p>
                    <p><strong>ID:</strong> ${patient.id || 'Unknown'}</p>
                    ${patient.birth_date ? `<p><strong>Birth Date:</strong> ${patient.birth_date}</p>` : ''}
                    ${patient.gender ? `<p><strong>Gender:</strong> ${patient.gender}</p>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Display coverage information
     */
    displayCoverageInfo(coverage) {
        const container = document.getElementById('coverage-info');
        if (!container) return;

        if (!coverage || coverage.length === 0) {
            container.innerHTML = '<p>No coverage information available</p>';
            return;
        }

        container.innerHTML = `
            <div class="coverage-card">
                <h3>Insurance Coverage</h3>
                <div class="coverage-details">
                    ${coverage.map(cov => `
                        <div class="coverage-item">
                            <p><strong>Type:</strong> ${cov.type?.coding?.[0]?.display || 'Unknown'}</p>
                            <p><strong>Status:</strong> ${cov.status || 'Unknown'}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return 'Unknown Date';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error('❌ Error:', message);
        
        // You can implement a proper error display here
        alert(`Error: ${message}`);
    }

    /**
     * Check if user is authenticated
     */
    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.backendUrl}/api/expenses`, {
                method: 'HEAD',
                credentials: 'include'
            });
            
            return response.status !== 401;
        } catch (error) {
            console.error('❌ Auth check failed:', error);
            return false;
        }
    }
}

// Initialize OAuth handler
window.epicOAuth = new EpicOAuthHandler();

// Handle OAuth callback if we're on the callback page
if (window.location.pathname === '/auth/callback') {
    window.epicOAuth.handleCallback();
}
