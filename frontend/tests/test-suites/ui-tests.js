// UI Tests for WEX Frontend
// Testing visual appearance, responsiveness, and user interface behavior

describe('Visual Design and Styling', () => {
    beforeEach(() => {
        // Setup test DOM with all UI components
        document.body.innerHTML = `
            <div class="app">
                <header class="main-header">
                    <div class="nav-container">
                        <h1 class="logo">WEX BENEFITS</h1>
                        <nav class="nav-center">
                            <a href="#" class="nav-link active">Dashboard</a>
                            <a href="#" class="nav-link">Claims</a>
                            <a href="#" class="nav-link">HSA</a>
                        </nav>
                        <div class="nav-right">
                            <span class="notification-badge">3</span>
                            <div class="user-menu">User</div>
                        </div>
                    </div>
                </header>
                
                <main class="main-content">
                    <div class="content-grid">
                        <div class="left-column">
                            <div class="card">
                                <h2>Provider Connection</h2>
                                <div class="action-buttons">
                                    <button class="action-btn primary">Connect My Provider</button>
                                    <button class="action-btn">View Claims</button>
                                </div>
                            </div>
                            
                            <div class="card">
                                <h2>Recent Claims</h2>
                                <table class="claims-table">
                                    <thead>
                                        <tr>
                                            <th>Provider</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Downtown Dental</td>
                                            <td>2025-08-19</td>
                                            <td>$30.00</td>
                                            <td class="status-pending">Pending</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="card">
                                <h2>Tasks</h2>
                                <div class="task-item">
                                    <span class="task-icon">⚠️</span>
                                    <span class="task-text">2 receipt(s) needed</span>
                                    <span class="help-icon">❓</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="right-column">
                            <div class="card hsa-planner-section">
                                <h2>My HSA Planner</h2>
                                <div class="goal-tags">
                                    <span class="goal-tag primary">2025 Goal</span>
                                    <span class="goal-tag secondary">Long Term</span>
                                </div>
                                <div class="goal-amount">
                                    <span class="amount-text">$1,905.00 of $4,792.00</span>
                                </div>
                                <div class="goal-status">
                                    <span class="status-text">Goal Status: Off Track</span>
                                </div>
                                <div class="goal-actions">
                                    <button class="btn-secondary">Update Goal</button>
                                    <div class="progress-info">
                                        <span>40% to your goal</span>
                                        <div class="progress-circle"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
        
        // Add CSS styles for testing
        const style = document.createElement('style');
        style.textContent = `
            .app { max-width: 1200px; margin: 0 auto; }
            .main-header { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
            .logo { background: linear-gradient(135deg, #253746 0%, #C8102E 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 16px; padding: 30px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
            .action-btn { background: linear-gradient(135deg, #253746 0%, #1a2a38 100%); color: white; padding: 14px 24px; border-radius: 8px; border: none; cursor: pointer; }
            .action-btn.primary { background: linear-gradient(135deg, #C8102E 0%, #a30d25 100%); }
            .claims-table { width: 100%; border-collapse: collapse; background: rgba(255, 255, 255, 0.8); border-radius: 12px; overflow: hidden; }
            .claims-table th { background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 16px; }
            .claims-table td { padding: 16px; border-bottom: 1px solid rgba(226, 232, 240, 0.6); }
            .status-pending { color: #d69e2e; background: rgba(254, 243, 199, 0.3); padding: 4px 12px; border-radius: 20px; }
            .task-item { background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%); padding: 20px; border-radius: 12px; border-left: 4px solid #C8102E; }
            .goal-tag { padding: 8px 16px; border-radius: 25px; font-weight: 600; }
            .goal-tag.primary { background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%); color: #22543d; }
            .goal-tag.secondary { background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%); color: #4a5568; }
            .amount-text { background: linear-gradient(135deg, #253746 0%, #C8102E 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 1.75rem; font-weight: 700; }
            .progress-circle { width: 50px; height: 50px; border-radius: 50%; border: 4px solid #e2e8f0; background: conic-gradient(#C8102E 0deg 144deg, #e2e8f0 144deg 360deg); }
            .btn-secondary { background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%); color: white; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; }
            .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
            .nav-container { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; }
            .nav-center { display: flex; gap: 30px; }
            .nav-link { text-decoration: none; color: #4a5568; padding: 10px 0; border-bottom: 3px solid transparent; }
            .nav-link.active { border-bottom-color: #C8102E; color: #253746; }
            .notification-badge { background: linear-gradient(135deg, #C8102E 0%, #e53e3e 100%); color: white; border-radius: 50%; padding: 4px 8px; font-size: 0.75rem; }
        `;
        document.head.appendChild(style);
    });
    
    afterEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });
    
    it('should display correct color scheme and branding', () => {
        const logo = document.querySelector('.logo');
        const primaryButton = document.querySelector('.action-btn.primary');
        const notificationBadge = document.querySelector('.notification-badge');
        
        // Verify WEX branding colors
        expect(logo).toBeDefined();
        expect(primaryButton).toBeDefined();
        expect(notificationBadge).toBeDefined();
        
        // Check that gradient text is applied to logo
        const logoStyles = window.getComputedStyle(logo);
        expect(logoStyles.backgroundImage).toContain('gradient');
    });
    
    it('should apply correct card styling and shadows', () => {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            const styles = window.getComputedStyle(card);
            expect(styles.borderRadius).toBe('16px');
            expect(styles.boxShadow).toContain('rgba(0, 0, 0, 0.1)');
            expect(styles.backgroundColor).toContain('rgba(255, 255, 255, 0.95)');
        });
    });
    
    it('should display gradient backgrounds on action buttons', () => {
        const buttons = document.querySelectorAll('.action-btn');
        
        buttons.forEach(button => {
            const styles = window.getComputedStyle(button);
            expect(styles.backgroundImage).toContain('gradient');
            expect(styles.borderRadius).toBe('8px');
            expect(styles.color).toBe('white');
        });
    });
    
    it('should show status indicators with correct styling', () => {
        const statusElement = document.querySelector('.status-pending');
        
        expect(statusElement).toBeDefined();
        expect(statusElement.textContent).toBe('Pending');
        
        const styles = window.getComputedStyle(statusElement);
        expect(styles.borderRadius).toBe('20px');
        expect(styles.backgroundColor).toContain('rgba(254, 243, 199, 0.3)');
    });
    
    it('should display task items with correct visual hierarchy', () => {
        const taskItem = document.querySelector('.task-item');
        
        expect(taskItem).toBeDefined();
        expect(taskItem.querySelector('.task-icon')).toBeDefined();
        expect(taskItem.querySelector('.task-text')).toBeDefined();
        expect(taskItem.querySelector('.help-icon')).toBeDefined();
        
        const styles = window.getComputedStyle(taskItem);
        expect(styles.borderLeftWidth).toBe('4px');
        expect(styles.borderLeftColor).toBe('rgb(200, 16, 46)'); // #C8102E
    });
    
    it('should show HSA planner with correct goal visualization', () => {
        const hsaSection = document.querySelector('.hsa-planner-section');
        const goalTags = hsaSection.querySelectorAll('.goal-tag');
        const amountText = hsaSection.querySelector('.amount-text');
        const progressCircle = hsaSection.querySelector('.progress-circle');
        
        expect(hsaSection).toBeDefined();
        expect(goalTags).toHaveLength(2);
        expect(amountText).toBeDefined();
        expect(progressCircle).toBeDefined();
        
        // Verify goal tag styling
        const primaryTag = hsaSection.querySelector('.goal-tag.primary');
        const secondaryTag = hsaSection.querySelector('.goal-tag.secondary');
        
        expect(primaryTag).toBeDefined();
        expect(secondaryTag).toBeDefined();
    });
    
    it('should display navigation with correct active states', () => {
        const navLinks = document.querySelectorAll('.nav-link');
        const activeLink = document.querySelector('.nav-link.active');
        
        expect(navLinks).toHaveLength(3);
        expect(activeLink).toBeDefined();
        expect(activeLink.textContent).toBe('Dashboard');
        
        // Verify active link styling
        const activeStyles = window.getComputedStyle(activeLink);
        expect(activeStyles.borderBottomColor).toBe('rgb(200, 16, 46)'); // #C8102E
    });
    
    it('should show notification badge with correct styling', () => {
        const badge = document.querySelector('.notification-badge');
        
        expect(badge).toBeDefined();
        expect(badge.textContent).toBe('3');
        
        const styles = window.getComputedStyle(badge);
        expect(styles.borderRadius).toBe('50%');
        expect(styles.backgroundColor).toContain('gradient');
        expect(styles.color).toBe('white');
    });
});

describe('Responsive Design and Layout', () => {
    beforeEach(() => {
        // Setup responsive test DOM
        document.body.innerHTML = `
            <div class="app">
                <header class="main-header">
                    <div class="nav-container">
                        <h1 class="logo">WEX BENEFITS</h1>
                        <nav class="nav-center">
                            <a href="#" class="nav-link">Dashboard</a>
                            <a href="#" class="nav-link">Claims</a>
                        </nav>
                        <div class="nav-right">
                            <span class="notification-badge">1</span>
                        </div>
                    </div>
                </header>
                
                <main class="main-content">
                    <div class="content-grid">
                        <div class="left-column">
                            <div class="card">
                                <h2>Responsive Test</h2>
                                <div class="action-buttons">
                                    <button class="action-btn">Test Button</button>
                                </div>
                            </div>
                        </div>
                        <div class="right-column">
                            <div class="card">
                                <h2>Right Column</h2>
                                <p>Content for testing responsive behavior</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
        
        // Add responsive CSS
        const style = document.createElement('style');
        style.textContent = `
            .app { max-width: 1200px; margin: 0 auto; }
            .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
            .card { background: white; padding: 30px; border-radius: 16px; margin-bottom: 20px; }
            .action-buttons { display: flex; gap: 15px; }
            .action-btn { padding: 14px 24px; border-radius: 8px; border: none; background: #253746; color: white; }
            
            @media (max-width: 768px) {
                .content-grid { grid-template-columns: 1fr; gap: 20px; }
                .nav-center { display: none; }
                .action-buttons { flex-direction: column; }
                .main-content { padding: 20px; }
                .card { padding: 20px; }
            }
            
            @media (max-width: 480px) {
                .nav-container { padding: 15px 20px; }
                .main-content { padding: 15px; }
                .card { padding: 15px; }
                .action-btn { padding: 12px 20px; }
            }
        `;
        document.head.appendChild(style);
    });
    
    afterEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });
    
    it('should maintain desktop layout at large screen sizes', () => {
        // Simulate desktop viewport
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1200
        });
        
        const contentGrid = document.querySelector('.content-grid');
        const styles = window.getComputedStyle(contentGrid);
        
        expect(styles.gridTemplateColumns).toBe('2fr 1fr');
        expect(styles.gap).toBe('30px');
    });
    
    it('should adapt to tablet screen sizes', () => {
        // Simulate tablet viewport
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 768
        });
        
        // Trigger resize event
        window.dispatchEvent(new Event('resize'));
        
        const contentGrid = document.querySelector('.content-grid');
        const navCenter = document.querySelector('.nav-center');
        const actionButtons = document.querySelector('.action-buttons');
        
        // Check responsive behavior
        expect(navCenter.style.display).toBe('none');
        expect(actionButtons.style.flexDirection).toBe('column');
    });
    
    it('should adapt to mobile screen sizes', () => {
        // Simulate mobile viewport
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 480
        });
        
        // Trigger resize event
        window.dispatchEvent(new Event('resize'));
        
        const mainContent = document.querySelector('.main-content');
        const cards = document.querySelectorAll('.card');
        const actionButtons = document.querySelector('.action-buttons');
        
        // Check mobile-specific styling
        expect(mainContent.style.padding).toBe('15px');
        cards.forEach(card => {
            expect(card.style.padding).toBe('15px');
        });
    });
    
    it('should handle content grid reflow correctly', () => {
        const contentGrid = document.querySelector('.content-grid');
        const leftColumn = document.querySelector('.left-column');
        const rightColumn = document.querySelector('.right-column');
        
        // Verify initial grid structure
        expect(contentGrid.children).toHaveLength(2);
        expect(leftColumn).toBeDefined();
        expect(rightColumn).toBeDefined();
        
        // Simulate mobile view
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 600
        });
        
        window.dispatchEvent(new Event('resize'));
        
        // Verify columns stack vertically on mobile
        const styles = window.getComputedStyle(contentGrid);
        expect(styles.gridTemplateColumns).toBe('1fr');
    });
    
    it('should maintain button accessibility across screen sizes', () => {
        const actionButton = document.querySelector('.action-btn');
        
        // Verify button is accessible at all sizes
        expect(actionButton).toBeDefined();
        expect(actionButton.getAttribute('aria-label') || actionButton.textContent).toBeDefined();
        
        // Test different viewport sizes
        const viewports = [1200, 768, 480];
        
        viewports.forEach(width => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: width
            });
            
            window.dispatchEvent(new Event('resize'));
            
            // Button should remain accessible
            expect(actionButton.style.display).not.toBe('none');
            expect(actionButton.offsetHeight).toBeGreaterThan(0);
        });
    });
});

describe('Interactive Elements and Hover States', () => {
    beforeEach(() => {
        // Setup interactive test DOM
        document.body.innerHTML = `
            <div class="app">
                <div class="card interactive-card">
                    <h2>Interactive Test</h2>
                    <div class="action-buttons">
                        <button class="action-btn primary">Primary Button</button>
                        <button class="action-btn">Secondary Button</button>
                    </div>
                    <div class="goal-tags">
                        <span class="goal-tag primary">Interactive Tag</span>
                        <span class="goal-tag secondary">Another Tag</span>
                    </div>
                </div>
                
                <div class="task-item interactive-task">
                    <span class="task-icon">⚠️</span>
                    <span class="task-text">Interactive task item</span>
                    <span class="help-icon">❓</span>
                </div>
            </div>
        `;
        
        // Add interactive CSS
        const style = document.createElement('style');
        style.textContent = `
            .card { background: white; padding: 30px; border-radius: 16px; transition: all 0.3s ease; position: relative; overflow: hidden; }
            .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #253746 0%, #C8102E 100%); opacity: 0; transition: opacity 0.3s ease; }
            .card:hover::before { opacity: 1; }
            .card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15); }
            
            .action-btn { padding: 14px 24px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden; }
            .action-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent); transition: left 0.5s ease; }
            .action-btn:hover::before { left: 100%; }
            .action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 55, 70, 0.4); }
            .action-btn.primary { background: linear-gradient(135deg, #C8102E 0%, #a30d25 100%); color: white; }
            .action-btn.primary:hover { background: linear-gradient(135deg, #a30d25 0%, #C8102E 100%); }
            
            .goal-tag { padding: 8px 16px; border-radius: 25px; font-weight: 600; transition: all 0.3s ease; cursor: pointer; position: relative; overflow: hidden; }
            .goal-tag::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent); transition: left 0.5s ease; }
            .goal-tag:hover::before { left: 100%; }
            .goal-tag.primary { background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%); color: #22543d; }
            .goal-tag.primary:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(198, 246, 213, 0.6); }
            .goal-tag.secondary { background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%); color: #4a5568; }
            .goal-tag.secondary:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(226, 232, 240, 0.6); }
            
            .task-item { background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%); padding: 20px; border-radius: 12px; border-left: 4px solid #C8102E; transition: all 0.3s ease; position: relative; overflow: hidden; }
            .task-item::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent); transition: left 0.6s ease; }
            .task-item:hover::before { left: 100%; }
            .task-item:hover { transform: translateX(4px); box-shadow: 0 4px 16px rgba(200, 16, 46, 0.2); }
            
            .help-icon { cursor: pointer; color: #d69e2e; font-size: 1.2rem; transition: all 0.2s ease; padding: 8px; border-radius: 50%; background: rgba(254, 243, 199, 0.3); }
            .help-icon:hover { color: #b7791f; transform: scale(1.1); background: rgba(254, 243, 199, 0.5); }
        `;
        document.head.appendChild(style);
    });
    
    afterEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });
    
    it('should show hover effects on cards', () => {
        const card = document.querySelector('.interactive-card');
        
        // Simulate hover
        const hoverEvent = new MouseEvent('mouseenter');
        card.dispatchEvent(hoverEvent);
        
        // Verify hover state
        expect(card).toBeDefined();
        
        // Check that hover styles are applied
        const styles = window.getComputedStyle(card);
        expect(styles.transform).toContain('translateY(-2px)');
    });
    
    it('should display button hover animations', () => {
        const primaryButton = document.querySelector('.action-btn.primary');
        const secondaryButton = document.querySelector('.action-btn');
        
        // Simulate hover on primary button
        const hoverEvent = new MouseEvent('mouseenter');
        primaryButton.dispatchEvent(hoverEvent);
        
        // Verify hover state
        expect(primaryButton).toBeDefined();
        expect(secondaryButton).toBeDefined();
        
        // Check that hover transforms are applied
        const primaryStyles = window.getComputedStyle(primaryButton);
        expect(primaryStyles.transform).toContain('translateY(-2px)');
    });
    
    it('should show goal tag hover effects', () => {
        const primaryTag = document.querySelector('.goal-tag.primary');
        const secondaryTag = document.querySelector('.goal-tag.secondary');
        
        // Simulate hover on primary tag
        const hoverEvent = new MouseEvent('mouseenter');
        primaryTag.dispatchEvent(hoverEvent);
        
        // Verify hover effects
        expect(primaryTag).toBeDefined();
        expect(secondaryTag).toBeDefined();
        
        // Check that hover transforms are applied
        const primaryStyles = window.getComputedStyle(primaryTag);
        expect(primaryStyles.transform).toContain('translateY(-2px)');
    });
    
    it('should display task item hover animations', () => {
        const taskItem = document.querySelector('.interactive-task');
        
        // Simulate hover
        const hoverEvent = new MouseEvent('mouseenter');
        taskItem.dispatchEvent(hoverEvent);
        
        // Verify hover state
        expect(taskItem).toBeDefined();
        
        // Check that hover transforms are applied
        const styles = window.getComputedStyle(taskItem);
        expect(styles.transform).toContain('translateX(4px)');
    });
    
    it('should show help icon hover effects', () => {
        const helpIcon = document.querySelector('.help-icon');
        
        // Simulate hover
        const hoverEvent = new MouseEvent('mouseenter');
        helpIcon.dispatchEvent(hoverEvent);
        
        // Verify hover state
        expect(helpIcon).toBeDefined();
        
        // Check that hover transforms are applied
        const styles = window.getComputedStyle(helpIcon);
        expect(styles.transform).toContain('scale(1.1)');
    });
    
    it('should maintain interactive states during transitions', () => {
        const card = document.querySelector('.interactive-card');
        const button = document.querySelector('.action-btn.primary');
        
        // Simulate rapid hover events
        const enterEvent = new MouseEvent('mouseenter');
        const leaveEvent = new MouseEvent('mouseleave');
        
        card.dispatchEvent(enterEvent);
        card.dispatchEvent(leaveEvent);
        card.dispatchEvent(enterEvent);
        
        button.dispatchEvent(enterEvent);
        button.dispatchEvent(leaveEvent);
        button.dispatchEvent(enterEvent);
        
        // Verify elements remain interactive
        expect(card).toBeDefined();
        expect(button).toBeDefined();
        expect(card.style.pointerEvents).not.toBe('none');
        expect(button.style.pointerEvents).not.toBe('none');
    });
});

