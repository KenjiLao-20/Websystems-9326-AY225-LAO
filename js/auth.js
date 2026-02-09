// Authentication and User Management System

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.adminUsers = ['admin@redcross.ph', 'coordinator@redcross.ph'];
        
        this.initializeAuth();
        this.setupAuthListeners();
    }

    initializeAuth() {
        // Check for existing user session
        this.currentUser = this.getCurrentUser();
        
        if (this.currentUser) {
            this.updateUIForLoggedInUser();
        } else {
            this.updateUIForGuest();
        }
        
        // Check for admin privileges
        this.checkAdminStatus();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('redcrossUser');
        return userData ? JSON.parse(userData) : null;
    }

    saveUser(userData) {
        localStorage.setItem('redcrossUser', JSON.stringify(userData));
        this.currentUser = userData;
    }

    logout() {
        localStorage.removeItem('redcrossUser');
        this.currentUser = null;
        this.updateUIForGuest();
        
        // Redirect to home page
        window.location.href = 'index.html';
    }

    updateUIForLoggedInUser() {
        // Update navigation
        this.updateNavigation();
        
        // Update user-specific content
        this.updateUserContent();
        
        // Show user dashboard links
        this.showUserDashboard();
    }

    updateUIForGuest() {
        // Reset navigation to guest state
        const navMenu = document.getElementById('nav-menu');
        if (navMenu) {
            // Remove any existing user profile items
            const userItems = navMenu.querySelectorAll('.user-profile-item');
            userItems.forEach(item => item.remove());
            
            // Add login/signup buttons if not already present
            if (!navMenu.querySelector('.auth-buttons')) {
                const authDiv = document.createElement('div');
                authDiv.className = 'auth-buttons';
                authDiv.innerHTML = `
                    <a href="#" class="btn-small" onclick="authSystem.showLoginModal()">Login</a>
                    <a href="volunteer.html" class="btn-primary">Sign Up</a>
                `;
                navMenu.appendChild(authDiv);
            }
        }
    }

