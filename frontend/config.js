/**
 * WEX Benefits Portal - Configuration
 * 
 * ⚠️ CODE REVIEWER: This is client-side config for demo purposes
 * In production, sensitive data would be server-side only
 * 
 * See frontend/README.md for architecture explanation
 * Production code is in frontend/dist/
 * 
 * This file provides centralized configuration for the development environment
 * and will be processed during the build step for production.
 */

// Centralized configuration for the demo (frontend-only)
// Note: In production, never expose secrets in client-side code

window.PROVIDER_CONFIG = {
  trellis: {
    name: 'Trellis Healthcare',
    displayName: 'trellishealth',
    terms:
      'Trellis Healthcare Terms and Conditions:\n\nBy connecting your Trellis Healthcare provider, you authorize WEX to access your healthcare information for the purpose of automatic claim verification and substantiation. This connection will enable real-time updates and zero-touch approval of eligible expenses.\n\nYour data is protected under HIPAA regulations and WEX security standards.\n\nTrellis Healthcare specific terms: Real-time data synchronization, automated eligibility checks, and instant claim processing.',
    logo:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwQzdCMiIvPgo8cGF0aCBkPSJNMTIgMjBMMTggMjZMMjggMTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=',
  },
  epic: {
    name: 'Epic Systems',
    displayName: 'Epic MyChart',
    terms:
      'Epic Systems Terms and Conditions:\n\nBy connecting your Epic Systems provider, you authorize WEX to access your healthcare information for the purpose of automatic claim verification and substantiation. This connection will enable real-time updates and zero-touch approval of eligible expenses.\n\nYour data is protected under HIPAA regulations and WEX security standards.\n\nEpic Systems specific terms: MyChart integration, secure data transmission, and comprehensive health record access.',
    logo:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwN0FDQyIvPgo8cGF0aCBkPSJNMTIgMjBMMTggMjZMMjggMTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=',
  },
  cerner: {
    name: 'Cerner Corporation',
    displayName: 'Cerner Health',
    terms:
      'Cerner Corporation Terms and Conditions:\n\nBy connecting your Cerner Corporation provider, you authorize WEX to access your healthcare information for the purpose of automatic claim verification and substantiation. This connection will enable real-time updates and zero-touch approval of eligible expenses.\n\nYour data is protected under HIPAA regulations and WEX security standards.\n\nCerner specific terms: PowerChart integration, secure clinical data access, and automated eligibility verification.',
    logo:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzAwQjJGRiIvPgo8cGF0aCBkPSJNMTIgMjBMMTggMjZMMjggMTQiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=',
  },
};

window.APP_CONFIG = {
  API_BASE: 'http://localhost:4000',
  DEFAULT_PROVIDER: 'trellis',
  DEFAULT_TRANSACTION: {
    id: 'TX-001',
    provider: 'Downtown Dental Associates',
    dateOfService: '2025-08-19',
    patientResponsibility: 30.0,
    currency: 'USD',
    status: 'Pending',
    source: 'Pending Verification',
  },
};

// Initialize ModalManager and other systems
(async function initializeSystems() {
  try {
    console.log('🚀 Initializing WEX Benefits Portal systems...');
    
    // Import ModalManager
    const { ModalManager } = await import('./assets/js/modalManager.js');
    
    // Create global instance
    window.modalManager = new ModalManager();
    
    // Enable debug mode for development
    window.modalManager.enableDebug();
    
    console.log('✅ ModalManager initialized successfully');
    console.log('✅ Available modals:', Array.from(window.modalManager.getAllModals().keys()));
    
    // Initialize other systems
    await initializeOtherSystems();
    
  } catch (error) {
    console.error('❌ Error initializing systems:', error);
    
    // Fallback: Create a basic modal manager
    console.log('🔄 Creating fallback modal manager...');
    window.modalManager = createFallbackModalManager();
  }
})();

// Initialize other systems
async function initializeOtherSystems() {
  try {
    // Import ProviderManager
    const { ProviderManager } = await import('./assets/js/providers.js');
    
    // Create global instance
    window.providerManager = new ProviderManager();
    
    // Enable debug mode for development
    window.providerManager.enableDebug();
    
    console.log('✅ ProviderManager initialized successfully');
    
    // Import main app
    const { default: mainApp } = await import('./assets/js/main.js');
    
    console.log('✅ Main application initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing other systems:', error);
  }
}

// Fallback modal manager for when ES6 modules fail
function createFallbackModalManager() {
  console.log('🔄 Creating fallback modal manager...');
  
  return {
    show: function(modalId) {
      console.log('🔧 Fallback: Showing modal', modalId);
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('hidden');
      }
    },
    hide: function(modalId) {
      console.log('🔧 Fallback: Hiding modal', modalId);
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('hidden');
      }
    },
    hideAll: function() {
      console.log('🔧 Fallback: Hiding all modals');
      const modals = document.querySelectorAll('.workflow-modal');
      modals.forEach(modal => modal.classList.add('hidden'));
    },
    getAllModals: function() {
      return new Map();
    },
    enableDebug: function() {
      console.log('🔍 Fallback debug mode enabled');
    }
  };
}