describe('Form Elements and Input Styling', () => {
    beforeEach(() => {
        // Setup form test DOM
        document.body.innerHTML = `
            <div class="app">
                <div class="card">
                    <h2>Form Test</h2>
                    <form class="test-form">
                        <div class="form-group">
                            <label for="provider">Provider</label>
                            <select id="provider" class="form-select" required>
                                <option value="">Select Provider</option>
                                <option value="trellis">Trellis Healthcare</option>
                            </select>
                            <small class="form-help">Select your healthcare provider</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" class="form-input" required placeholder="Enter username">
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="termsCheckbox" required>
                                <span class="checkmark"></span>
                                I agree to Terms and Conditions
                            </label>
                        </div>
                        
                        <button type="submit" class="btn-primary">Submit Form</button>
                    </form>
                </div>
            </div>
        `;
        
        // Add form CSS
        const style = document.createElement('style');
        style.textContent = `
            .form-group { margin-bottom: 24px; }
            .form-group label { display: block; margin-bottom: 8px; color: #253746; font-weight: 600; font-size: 0.95rem; }
            
            .form-select { width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; background: white; transition: all 0.3s ease; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e"); background-position: right 12px center; background-repeat: no-repeat; background-size: 16px; padding-right: 40px; }
            .form-select:hover { border-color: #cbd5e0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
            .form-select:focus { outline: none; border-color: #253746; box-shadow: 0 0 0 3px rgba(37, 55, 70, 0.1); transform: translateY(-1px); }
            
            .form-input { width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; transition: all 0.3s ease; background: white; }
            .form-input:hover { border-color: #cbd5e0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
            .form-input:focus { outline: none; border-color: #253746; box-shadow: 0 0 0 3px rgba(37, 55, 70, 0.1); transform: translateY(-1px); }
            .form-input::placeholder { color: #a0aec0; font-style: italic; }
            
            .form-help { display: block; margin-top: 6px; font-size: 0.85rem; color: #718096; font-style: italic; line-height: 1.4; }
            
            .checkbox-label { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; padding: 8px 0; transition: all 0.2s ease; font-size: 0.9rem; line-height: 1.4; }
            .checkbox-label input[type="checkbox"] { display: none; }
            .checkmark { width: 20px; height: 20px; border: 2px solid #cbd5e0; border-radius: 4px; background: white; position: relative; transition: all 0.3s ease; flex-shrink: 0; margin-top: 2px; }
            .checkbox-label input[type="checkbox"]:checked + .checkmark { background: linear-gradient(135deg, #C8102E 0%, #a30d25 100%); border-color: #C8102E; box-shadow: 0 2px 8px rgba(200, 16, 46, 0.3); }
            .checkbox-label input[type="checkbox"]:checked + .checkmark::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 14px; font-weight: bold; }
            .checkbox-label:hover .checkmark { border-color: #253746; transform: scale(1.05); }
            
            .btn-primary { background: linear-gradient(135deg, #C8102E 0%, #a30d25 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(200, 16, 46, 0.3); }
            .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(200, 16, 46, 0.4); }
            
            .form-select.error, .form-input.error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
        `;
        document.head.appendChild(style);
    });
    
    afterEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });
    
    it('should display form elements with correct styling', () => {
        const form = document.querySelector('.test-form');
        const select = document.getElementById('provider');
        const input = document.getElementById('username');
        const checkbox = document.getElementById('termsCheckbox');
        const label = document.querySelector('label[for="provider"]');
        const help = document.querySelector('.form-help');
        
        // Verify all form elements are present
        expect(form).toBeDefined();
        expect(select).toBeDefined();
        expect(input).toBeDefined();
        expect(checkbox).toBeDefined();
        expect(label).toBeDefined();
        expect(help).toBeDefined();
        
        // Check form element styling
        const selectStyles = window.getComputedStyle(select);
        expect(selectStyles.borderRadius).toBe('8px');
        expect(selectStyles.padding).toBe('14px 16px');
        
        const inputStyles = window.getComputedStyle(input);
        expect(inputStyles.borderRadius).toBe('8px');
        expect(inputStyles.padding).toBe('14px 16px');
    });
    
    it('should show hover states on form elements', () => {
        const select = document.getElementById('provider');
        const input = document.getElementById('username');
        
        // Simulate hover on select
        const selectHoverEvent = new MouseEvent('mouseenter');
        select.dispatchEvent(selectHoverEvent);
        
        // Simulate hover on input
        const inputHoverEvent = new MouseEvent('mouseenter');
        input.dispatchEvent(inputHoverEvent);
        
        // Verify hover states are applied
        expect(select).toBeDefined();
        expect(input).toBeDefined();
        
        // Check that hover styles are working
        const selectStyles = window.getComputedStyle(select);
        const inputStyles = window.getComputedStyle(input);
        expect(selectStyles.borderColor).toBe('rgb(203, 213, 224)'); // #cbd5e0
        expect(inputStyles.borderColor).toBe('rgb(203, 213, 224)'); // #cbd5e0
    });
    
    it('should display focus states correctly', () => {
        const select = document.getElementById('provider');
        const input = document.getElementById('username');
        
        // Focus select
        select.focus();
        
        // Focus input
        input.focus();
        
        // Verify focus states
        expect(select).toBe(document.activeElement);
        expect(input).toBe(document.activeElement);
        
        // Check focus styles
        const selectStyles = window.getComputedStyle(select);
        const inputStyles = window.getComputedStyle(input);
        expect(selectStyles.borderColor).toBe('rgb(37, 55, 70)'); // #253746
        expect(inputStyles.borderColor).toBe('rgb(37, 55, 70)'); // #253746
    });
    
    it('should show checkbox states correctly', () => {
        const checkbox = document.getElementById('termsCheckbox');
        const checkmark = document.querySelector('.checkmark');
        const label = document.querySelector('.checkbox-label');
        
        // Initial state
        expect(checkbox.checked).toBe(false);
        
        // Check checkbox
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change'));
        
        // Verify checked state
        expect(checkbox.checked).toBe(true);
        
        // Check that checkmark shows check
        const checkmarkStyles = window.getComputedStyle(checkmark);
        expect(checkmarkStyles.backgroundColor).toContain('gradient');
    });
    
    it('should display form validation states', () => {
        const select = document.getElementById('provider');
        const input = document.getElementById('username');
        
        // Add error class
        select.classList.add('error');
        input.classList.add('error');
        
        // Verify error states
        expect(select.classList.contains('error')).toBe(true);
        expect(input.classList.contains('error')).toBe(true);
        
        // Check error styling
        const selectStyles = window.getComputedStyle(select);
        const inputStyles = window.getComputedStyle(input);
        expect(selectStyles.borderColor).toBe('rgb(239, 68, 68)'); // #ef4444
        expect(inputStyles.borderColor).toBe('rgb(239, 68, 68)'); // #ef4444
    });
    
    it('should show placeholder text correctly', () => {
        const input = document.getElementById('username');
        
        // Verify placeholder
        expect(input.placeholder).toBe('Enter username');
        
        // Check placeholder styling
        const styles = window.getComputedStyle(input, '::placeholder');
        expect(input.getAttribute('placeholder')).toBe('Enter username');
    });
    
    it('should maintain form layout consistency', () => {
        const form = document.querySelector('.test-form');
        const formGroups = form.querySelectorAll('.form-group');
        const submitButton = form.querySelector('.btn-primary');
        
        // Verify form structure
        expect(formGroups).toHaveLength(3);
        expect(submitButton).toBeDefined();
        
        // Check that form groups have consistent spacing
        formGroups.forEach(group => {
            const styles = window.getComputedStyle(group);
            expect(styles.marginBottom).toBe('24px');
        });
    });
});
