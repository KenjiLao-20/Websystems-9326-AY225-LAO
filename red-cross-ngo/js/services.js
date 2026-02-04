// Services Management System

class ServicesSystem {
    constructor() {
        this.services = [];
        this.filteredServices = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        
        this.initializeServices();
        this.setupEventListeners();
        this.loadServiceLocations();
    }

    initializeServices() {
        this.loadServices();
        this.renderServices();
        this.setupServiceFilter();
        this.setupSearch();
    }

    loadServices() {
        // Try to load from localStorage
        const savedServices = localStorage.getItem('redcrossServices');
        
        if (savedServices) {
            this.services = JSON.parse(savedServices);
        } else {
            // Create sample services
            this.services = this.createSampleServices();
            this.saveServices();
        }
        
        this.filteredServices = [...this.services];
    }

    createSampleServices() {
        return [
            {
                id: 1,
                title: "Blood Donation Services",
                category: "medical",
                description: "Safe blood collection and distribution for emergency and medical needs",
                details: "Our blood service operates 6 days a week, providing safe and hygienic blood collection facilities. We screen all donors and ensure blood safety through rigorous testing.",
                icon: "🩸",
                requirements: ["Age 16-65 years", "Minimum weight 50kg", "Good health condition", "No recent illnesses"],
                locations: ["Manila Headquarters", "Quezon City Chapter", "Makati Blood Center", "Cebu Chapter"],
                contact: "blood@redcross.org.ph",
                phone: "(02) 8527-8385",
                hours: "Mon-Sat: 8:00 AM - 5:00 PM",
                urgency: "high"
            },
            {
                id: 2,
                title: "Disaster Response",
                category: "disaster",
                description: "24/7 emergency response and disaster management",
                details: "Trained teams ready to respond to natural disasters, accidents, and emergencies. Includes search and rescue, emergency shelter, and relief distribution.",
                icon: "🚨",
                requirements: ["Emergency training recommended", "Physical fitness required"],
                locations: ["All Chapters Nationwide"],
                contact: "emergency@redcross.org.ph",
                phone: "143 (24/7 Hotline)",
                hours: "24/7 Emergency Service",
                urgency: "critical"
            },
            {
                id: 3,
                title: "First Aid Training",
                category: "training",
                description: "Certified first aid and CPR training programs",
                details: "Comprehensive training programs for individuals, schools, and organizations. Certifications valid for 2 years with refresher courses available.",
                icon: "🩹",
                requirements: ["Minimum age 16", "Registration required"],
                locations: ["National Training Center", "Regional Chapters"],
                contact: "training@redcross.org.ph",
                phone: "(02) 8790-2300 loc. 123",
                hours: "Weekday sessions available",
                urgency: "medium"
            },
            {
                id: 4,
                title: "Community Health Programs",
                category: "community",
                description: "Health education and preventive care services",
                details: "Mobile health clinics, vaccination drives, and health education programs in underserved communities. Focus on preventive care and early detection.",
                icon: "🏥",
                requirements: ["Community registration", "Health card may be required"],
                locations: ["Various Community Centers"],
                contact: "community@redcross.org.ph",
                phone: "(02) 8790-2300 loc. 456",
                hours: "Schedule varies by location",
                urgency: "medium"
            },
            {
                id: 5,
                title: "Ambulance Services",
                category: "medical",
                description: "Emergency medical transport and pre-hospital care",
                details: "Fully equipped ambulances with trained EMTs available for emergency transport. Can be requested through our emergency hotline.",
                icon: "🚑",
                requirements: ["Emergency situation", "Medical referral if non-emergency"],
                locations: ["Metro Manila", "Major Cities"],
                contact: "ambulance@redcross.org.ph",
                phone: "(02) 8790-2300",
                hours: "24/7 Emergency Service",
                urgency: "critical"
            },
            {
                id: 6,
                title: "Youth Volunteer Programs",
                category: "community",
                description: "Engagement programs for young volunteers",
                details: "Special programs for youth aged 16-25 to develop leadership skills through community service and humanitarian work.",
                icon: "👨‍🎓",
                requirements: ["Age 16-25", "Parental consent for minors"],
                locations: ["All Chapters"],
                contact: "youth@redcross.org.ph",
                phone: "(02) 8790-2300 loc. 789",
                hours: "Weekends and school breaks",
                urgency: "low"
            }
        ];
    }

