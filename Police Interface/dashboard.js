// Global state management
let currentUser = null
let isAuthenticated = false
let currentTab = "dashboard"

// Mock data
// const alerts = [
//   {
//     id: 1,
//     title: "Armed Robbery in Progress",
//     description: "Main Street Bank - Multiple suspects",
//     priority: "high",
//     status: "active",
//     time: "2 minutes ago",
//     location: "Main Street Bank",
//   },
//   {
//     id: 2,
//     title: "Traffic Accident",
//     description: "Highway 101 - Minor collision",
//     priority: "medium",
//     status: "active",
//     time: "15 minutes ago",
//     location: "Highway 101",
//   },
// ]



const cases = [
  {
    id: 1,
    caseNumber: "2024-001",
    type: "Burglary",
    location: "123 Oak Street",
    assignedOfficer: "Officer Aryan",
    status: "open",
    dateCreated: "Jan 15, 2024",
  },
  {
    id: 2,
    caseNumber: "2024-002",
    type: "Vehicle Theft",
    location: "Downtown Parking Lot",
    assignedOfficer: "Officer Ansh",
    status: "investigating",
    dateCreated: "Jan 14, 2024",
  },
]

const firs = [
  {
    id: 1,
    firNumber: "2024-001",
    type: "Theft",
    complainant: "Rahul Suman",
    location: "456 Pine Street",
    status: "registered",
    dateCreated: "Jan 16, 2024",
  },
]

const officers = [
  { id: 1, name: "Unit 101", status: "active", location: { x: 20, y: 30 } },
  { id: 2, name: "Unit 102", status: "active", location: { x: 70, y: 60 } },
]

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeDashboard()
})

function initializeDashboard() {
  // Check authentication state
  checkAuthState()

  // Initialize event listeners
  initializeEventListeners()

  // Initialize dashboard content
  if (isAuthenticated) {
    loadDashboardContent()
    startRealTimeUpdates()
  }
}

function checkAuthState() {
  // Check if user is stored in localStorage
  const storedUser = localStorage.getItem("policeUser")
  if (storedUser) {
    currentUser = JSON.parse(storedUser)
    isAuthenticated = true

    // Display user info
    const badgeDisplay = document.getElementById("badgeDisplay")
    if (badgeDisplay && currentUser) {
      badgeDisplay.textContent = currentUser.badgeNumber || "Unknown"
    }
  } else {
    // Redirect to login if not authenticated
    window.location.href = "login.html"
  }
}

function initializeEventListeners() {
  // Logout button
  const logoutButton = document.getElementById("logoutButton")
  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout)
  }

  // Tab navigation
  const navTabs = document.querySelectorAll(".nav-tab")
  navTabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      const tabName = e.target.getAttribute("data-tab")
      switchTab(tabName)
    })
  })

  // Action buttons
  document.addEventListener("click", handleActionButtons)

  // Map controls
  const mapControls = document.querySelectorAll(".map-control")
  mapControls.forEach((control) => {
    control.addEventListener("click", (e) => {
      const layer = e.target.getAttribute("data-layer")
      toggleMapLayer(layer)
    })
  })
}

function handleLogout() {
  currentUser = null
  isAuthenticated = false
  localStorage.removeItem("policeUser")
  window.location.href = "login.html"
}

function switchTab(tabName) {
  // Update active tab
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.remove("active")
  })
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

  // Show corresponding content
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active")
  })
  document.getElementById(`${tabName}-tab`).classList.add("active")

  currentTab = tabName

  // Load tab-specific content
  loadTabContent(tabName)
}

function loadTabContent(tabName) {
  switch (tabName) {
    case "dashboard":
      updateDashboardStats()
      break
    case "alerts":
      renderAlerts()
      break
    case "cases":
      renderCases()
      break
    case "map":
      renderMap()
      break
    case "fir":
      renderFIRs()
      break
  }
}

function loadDashboardContent() {
  updateDashboardStats()
  renderAlerts()
  renderCases()
  renderFIRs()
  renderMap()
}

function updateDashboardStats() {
  document.getElementById("activeAlerts").textContent = alerts.filter((a) => a.status === "active").length
  document.getElementById("openCases").textContent = cases.filter((c) => c.status !== "closed").length
  document.getElementById("officersOnDuty").textContent = officers.filter((o) => o.status === "active").length
  document.getElementById("firsToday").textContent = firs.length
}

