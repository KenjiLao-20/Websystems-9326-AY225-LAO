// Main JavaScript file - Shared functionality across all pages

class RedCrossApp {
    constructor() {
        this.initializeApp();
        this.setupEventListeners();
        this.loadAlerts();
        this.updateDonationTracker();
        this.initializeEmergencyAlerts();
    }

    initializeApp() {
        // Check for saved user preferences
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        // Initialize mobile menu
        this.initMobileMenu();
        
        // Check authentication status
        this.checkAuthStatus();
        
        // Update live counters
        this.updateLiveCounters();
        
        // Initialize chatbot
        this.initChatbot();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu');
        const navMenu = document.getElementById('nav-menu');
        
        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileMenuBtn.innerHTML = navMenu.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-container') && navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                if (mobileMenuBtn) {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });

        // Form submissions
        const donationForm = document.getElementById('donationForm');
        if (donationForm) {
            donationForm.addEventListener('submit', (e) => this.handleDonation(e));
        }

        const alertForm = document.getElementById('alertSubscriptionForm');
        if (alertForm) {
            alertForm.addEventListener('submit', (e) => this.handleAlertSubscription(e));
        }

        // Amount buttons for donation form
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = btn.getAttribute('data-amount');
                document.getElementById('customAmount').value = amount;
            });
        });

        // Tab navigation for volunteer form
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });

        // Previous/Next buttons for volunteer form
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.navigateTabs('prev'));
        if (nextBtn) nextBtn.addEventListener('click', () => this.navigateTabs('next'));
    }