    saveServices() {
        localStorage.setItem('redcrossServices', JSON.stringify(this.services));
    }

    renderServices() {
        const container = document.getElementById('servicesContainer');
        if (!container) return;

        if (this.filteredServices.length === 0) {
            container.innerHTML = `
                <div class="no-services">
                    <i class="fas fa-search"></i>
                    <h3>No services found</h3>
                    <p>Try adjusting your filters or search term</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredServices.map(service => `
            <div class="service-card" onclick="servicesSystem.openServiceModal(${service.id})">
                <div class="service-icon">${service.icon}</div>
                <div class="service-content">
                    <div class="service-header">
                        <h3>${service.title}</h3>
                        <span class="urgency-badge ${service.urgency}">${service.urgency}</span>
                    </div>
                    <p class="service-description">${service.description}</p>
                    <div class="service-meta">
                        <span class="service-category">${service.category}</span>
                        <span class="service-locations">
                            <i class="fas fa-map-marker-alt"></i> ${service.locations.length} locations
                        </span>
                    </div>
                    <div class="service-footer">
                        <span class="service-contact">
                            <i class="fas fa-phone"></i> ${service.phone}
                        </span>
                        <button class="btn-small" onclick="event.stopPropagation(); servicesSystem.navigateToService('${service.title}')">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupServiceFilter() {
        const filterButtons = document.querySelectorAll('.filter-btn[data-category]');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                this.filterServices(category);
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    filterServices(category) {
        this.currentFilter = category;
        
        if (category === 'all') {
            this.filteredServices = [...this.services];
        } else {
            this.filteredServices = this.services.filter(service => service.category === category);
        }
        
        // Apply search filter if exists
        if (this.searchTerm) {
            this.filteredServices = this.filteredServices.filter(service =>
                service.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                service.description.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }
        
        this.renderServices();
        this.updateServiceCount();
    }

    setupSearch() {
        const searchInput = document.getElementById('serviceSearch');
        if (!searchInput) return;

        // Debounce search to improve performance
        let timeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.searchTerm = e.target.value;
                this.filterServices(this.currentFilter);
            }, 300);
        });
    }

    updateServiceCount() {
        const countElement = document.querySelector('.services-count');
        if (!countElement) return;

        countElement.textContent = `${this.filteredServices.length} services found`;
    }

