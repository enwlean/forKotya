// Init
let currentUser = null;
let currentLang = 'ru';
let cats = [];
let users = [];

// Load data
function loadData() {
    users = JSON.parse(localStorage.getItem('users') || '[]');
    cats = JSON.parse(localStorage.getItem('cats') || '[]');
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    // Create admin if doesn't exist
    if (!users.find(u => u.username === 'admin')) {
        users.push({
            id: 'admin',
            username: 'admin',
            password: 'admin123',
            email: 'admin@petme.com',
            role: 'admin'
        });
        saveData();
    }
}

function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('cats', JSON.stringify(cats));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// Language
function toggleLang() {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    document.getElementById('lang').textContent = currentLang.toUpperCase();
    updateUI();
}

// Auth
function openLogin() {
    document.getElementById('loginModal').classList.add('active');
}

function closeModal() {
    document.getElementById('loginModal').classList.remove('active');
    showLogin();
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function doLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = user;
        saveData();
        closeModal();
        alert('Welcome!');
        updateUI();
    } else {
        alert('Wrong username or password!');
    }

    return false;
}

function doRegister() {
    const username = document.getElementById('regUser').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;

    if (users.find(u => u.username === username)) {
        alert('Username already exists!');
        return false;
    }

    users.push({
        id: 'user-' + Date.now(),
        username,
        email,
        password,
        role: 'user'
    });

    saveData();
    alert('Registration successful!');
    showLogin();
    return false;
}

function logout() {
    currentUser = null;
    saveData();
    goHome();
}

// Pages
function goHome() {
    const content = document.getElementById('content');
    const approved = cats.filter(c => c.status === 'approved');

    content.innerHTML = `
        <section class="hero">
            <div class="cat-box">
                <img src="cat_sketch.webp" alt="Cat" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><text x=%2250%%22 y=%2250%%22 font-size=%2248%22>🐱</text></svg>'">
            </div>
            <div class="hero-text">
                <h1>
                    100k+<br>
                    cats online
                </h1>
                <p style="font-size: 28px;">Share your fluffy friend!</p>
                <button class="upload-btn" onclick="openUpload()">upload ur cats 🎨</button>
            </div>
        </section>
        
        <section class="gallery">
            <h2>Recent Cats</h2>
            <div class="gallery-grid">
                ${approved.slice(0, 6).map(c => `
                    <div class="cat-card">
                        <img src="${c.image}" alt="${c.name}">
                        <div class="cat-card-content">
                            <h3>${c.name}</h3>
                            <p>by ${c.owner}</p>
                        </div>
                    </div>
                `).join('') || '<p style="text-align: center; font-size: 24px;">No cats yet! Upload the first one! 🐱</p>'}
            </div>
        </section>
    `;
}

function showGallery() {
    const content = document.getElementById('content');
    const approved = cats.filter(c => c.status === 'approved');

    content.innerHTML = `
        <section class="gallery">
            <h2>All Cats</h2>
            <div class="gallery-grid">
                ${approved.map(c => `
                    <div class="cat-card">
                        <img src="${c.image}" alt="${c.name}">
                        <div class="cat-card-content">
                            <h3>${c.name}</h3>
                            <p>by ${c.owner}</p>
                            ${c.desc ? `<p style="margin-top: 10px;">${c.desc}</p>` : ''}
                        </div>
                    </div>
                `).join('') || '<p style="text-align: center; font-size: 24px;">No cats yet! 🐱</p>'}
            </div>
        </section>
    `;
}

function showPopular() {
    showGallery();
}

function showProfile() {
    if (!currentUser) {
        openLogin();
        return;
    }

    const myCats = cats.filter(c => c.userId === currentUser.id);
    const content = document.getElementById('content');

    content.innerHTML = `
        <div class="profile-page">
            <div class="profile-header">
                <h1>👤 ${currentUser.username}</h1>
                <p style="font-size: 24px; color: #666;">${currentUser.email}</p>
                <button style="margin-top: 20px; font-size: 24px;" onclick="openUpload()">Upload New Cat</button>
            </div>
            
            <h2 style="text-align: center; font-size: 42px; margin: 40px 0;">My Cats (${myCats.length})</h2>
            
            <div class="gallery-grid">
                ${myCats.map(c => `
                    <div class="cat-card">
                        <img src="${c.image}" alt="${c.name}">
                        <div class="cat-card-content">
                            <h3>${c.name}</h3>
                            <p>by ${c.owner}</p>
                            <span class="status-badge status-${c.status}">
                                ${c.status === 'pending' ? 'Pending' : c.status === 'approved' ? 'Approved' : 'Rejected'}
                            </span>
                        </div>
                    </div>
                `).join('') || '<p style="text-align: center; font-size: 24px;">No cats uploaded yet! 🐱</p>'}
            </div>
        </div>
    `;
}

