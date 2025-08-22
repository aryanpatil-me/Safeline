// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Navigation click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked nav item
            this.parentElement.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show target content section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Load user data from localStorage
    loadUserData();
    
    // SOS button functionality
    const sosButton = document.getElementById('sosButton');
    sosButton.addEventListener('click', function() {
        sendEmergencyAlert();
    });
    
    // Settings functionality
    const addContactBtn = document.getElementById('addContactBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    addContactBtn.addEventListener('click', addEmergencyContact);
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Load emergency contacts
    loadEmergencyContacts();
    
    // Profile photo change handler
    const settingsPhoto = document.getElementById('settingsPhoto');
    settingsPhoto.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const userAvatar = document.getElementById('userAvatar');
                userAvatar.src = e.target.result;
                localStorage.setItem('userPhoto', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
});

// Load user data from localStorage
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (userData.name) {
        document.getElementById('userName').textContent = `Welcome back, ${userData.name}!`;
        document.getElementById('settingsName').value = userData.name;
    }
    
    if (userData.email) {
        document.getElementById('settingsEmail').value = userData.email;
    }
    
    if (userData.photo) {
        document.getElementById('userAvatar').src = userData.photo;
    }
    
    // Update greeting based on time
    updateGreeting();
}

// Update greeting based on time of day
function updateGreeting() {
    const hour = new Date().getHours();
    const greetingElement = document.querySelector('.greeting');
    let greeting = 'Good ';
    
    if (hour < 12) {
        greeting += 'Morning!';
    } else if (hour < 18) {
        greeting += 'Afternoon!';
    } else {
        greeting += 'Evening!';
    }
    
    greetingElement.textContent = greeting + ' Stay Safe Today';
}

// Send emergency alert
function sendEmergencyAlert() {
    // Get user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Simulate sending emergency alert
            alert('🚨 EMERGENCY ALERT SENT! 🚨\n\nYour location has been shared with emergency contacts and authorities.\n\nStay calm and help is on the way.');
            
            // Log emergency alert
            console.log('Emergency alert sent:', {
                timestamp: new Date().toISOString(),
                location: { lat, lng },
                user: JSON.parse(localStorage.getItem('userData') || '{}')
            });
            
            // Send to emergency contacts
            sendToEmergencyContacts(lat, lng);
            
        }, function(error) {
            alert('🚨 EMERGENCY ALERT SENT! 🚨\n\nUnable to get location, but alert has been sent to emergency contacts.');
            sendToEmergencyContacts(null, null);
        });
    } else {
        alert('🚨 EMERGENCY ALERT SENT! 🚨\n\nAlert has been sent to emergency contacts.');
        sendToEmergencyContacts(null, null);
    }
}

// Send alert to emergency contacts
function sendToEmergencyContacts(lat, lng) {
    const emergencyContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    emergencyContacts.forEach(contact => {
        // Simulate sending SMS/call to emergency contacts
        console.log(`Sending emergency alert to ${contact.name} (${contact.phone}):`, {
            message: `EMERGENCY ALERT from ${userData.name}. Location: ${lat ? `${lat}, ${lng}` : 'Unknown'}. Please check on them immediately.`,
            timestamp: new Date().toISOString()
        });
    });
}

// Add emergency contact
function addEmergencyContact() {
    const contactsList = document.getElementById('emergencyContactsList');
    const contactDiv = document.createElement('div');
    contactDiv.className = 'contact-item';
    
    contactDiv.innerHTML = `
        <input type="text" placeholder="Contact Name" class="contact-name">
        <input type="tel" placeholder="Phone Number" class="contact-phone">
        <input type="text" placeholder="Relationship" class="contact-relation">
        <button type="button" class="remove-contact" onclick="removeContact(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    contactsList.appendChild(contactDiv);
}

// Remove emergency contact
function removeContact(button) {
    button.parentElement.remove();
}

// Load emergency contacts
function loadEmergencyContacts() {
    const emergencyContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    const contactsList = document.getElementById('emergencyContactsList');
    
    emergencyContacts.forEach(contact => {
        const contactDiv = document.createElement('div');
        contactDiv.className = 'contact-item';
        
        contactDiv.innerHTML = `
            <input type="text" placeholder="Contact Name" class="contact-name" value="${contact.name}">
            <input type="tel" placeholder="Phone Number" class="contact-phone" value="${contact.phone}">
            <input type="text" placeholder="Relationship" class="contact-relation" value="${contact.relation}">
            <button type="button" class="remove-contact" onclick="removeContact(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        contactsList.appendChild(contactDiv);
    });
}

// Save settings
function saveSettings() {
    const name = document.getElementById('settingsName').value;
    const email = document.getElementById('settingsEmail').value;
    const photo = localStorage.getItem('userPhoto') || document.getElementById('userAvatar').src;
    
    // Save user data
    const userData = {
        name: name,
        email: email,
        photo: photo
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Save emergency contacts
    const contactItems = document.querySelectorAll('.contact-item');
    const emergencyContacts = [];
    
    contactItems.forEach(item => {
        const name = item.querySelector('.contact-name').value;
        const phone = item.querySelector('.contact-phone').value;
        const relation = item.querySelector('.contact-relation').value;
        
        if (name && phone) {
            emergencyContacts.push({
                name: name,
                phone: phone,
                relation: relation
            });
        }
    });
    
    localStorage.setItem('emergencyContacts', JSON.stringify(emergencyContacts));
    
    // Update UI
    loadUserData();
    
    alert('Settings saved successfully!');
}

// Simulate live location updates
setInterval(function() {
    const locationDot = document.querySelector('.location-dot');
    if (locationDot) {
        // Simulate slight movement
        const currentLeft = parseInt(locationDot.style.left) || 60;
        const currentTop = parseInt(locationDot.style.top) || 40;
        
        const newLeft = currentLeft + (Math.random() - 0.5) * 2;
        const newTop = currentTop + (Math.random() - 0.5) * 2;
        
        locationDot.style.left = Math.max(10, Math.min(90, newLeft)) + '%';
        locationDot.style.top = Math.max(10, Math.min(90, newTop)) + '%';
    }
}, 3000);