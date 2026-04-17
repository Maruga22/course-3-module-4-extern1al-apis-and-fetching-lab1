// State mapping for full state names
const stateNames = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

// DOM Elements
const stateInput = document.getElementById('state-input');
const fetchButton = document.getElementById('fetch-alerts-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessageDiv = document.getElementById('error-message');
const alertsDisplay = document.getElementById('alerts-display');

// Helper Functions
function showLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.classList.remove('hidden');
    }
}

function hideLoadingSpinner() {
    if (loadingSpinner) {
        loadingSpinner.classList.add('hidden');
    }
}

function displayError(message) {
    if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.remove('hidden');
    }
}

function clearError() {
    if (errorMessageDiv) {
        errorMessageDiv.textContent = '';
        errorMessageDiv.classList.add('hidden');
    }
}

function clearAlertsDisplay() {
    if (alertsDisplay) {
        alertsDisplay.innerHTML = '';
    }
}

async function fetchWeatherAlerts(stateAbbr) {
    const url = `https://api.weather.gov/alerts/active?area=${stateAbbr}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
}

function displayAlerts(data) {
    if (!alertsDisplay) return;
    
    const features = data.features || [];
    const alertCount = features.length;
    
    // Clear previous content
    alertsDisplay.innerHTML = '';
    
    // Create summary element with exact format test expects
    const summary = document.createElement('div');
    summary.textContent = `Weather Alerts: ${alertCount}`;
    alertsDisplay.appendChild(summary);
    
    // Create list of alerts
    if (alertCount > 0) {
        const alertList = document.createElement('ul');
        features.forEach(feature => {
            const headline = feature.properties.headline;
            if (headline) {
                const listItem = document.createElement('li');
                listItem.textContent = headline;
                alertList.appendChild(listItem);
            }
        });
        alertsDisplay.appendChild(alertList);
    }
}

async function handleFetchAlerts() {
    // Clear previous data
    clearError();
    clearAlertsDisplay();
    
    // Get input value
    let stateAbbr = stateInput.value.trim().toUpperCase();
    
    // Validate input is not empty
    if (!stateAbbr) {
        displayError('Please enter a state abbreviation');
        return;
    }
    
    // Validate input is exactly 2 letters
    if (!/^[A-Z]{2}$/.test(stateAbbr)) {
        displayError('Please enter a valid two-letter state abbreviation (e.g., CA, NY, TX)');
        return;
    }
    
    try {
        // Show loading spinner
        showLoadingSpinner();
        
        // Fetch alerts
        const data = await fetchWeatherAlerts(stateAbbr);
        
        // Hide loading spinner
        hideLoadingSpinner();
        
        // Display alerts
        displayAlerts(data);
        
        // Clear input field (TEST EXPECTATION)
        stateInput.value = '';
        
        // Clear any existing error
        clearError();
        
    } catch (error) {
        // Hide loading spinner
        hideLoadingSpinner();
        
        // Display error message matching test expectations
        let errorMsg = 'An unknown error occurred while fetching alerts.';
        if (error.message && error.message.includes('HTTP')) {
            errorMsg = 'API Error: Unable to fetch weather alerts';
        } else if (error.message) {
            errorMsg = error.message;
        }
        displayError(errorMsg);
        
        // Clear alerts display on error
        clearAlertsDisplay();
    }
}

// Event Listeners
if (fetchButton) {
    fetchButton.addEventListener('click', handleFetchAlerts);
}

// Allow Enter key to trigger search
if (stateInput) {
    stateInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleFetchAlerts();
        }
    });
    
    // Auto-uppercase input as user types
    stateInput.addEventListener('input', (event) => {
        event.target.value = event.target.value.toUpperCase();
    });
    
    // Clear error when user starts typing
    stateInput.addEventListener('focus', () => {
        clearError();
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchWeatherAlerts,
        displayAlerts,
        handleFetchAlerts,
        showLoadingSpinner,
        hideLoadingSpinner,
        displayError,
        clearError,
        clearAlertsDisplay
    };
}

console.log('Weather Alerts App Ready!');