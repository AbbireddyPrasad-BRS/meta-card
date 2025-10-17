document.addEventListener('DOMContentLoaded', function() {
    // Initialize visit counter
    let visitCount = localStorage.getItem('visitCount') || 0;
    visitCount = parseInt(visitCount) + 1;
    localStorage.setItem('visitCount', visitCount);
    document.getElementById('visit-count').textContent = visitCount;
});

document.getElementById('social-btn').addEventListener('click', function() {
    showForm('social');
});

document.getElementById('educational-btn').addEventListener('click', function() {
    showForm('educational');
});

document.getElementById('nav-social').addEventListener('click', function() {
    showForm('social');
});

document.getElementById('nav-educational').addEventListener('click', function() {
    showForm('educational');
});

document.getElementById('nav-developer').addEventListener('click', function() {
    showDeveloper();
});

document.getElementById('back-social').addEventListener('click', function(event) {
    event.preventDefault();
    showHero();
});

document.getElementById('back-educational').addEventListener('click', function(event) {
    event.preventDefault();
    showHero();
});

function showHero() {
    document.getElementById('hero').style.display = 'flex';
    document.getElementById('form-section').style.display = 'none';
    document.getElementById('developer-section').style.display = 'none';
    document.getElementById('selection').style.display = 'flex';
    document.getElementById('social-form').style.display = 'none';
    document.getElementById('educational-form').style.display = 'none';
}

function showForm(type) {
    document.getElementById('hero').style.display = 'none';
    document.getElementById('form-section').style.display = 'block';
    document.getElementById('developer-section').style.display = 'none';
    document.getElementById('selection').style.display = 'none';
    if (type === 'social') {
        document.getElementById('social-form').style.display = 'block';
        document.getElementById('educational-form').style.display = 'none';
        document.getElementById('form-title').textContent = 'Social Media Card';
    } else {
        document.getElementById('social-form').style.display = 'none';
        document.getElementById('educational-form').style.display = 'block';
        document.getElementById('form-title').textContent = 'Educational Card';
    }
}

function showDeveloper() {
    document.getElementById('hero').style.display = 'none';
    document.getElementById('form-section').style.display = 'none';
    document.getElementById('developer-section').style.display = 'block';
}

document.querySelector('.logo').addEventListener('click', showHero);

document.getElementById('social-form').addEventListener('submit', function(event) {
    event.preventDefault();
    generateCard('social');
});

document.getElementById('educational-form').addEventListener('submit', function(event) {
    event.preventDefault();
    generateCard('educational');
});

// Add new field functionality
document.getElementById('social-form').insertAdjacentHTML('beforeend', '<button type="button" id="add-new-social">Add New</button>');
document.getElementById('educational-form').insertAdjacentHTML('beforeend', '<button type="button" id="add-new-educational">Add New</button>');

document.getElementById('add-new-social').addEventListener('click', function() {
    addNewField('social-form');
});

document.getElementById('add-new-educational').addEventListener('click', function() {
    addNewField('educational-form');
});

function addNewField(formId) {
    const form = document.getElementById(formId);
    const newDiv = document.createElement('div');
    newDiv.className = 'custom-field';
    newDiv.innerHTML = `
        <label>App Name:</label>
        <input type="text" class="app-name" placeholder="e.g., TikTok">
        <label>Username:</label>
        <input type="text" class="username" placeholder="username">
        <button type="button" class="remove-field">Remove</button>
    `;
    form.insertBefore(newDiv, form.lastElementChild);
    newDiv.querySelector('.remove-field').addEventListener('click', function() {
        newDiv.remove();
    });
}

document.getElementById('download-btn').addEventListener('click', function() {
    const metaCard = document.getElementById('meta-card');
    html2canvas(metaCard).then(canvas => {
        const link = document.createElement('a');
        link.download = 'meta-card.png';
        link.href = canvas.toDataURL();
        link.click();
    });
});