function renderAlerts() {
  const alertsList = document.getElementById("alertsList")
  if (!alertsList) return

  alertsList.innerHTML = alerts
    .map(
      (alert) => `
        <div class="alert-item ${alert.priority}">
            <div class="alert-priority">${alert.priority.toUpperCase()}</div>
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.description}</p>
                <span class="alert-time">${alert.time}</span>
            </div>
            <div class="alert-actions">
                <button class="action-button dispatch" data-action="dispatch" data-id="${alert.id}">Dispatch</button>
                <button class="action-button resolve" data-action="resolve" data-id="${alert.id}">Resolve</button>
            </div>
        </div>
    `,
    )
    .join("")
}

function renderCases() {
  const casesList = document.getElementById("casesList")
  if (!casesList) return

  casesList.innerHTML = cases
    .map(
      (caseItem) => `
        <div class="case-item">
            <div class="case-header">
                <h4>Case #${caseItem.caseNumber}</h4>
                <span class="case-status ${caseItem.status}">${caseItem.status}</span>
            </div>
            <p><strong>Type:</strong> ${caseItem.type}</p>
            <p><strong>Location:</strong> ${caseItem.location}</p>
            <p><strong>Assigned:</strong> ${caseItem.assignedOfficer}</p>
            <span class="case-date">Filed: ${caseItem.dateCreated}</span>
        </div>
    `,
    )
    .join("")
}

function renderFIRs() {
  const firList = document.getElementById("firList")
  if (!firList) return

  firList.innerHTML = firs
    .map(
      (fir) => `
        <div class="fir-item">
            <div class="fir-header">
                <h4>FIR #${fir.firNumber}</h4>
                <span class="fir-status ${fir.status}">${fir.status}</span>
            </div>
            <p><strong>Type:</strong> ${fir.type}</p>
            <p><strong>Complainant:</strong> ${fir.complainant}</p>
            <p><strong>Location:</strong> ${fir.location}</p>
            <span class="fir-date">Filed: ${fir.dateCreated}</span>
        </div>
    `,
    )
    .join("")
}

 
function renderMap() {
  const mapContainer = document.querySelector(".map-placeholder")
  if (!mapContainer) return

  // Clear existing markers
  mapContainer.innerHTML = ""

  // Add officer markers
  officers.forEach((officer) => {
    const marker = document.createElement("div")
    marker.className = "officer-marker"
    marker.style.top = `${officer.location.y}%`
    marker.style.left = `${officer.location.x}%`
    marker.innerHTML = `
            <div class="marker-icon officer">👮</div>
            <span class="marker-label">${officer.name}</span>
        `
    mapContainer.appendChild(marker)
  })

  // Add incident markers
  const activeIncidents = alerts.filter((alert) => alert.status === "active")
  activeIncidents.forEach((incident, index) => {
    const marker = document.createElement("div")
    marker.className = "incident-marker"
    marker.style.top = `${45 + index * 10}%`
    marker.style.left = `${50 + index * 5}%`
    marker.innerHTML = `
            <div class="marker-icon incident">⚠️</div>
            <span class="marker-label">Active Alert</span>
        `
    mapContainer.appendChild(marker)
  })
}

function handleActionButtons(e) {
  const action = e.target.getAttribute("data-action")
  const id = e.target.getAttribute("data-id")

  if (!action || !id) return

  switch (action) {
    case "dispatch":
      handleDispatch(Number.parseInt(id))
      break
    case "resolve":
      handleResolve(Number.parseInt(id))
      break
    case "newAlert":
      showNewAlertDialog()
      break
    case "newCase":
      showNewCaseDialog()
      break
    case "newFir":
      showNewFIRDialog()
      break
  }
}

function handleDispatch(alertId) {
  const alert = alerts.find((a) => a.id === alertId)
  if (alert) {
    alert.status = "dispatched"
    showNotification(`Alert "${alert.title}" has been dispatched`, "success")
    renderAlerts()
    updateDashboardStats()
  }
}

function handleResolve(alertId) {
  const alertIndex = alerts.findIndex((a) => a.id === alertId)
  if (alertIndex !== -1) {
    const alert = alerts[alertIndex]
    alerts.splice(alertIndex, 1)
    showNotification(`Alert "${alert.title}" has been resolved`, "success")
    renderAlerts()
    updateDashboardStats()
  }
}