updateNavigation() {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return;
    
    // Remove existing auth buttons and user dropdown
    const existingAuth = navMenu.querySelector('.auth-buttons');
    if (existingAuth) {
        existingAuth.remove();
    }
    
    const existingUserItem = navMenu.querySelector('.user-profile-item');
    if (existingUserItem) {
        existingUserItem.remove();
    }
    
    // Add appropriate auth elements
    if (this.currentUser) {
        // Add user profile dropdown
        const userItem = document.createElement('li');
        userItem.className = 'user-profile-item';
        userItem.innerHTML = `
            <div class="user-dropdown">
                <button class="user-profile-btn">
                    <i class="fas fa-user-circle"></i>
                    <span>${this.currentUser.name.split(' ')[0]}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-dropdown-menu">
                    <a href="volunteer.html#volunteerDashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                    <a href="#" onclick="authSystem.showProfileModal()"><i class="fas fa-user-edit"></i> Profile</a>
                    <a href="#" onclick="authSystem.showSettingsModal()"><i class="fas fa-cog"></i> Settings</a>
                    <div class="dropdown-divider"></div>
                    <a href="#" onclick="authSystem.logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        `;
        navMenu.appendChild(userItem);
        
        // Setup dropdown toggle
        const dropdownBtn = userItem.querySelector('.user-profile-btn');
        const dropdownMenu = userItem.querySelector('.user-dropdown-menu');
        
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
    } else {
        // Add auth buttons for guests
        const authContainer = document.createElement('div');
        authContainer.className = 'auth-buttons';
        authContainer.innerHTML = `
            <a href="#" class="btn-small" onclick="authSystem.showLoginModal()">Login</a>
            <a href="volunteer.html" class="btn-primary">Sign Up</a>
        `;
        
        // Insert before the donate button
        const donateBtn = navMenu.querySelector('.btn-donate');
        if (donateBtn && donateBtn.parentElement) {
            navMenu.insertBefore(authContainer, donateBtn.parentElement);
        } else {
            navMenu.appendChild(authContainer);
        }
    }
}

    updateUserContent() {
        // Update any user-specific content on the page
        const userGreeting = document.getElementById('userGreeting');
        if (userGreeting && this.currentUser) {
            userGreeting.textContent = `Welcome back, ${this.currentUser.name.split(' ')[0]}!`;
        }
        
        // Update volunteer dashboard if on volunteer page
        if (window.location.pathname.includes('volunteer.html')) {
            this.updateVolunteerDashboard();
        }
    }

    showUserDashboard() {
        const dashboard = document.getElementById('volunteerDashboard');
        if (dashboard && this.currentUser) {
            dashboard.style.display = 'block';
        }
    }

    updateVolunteerDashboard() {
        // This would be expanded based on actual dashboard requirements
        console.log('Updating volunteer dashboard for:', this.currentUser);
    }

    checkAdminStatus() {
        if (this.currentUser && this.adminUsers.includes(this.currentUser.email)) {
            this.currentUser.role = 'admin';
            this.saveUser(this.currentUser);
            this.showAdminFeatures();
        }
    }

    showAdminFeatures() {
        // Show admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = 'block';
        });
        
        // Add admin link to navigation
        const navMenu = document.getElementById('nav-menu');
        if (navMenu) {
            const adminLink = document.createElement('li');
            adminLink.innerHTML = `
                <a href="#" class="admin-link" onclick="authSystem.showAdminPanel()">
                    <i class="fas fa-shield-alt"></i> Admin
                </a>
            `;
            navMenu.insertBefore(adminLink, navMenu.querySelector('.user-profile-item'));
        }
    }

    setupAuthListeners() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Registration form submission
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // Password reset form
        const resetForm = document.getElementById('resetPasswordForm');
        if (resetForm) {
            resetForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
        }
    }

    handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        
        // Simple validation
        if (!this.validateEmail(email)) {
            this.showAuthMessage('Please enter a valid email address', 'error');
            return;
        }
        
        if (!password) {
            this.showAuthMessage('Please enter your password', 'error');
            return;
        }
        
        // Simulate API call
        this.showLoading(true);
        
        setTimeout(() => {
            // For demo purposes, accept any email/password combination
            // In a real app, this would validate against a backend
            const userData = {
                name: email.split('@')[0],
                email: email,
                role: this.adminUsers.includes(email) ? 'admin' : 'user',
                joinDate: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            
            this.saveUser(userData);
            this.showAuthMessage('Login successful!', 'success');
            
            // Close modal and refresh page
            setTimeout(() => {
                this.closeLoginModal();
                window.location.reload();
            }, 1500);
            
        }, 1000);
    }

    handleRegister(event) {
        event.preventDefault();
        
        const form = event.target;
        const name = form.querySelector('input[name="name"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[name="password"]').value;
        const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
        
        // Validation
        if (!name || name.length < 3) {
            this.showAuthMessage('Name must be at least 3 characters', 'error');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showAuthMessage('Please enter a valid email address', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showAuthMessage('Password must be at least 6 characters', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showAuthMessage('Passwords do not match', 'error');
            return;
        }
        
        // Check if email already exists
        const existingUsers = JSON.parse(localStorage.getItem('redcrossUsers') || '[]');
        if (existingUsers.find(user => user.email === email)) {
            this.showAuthMessage('Email already registered', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            name: name,
            email: email,
            role: 'user',
            joinDate: new Date().toISOString(),
            verified: false
        };
        
        // Save to users list
        existingUsers.push(newUser);
        localStorage.setItem('redcrossUsers', JSON.stringify(existingUsers));
        
        // Also save as current user
        this.saveUser(newUser);
        
        this.showAuthMessage('Registration successful!', 'success');
        
        // Redirect to volunteer page
        setTimeout(() => {
            window.location.href = 'volunteer.html';
        }, 1500);
    }

    handlePasswordReset(event) {
        event.preventDefault();
        
        const form = event.target;
        const email = form.querySelector('input[type="email"]').value;
        
        if (!this.validateEmail(email)) {
            this.showAuthMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate password reset email
        this.showAuthMessage('Password reset instructions sent to your email', 'success');
        
        // Close modal after 2 seconds
        setTimeout(() => {
            this.closeResetModal();
        }, 2000);
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showAuthMessage(message, type) {
        const messageDiv = document.getElementById('authMessage');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `auth-message ${type}`;
            messageDiv.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    showLoading(show) {
        const submitBtn = document.querySelector('.auth-form button[type="submit"]');
        if (submitBtn) {
            if (show) {
                submitBtn.innerHTML = '<span class="loading"></span> Processing...';
                submitBtn.disabled = true;
            } else {
                submitBtn.innerHTML = 'Submit';
                submitBtn.disabled = false;
            }
        }
    }

    // Modal Management
    showLoginModal() {
        const modal = this.createAuthModal('login');
        document.body.appendChild(modal);
    }

    showRegisterModal() {
        const modal = this.createAuthModal('register');
        document.body.appendChild(modal);
    }

    showProfileModal() {
        if (!this.currentUser) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h2>Your Profile</h2>
                <form id="profileForm">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" value="${this.currentUser.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" value="${this.currentUser.email}" readonly>
                        <small>Email cannot be changed</small>
                    </div>
                    <div class="form-group">
                        <label>Member Since</label>
                        <input type="text" value="${new Date(this.currentUser.joinDate).toLocaleDateString()}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Role</label>
                        <input type="text" value="${this.currentUser.role}" readonly>
                    </div>
                    <button type="submit" class="btn-primary">Update Profile</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Handle profile update
        const form = modal.querySelector('#profileForm');
        form.addEventListener('submit', (e) => this.handleProfileUpdate(e));
    }

    handleProfileUpdate(event) {
        event.preventDefault();
        
        const form = event.target;
        const name = form.querySelector('input[type="text"]').value;
        
        if (name !== this.currentUser.name) {
            this.currentUser.name = name;
            this.saveUser(this.currentUser);
            this.showAuthMessage('Profile updated successfully', 'success');
            
            // Update UI
            this.updateNavigation();
            this.updateUserContent();
            
            // Close modal
            event.target.closest('.modal').remove();
        }
    }

    showSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h2>Account Settings</h2>
                <div class="settings-options">
                    <div class="setting-item">
                        <h3>Notifications</h3>
                        <label class="switch">
                            <input type="checkbox" id="emailNotifications" checked>
                            <span class="slider"></span>
                        </label>
                        <span>Email notifications</span>
                    </div>
                    <div class="setting-item">
                        <h3>Privacy</h3>
                        <label class="switch">
                            <input type="checkbox" id="profileVisibility">
                            <span class="slider"></span>
                        </label>
                        <span>Show profile to other volunteers</span>
                    </div>
                    <div class="setting-item">
                        <h3>Theme</h3>
                        <select id="themeSelect">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>
                </div>
                <div class="settings-actions">
                    <button class="btn-secondary" onclick="authSystem.exportUserData()">
                        <i class="fas fa-download"></i> Export Data
                    </button>
                    <button class="btn-danger" onclick="authSystem.deleteAccount()">
                        <i class="fas fa-trash"></i> Delete Account
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Load current settings
        this.loadUserSettings(modal);
    }

    loadUserSettings(modal) {
        const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        
        // Set notification toggle
        const emailToggle = modal.querySelector('#emailNotifications');
        if (emailToggle) {
            emailToggle.checked = settings.emailNotifications !== false;
        }
        
        // Set privacy toggle
        const privacyToggle = modal.querySelector('#profileVisibility');
        if (privacyToggle) {
            privacyToggle.checked = settings.profileVisibility === true;
        }
        
        // Set theme
        const themeSelect = modal.querySelector('#themeSelect');
        if (themeSelect) {
            themeSelect.value = settings.theme || 'light';
        }
        
        // Save settings on change
        modal.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', () => this.saveUserSettings());
        });
    }

    saveUserSettings() {
        const settings = {
            emailNotifications: document.getElementById('emailNotifications')?.checked,
            profileVisibility: document.getElementById('profileVisibility')?.checked,
            theme: document.getElementById('themeSelect')?.value
        };
        
        localStorage.setItem('userSettings', JSON.stringify(settings));
        
        // Apply theme
        if (settings.theme && window.redCrossApp) {
            window.redCrossApp.setTheme(settings.theme);
        }
    }

    exportUserData() {
        if (!this.currentUser) return;
        
        // Get all user-related data
        const userData = {
            profile: this.currentUser,
            volunteerApplications: JSON.parse(localStorage.getItem('volunteerApplications') || '[]')
                .filter(app => app.personal.email === this.currentUser.email),
            eventRegistrations: JSON.parse(localStorage.getItem('eventRegistrations') || '[]')
                .filter(reg => reg.email === this.currentUser.email),
            donations: JSON.parse(localStorage.getItem('redcrossDonations') || '[]')
                .filter(donation => donation.email === this.currentUser.email)
        };
        
        // Create JSON file
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Create download link
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `redcross_data_${this.currentUser.email}_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showAuthMessage('Data exported successfully', 'success');
    }

    deleteAccount() {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }
        
        if (!this.currentUser) return;
        
        // Remove user data
        localStorage.removeItem('redcrossUser');
        
        // Remove user from users list
        let users = JSON.parse(localStorage.getItem('redcrossUsers') || '[]');
        users = users.filter(user => user.email !== this.currentUser.email);
        localStorage.setItem('redcrossUsers', JSON.stringify(users));
        
        // Clear current user
        this.currentUser = null;
        
        // Update UI
        this.updateUIForGuest();
        
        // Close modal
        const modal = document.querySelector('.modal.active');
        if (modal) modal.remove();
        
        // Show message
        this.showAuthMessage('Account deleted successfully', 'success');
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    showAdminPanel() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content wide-modal">
                <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h2>Admin Panel</h2>
                
                <div class="admin-tabs">
                    <button class="admin-tab active" data-tab="users">Users</button>
                    <button class="admin-tab" data-tab="volunteers">Volunteers</button>
                    <button class="admin-tab" data-tab="events">Events</button>
                    <button class="admin-tab" data-tab="analytics">Analytics</button>
                </div>
                
                <div class="admin-content">
                    <div id="usersTab" class="admin-tab-content active">
                        <h3>User Management</h3>
                        <div id="usersList">
                            Loading users...
                        </div>
                    </div>
                    
                    <div id="volunteersTab" class="admin-tab-content">
                        <h3>Volunteer Applications</h3>
                        <div id="volunteersList">
                            Loading applications...
                        </div>
                    </div>
                    
                    <div id="eventsTab" class="admin-tab-content">
                        <h3>Event Management</h3>
                        <div id="eventsListAdmin">
                            Loading events...
                        </div>
                    </div>
                    
                    <div id="analyticsTab" class="admin-tab-content">
                        <h3>Analytics Dashboard</h3>
                        <div id="analyticsContent">
                            Loading analytics...
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Load admin data
        this.loadAdminData(modal);
        
        // Setup tab switching
        this.setupAdminTabs(modal);
    }

    loadAdminData(modal) {
        // Load users
        const users = JSON.parse(localStorage.getItem('redcrossUsers') || '[]');
        const usersList = modal.querySelector('#usersList');
        if (usersList) {
            usersList.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td><span class="role-badge ${user.role}">${user.role}</span></td>
                                <td>${new Date(user.joinDate).toLocaleDateString()}</td>
                                <td>
                                    <button class="btn-small" onclick="authSystem.editUser('${user.email}')">Edit</button>
                                    ${user.role !== 'admin' ? `
                                        <button class="btn-danger" onclick="authSystem.deleteUser('${user.email}')">Delete</button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
        
        // Load volunteer applications
        const applications = JSON.parse(localStorage.getItem('volunteerApplications') || '[]');
        const volunteersList = modal.querySelector('#volunteersList');
        if (volunteersList) {
            volunteersList.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Applied</th>
                            <th>Chapter</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${applications.map(app => `
                            <tr>
                                <td>${app.personal.name}</td>
                                <td>${app.personal.email}</td>
                                <td><span class="status-badge ${app.metadata.status}">${app.metadata.status}</span></td>
                                <td>${new Date(app.metadata.applicationDate).toLocaleDateString()}</td>
                                <td>${app.metadata.assignedChapter}</td>
                                <td>
                                    <button class="btn-small" onclick="authSystem.viewApplication('${app.personal.email}')">View</button>
                                    <button class="btn-primary" onclick="authSystem.updateStatus('${app.personal.email}', 'approved')">Approve</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    }

    setupAdminTabs(modal) {
        const tabs = modal.querySelectorAll('.admin-tab');
        const tabContents = modal.querySelectorAll('.admin-tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tabId}Tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    createAuthModal(type) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        if (type === 'login') {
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
                    <h2>Login to Red Cross</h2>
                    <form id="loginForm" class="auth-form">
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" required>
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" required>
                        </div>
                        <div class="form-options">
                            <label>
                                <input type="checkbox" name="remember"> Remember me
                            </label>
                            <a href="#" onclick="authSystem.showResetModal()">Forgot password?</a>
                        </div>
                        <button type="submit" class="btn-primary">Login</button>
                        <div class="auth-divider">
                            <span>or</span>
                        </div>
                        <button type="button" class="btn-secondary" onclick="authSystem.showRegisterModal()">
                            Create New Account
                        </button>
                    </form>
                    <div id="authMessage" class="auth-message"></div>
                </div>
            `;
        } else if (type === 'register') {
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
                    <h2>Create Account</h2>
                    <form id="registerForm" class="auth-form">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" name="name" required>
                        </div>
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" required>
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" name="password" required>
                        </div>
                        <div class="form-group">
                            <label>Confirm Password</label>
                            <input type="password" name="confirmPassword" required>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" required>
                                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                            </label>
                        </div>
                        <button type="submit" class="btn-primary">Create Account</button>
                        <div class="auth-divider">
                            <span>or</span>
                        </div>
                        <button type="button" class="btn-secondary" onclick="authSystem.showLoginModal()">
                            Already have an account? Login
                        </button>
                    </form>
                    <div id="authMessage" class="auth-message"></div>
                </div>
            `;
        }
        
        return modal;
    }

    showResetModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" onclick="this.closeResetModal()">&times;</span>
                <h2>Reset Password</h2>
                <form id="resetPasswordForm" class="auth-form">
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" required>
                    </div>
                    <p class="help-text">
                        Enter your email address and we'll send you instructions to reset your password.
                    </p>
                    <button type="submit" class="btn-primary">Send Reset Instructions</button>
                </form>
                <div id="authMessage" class="auth-message"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Handle close
        modal.querySelector('.close-modal').addEventListener('click', () => {
            this.closeResetModal();
        });
    }

    closeResetModal() {
        const modal = document.querySelector('.modal.active');
        if (modal) modal.remove();
    }

    closeLoginModal() {
        const modal = document.querySelector('.modal.active');
        if (modal) modal.remove();
    }

    // Admin functions
    editUser(email) {
        // Implementation for editing user
        console.log('Edit user:', email);
    }

    deleteUser(email) {
        if (!confirm(`Are you sure you want to delete user ${email}?`)) return;
        
        // Remove user
        let users = JSON.parse(localStorage.getItem('redcrossUsers') || '[]');
        users = users.filter(user => user.email !== email);
        localStorage.setItem('redcrossUsers', JSON.stringify(users));
        
        // Refresh admin panel
        this.showAuthMessage('User deleted successfully', 'success');
        
        // Close and reopen admin panel to refresh data
        const modal = document.querySelector('.modal.active');
        if (modal) modal.remove();
        
        setTimeout(() => this.showAdminPanel(), 500);
    }

    viewApplication(email) {
        // Implementation for viewing application
        console.log('View application for:', email);
    }

    updateStatus(email, status) {
        // Update application status
        let applications = JSON.parse(localStorage.getItem('volunteerApplications') || '[]');
        applications = applications.map(app => {
            if (app.personal.email === email) {
                app.metadata.status = status;
            }
            return app;
        });
        localStorage.setItem('volunteerApplications', JSON.stringify(applications));
        
        this.showAuthMessage(`Application ${status}`, 'success');
        
        // Refresh admin panel
        const modal = document.querySelector('.modal.active');
        if (modal) modal.remove();
        
        setTimeout(() => this.showAdminPanel(), 500);
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});