function showAdmin() {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Admin only!');
        return;
    }

    const pending = cats.filter(c => c.status === 'pending');
    const content = document.getElementById('content');

    content.innerHTML = `
        <div class="admin-page">
            <h1 style="text-align: center; font-size: 56px; margin-bottom: 40px;">👑 Admin Panel</h1>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="number">${users.length}</div>
                    <div class="label">Users</div>
                </div>
                <div class="stat-card">
                    <div class="number">${cats.filter(c => c.status === 'approved').length}</div>
                    <div class="label">Approved</div>
                </div>
                <div class="stat-card">
                    <div class="number">${pending.length}</div>
                    <div class="label">Pending</div>
                </div>
            </div>
            
            <h2 style="text-align: center; font-size: 42px; margin: 40px 0;">Pending Submissions</h2>
            
            <div class="gallery-grid">
                ${pending.map(c => `
                    <div class="cat-card">
                        <img src="${c.image}" alt="${c.name}">
                        <div class="cat-card-content">
                            <h3>${c.name}</h3>
                            <p>by ${c.owner}</p>
                            ${c.desc ? `<p style="margin-top: 10px;">${c.desc}</p>` : ''}
                            <div style="display: flex; gap: 10px; margin-top: 15px;">
                                <button onclick="approve('${c.id}')" style="flex: 1; background: #4CAF50; color: white; border-color: #4CAF50;">✓ Approve</button>
                                <button onclick="reject('${c.id}')" style="flex: 1; background: #F44336; color: white; border-color: #F44336;">✗ Reject</button>
                            </div>
                        </div>
                    </div>
                `).join('') || '<p style="text-align: center; font-size: 24px;">No pending cats! 🎉</p>'}
            </div>
        </div>
    `;
}

function approve(id) {
    const cat = cats.find(c => c.id === id);
    if (cat) {
        cat.status = 'approved';
        saveData();
        showAdmin();
    }
}

function reject(id) {
    const cat = cats.find(c => c.id === id);
    if (cat) {
        cat.status = 'rejected';
        saveData();
        showAdmin();
    }
}

function openUpload() {
    if (!currentUser) {
        alert('Please login first!');
        openLogin();
        return;
    }

    const content = document.getElementById('content');

    content.innerHTML = `
        <div class="upload-page">
            <h1 style="text-align: center; font-size: 56px; margin-bottom: 40px;">Upload Your Cat</h1>
            
            <div class="upload-form">
                <form onsubmit="return doUpload()">
                    <div class="form-group">
                        <label>Cat Photo</label>
                        <input type="file" id="catFile" accept="image/*" required onchange="preview()">
                    </div>
                    
                    <div id="imagePreview"></div>
                    
                    <div class="form-group">
                        <label>Cat Name</label>
                        <input type="text" id="catName" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Description (optional)</label>
                        <textarea id="catDesc" rows="4"></textarea>
                    </div>
                    
                    <div class="button-group">
                        <button type="submit">Submit</button>
                        <button type="button" onclick="goHome()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function preview() {
    const file = document.getElementById('catFile').files[0];
    const prev = document.getElementById('imagePreview');

    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            prev.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

function doUpload() {
    const file = document.getElementById('catFile').files[0];
    const name = document.getElementById('catName').value;
    const desc = document.getElementById('catDesc').value;

    const reader = new FileReader();
    reader.onload = e => {
        cats.push({
            id: 'cat-' + Date.now(),
            name,
            desc,
            image: e.target.result,
            owner: currentUser.username,
            userId: currentUser.id,
            status: currentUser.role === 'admin' ? 'approved' : 'pending'
        });

        saveData();
        alert('Cat uploaded! ' + (currentUser.role === 'admin' ? 'Auto-approved!' : 'Waiting for admin approval.'));
        showProfile();
    };
    reader.readAsDataURL(file);

    return false;
}

// Update UI
function updateUI() {
    const nav = document.getElementById('userNav');

    if (currentUser) {
        nav.innerHTML = `
            <a href="#" onclick="showProfile(); return false;">Profile</a>
            ${currentUser.role === 'admin' ? '<a href="#" onclick="showAdmin(); return false;">Admin</a>' : ''}
            <a href="#" onclick="logout(); return false;">Logout</a>
        `;
    } else {
        nav.innerHTML = '<a href="#" onclick="openLogin(); return false;"><button>Login</button></a>';
    }
}

// Click outside modal to close
window.onclick = e => {
    const modal = document.getElementById('loginModal');
    if (e.target === modal) {
        closeModal();
    }
};

// Init
loadData();
goHome();
updateUI();
