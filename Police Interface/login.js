// Global state management
let currentUser = null
let isAuthenticated = false

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeLoginPage()
})

function initializeLoginPage() {
  // Check if already authenticated
  checkAuthState()

  // Initialize event listeners
  initializeEventListeners()

  // Start typing effect
  startTypingEffect()
}

function checkAuthState() {
  // Check if user is stored in localStorage
  const storedUser = localStorage.getItem("policeUser")
  if (storedUser) {
    currentUser = JSON.parse(storedUser)
    isAuthenticated = true
    // Redirect to dashboard if already logged in
    window.location.href = "dashboard.html"
  }
}

function initializeEventListeners() {
  // Login form
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }

  // Form inputs - clear errors on input
  const formInputs = document.querySelectorAll(".form-input")
  formInputs.forEach((input) => {
    input.addEventListener("input", clearErrors)
  })

  // Auth links
  const forgotPasswordLink = document.getElementById("forgotPassword")
  const signInLink = document.getElementById("signInOption")

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault()
      alert("Password reset functionality will be implemented by IT department.")
    })
  }

  if (signInLink) {
    signInLink.addEventListener("click", (e) => {
      e.preventDefault()
      alert("New officer registration requires approval from department administration.")
    })
  }
}

async function handleLogin(e) {
  e.preventDefault()

  const officerName = document.getElementById("officerName").value.trim()
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value.trim()
  const location = document.getElementById("location").value.trim()
  const errorElement = document.getElementById("errorMessage")
  const buttonElement = document.getElementById("loginButton")
  const buttonText = document.getElementById("buttonText")
  const loadingSpinner = document.getElementById("loadingSpinner")

  // Clear previous errors
  clearErrors(errorElement)

  // Validation
  if (!officerName || !email || !password || !location) {
    showError(errorElement, "Please fill in all fields")
    return
  }

  if (!isValidEmail(email)) {
    showError(errorElement, "Please enter a valid email address")
    return
  }

  if (password.length < 6) {
    showError(errorElement, "Password must be at least 6 characters")
    return
  }

  // Show loading state
  buttonElement.disabled = true
  buttonText.classList.add("hidden")
  loadingSpinner.classList.remove("hidden")

  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock authentication
    currentUser = {
      name: officerName,
      email: email,
      location: location,
      badgeNumber: `BADGE-${Math.floor(Math.random() * 9000) + 1000}`,
      loginTime: new Date().toISOString(),
    }

    // Store in localStorage
    localStorage.setItem("policeUser", JSON.stringify(currentUser))

    isAuthenticated = true
    window.location.href = "dashboard.html"
  } catch (error) {
    showError(errorElement, "Login failed. Please try again.")
  } finally {
    // Reset button state
    buttonElement.disabled = false
    buttonText.classList.remove("hidden")
    loadingSpinner.classList.add("hidden")
  }
}

// Helper functions for error handling
function clearErrors(errorElement) {
  if (errorElement) {
    errorElement.textContent = ""
    errorElement.style.display = "none"
  }
}

function showError(errorElement, message) {
  if (errorElement) {
    errorElement.textContent = message
    errorElement.style.display = "block"
  }
}

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Typing effect for interactive text
function startTypingEffect() {
  const typingElement = document.getElementById("typingEffect")
  if (!typingElement) return

  const messages = [
    "Ready to serve justice...",
    "Protecting our community 24/7...",
    "Your safety is our priority...",
    "Dedicated to law and order...",
  ]

  let messageIndex = 0
  let charIndex = 0
  let isDeleting = false

  function typeWriter() {
    const currentMessage = messages[messageIndex]

    if (isDeleting) {
      typingElement.textContent = currentMessage.substring(0, charIndex - 1)
      charIndex--
    } else {
      typingElement.textContent = currentMessage.substring(0, charIndex + 1)
      charIndex++
    }

    let typeSpeed = isDeleting ? 50 : 100

    if (!isDeleting && charIndex === currentMessage.length) {
      typeSpeed = 2000 // Pause at end
      isDeleting = true
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false
      messageIndex = (messageIndex + 1) % messages.length
      typeSpeed = 500 // Pause before next message
    }

    setTimeout(typeWriter, typeSpeed)
  }

  typeWriter()
}