/**
 * WEX Benefits Portal - Functionality Test Script
 * Tests key functionality to ensure restructure didn't break anything
 */

console.log('🧪 Testing WEX Benefits Portal functionality...');

// Test 1: Check if configuration is loaded
console.log('\n📋 Test 1: Configuration Loading');
if (window.PROVIDER_CONFIG) {
    console.log('✅ PROVIDER_CONFIG loaded successfully');
    console.log('   • Available providers:', Object.keys(window.PROVIDER_CONFIG));
} else {
    console.log('❌ PROVIDER_CONFIG not loaded');
}

if (window.APP_CONFIG) {
    console.log('✅ APP_CONFIG loaded successfully');
    console.log('   • API Base:', window.APP_CONFIG.API_BASE);
} else {
    console.log('❌ APP_CONFIG not loaded');
}

// Test 2: Check if CSS is applied
console.log('\n🎨 Test 2: CSS Loading');
const body = document.body;
const computedStyle = window.getComputedStyle(body);
console.log('   • Background:', computedStyle.background);
console.log('   • Font family:', computedStyle.fontFamily);

// Test 3: Check if main elements are present
console.log('\n🏗️ Test 3: HTML Structure');
const requiredElements = [
    '.main-header',
    '.nav-container',
    '.logo',
    '.main-content',
    '.content-grid',
    '.card',
    '.action-btn'
];

requiredElements.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
        console.log(`✅ ${selector} found`);
    } else {
        console.log(`❌ ${selector} not found`);
    }
});

// Test 4: Check if modals are present
console.log('\n🎭 Test 4: Modal System');
const modals = document.querySelectorAll('.workflow-modal');
console.log(`   • Found ${modals.length} workflow modals`);

modals.forEach(modal => {
    const modalId = modal.id;
    const isHidden = modal.classList.contains('hidden');
    console.log(`   • ${modalId}: ${isHidden ? 'Hidden' : 'Visible'}`);
});

// Test 5: Check if JavaScript modules are loaded
console.log('\n⚡ Test 5: JavaScript Modules');
if (window.modalManager) {
    console.log('✅ ModalManager loaded');
    console.log('   • Initialized:', window.modalManager.isInitialized);
} else {
    console.log('❌ ModalManager not loaded');
}

if (window.providerManager) {
    console.log('✅ ProviderManager loaded');
    console.log('   • Initialized:', window.providerManager.isInitialized);
} else {
    console.log('❌ ProviderManager not loaded');
}

if (window.wexApp) {
    console.log('✅ Main Application loaded');
    console.log('   • Status:', window.wexApp.getStatus());
} else {
    console.log('❌ Main Application not loaded');
}

// Test 6: Check development helpers
console.log('\n🔧 Test 6: Development Helpers');
if (window.devHelpers) {
    console.log('✅ Development helpers available');
    console.log('   • Functions:', Object.keys(window.devHelpers));
} else {
    console.log('❌ Development helpers not available');
}

// Test 7: Test modal functionality
console.log('\n🎭 Test 7: Modal Functionality');
if (window.modalManager) {
    try {
        // Test modal registration
        const modalInfo = window.modalManager.getAllModals();
        console.log(`   • Registered modals: ${modalInfo.size}`);
        
        // Test modal visibility check
        const hasVisibleModals = window.modalManager.hasVisibleModals();
        console.log(`   • Has visible modals: ${hasVisibleModals}`);
        
        console.log('✅ Modal functionality working');
    } catch (error) {
        console.log('❌ Modal functionality error:', error.message);
    }
}

// Test 8: Test provider functionality
console.log('\n🏥 Test 8: Provider Functionality');
if (window.providerManager) {
    try {
        const connectedProviders = window.providerManager.getConnectedProviders();
        const availableProviders = window.providerManager.getAvailableProviders();
        
        console.log(`   • Connected providers: ${connectedProviders.length}`);
        console.log(`   • Available providers: ${availableProviders.length}`);
        
        console.log('✅ Provider functionality working');
    } catch (error) {
        console.log('❌ Provider functionality error:', error.message);
    }
}

// Test 9: Check responsive design
console.log('\n📱 Test 9: Responsive Design');
const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
};
console.log(`   • Viewport: ${viewport.width}x${viewport.height}`);

// Add responsive classes to body
document.body.classList.toggle('mobile', viewport.width < 768);
document.body.classList.toggle('tablet', viewport.width >= 768 && viewport.width < 1024);
document.body.classList.toggle('desktop', viewport.width >= 1024);

console.log('   • Responsive classes applied');

// Test 10: Performance check
console.log('\n🚀 Test 10: Performance');
if ('performance' in window) {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log(`   • Page load time: ${loadTime}ms`);
    
    if (loadTime < 3000) {
        console.log('✅ Load time is good (< 3s)');
    } else {
        console.log('⚠️ Load time is slow (> 3s)');
    }
} else {
    console.log('⚠️ Performance API not available');
}

console.log('\n🎯 Functionality Test Complete!');
console.log('\n💡 To test specific functionality:');
console.log('   • Check modals: devHelpers.checkModals()');
console.log('   • Test modal: devHelpers.testModal("termsModal")');
console.log('   • Reset portal: devHelpers.resetPortal()');
console.log('   • Enable debug: wexApp.enableDebug()');