async function generateCard(type) {
    const qrContainer = document.getElementById('qr-container');
    qrContainer.innerHTML = '';
    const platforms = type === 'social' ? ['facebook', 'instagram', 'snapchat', 'twitter'] : ['codechef', 'geeksforgeeks', 'github', 'hackerrank', 'leetcode', 'linkedin', 'others'];
    let qrCount = 0;
    let invalidUsernames = [];
    let nonExistentAccounts = [];

    // Collect all inputs to check
    const checks = [];
    platforms.forEach(platform => {
        const input = document.getElementById(platform);
        const value = input.value.trim();
        if (value && isValidUsername(platform, value)) {
            checks.push({ platform, value });
        } else if (value) {
            invalidUsernames.push(`${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${value}`);
        }
    });

    // Handle custom fields
    const form = document.getElementById(`${type}-form`);
    const customFields = form.querySelectorAll('.custom-field');
    customFields.forEach(field => {
        const appName = field.querySelector('.app-name').value.trim();
        const username = field.querySelector('.username').value.trim();
        if (appName && username && isValidUsername('custom', username)) {
            checks.push({ platform: 'custom', value: username, appName });
        } else if (appName && username) {
            invalidUsernames.push(`${appName}: ${username}`);
        }
    });

    // Check existence for supported platforms
    for (const check of checks) {
        const exists = await checkAccountExists(check.platform, check.value);
        if (!exists) {
            nonExistentAccounts.push(`${check.appName || check.platform.charAt(0).toUpperCase() + check.platform.slice(1)}: ${check.value}`);
            continue;
        }
        const qrDiv = document.createElement('div');
        qrDiv.className = 'qr-item';
        const tooltip = check.appName ? `${check.appName}: ${check.value}` : `${check.platform.charAt(0).toUpperCase() + check.platform.slice(1)}: ${check.value}`;
        qrDiv.setAttribute('data-tooltip', tooltip);
        const url = check.appName ? `https://${check.appName.toLowerCase()}.com/${check.value}` : getUrl(check.platform, check.value);
        qrDiv.addEventListener('click', () => window.open(url, '_blank'));
        new QRCode(qrDiv, {
            text: url,
            width: 100,
            height: 100
        });
        qrContainer.appendChild(qrDiv);
        qrCount++;
    }

    if (invalidUsernames.length > 0) {
        alert(`Invalid usernames detected and skipped: ${invalidUsernames.join(', ')}`);
    }
    if (nonExistentAccounts.length > 0) {
        alert(`Accounts not found and skipped: ${nonExistentAccounts.join(', ')}`);
    }
    if (qrCount === 0) {
        alert('Please enter at least one valid and existing username to generate the Meta Card.');
        return;
    }
    // Adjust card height dynamically
    const metaCard = document.getElementById('meta-card');
    const baseHeight = 200; // Base height without image
    const qrHeight = 110; // 100 + 10 gap
    const maxPerRow = 4;
    const rows = Math.ceil(qrCount / maxPerRow);
    const dynamicHeight = baseHeight + (rows * qrHeight);
    metaCard.style.height = `${dynamicHeight}px`;
    metaCard.style.display = 'block';
}

async function checkAccountExists(platform, username) {
    const url = getUrl(platform, username);
    try {
        const response = await fetch(url, {
            method: 'HEAD', // Use HEAD to get headers without body for faster check
            mode: 'no-cors' // Allow cross-origin requests
        });
        // Since no-cors mode doesn't give us response.ok, assume exists if no error
        return true;
    } catch (error) {
        // If fetch fails, assume account doesn't exist
        console.error(`Error checking ${platform} account:`, error);
        return false;
    }
}

function isValidUsername(platform, username) {
    const patterns = {
        facebook: /^[a-zA-Z0-9._-]{1,50}$/, // Basic alphanumeric with dots, underscores, hyphens
        instagram: /^[a-zA-Z0-9._]{1,30}$/, // Alphanumeric, dots, underscores, 1-30 chars
        snapchat: /^[a-zA-Z0-9._-]{1,15}$/, // Similar to Instagram but shorter
        twitter: /^[a-zA-Z0-9_]{1,15}$/, // Alphanumeric and underscores, 1-15 chars
        linkedin: /^[a-zA-Z0-9_-]{1,30}$/, // Alphanumeric, hyphens, underscores
        github: /^[a-zA-Z0-9_-]{1,39}$/, // Alphanumeric, hyphens, underscores, 1-39 chars
        hackerrank: /^[a-zA-Z0-9_-]{1,30}$/, // Basic
        geeksforgeeks: /^[a-zA-Z0-9_-]{1,30}$/, // Basic
        codechef: /^[a-zA-Z0-9_-]{1,30}$/, // Basic
        leetcode: /^[a-zA-Z0-9_-]{1,30}$/, // Basic
        others: /^[a-zA-Z0-9._/-]{1,50}$/, // More permissive for custom
        custom: /^[a-zA-Z0-9._/-]{1,50}$/ // Basic for custom apps
    };
    const pattern = patterns[platform];
    return pattern ? pattern.test(username) : true; // If no pattern, allow
}

function getUrl(platform, value) {
    const urls = {
        instagram: `https://instagram.com/${value}`,
        facebook: `https://facebook.com/${value}`,
        snapchat: `https://snapchat.com/add/${value}`,
        twitter: `https://twitter.com/${value}`,
        linkedin: `https://linkedin.com/in/${value}`,
        github: `https://github.com/${value}`,
        hackerrank: `https://hackerrank.com/${value}`,
        geeksforgeeks: `https://geeksforgeeks.org/user/${value}`,
        codechef: `https://codechef.com/users/${value}`,
        leetcode: `https://leetcode.com/${value}`,
        others: value.startsWith('http') ? value : `https://${value}`
    };
    return urls[platform] || value;
}
