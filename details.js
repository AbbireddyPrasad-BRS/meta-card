const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

if (username) {
    fetch(`https://api.github.com/users/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('User not found');
            }
            return response.json();
        })
        .then(data => {
            const detailsDiv = document.getElementById('details');
            detailsDiv.innerHTML = `
                <div class="card">
                    <img src="${data.avatar_url}" alt="Avatar" style="width: 100px; height: 100px; border-radius: 50%;">
                    <h2>${data.name || data.login}</h2>
                    <p><strong>Username:</strong> ${data.login}</p>
                    <p><strong>Bio:</strong> ${data.bio || 'No bio available'}</p>
                    <p><strong>Followers:</strong> ${data.followers}</p>
                    <p><strong>Following:</strong> ${data.following}</p>
                    <p><strong>Public Repos:</strong> ${data.public_repos}</p>
                    <p><strong>Location:</strong> ${data.location || 'Not specified'}</p>
                    <a href="${data.html_url}" target="_blank">View on GitHub</a>
                </div>
            `;
        })
        .catch(error => {
            document.getElementById('details').innerHTML = `<p>Error: ${error.message}</p>`;
        });
} else {
    document.getElementById('details').innerHTML = '<p>No username provided.</p>';
}