initMobileMenu() {
    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            const navMenu = document.getElementById('nav-menu');
            const mobileMenuBtn = document.getElementById('mobile-menu');
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                if (mobileMenuBtn) {
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const navMenu = document.getElementById('nav-menu');
        const mobileMenuBtn = document.getElementById('mobile-menu');
        
        if (navMenu && navMenu.classList.contains('active') && 
            !e.target.closest('.nav-container')) {
            navMenu.classList.remove('active');
            if (mobileMenuBtn) {
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    });
}

    // Donation Management
    updateDonationTracker() {
        const campaigns = {
            relief: { target: 500000, current: 325000 },
            medical: { target: 300000, current: 210000 },
            community: { target: 200000, current: 125000 }
        };

        // Update progress bars
        Object.keys(campaigns).forEach(campaign => {
            const progress = (campaigns[campaign].current / campaigns[campaign].target) * 100;
            const progressBar = document.getElementById(`${campaign}-progress`);
            const amountText = document.getElementById(`${campaign}-amount`);
            
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            
            if (amountText) {
                amountText.textContent = 
                    `₱${campaigns[campaign].current.toLocaleString()} / ₱${campaigns[campaign].target.toLocaleString()}`;
            }
        });

        // Simulate live updates
        setInterval(() => {
            Object.keys(campaigns).forEach(campaign => {
                // Random small increment to simulate donations
                campaigns[campaign].current += Math.floor(Math.random() * 100);
                
                const progress = (campaigns[campaign].current / campaigns[campaign].target) * 100;
                const progressBar = document.getElementById(`${campaign}-progress`);
                const amountText = document.getElementById(`${campaign}-amount`);
                
                if (progressBar && progress < 100) {
                    progressBar.style.width = `${progress}%`;
                }
                
                if (amountText) {
                    amountText.textContent = 
                        `₱${campaigns[campaign].current.toLocaleString()} / ₱${campaigns[campaign].target.toLocaleString()}`;
                }
            });
        }, 30000); // Update every 30 seconds
    }

    handleDonation(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const donationData = {
            amount: formData.get('customAmount') || document.getElementById('customAmount').value,
            campaign: formData.get('donationCampaign'),
            name: formData.get('donorName'),
            email: formData.get('donorEmail'),
            date: new Date().toISOString(),
            id: 'DON' + Date.now()
        };

        // Validate donation amount
        if (!donationData.amount || donationData.amount < 100) {
            this.showMessage('Please enter a minimum donation of ₱100', 'error');
            return;
        }

        // Save donation to localStorage
        this.saveDonation(donationData);

        // Show success message
        this.showMessage(`Thank you for your donation of ₱${donationData.amount}! A receipt has been sent to ${donationData.email}.`, 'success');

        // Reset form
        form.reset();

        // Close modal after 3 seconds
        setTimeout(() => {
            this.closeDonationModal();
        }, 3000);
    }

    saveDonation(donation) {
        const donations = JSON.parse(localStorage.getItem('redcrossDonations') || '[]');
        donations.push(donation);
        localStorage.setItem('redcrossDonations', JSON.stringify(donations));
        
        // Update total donations in stats
        this.updateDonationStats(donation.amount);
    }

    updateDonationStats(amount) {
        let totalDonations = parseInt(localStorage.getItem('totalDonations') || '0');
        totalDonations += parseInt(amount);
        localStorage.setItem('totalDonations', totalDonations.toString());
        
        // Update displayed total if element exists
        const totalElement = document.getElementById('totalDonations');
        if (totalElement) {
            totalElement.textContent = totalDonations.toLocaleString();
        }
    }

    // Alert System
    initializeEmergencyAlerts() {
        this.alerts = JSON.parse(localStorage.getItem('emergencyAlerts') || '[]');
        
        // Display recent alerts
        this.displayRecentAlerts();
        
        // Simulate new alerts
        this.simulateAlertSystem();
    }

    displayRecentAlerts() {
        const alertsContainer = document.getElementById('alertsContainer');
        if (!alertsContainer) return;

        const recentAlerts = this.alerts
            .filter(alert => new Date(alert.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            .slice(0, 5);

        if (recentAlerts.length === 0) {
            alertsContainer.innerHTML = '<p class="no-alerts">No recent alerts</p>';
            return;
        }

        alertsContainer.innerHTML = recentAlerts.map(alert => `
            <div class="alert-item ${alert.priority}">
                <div class="alert-header">
                    <span class="alert-type">${alert.type.toUpperCase()}</span>
                    <span class="alert-time">${this.formatTimeAgo(alert.timestamp)}</span>
                </div>
                <h4>${alert.title}</h4>
                <p>${alert.message}</p>
                ${alert.instructions ? `<p class="alert-instructions">${alert.instructions}</p>` : ''}
            </div>
        `).join('');
    }

    simulateAlertSystem() {
        // Only simulate if no recent alerts exist
        if (this.alerts.length === 0 || 
            new Date(this.alerts[0].timestamp) < new Date(Date.now() - 2 * 60 * 60 * 1000)) {
            
            const alertTypes = [
                {
                    type: 'weather',
                    title: 'Heavy Rainfall Advisory',
                    message: 'Moderate to heavy rains expected in Metro Manila within the next 3 hours.',
                    priority: 'warning'
                },
                {
                    type: 'blood',
                    title: 'Urgent Blood Need',
                    message: 'Type O- blood supply critically low. Donors urgently needed.',
                    priority: 'critical'
                },
                {
                    type: 'disaster',
                    title: 'Earthquake Preparedness',
                    message: 'Remember: Drop, Cover, and Hold On during earthquakes.',
                    priority: 'info'
                }
            ];

            const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
            const newAlert = {
                ...randomAlert,
                timestamp: new Date().toISOString(),
                id: Date.now()
            };

            this.alerts.unshift(newAlert);
            localStorage.setItem('emergencyAlerts', JSON.stringify(this.alerts));
            this.displayRecentAlerts();
            this.notifySubscribers(newAlert);
        }

        // Schedule next alert simulation (every 2-4 hours)
        const nextAlertTime = Math.random() * 2 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000;
        setTimeout(() => this.simulateAlertSystem(), nextAlertTime);
    }

    handleAlertSubscription(event) {
        event.preventDefault();
        
        const form = event.target;
        const email = form.querySelector('input[type="email"]').value;
        const region = document.getElementById('alertRegion').value;
        
        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        if (!region) {
            this.showMessage('Please select your region', 'error');
            return;
        }
        
        // Save subscription
        const subscriptions = JSON.parse(localStorage.getItem('alertSubscriptions') || '[]');
        if (!subscriptions.find(sub => sub.email === email)) {
            subscriptions.push({ email, region, date: new Date().toISOString() });
            localStorage.setItem('alertSubscriptions', JSON.stringify(subscriptions));
        }
        
        this.showMessage('Successfully subscribed to emergency alerts!', 'success');
        form.reset();
    }

    // Utility Functions
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    formatTimeAgo(timestamp) {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message-popup');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-popup ${type}`;
        messageDiv.innerHTML = `
            <p>${message}</p>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add styles
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background-color: ${type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#d1ecf1'};
            color: ${type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#0c5460'};
            border: 1px solid ${type === 'error' ? '#f5c6cb' : type === 'success' ? '#c3e6cb' : '#bee5eb'};
            border-radius: 4px;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Modal Functions
    openDonationModal() {
        const modal = document.getElementById('donationModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeDonationModal() {
        const modal = document.getElementById('donationModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    openServiceModal(serviceId) {
        // This function will be implemented in services.js
        console.log('Opening service modal for:', serviceId);
    }

    closeServiceModal() {
        const modal = document.querySelector('.service-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Theme Management
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    // Chatbot Functions
    initChatbot() {
        const chatbotToggle = document.querySelector('.chatbot-toggle');
        const chatbotContainer = document.getElementById('chatbotContainer');
        
        if (chatbotToggle && chatbotContainer) {
            // Load previous messages
            this.loadChatHistory();
            
            // Set up message sending
            const input = document.getElementById('chatbotInput');
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.sendChatMessage();
                    }
                });
            }
        }
    }

    loadChatHistory() {
        const messages = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const messagesContainer = document.getElementById('chatbotMessages');
        
        if (messagesContainer && messages.length > 0) {
            messagesContainer.innerHTML = messages.map(msg => `
                <div class="message ${msg.sender}">
                    <p>${msg.text}</p>
                </div>
            `).join('');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    sendChatMessage() {
        const input = document.getElementById('chatbotInput');
        const messagesContainer = document.getElementById('chatbotMessages');
        
        if (!input || !messagesContainer || !input.value.trim()) return;
        
        const userMessage = input.value.trim();
        
        // Add user message
        this.addChatMessage(userMessage, 'user');
        input.value = '';
        
        // Generate bot response
        setTimeout(() => {
            const botResponse = this.generateBotResponse(userMessage);
            this.addChatMessage(botResponse, 'bot');
        }, 1000);
    }

    addChatMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = `<p>${text}</p>`;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Save to history
        this.saveChatMessage(text, sender);
    }

    saveChatMessage(text, sender) {
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        chatHistory.push({ text, sender, timestamp: new Date().toISOString() });
        
        // Keep only last 50 messages
        if (chatHistory.length > 50) {
            chatHistory.splice(0, chatHistory.length - 50);
        }
        
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }

    generateBotResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        if (message.includes('blood') || message.includes('donate')) {
            return "You can donate blood at any Red Cross blood center. Requirements: Age 16-65, at least 50kg, in good health. Walk-ins welcome!";
        } else if (message.includes('emergency') || message.includes('help')) {
            return "For emergencies, call our 24/7 hotline: 143. For ambulance service: (02) 8790-2300.";
        } else if (message.includes('volunteer') || message.includes('join')) {
            return "Visit our Volunteer page to register. We need help with disaster response, blood services, and community programs.";
        } else if (message.includes('donation') || message.includes('money')) {
            return "You can donate through our website. Click 'Donate Now' button. All donations are tax-deductible.";
        } else if (message.includes('training') || message.includes('first aid')) {
            return "We offer regular first aid training. Check our Events page for schedules or contact your local chapter.";
        } else {
            return "I'm here to help with Red Cross services. You can ask about: blood donation, emergencies, volunteering, donations, or training.";
        }
    }

    askQuickQuestion(question) {
        const input = document.getElementById('chatbotInput');
        if (input) {
            input.value = question;
            this.sendChatMessage();
        }
    }

    toggleChatbot() {
        const container = document.getElementById('chatbotContainer');
        const toggleBtn = document.querySelector('.chatbot-toggle');
        
        if (container && toggleBtn) {
            container.classList.toggle('active');
            
            // Hide notification badge when opened
            const notification = document.getElementById('chatNotification');
            if (notification && container.classList.contains('active')) {
                notification.style.display = 'none';
            }
        }
    }

    // Tab Navigation for Volunteer Form
    switchTab(event) {
        const tabId = event.target.getAttribute('data-tab');
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Show selected tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
        
        // Update progress bar
        this.updateFormProgress();
    }

    navigateTabs(direction) {
        const tabs = ['personal', 'skills', 'availability'];
        const currentTab = document.querySelector('.tab-content.active').id.replace('-tab', '');
        const currentIndex = tabs.indexOf(currentTab);
        
        let nextIndex;
        if (direction === 'next' && currentIndex < tabs.length - 1) {
            nextIndex = currentIndex + 1;
        } else if (direction === 'prev' && currentIndex > 0) {
            nextIndex = currentIndex - 1;
        } else {
            return;
        }
        
        // Switch to the new tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabs[nextIndex]) {
                btn.classList.add('active');
            }
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabs[nextIndex]}-tab`) {
                content.classList.add('active');
            }
        });
        
        this.updateFormProgress();
    }

    updateFormProgress() {
        const tabs = ['personal', 'skills', 'availability'];
        const currentTab = document.querySelector('.tab-content.active').id.replace('-tab', '');
        const currentIndex = tabs.indexOf(currentTab);
        const progress = ((currentIndex + 1) / tabs.length) * 100;
        
        const progressBar = document.getElementById('formProgress');
        const progressText = document.getElementById('progressText');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Step ${currentIndex + 1} of ${tabs.length}`;
        }
    }

    // Update Live Counters
    updateLiveCounters() {
        // Blood donations counter
        const bloodElement = document.getElementById('bloodDonations');
        if (bloodElement) {
            let count = parseInt(bloodElement.textContent.replace(/,/g, ''));
            setInterval(() => {
                count += Math.floor(Math.random() * 10);
                bloodElement.textContent = count.toLocaleString();
            }, 60000); // Update every minute
        }

        // Active volunteers counter
        const volunteersElement = document.getElementById('activeVolunteers');
        if (volunteersElement) {
            let count = parseInt(volunteersElement.textContent.replace(/,/g, ''));
            setInterval(() => {
                count += Math.floor(Math.random() * 5);
                volunteersElement.textContent = count.toLocaleString();
            }, 120000); // Update every 2 minutes
        }

        // Lives saved counter
        const livesElement = document.getElementById('livesSaved');
        if (livesElement) {
            let count = parseInt(livesElement.textContent.replace(/,/g, ''));
            setInterval(() => {
                count += Math.floor(Math.random() * 3);
                livesElement.textContent = count.toLocaleString();
            }, 180000); // Update every 3 minutes
        }
    }

    // Check Authentication Status
    checkAuthStatus() {
        const user = JSON.parse(localStorage.getItem('redcrossUser'));
        if (user) {
            this.updateUserInterface(user);
        }
    }

    updateUserInterface(user) {
        // Update navigation
        const navMenu = document.getElementById('nav-menu');
        if (navMenu && user) {
            const userItem = document.createElement('li');
            userItem.innerHTML = `
                <a href="#" class="user-profile">
                    <i class="fas fa-user"></i> ${user.name.split(' ')[0]}
                </a>
            `;
            navMenu.appendChild(userItem);
        }
    }

    // Alert Functions
    closeAlert() {
        const alertBanner = document.getElementById('emergencyAlert');
        if (alertBanner) {
            alertBanner.style.display = 'none';
            localStorage.setItem('alertClosed', new Date().toISOString());
        }
    }

    loadAlerts() {
        const lastClosed = localStorage.getItem('alertClosed');
        const alertBanner = document.getElementById('emergencyAlert');
        
        if (alertBanner && lastClosed) {
            const hoursSinceClose = (new Date() - new Date(lastClosed)) / (1000 * 60 * 60);
            if (hoursSinceClose < 24) {
                alertBanner.style.display = 'none';
            }
        }
    }

    notifySubscribers(alert) {
        const subscriptions = JSON.parse(localStorage.getItem('alertSubscriptions') || '[]');
        
        // In a real app, you would send emails here
        // For this demo, we'll just log it
        console.log('Notifying subscribers:', subscriptions.length, 'subscribers about:', alert.title);
        
        // Update notification badge
        const notification = document.getElementById('chatNotification');
        if (notification) {
            const currentCount = parseInt(notification.textContent) || 0;
            notification.textContent = currentCount + 1;
            notification.style.display = 'flex';
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.redCrossApp = new RedCrossApp();
});

// Global functions for HTML onclick handlers
function openDonationModal() {
    if (window.redCrossApp) {
        window.redCrossApp.openDonationModal();
    }
}

function closeDonationModal() {
    if (window.redCrossApp) {
        window.redCrossApp.closeDonationModal();
    }
}

function closeAlert() {
    if (window.redCrossApp) {
        window.redCrossApp.closeAlert();
    }
}

function toggleChatbot() {
    if (window.redCrossApp) {
        window.redCrossApp.toggleChatbot();
    }
}

function askQuickQuestion(question) {
    if (window.redCrossApp) {
        window.redCrossApp.askQuickQuestion(question);
    }
}

function sendChatMessage() {
    if (window.redCrossApp) {
        window.redCrossApp.sendChatMessage();
    }
}

// Service modal functions
function openServiceModal(serviceId) {
    // Will be implemented in services.js
}

function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Volunteer form functions
function enableNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                alert('Notifications enabled! You will receive reminders for upcoming events.');
                localStorage.setItem('notificationsEnabled', 'true');
            }
        });
    } else if (Notification.permission === 'granted') {
        alert('Notifications are already enabled.');
    } else {
        alert('Notifications are blocked. Please enable them in your browser settings.');
    }
}