function toggleMapLayer(layer) {
  // Update active control
  document.querySelectorAll(".map-control").forEach((control) => {
    control.classList.remove("active")
  })
  document.querySelector(`[data-layer="${layer}"]`).classList.add("active")

  // Show/hide markers based on layer
  const officerMarkers = document.querySelectorAll(".officer-marker")
  const incidentMarkers = document.querySelectorAll(".incident-marker")

  switch (layer) {
    case "officers":
      officerMarkers.forEach((marker) => (marker.style.display = "flex"))
      incidentMarkers.forEach((marker) => (marker.style.display = "none"))
      break
    case "incidents":
      officerMarkers.forEach((marker) => (marker.style.display = "none"))
      incidentMarkers.forEach((marker) => (marker.style.display = "flex"))
      break
    case "patrol":
      officerMarkers.forEach((marker) => (marker.style.display = "flex"))
      incidentMarkers.forEach((marker) => (marker.style.display = "flex"))
      break
  }
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#10b981" : "#3b82f6"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-width: 300px;
        font-size: 0.875rem;
        animation: slideIn 0.3s ease-out;
    `
  notification.textContent = message

  // Add animation styles
  const style = document.createElement("style")
  style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `
  document.head.appendChild(style)

  document.body.appendChild(notification)

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

function startRealTimeUpdates() {
  // Simulate real-time updates every 30 seconds
  setInterval(() => {
    if (isAuthenticated) {
      // Simulate new activity
      const activities = [
        "New patrol report submitted",
        "Officer status updated",
        "Case evidence uploaded",
        "FIR status changed",
      ]

      const randomActivity = activities[Math.floor(Math.random() * activities.length)]

      // Update activity list
      const activityList = document.getElementById("activityList")
      if (activityList && Math.random() > 0.7) {
        // 30% chance of new activity
        const newActivity = document.createElement("div")
        newActivity.className = "activity-item"
        newActivity.innerHTML = `
                    <div class="activity-icon low">i</div>
                    <div class="activity-content">
                        <p><strong>System Update:</strong> ${randomActivity}</p>
                        <span class="activity-time">Just now</span>
                    </div>
                `
        activityList.insertBefore(newActivity, activityList.firstChild)

        // Keep only last 5 activities
        while (activityList.children.length > 5) {
          activityList.removeChild(activityList.lastChild)
        }
      }
    }
  }, 30000)
}

// Mock dialog functions (simplified for demo)
function showNewAlertDialog() {
  const title = prompt("Enter alert title:")
  const description = prompt("Enter alert description:")
  const priority = prompt("Enter priority (high/medium/low):") || "medium"

  if (title && description) {
    const newAlert = {
      id: alerts.length + 1,
      title: title,
      description: description,
      priority: priority,
      status: "active",
      time: "Just now",
      location: "Unknown",
    }

    alerts.unshift(newAlert)
    renderAlerts()
    updateDashboardStats()
    showNotification("New alert created successfully", "success")
  }
}

function showNewCaseDialog() {
  const type = prompt("Enter case type:")
  const location = prompt("Enter location:")
  const officer = prompt("Assign to officer:") || "Unassigned"

  if (type && location) {
    const newCase = {
      id: cases.length + 1,
      caseNumber: `2024-${String(cases.length + 1).padStart(3, "0")}`,
      type: type,
      location: location,
      assignedOfficer: officer,
      status: "open",
      dateCreated: new Date().toLocaleDateString(),
    }

    cases.unshift(newCase)
    renderCases()
    updateDashboardStats()
    showNotification("New case created successfully", "success")
  }
}

function showNewFIRDialog() {
  const type = prompt("Enter FIR type:")
  const complainant = prompt("Enter complainant name:")
  const location = prompt("Enter location:")

  if (type && complainant && location) {
    const newFIR = {
      id: firs.length + 1,
      firNumber: `2024-${String(firs.length + 1).padStart(3, "0")}`,
      type: type,
      complainant: complainant,
      location: location,
      status: "registered",
      dateCreated: new Date().toLocaleDateString(),
    }

    firs.unshift(newFIR)
    renderFIRs()
    updateDashboardStats()
    showNotification("New FIR registered successfully", "success")
  }
}