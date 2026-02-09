// Events Management System

class EventsSystem {
    constructor() {
        this.currentDate = new Date();
        this.events = [];
        this.filteredEvents = [];
        this.selectedEvent = null;
        
        this.initializeCalendar();
        this.loadEvents();
        this.setupEventListeners();
        this.checkAdminAccess();
    }

    initializeCalendar() {
        this.renderCalendar();
        this.setupCalendarControls();
    }

    setupCalendarControls() {
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateMonth(-1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateMonth(1));
        }
    }

    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
        this.updateEventsList();
        this.updateEventStats();
    }

    renderCalendar() {
        const calendarEl = document.getElementById('eventCalendar');
        if (!calendarEl) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month display
        const monthDisplay = document.getElementById('currentMonth');
        if (monthDisplay) {
            monthDisplay.textContent = this.currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
        }

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const totalDays = lastDay.getDate();
        const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Clear calendar
        calendarEl.innerHTML = '';

        // Add day headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarEl.appendChild(dayHeader);
        });

        // Add empty cells for days before the first day of month
        for (let i = 0; i < startingDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            calendarEl.appendChild(emptyCell);
        }

        // Add days of the month
        for (let day = 1; day <= totalDays; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            dayCell.textContent = day;
            dayCell.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Check if this day has events
            const hasEvents = this.checkDayForEvents(year, month, day);
            if (hasEvents) {
                dayCell.classList.add('has-event');
                dayCell.addEventListener('click', () => this.showDayEvents(dayCell.dataset.date));
            }

            // Highlight today
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayCell.classList.add('today');
            }

            calendarEl.appendChild(dayCell);
        }
    }

    checkDayForEvents(year, month, day) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return this.events.some(event => event.date === dateStr);
    }

    loadEvents() {
        // Try to load from localStorage first
        const savedEvents = localStorage.getItem('redcrossEvents');
        
        if (savedEvents) {
            this.events = JSON.parse(savedEvents);
        } else {
            // Create sample events
            this.events = this.createSampleEvents();
            this.saveEvents();
        }
        
        this.filteredEvents = [...this.events];
        this.updateEventsList();
        this.updateEventStats();
        this.setupEventFilters();
    }

    createSampleEvents() {
        const today = new Date();
        const events = [];
        
        // Create events for the next 30 days
        for (let i = 1; i <= 10; i++) {
            const eventDate = new Date(today);
            eventDate.setDate(eventDate.getDate() + i * 3);
            
            const eventTypes = ['blood', 'training', 'fundraiser', 'community'];
            const eventType = eventTypes[i % eventTypes.length];
            
            events.push({
                id: 'EVT' + Date.now() + i,
                title: this.getEventTitle(eventType, i),
                type: eventType,
                date: eventDate.toISOString().split('T')[0],
                time: this.getEventTime(i),
                location: this.getEventLocation(i),
                description: this.getEventDescription(eventType),
                maxParticipants: [50, 100, 30, 200][i % 4],
                registeredParticipants: Math.floor(Math.random() * 30),
                contactPerson: 'Red Cross Coordinator',
                contactEmail: 'events@redcross.org.ph',
                requirements: this.getEventRequirements(eventType),
                status: 'upcoming'
            });
        }
        
        return events;
    }

    getEventTitle(type, index) {
        const titles = {
            blood: ['Blood Donation Drive', 'Emergency Blood Collection', 'Community Blood Donation'],
            training: ['First Aid Training', 'Disaster Response Workshop', 'CPR Certification'],
            fundraiser: ['Charity Gala Dinner', 'Fun Run for a Cause', 'Online Fundraising Campaign'],
            community: ['Community Health Fair', 'Medical Mission', 'Youth Volunteer Day']
        };
        
        return titles[type][index % titles[type].length];
    }

    getEventTime(index) {
        const times = ['9:00 AM', '1:00 PM', '10:00 AM', '2:00 PM', '6:00 PM'];
        return times[index % times.length];
    }

    getEventLocation(index) {
        const locations = [
            'SM Mall of Asia, Pasay City',
            'Red Cross National Headquarters',
            'Quezon City Memorial Circle',
            'Ayala Center Cebu',
            'Davao City Convention Center'
        ];
        return locations[index % locations.length];
    }

    getEventDescription(type) {
        const descriptions = {
            blood: 'Join us in saving lives by donating blood. All blood types are needed. Walk-ins welcome!',
            training: 'Learn essential life-saving skills from certified Red Cross trainers.',
            fundraiser: 'Help us raise funds for emergency response equipment and medical supplies.',
            community: 'Free medical check-ups, health education, and community service activities.'
        };
        return descriptions[type];
    }

    getEventRequirements(type) {
        const requirements = {
            blood: ['Age 16-65', 'Minimum weight 50kg', 'Good health condition'],
            training: ['Registration required', 'Comfortable clothing', 'Notebook and pen'],
            fundraiser: ['Registration fee may apply', 'Fundraising goal participation'],
            community: ['Volunteer spirit', 'Comfortable shoes', 'Willingness to help']
        };
        return requirements[type];
    }

    saveEvents() {
        localStorage.setItem('redcrossEvents', JSON.stringify(this.events));
    }

    updateEventsList() {
        const eventsListEl = document.getElementById('eventsList');
        if (!eventsListEl) return;

        // Filter events for current month
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        
        const monthEvents = this.filteredEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getMonth() === currentMonth && 
                   eventDate.getFullYear() === currentYear;
        });

        // Sort by date
        monthEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (monthEvents.length === 0) {
            eventsListEl.innerHTML = '<p class="no-events">No events scheduled for this month.</p>';
            return;
        }

        eventsListEl.innerHTML = monthEvents.map(event => `
            <div class="event-list-item" data-event-id="${event.id}">
                <div class="event-date-badge">
                    <span class="event-day">${new Date(event.date).getDate()}</span>
                    <span class="event-month">${new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                <div class="event-details">
                    <h3>${event.title}</h3>
                    <p class="event-meta">
                        <i class="fas fa-clock"></i> ${event.time} • 
                        <i class="fas fa-map-marker-alt"></i> ${event.location}
                    </p>
                    <p class="event-description">${event.description}</p>
                    <div class="event-stats">
                        <span class="participants">
                            <i class="fas fa-users"></i> 
                            ${event.registeredParticipants} / ${event.maxParticipants} registered
                        </span>
                        <span class="event-type ${event.type}">${event.type}</span>
                    </div>
                </div>
                <div class="event-actions">
                    <button class="btn-small" onclick="eventsSystem.viewEventDetails('${event.id}')">
                        Details
                    </button>
                    <button class="btn-primary" onclick="eventsSystem.registerForEvent('${event.id}')"
                            ${event.registeredParticipants >= event.maxParticipants ? 'disabled' : ''}>
                        ${event.registeredParticipants >= event.maxParticipants ? 'Full' : 'Register'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateEventStats() {
        const today = new Date();
        const upcomingEvents = this.events.filter(event => new Date(event.date) >= today);
        const thisMonthEvents = upcomingEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getMonth() === today.getMonth() && 
                   eventDate.getFullYear() === today.getFullYear();
        });
        
        const totalParticipants = this.events.reduce((sum, event) => sum + event.registeredParticipants, 0);

        // Update stats display
        const upcomingCount = document.getElementById('upcomingEvents');
        const participantsCount = document.getElementById('totalParticipants');
        const monthCount = document.getElementById('eventsThisMonth');
        
        if (upcomingCount) upcomingCount.textContent = upcomingEvents.length;
        if (participantsCount) participantsCount.textContent = totalParticipants;
        if (monthCount) monthCount.textContent = thisMonthEvents.length;
    }

    setupEventListeners() {
        // Event filter buttons
        document.querySelectorAll('.filter-btn[data-type]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-type');
                this.filterEvents(type);
                
                // Update active button
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Event creation form
        const createEventForm = document.getElementById('createEventForm');
        if (createEventForm) {
            createEventForm.addEventListener('submit', (e) => this.createNewEvent(e));
        }
    }

    filterEvents(type) {
        if (type === 'all') {
            this.filteredEvents = [...this.events];
        } else {
            this.filteredEvents = this.events.filter(event => event.type === type);
        }
        
        this.updateEventsList();
    }

    setupEventFilters() {
        const filterButtons = document.querySelectorAll('.event-filters .filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-type');
                this.filterEvents(type);
                
                // Update active filter
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    viewEventDetails(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        this.selectedEvent = event;
        
        const modal = document.getElementById('eventRegistrationModal');
        const modalContent = document.getElementById('eventRegistrationContent');
        
        if (!modal || !modalContent) return;
        
        const registrationCount = event.registeredParticipants;
        const maxParticipants = event.maxParticipants;
        const availableSpots = maxParticipants - registrationCount;
        const progressPercent = (registrationCount / maxParticipants) * 100;
        
        modalContent.innerHTML = `
            <h2>${event.title}</h2>
            <div class="event-details-modal">
                <div class="detail-row">
                    <i class="fas fa-calendar"></i>
                    <div>
                        <strong>Date & Time</strong>
                        <p>${new Date(event.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })} • ${event.time}</p>
                    </div>
                </div>
                <div class="detail-row">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <strong>Location</strong>
                        <p>${event.location}</p>
                    </div>
                </div>
                <div class="detail-row">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <strong>Description</strong>
                        <p>${event.description}</p>
                    </div>
                </div>
                <div class="detail-row">
                    <i class="fas fa-list-check"></i>
                    <div>
                        <strong>Requirements</strong>
                        <ul>${event.requirements.map(req => `<li>${req}</li>`).join('')}</ul>
                    </div>
                </div>
                
                <div class="registration-stats">
                    <h3>Registration Status</h3>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progressPercent}%"></div>
                    </div>
                    <p>${registrationCount} registered • ${availableSpots} spots available</p>
                </div>
                
                ${availableSpots > 0 ? `
                    <form id="eventRegistrationForm">
                        <h3>Register for this Event</h3>
                        <div class="form-group">
                            <label for="registrantName">Full Name *</label>
                            <input type="text" id="registrantName" required>
                        </div>
                        <div class="form-group">
                            <label for="registrantEmail">Email Address *</label>
                            <input type="email" id="registrantEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="registrantPhone">Phone Number *</label>
                            <input type="tel" id="registrantPhone" pattern="[0-9]{11}" required>
                        </div>
                        <div class="form-group">
                            <label for="additionalInfo">Additional Information</label>
                            <textarea id="additionalInfo" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn-primary">Complete Registration</button>
                    </form>
                ` : `
                    <div class="event-full">
                        <i class="fas fa-times-circle"></i>
                        <h3>Event Full</h3>
                        <p>This event has reached maximum capacity. Please check other upcoming events.</p>
                    </div>
                `}
            </div>
        `;
        
        // Set up registration form
        const registrationForm = document.getElementById('eventRegistrationForm');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => this.handleEventRegistration(e, eventId));
        }
        
        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    handleEventRegistration(event, eventId) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const registrationData = {
            eventId: eventId,
            name: formData.get('registrantName'),
            email: formData.get('registrantEmail'),
            phone: formData.get('registrantPhone'),
            additionalInfo: formData.get('additionalInfo'),
            registrationDate: new Date().toISOString(),
            registrationId: 'REG' + Date.now()
        };
        
        // Validate data
        if (!this.validateRegistration(registrationData)) {
            this.showMessage('Please check your information and try again.', 'error');
            return;
        }
        
        // Register for event
        this.registerParticipant(eventId, registrationData);
        
        // Close modal
        this.closeEventModal();
        
        // Show success message
        this.showMessage(`Successfully registered for ${this.selectedEvent.title}! Confirmation sent to ${registrationData.email}.`, 'success');
    }

    validateRegistration(data) {
        // Basic validation
        if (!data.name || data.name.length < 3) return false;
        if (!data.email || !data.email.includes('@')) return false;
        if (!data.phone || data.phone.length !== 11) return false;
        
        return true;
    }

    registerForEvent(eventId) {
        // Quick registration - use stored user info if available
        const currentUser = JSON.parse(localStorage.getItem('redcrossUser') || '{}');
        
        if (!currentUser.email) {
            // Show detailed registration modal
            this.viewEventDetails(eventId);
            return;
        }
        
        // Quick registration with stored user data
        const registrationData = {
            eventId: eventId,
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone || '',
            registrationDate: new Date().toISOString(),
            registrationId: 'REG' + Date.now()
        };
        
        this.registerParticipant(eventId, registrationData);
        
        this.showMessage(`Successfully registered for event!`, 'success');
    }

    registerParticipant(eventId, registrationData) {
        // Update event registration count
        const eventIndex = this.events.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
            this.events[eventIndex].registeredParticipants++;
            this.saveEvents();
        }
        
        // Save registration
        let registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
        registrations.push(registrationData);
        localStorage.setItem('eventRegistrations', JSON.stringify(registrations));
        
        // Update display
        this.updateEventsList();
        this.updateEventStats();
        
        // Send confirmation (simulated)
        this.sendConfirmationEmail(registrationData);
    }

    sendConfirmationEmail(registration) {
        const event = this.events.find(e => e.id === registration.eventId);
        if (!event) return;
        
        console.log('Confirmation email sent to:', registration.email);
        console.log('Event:', event.title);
        console.log('Registration ID:', registration.registrationId);
        
        // In a real app, you would send an actual email here
    }

    closeEventModal() {
        const modal = document.getElementById('eventRegistrationModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    createNewEvent(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const newEvent = {
            id: 'EVT' + Date.now(),
            title: formData.get('eventTitle'),
            type: formData.get('eventType'),
            date: formData.get('eventDate'),
            time: formData.get('eventTime'),
            location: formData.get('eventLocation'),
            description: formData.get('eventDescription'),
            maxParticipants: parseInt(formData.get('eventMaxParticipants')),
            registeredParticipants: 0,
            contactPerson: 'Red Cross Coordinator',
            contactEmail: 'events@redcross.org.ph',
            requirements: this.getEventRequirements(formData.get('eventType')),
            status: 'upcoming',
            createdBy: 'admin',
            createdAt: new Date().toISOString()
        };
        
        // Add to events array
        this.events.push(newEvent);
        this.filteredEvents.push(newEvent);
        
        // Save to localStorage
        this.saveEvents();
        
        // Update UI
        this.updateEventsList();
        this.updateEventStats();
        
        // Reset form
        form.reset();
        
        // Show success message
        this.showMessage('Event created successfully!', 'success');
    }

    checkAdminAccess() {
        // Check if user has admin privileges (simplified for demo)
        const user = JSON.parse(localStorage.getItem('redcrossUser') || '{}');
        const adminSection = document.getElementById('adminSection');
        
        if (adminSection && user.role === 'admin') {
            adminSection.style.display = 'block';
        }
    }

    showDayEvents(date) {
        const dayEvents = this.events.filter(event => event.date === date);
        
        if (dayEvents.length === 0) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h2>Events on ${new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</h2>
                <div class="day-events">
                    ${dayEvents.map(event => `
                        <div class="day-event-item">
                            <h3>${event.title}</h3>
                            <p><i class="fas fa-clock"></i> ${event.time}</p>
                            <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                            <button class="btn-small" onclick="eventsSystem.viewEventDetails('${event.id}')">
                                View Details
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showMessage(message, type) {
        if (window.redCrossApp) {
            window.redCrossApp.showMessage(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize events system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.eventsSystem = new EventsSystem();
});

// Global function for closing event modal
function closeEventModal() {
    if (window.eventsSystem) {
        window.eventsSystem.closeEventModal();
    }
}