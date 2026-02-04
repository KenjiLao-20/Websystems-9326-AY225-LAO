// Volunteer Registration and Management System

class VolunteerSystem {
    constructor() {
        this.currentStep = 1;
        this.formData = {};
        this.initializeForm();
        this.loadOpportunities();
        this.checkExistingApplication();
    }

    initializeForm() {
        // Set minimum date for birthdate (16 years ago)
        const birthdateInput = document.getElementById('birthdate');
        if (birthdateInput) {
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - 65);
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() - 16);
            
            birthdateInput.min = minDate.toISOString().split('T')[0];
            birthdateInput.max = maxDate.toISOString().split('T')[0];
        }

        // Form submission
        const form = document.getElementById('volunteerRegistrationForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmission(e));
        }

        // Real-time validation
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        // Name validation
        const nameInput = document.getElementById('fullName');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                this.validateName(e.target.value);
            });
        }

        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                this.validateEmail(e.target.value);
            });
        }

        // Phone validation
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.validatePhone(e.target.value);
            });
        }

        // Skills validation
        const skillsCheckboxes = document.querySelectorAll('input[name="skills"]');
        skillsCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.validateSkills();
            });
        });
    }

    validateName(name) {
        const errorElement = document.getElementById('nameError');
        const regex = /^[A-Za-z\s]{3,50}$/;
        
        if (!name) {
            errorElement.textContent = '';
            return false;
        }
        
        if (!regex.test(name)) {
            errorElement.textContent = 'Name must be 3-50 characters, letters and spaces only';
            return false;
        }
        
        errorElement.textContent = '';
        return true;
    }

    validateEmail(email) {
        const errorElement = document.getElementById('emailError');
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            errorElement.textContent = '';
            return false;
        }
        
        if (!regex.test(email)) {
            errorElement.textContent = 'Please enter a valid email address';
            return false;
        }
        
        errorElement.textContent = '';
        return true;
    }

    validatePhone(phone) {
        const errorElement = document.getElementById('phoneError');
        const regex = /^(09|\+639)\d{9}$/;
        
        if (!phone) {
            errorElement.textContent = '';
            return false;
        }
        
        if (!regex.test(phone)) {
            errorElement.textContent = 'Please enter a valid Philippine mobile number (09XXXXXXXXX)';
            return false;
        }
        
        errorElement.textContent = '';
        return true;
    }

    validateSkills() {
        const errorElement = document.getElementById('skillsError');
        const selectedSkills = document.querySelectorAll('input[name="skills"]:checked');
        
        if (selectedSkills.length < 2) {
            errorElement.textContent = 'Please select at least 2 skills';
            return false;
        }
        
        errorElement.textContent = '';
        return true;
    }

    collectFormData() {
        const form = document.getElementById('volunteerRegistrationForm');
        if (!form) return null;

        const formData = new FormData(form);
        
        // Basic info
        this.formData = {
            personal: {
                name: formData.get('fullName'),
                birthdate: formData.get('birthdate'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address')
            },
            skills: {
                selected: Array.from(formData.getAll('skills')),
                interests: Array.from(document.getElementById('interestArea').selectedOptions).map(opt => opt.value)
            },
            availability: {
                days: Array.from(formData.getAll('days')),
                preferredTime: formData.get('preferredTime'),
                emergencyContact: formData.get('emergencyContact'),
                emergencyPhone: formData.get('emergencyPhone')
            },
            metadata: {
                applicationDate: new Date().toISOString(),
                applicationId: 'VOL' + Date.now(),
                status: 'pending',
                assignedChapter: this.assignChapter(formData.get('address'))
            }
        };

        return this.formData;
    }

    assignChapter(address) {
        // Simple chapter assignment based on location keywords
        const addressLower = address.toLowerCase();
        
        if (addressLower.includes('manila')) return 'Manila Chapter';
        if (addressLower.includes('quezon')) return 'Quezon City Chapter';
        if (addressLower.includes('makati')) return 'Makati Chapter';
        if (addressLower.includes('cebu')) return 'Cebu Chapter';
        if (addressLower.includes('davao')) return 'Davao Chapter';
        
        return 'National Headquarters';
    }

    async handleSubmission(event) {
        event.preventDefault();
        
        // Validate all steps
        if (!this.validateAllSteps()) {
            this.showMessage('Please fix the errors in the form', 'error');
            return;
        }
        
        const formData = this.collectFormData();
        
        // Show loading state
        this.showLoading(true);
        
        try {
            // Save to localStorage
            this.saveApplication(formData);
            
            // Show success message
            this.showSuccessMessage(formData);
            
            // Update dashboard
            this.updateVolunteerDashboard(formData);
            
            // Reset form
            event.target.reset();
            
            // Reset to first step
            this.resetFormSteps();
            
        } catch (error) {
            this.showMessage('Error submitting application. Please try again.', 'error');
            console.error('Submission error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    validateAllSteps() {
        const nameValid = this.validateName(document.getElementById('fullName')?.value);
        const emailValid = this.validateEmail(document.getElementById('email')?.value);
        const phoneValid = this.validatePhone(document.getElementById('phone')?.value);
        const skillsValid = this.validateSkills();
        
        return nameValid && emailValid && phoneValid && skillsValid;
    }

    saveApplication(application) {
        // Get existing applications
        let applications = JSON.parse(localStorage.getItem('volunteerApplications') || '[]');
        
        // Check if email already exists
        const existingIndex = applications.findIndex(app => 
            app.personal.email === application.personal.email
        );
        
        if (existingIndex > -1) {
            // Update existing application
            applications[existingIndex] = application;
        } else {
            // Add new application
            applications.push(application);
        }
        
        // Save to localStorage
        localStorage.setItem('volunteerApplications', JSON.stringify(applications));
        
        // Also save as current user if this is their first application
        if (!localStorage.getItem('redcrossUser')) {
            localStorage.setItem('redcrossUser', JSON.stringify({
                name: application.personal.name,
                email: application.personal.email,
                role: 'volunteer',
                joinDate: new Date().toISOString()
            }));
        }
        
        // Update statistics
        this.updateVolunteerStats();
    }

    updateVolunteerStats() {
        let stats = JSON.parse(localStorage.getItem('volunteerStats') || '{}');
        
        stats.totalApplications = (stats.totalApplications || 0) + 1;
        stats.lastApplicationDate = new Date().toISOString();
        
        localStorage.setItem('volunteerStats', JSON.stringify(stats));
    }

    showSuccessMessage(application) {
        const statusElement = document.getElementById('applicationStatus');
        if (!statusElement) return;
        
        statusElement.innerHTML = `
            <div class="success-message">
                <h3>Application Submitted Successfully!</h3>
                <p><strong>Application ID:</strong> ${application.metadata.applicationId}</p>
                <p><strong>Assigned Chapter:</strong> ${application.metadata.assignedChapter}</p>
                <p><strong>Status:</strong> ${application.metadata.status}</p>
                <p>We will contact you at ${application.personal.email} within 48 hours.</p>
                <button class="btn-primary" onclick="window.location.href='volunteer.html#volunteerDashboard'">
                    View Your Dashboard
                </button>
            </div>
        `;
        
        // Scroll to status message
        statusElement.scrollIntoView({ behavior: 'smooth' });
    }

    showLoading(show) {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            if (show) {
                submitBtn.innerHTML = '<span class="loading"></span> Processing...';
                submitBtn.disabled = true;
            } else {
                submitBtn.innerHTML = 'Submit Application';
                submitBtn.disabled = false;
            }
        }
    }

    showMessage(message, type) {
        if (window.redCrossApp) {
            window.redCrossApp.showMessage(message, type);
        } else {
            alert(message);
        }
    }

    resetFormSteps() {
        // Reset to first tab
        document.querySelectorAll('.tab-btn').forEach((btn, index) => {
            btn.classList.remove('active');
            if (index === 0) btn.classList.add('active');
        });
        
        document.querySelectorAll('.tab-content').forEach((content, index) => {
            content.classList.remove('active');
            if (index === 0) content.classList.add('active');
        });
        
        // Reset progress bar
        const progressBar = document.getElementById('formProgress');
        if (progressBar) {
            progressBar.style.width = '33%';
        }
        
        const progressText = document.getElementById('progressText');
        if (progressText) {
            progressText.textContent = 'Step 1 of 3';
        }
    }

    checkExistingApplication() {
        const applications = JSON.parse(localStorage.getItem('volunteerApplications') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('redcrossUser') || '{}');
        
        if (currentUser.email) {
            const userApplication = applications.find(app => 
                app.personal.email === currentUser.email
            );
            
            if (userApplication) {
                this.showExistingApplication(userApplication);
            }
        }
    }

    showExistingApplication(application) {
        const formContainer = document.querySelector('.form-container');
        if (!formContainer) return;
        
        const existingAppDiv = document.createElement('div');
        existingAppDiv.className = 'existing-application';
        existingAppDiv.innerHTML = `
            <h3>Existing Application Found</h3>
            <p><strong>Status:</strong> ${application.metadata.status}</p>
            <p><strong>Submitted:</strong> ${new Date(application.metadata.applicationDate).toLocaleDateString()}</p>
            <button class="btn-secondary" onclick="volunteerSystem.viewApplicationDetails()">
                View Details
            </button>
            <button class="btn-primary" onclick="volunteerSystem.continueApplication()">
                Update Application
            </button>
        `;
        
        formContainer.prepend(existingAppDiv);
    }

    viewApplicationDetails() {
        const applications = JSON.parse(localStorage.getItem('volunteerApplications') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('redcrossUser') || '{}');
        const userApplication = applications.find(app => app.personal.email === currentUser.email);
        
        if (userApplication) {
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
                    <h2>Application Details</h2>
                    <div class="application-details">
                        <h3>Personal Information</h3>
                        <p><strong>Name:</strong> ${userApplication.personal.name}</p>
                        <p><strong>Email:</strong> ${userApplication.personal.email}</p>
                        <p><strong>Phone:</strong> ${userApplication.personal.phone}</p>
                        
                        <h3>Skills & Interests</h3>
                        <p><strong>Skills:</strong> ${userApplication.skills.selected.join(', ')}</p>
                        <p><strong>Interests:</strong> ${userApplication.skills.interests.join(', ')}</p>
                        
                        <h3>Application Information</h3>
                        <p><strong>Application ID:</strong> ${userApplication.metadata.applicationId}</p>
                        <p><strong>Status:</strong> ${userApplication.metadata.status}</p>
                        <p><strong>Assigned Chapter:</strong> ${userApplication.metadata.assignedChapter}</p>
                        <p><strong>Submitted:</strong> ${new Date(userApplication.metadata.applicationDate).toLocaleString()}</p>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }

    continueApplication() {
        // Remove existing application notice
        const existingNotice = document.querySelector('.existing-application');
        if (existingNotice) {
            existingNotice.remove();
        }
        
        // Populate form with existing data
        this.populateFormWithExistingData();
    }

    populateFormWithExistingData() {
        const applications = JSON.parse(localStorage.getItem('volunteerApplications') || '[]');
        const currentUser = JSON.parse(localStorage.getItem('redcrossUser') || '{}');
        const userApplication = applications.find(app => app.personal.email === currentUser.email);
        
        if (!userApplication) return;
        
        // Populate personal info
        document.getElementById('fullName').value = userApplication.personal.name || '';
        document.getElementById('birthdate').value = userApplication.personal.birthdate || '';
        document.getElementById('email').value = userApplication.personal.email || '';
        document.getElementById('phone').value = userApplication.personal.phone || '';
        document.getElementById('address').value = userApplication.personal.address || '';
        
        // Populate skills
        document.querySelectorAll('input[name="skills"]').forEach(checkbox => {
            checkbox.checked = userApplication.skills.selected.includes(checkbox.value);
        });
        
        // Populate interests
        const interestSelect = document.getElementById('interestArea');
        if (interestSelect) {
            Array.from(interestSelect.options).forEach(option => {
                option.selected = userApplication.skills.interests.includes(option.value);
            });
        }
        
        // Populate availability
        document.querySelectorAll('input[name="days"]').forEach(checkbox => {
            checkbox.checked = userApplication.availability.days.includes(checkbox.value);
        });
        
        document.getElementById('preferredTime').value = userApplication.availability.preferredTime || '';
        document.getElementById('emergencyContact').value = userApplication.availability.emergencyContact || '';
        document.getElementById('emergencyPhone').value = userApplication.availability.emergencyPhone || '';
        
        // Show message
        this.showMessage('Form populated with your existing application data. You can now make changes.', 'info');
    }

    updateVolunteerDashboard(application) {
        const dashboard = document.getElementById('volunteerDashboard');
        if (!dashboard) return;
        
        // Show dashboard
        dashboard.style.display = 'block';
        
        // Update profile section
        const profileSection = document.getElementById('volunteerProfile');
        if (profileSection) {
            profileSection.innerHTML = `
                <p><strong>Name:</strong> ${application.personal.name}</p>
                <p><strong>Chapter:</strong> ${application.metadata.assignedChapter}</p>
                <p><strong>Status:</strong> <span class="status-badge ${application.metadata.status}">${application.metadata.status}</span></p>
                <p><strong>Member Since:</strong> ${new Date(application.metadata.applicationDate).toLocaleDateString()}</p>
            `;
        }
        
        // Update hours logged
        this.updateHoursLogged();
        
        // Load upcoming shifts
        this.loadUpcomingShifts(application);
        
        // Load training progress
        this.loadTrainingProgress(application);
    }

    updateHoursLogged() {
        let hours = parseInt(localStorage.getItem('volunteerHours') || '0');
        const hoursElement = document.getElementById('totalHours');
        if (hoursElement) {
            hoursElement.textContent = hours;
        }
    }

    loadUpcomingShifts(application) {
        const shiftsElement = document.getElementById('upcomingShifts');
        if (!shiftsElement) return;
        
        // Get shifts from localStorage or create sample data
        let shifts = JSON.parse(localStorage.getItem('volunteerShifts') || '[]');
        
        if (shifts.length === 0) {
            // Create sample shifts for the next two weeks
            shifts = this.generateSampleShifts(application);
            localStorage.setItem('volunteerShifts', JSON.stringify(shifts));
        }
        
        const upcomingShifts = shifts
            .filter(shift => new Date(shift.date) > new Date())
            .slice(0, 3);
        
        if (upcomingShifts.length === 0) {
            shiftsElement.innerHTML = '<p class="no-shifts">No upcoming shifts scheduled</p>';
            return;
        }
        
        shiftsElement.innerHTML = upcomingShifts.map(shift => `
            <div class="shift-item">
                <h4>${shift.event}</h4>
                <p>${new Date(shift.date).toLocaleDateString()} • ${shift.time}</p>
                <p>📍 ${shift.location}</p>
                <button class="btn-small" onclick="volunteerSystem.cancelShift('${shift.id}')">Cancel</button>
            </div>
        `).join('');
    }

    generateSampleShifts(application) {
        const shifts = [];
        const today = new Date();
        
        for (let i = 1; i <= 3; i++) {
            const shiftDate = new Date(today);
            shiftDate.setDate(shiftDate.getDate() + i * 3);
            
            shifts.push({
                id: 'SHIFT' + Date.now() + i,
                event: ['Blood Donation Drive', 'Disaster Preparedness Training', 'Community Health Fair'][i % 3],
                date: shiftDate.toISOString(),
                time: ['9:00 AM', '1:00 PM', '10:00 AM'][i % 3],
                location: application.metadata.assignedChapter,
                status: 'confirmed'
            });
        }
        
        return shifts;
    }

    loadTrainingProgress(application) {
        const progressElement = document.getElementById('trainingProgress');
        if (!progressElement) return;
        
        const trainings = [
            { name: 'First Aid & CPR', completed: true, date: '2024-03-15' },
            { name: 'Disaster Response', completed: true, date: '2024-03-20' },
            { name: 'Blood Service Training', completed: false, date: null },
            { name: 'Community Health', completed: false, date: null }
        ];
        
        progressElement.innerHTML = trainings.map(training => `
            <div class="training-item">
                <div class="training-info">
                    <span class="training-name">${training.name}</span>
                    ${training.completed 
                        ? `<span class="training-status completed">Completed</span>` 
                        : `<span class="training-status pending">Pending</span>`
                    }
                </div>
                ${training.completed 
                    ? `<div class="training-date">${new Date(training.date).toLocaleDateString()}</div>` 
                    : `<button class="btn-small" onclick="volunteerSystem.enrollTraining('${training.name}')">Enroll</button>`
                }
            </div>
        `).join('');
    }

    cancelShift(shiftId) {
        let shifts = JSON.parse(localStorage.getItem('volunteerShifts') || '[]');
        shifts = shifts.filter(shift => shift.id !== shiftId);
        localStorage.setItem('volunteerShifts', JSON.stringify(shifts));
        
        // Reload shifts
        const application = this.collectFormData();
        if (application) {
            this.loadUpcomingShifts(application);
        }
        
        this.showMessage('Shift cancelled successfully', 'success');
    }

    enrollTraining(trainingName) {
        // In a real app, this would enroll the volunteer in training
        this.showMessage(`Enrolled in ${trainingName}. Details will be sent to your email.`, 'success');
        
        // Reload training progress
        const application = this.collectFormData();
        if (application) {
            this.loadTrainingProgress(application);
        }
    }

    loadOpportunities() {
        const opportunitiesGrid = document.getElementById('opportunitiesGrid');
        if (!opportunitiesGrid) return;
        
        const opportunities = [
            {
                id: 1,
                title: 'Disaster Response Team',
                location: 'National Headquarters',
                commitment: 'Flexible hours',
                requirements: ['First Aid training', 'Physical fitness'],
                urgency: 'high'
            },
            {
                id: 2,
                title: 'Blood Donation Assistant',
                location: 'Various Blood Centers',
                commitment: '4 hours/week',
                requirements: ['Customer service skills'],
                urgency: 'high'
            },
            {
                id: 3,
                title: 'Youth Program Mentor',
                location: 'Community Centers',
                commitment: 'Weekends',
                requirements: ['Teaching experience', 'Patience'],
                urgency: 'medium'
            },
            {
                id: 4,
                title: 'Administrative Support',
                location: 'Chapter Offices',
                commitment: 'Regular office hours',
                requirements: ['Computer skills', 'Organization'],
                urgency: 'low'
            }
        ];
        
        opportunitiesGrid.innerHTML = opportunities.map(opp => `
            <div class="opportunity-card ${opp.urgency}">
                <h3>${opp.title}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${opp.location}</p>
                <p><i class="fas fa-clock"></i> ${opp.commitment}</p>
                <div class="requirements">
                    <strong>Requirements:</strong>
                    <ul>${opp.requirements.map(req => `<li>${req}</li>`).join('')}</ul>
                </div>
                <button class="btn-primary" onclick="volunteerSystem.applyForOpportunity(${opp.id})">
                    Apply Now
                </button>
            </div>
        `).join('');
    }

    applyForOpportunity(opportunityId) {
        const application = this.collectFormData();
        if (!application) {
            this.showMessage('Please complete your volunteer application first', 'error');
            return;
        }
        
        // Save opportunity application
        let opportunityApplications = JSON.parse(localStorage.getItem('opportunityApplications') || '[]');
        
        opportunityApplications.push({
            opportunityId,
            volunteerEmail: application.personal.email,
            applicationDate: new Date().toISOString(),
            status: 'pending'
        });
        
        localStorage.setItem('opportunityApplications', JSON.stringify(opportunityApplications));
        
        this.showMessage('Application submitted successfully! We will contact you soon.', 'success');
    }
}

// Initialize volunteer system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.volunteerSystem = new VolunteerSystem();
});