    openServiceModal(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        const modal = document.getElementById('serviceModal');
        const modalContent = document.getElementById('modalContent');
        
        if (!modal || !modalContent) return;

        modalContent.innerHTML = `
            <div class="service-modal-content">
                <div class="service-modal-header">
                    <div class="service-icon-large">${service.icon}</div>
                    <div>
                        <h2>${service.title}</h2>
                        <div class="service-tags">
                            <span class="service-category-tag">${service.category}</span>
                            <span class="urgency-tag ${service.urgency}">${service.urgency.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="service-modal-body">
                    <div class="service-section">
                        <h3><i class="fas fa-info-circle"></i> Description</h3>
                        <p>${service.details}</p>
                    </div>
                    
                    <div class="service-section">
                        <h3><i class="fas fa-list-check"></i> Requirements</h3>
                        <ul class="requirements-list">
                            ${service.requirements.map(req => `<li>${req}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="service-section">
                        <h3><i class="fas fa-map-marker-alt"></i> Available Locations</h3>
                        <div class="locations-grid">
                            ${service.locations.map(location => `
                                <div class="location-item">
                                    <i class="fas fa-hospital"></i>
                                    <span>${location}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="service-section">
                        <h3><i class="fas fa-clock"></i> Operating Hours</h3>
                        <p>${service.hours}</p>
                    </div>
                    
                    <div class="service-section">
                        <h3><i class="fas fa-phone"></i> Contact Information</h3>
                        <div class="contact-info">
                            <p><strong>Phone:</strong> ${service.phone}</p>
                            <p><strong>Email:</strong> ${service.contact}</p>
                        </div>
                    </div>
                </div>
                
                <div class="service-modal-actions">
                    <button class="btn-secondary" onclick="servicesSystem.printServiceInfo(${serviceId})">
                        <i class="fas fa-print"></i> Print Info
                    </button>
                    <button class="btn-primary" onclick="servicesSystem.navigateToVolunteer('${service.title}')">
                        <i class="fas fa-heart"></i> Volunteer for this Service
                    </button>
                </div>
            </div>
        `;

        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeServiceModal() {
        const modal = document.getElementById('serviceModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    printServiceInfo(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${service.title} - Red Cross</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #D32F2F; }
                    .info-section { margin: 20px 0; }
                    .requirements li { margin: 5px 0; }
                </style>
            </head>
            <body>
                <h1>${service.title}</h1>
                <div class="info-section">
                    <h3>Description</h3>
                    <p>${service.details}</p>
                </div>
                <div class="info-section">
                    <h3>Requirements</h3>
                    <ul class="requirements">
                        ${service.requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                <div class="info-section">
                    <h3>Locations</h3>
                    <p>${service.locations.join('<br>')}</p>
                </div>
                <div class="info-section">
                    <h3>Contact</h3>
                    <p>Phone: ${service.phone}</p>
                    <p>Email: ${service.contact}</p>
                </div>
                <div class="info-section">
                    <h3>Hours</h3>
                    <p>${service.hours}</p>
                </div>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                    Printed from Philippine Red Cross Services - ${new Date().toLocaleDateString()}
                </p>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    navigateToVolunteer(serviceName) {
        // Save selected service to localStorage for volunteer form
        localStorage.setItem('selectedService', serviceName);
        
        // Redirect to volunteer page
        window.location.href = 'volunteer.html';
    }

    navigateToService(serviceName) {
        // For learn more button - just open modal
        const service = this.services.find(s => s.title === serviceName);
        if (service) {
            this.openServiceModal(service.id);
        }
    }

    loadServiceLocations() {
        // This would typically load from an API
        // For demo, we'll use sample data
        this.serviceLocations = {
            blood: [
                { name: "Manila Blood Center", address: "37 EDSA, Mandaluyong", hours: "8AM-5PM", phone: "(02) 8527-8385" },
                { name: "Quezon City Chapter", address: "Quezon City Hall Compound", hours: "8AM-5PM", phone: "(02) 8921-1234" }
            ],
            firstaid: [
                { name: "National Training Center", address: "Red Cross Compound, Mandaluyong", hours: "9AM-4PM", phone: "(02) 8790-2300" }
            ],
            ambulance: [
                { name: "Metro Manila Dispatch", address: "37 EDSA, Mandaluyong", hours: "24/7", phone: "(02) 8790-2300" }
            ],
            testing: [
                { name: "Main Testing Center", address: "Red Cross Compound", hours: "8AM-5PM", phone: "(02) 8527-8385" }
            ]
        };
    }

    findServices() {
        const serviceType = document.getElementById('serviceType').value;
        const location = document.getElementById('locationSelect').value;
        const resultsEl = document.getElementById('locatorResults');
        
        if (!resultsEl) return;
        
        if (!serviceType || !location) {
            resultsEl.innerHTML = `
                <div class="locator-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Please select both service type and location</p>
                </div>
            `;
            return;
        }
        
        // Filter services based on selections
        const filtered = this.services.filter(service => {
            // Map service type to category
            const typeMap = {
                'blood': 'medical',
                'firstaid': 'training',
                'ambulance': 'medical',
                'testing': 'medical'
            };
            
            const matchesType = service.category === typeMap[serviceType];
            const matchesLocation = service.locations.some(loc => 
                loc.toLowerCase().includes(location.toLowerCase())
            );
            
            return matchesType && matchesLocation;
        });
        
        if (filtered.length === 0) {
            resultsEl.innerHTML = `
                <div class="locator-no-results">
                    <i class="fas fa-search"></i>
                    <h3>No services found</h3>
                    <p>Try selecting different options or contact us directly</p>
                    <button class="btn-secondary" onclick="window.location.href='contact.html'">
                        Contact Support
                    </button>
                </div>
            `;
            return;
        }
        
        resultsEl.innerHTML = `
            <div class="locator-results-header">
                <h3>Found ${filtered.length} service(s)</h3>
                <button class="btn-small" onclick="servicesSystem.downloadResults()">
                    <i class="fas fa-download"></i> Download List
                </button>
            </div>
            <div class="locator-results-list">
                ${filtered.map(service => `
                    <div class="locator-result-item">
                        <h4>${service.title}</h4>
                        <p><i class="fas fa-map-marker-alt"></i> ${service.locations[0]}</p>
                        <p><i class="fas fa-clock"></i> ${service.hours}</p>
                        <p><i class="fas fa-phone"></i> ${service.phone}</p>
                        <div class="result-actions">
                            <button class="btn-small" onclick="servicesSystem.getDirections('${service.locations[0]}')">
                                <i class="fas fa-directions"></i> Directions
                            </button>
                            <button class="btn-small" onclick="servicesSystem.callService('${service.phone}')">
                                <i class="fas fa-phone"></i> Call Now
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getDirections(location) {
        // In a real app, this would open Google Maps or similar
        alert(`Directions to: ${location}\n\nThis would open in your maps application.`);
        
        // For demo purposes, we'll simulate opening Google Maps
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location + ' Red Cross Philippines')}`;
        window.open(mapsUrl, '_blank');
    }

    callService(phoneNumber) {
        // Create a confirmation dialog
        if (confirm(`Call ${phoneNumber}?`)) {
            window.location.href = `tel:${phoneNumber}`;
        }
    }

    downloadResults() {
        const results = this.getCurrentResults();
        if (results.length === 0) return;
        
        // Create CSV content
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Service,Location,Hours,Phone\n";
        
        results.forEach(service => {
            const row = [
                `"${service.title}"`,
                `"${service.locations[0]}"`,
                `"${service.hours}"`,
                `"${service.phone}"`
            ].join(',');
            csvContent += row + "\n";
        });
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "redcross_services.csv");
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        document.body.removeChild(link);
        
        this.showMessage('Service list downloaded successfully', 'success');
    }

    getCurrentResults() {
        const serviceType = document.getElementById('serviceType').value;
        const location = document.getElementById('locationSelect').value;
        
        if (!serviceType || !location) return [];
        
        // Filter services (same logic as findServices)
        return this.services.filter(service => {
            const typeMap = {
                'blood': 'medical',
                'firstaid': 'training',
                'ambulance': 'medical',
                'testing': 'medical'
            };
            
            const matchesType = service.category === typeMap[serviceType];
            const matchesLocation = service.locations.some(loc => 
                loc.toLowerCase().includes(location.toLowerCase())
            );
            
            return matchesType && matchesLocation;
        });
    }

    setupEventListeners() {
        // FAQ Accordion
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const icon = question.querySelector('i');
                
                // Toggle answer visibility
                answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
                
                // Rotate icon
                icon.style.transform = answer.style.display === 'block' ? 'rotate(180deg)' : 'rotate(0deg)';
                
                // Close other answers
                faqQuestions.forEach(otherQuestion => {
                    if (otherQuestion !== question) {
                        otherQuestion.nextElementSibling.style.display = 'none';
                        otherQuestion.querySelector('i').style.transform = 'rotate(0deg)';
                    }
                });
            });
        });

        // Service type select change
        const serviceTypeSelect = document.getElementById('serviceType');
        if (serviceTypeSelect) {
            serviceTypeSelect.addEventListener('change', () => {
                // Update location options based on service type
                this.updateLocationOptions();
            });
        }
    }

    updateLocationOptions() {
        const serviceType = document.getElementById('serviceType').value;
        const locationSelect = document.getElementById('locationSelect');
        
        if (!serviceType || !locationSelect) return;
        
        // Get unique locations for this service type
        const typeMap = {
            'blood': 'medical',
            'firstaid': 'training',
            'ambulance': 'medical',
            'testing': 'medical'
        };
        
        const category = typeMap[serviceType];
        const servicesInCategory = this.services.filter(s => s.category === category);
        
        // Extract all locations
        const allLocations = [];
        servicesInCategory.forEach(service => {
            service.locations.forEach(location => {
                if (!allLocations.includes(location)) {
                    allLocations.push(location);
                }
            });
        });
        
        // Update location select options
        locationSelect.innerHTML = `
            <option value="">Select City/Municipality</option>
            ${allLocations.map(loc => `<option value="${loc.split(',')[0].toLowerCase()}">${loc.split(',')[0]}</option>`).join('')}
        `;
    }

    showMessage(message, type) {
        if (window.redCrossApp) {
            window.redCrossApp.showMessage(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize services system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.servicesSystem = new ServicesSystem();
});

// Global functions for HTML onclick handlers
function findServices() {
    if (window.servicesSystem) {
        window.servicesSystem.findServices();
    }
}

function closeServiceModal() {
    if (window.servicesSystem) {
        window.servicesSystem.closeServiceModal();
    }
}