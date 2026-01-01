let currentUser = null;
let isLoggedIn = false;
let isGuestMode = false;
let currentAlbum = null;
let currentPhotoIndex = 0;
let isDarkMode = false;
let autoLoginProcessed = false;

let hamburger, sidebar, pages, loginBtn, guestLoginBtn, searchInput;
let modalOverlay, modalClose, photoModal, photoModalClose;
let prevPhotoBtn, nextPhotoBtn, notification, notificationText;
let rememberMeCheckbox, themeToggle;

const users = [
    { username: "abiyyu", fullname: "Abiyyu Nocherino Revantara" },
    { username: "ahmed", fullname: "Ahmed Fadee Aisyhafiy" },
    { username: "alifah", fullname: "Alifah Adeliza" },
    { username: "amalia", fullname: "Amalia Rezki Azizi" },
    { username: "argani", fullname: "Argani Wisnu Wibisana" },
    { username: "arni", fullname: "Arni Rahmadhani" },
    { username: "aryasatya", fullname: "Aryasatya Byakta" },
    { username: "azelia", fullname: "Azelia Nur Azzahra" },
    { username: "azzam", fullname: "Azzam Amanullah" },
    { username: "denessia", fullname: "Denessia Fahia Mahya" },
    { username: "dwika", fullname: "Dwika Hadi Wijaya" },
    { username: "erfira", fullname: "Erfira Anggraeni" },
    { username: "farzan", fullname: "Farzan Ahza Argani" },
    { username: "firli", fullname: "Firli Alisa Rahma" },
    { username: "ghatfaan", fullname: "Ghatfaan Fayaadh Aufaa" },
    { username: "hartts", fullname: "Harist Abdul Hakim" },
    { username: "joshua", fullname: "Joshua Veddyttarro" },
    { username: "keisha", fullname: "Keisha Novelis Nafeeza Zaafarani" },
    { username: "kirana", fullname: "Kirana Kamalia Ayu Wardaniningrum" },
    { username: "mohammad", fullname: "Mohammad Asadell Akhtar" },
    { username: "muhammad", fullname: "Muhammad Ardiansyah" },
    { username: "mutia", fullname: "Mutia Almas Fatimatuzzahra" },
    { username: "nafis", fullname: "Nafis Prawiro" },
    { username: "nara", fullname: "Nara Ayu Apriliani" },
    { username: "priska", fullname: "Priska Oktaviana" },
    { username: "rajendra", fullname: "Rajendra Veron Alerea" },
    { username: "reina", fullname: "Reina Al Yasmin" },
    { username: "riyan", fullname: "Riyan Ade Saputra" },
    { username: "selena", fullname: "Selena Zayna Tatum" },
    { username: "shafin", fullname: "Shafin Althaf" },
    { username: "zabarjad", fullname: "Zabarjad Nibras Alzain" },
    { username: "zauhair", fullname: "Zauhair Rakha Adi" }
];

function initializeApp() {
    hamburger = document.getElementById('hamburger-btn');
    sidebar = document.querySelector('.sidebar');
    pages = document.querySelectorAll('.page');
    loginBtn = document.getElementById('login-btn');
    guestLoginBtn = document.getElementById('guest-login-btn');
    searchInput = document.getElementById('search-input');
    modalOverlay = document.getElementById('user-modal-overlay');
    modalClose = document.getElementById('modal-close');
    photoModal = document.getElementById('photo-modal');
    photoModalClose = document.getElementById('photo-modal-close');
    prevPhotoBtn = document.getElementById('prev-photo');
    nextPhotoBtn = document.getElementById('next-photo');
    notification = document.getElementById('notification');
    notificationText = document.getElementById('notification-text');
    rememberMeCheckbox = document.getElementById('remember-me');
    themeToggle = document.getElementById('theme-toggle');
    
    if (hamburger) hamburger.addEventListener('click', toggleSidebar);
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (guestLoginBtn) guestLoginBtn.addEventListener('click', enterGuestMode);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (searchInput) searchInput.addEventListener('input', filterAnggota);
    if (photoModalClose) photoModalClose.addEventListener('click', closePhotoModal);
    if (prevPhotoBtn) prevPhotoBtn.addEventListener('click', showPrevPhoto);
    if (nextPhotoBtn) nextPhotoBtn.addEventListener('click', showNextPhoto);
    if (themeToggle) themeToggle.addEventListener('click', toggleDarkMode);
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) closeModal();
        });
    }
    
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const accordionContent = this.nextElementSibling;
            
            document.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== accordionItem) {
                    item.classList.remove('active');
                    const content = item.querySelector('.accordion-content');
                    if (content) content.classList.remove('active');
                }
            });

            accordionItem.classList.toggle('active');
            accordionContent.classList.toggle('active');
        });
    });
    
    const subMenuLinks = document.querySelectorAll('.sub-menu li');
    subMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/'([^']+)'/);
                if (match) {
                    const pageId = match[1];
                    showPage(pageId);
                    toggleSidebar();
                }
            }
        });
    });
    
    if (hamburger) hamburger.style.display = 'none';
    if (themeToggle) themeToggle.style.display = 'none';
    
    loadDarkModePreference();
    checkAutoLogin();
    
    if (window.anggotaData) renderAnggotaKelas();
    if (typeof renderOrganisasiKelas === 'function') renderOrganisasiKelas();
    if (window.jadwalPelajaran && typeof renderJadwalPelajaran === 'function') renderJadwalPelajaran();
    if (window.jadwalPiket && typeof renderJadwalPiket === 'function') renderJadwalPiket();
    if (window.albumData && typeof renderPhotoAlbums === 'function') renderPhotoAlbums();
    if (window.pengumumanData && typeof renderPengumuman === 'function') renderPengumuman();
    if (window.tugasData && typeof renderTugas === 'function') renderTugas();
    if (window.kegiatanData && typeof renderKegiatan === 'function') renderKegiatan();
}

document.addEventListener('DOMContentLoaded', initializeApp);

function saveLoginData(username, remember) {
    if (remember) {
        const loginData = {
            username: username,
            timestamp: Date.now(),
            expiry: 30 * 24 * 60 * 60 * 1000
        };
        localStorage.setItem('class7d_login', JSON.stringify(loginData));
    } else {
        sessionStorage.setItem('class7d_login', username);
    }
}

function checkAutoLogin() {
    if (autoLoginProcessed) return;
    
    const savedLogin = localStorage.getItem('class7d_login');
    let username = null;
    
    if (savedLogin) {
        try {
            const loginData = JSON.parse(savedLogin);
            const now = Date.now();
            
            if (now - loginData.timestamp < loginData.expiry) {
                username = loginData.username;
                if (rememberMeCheckbox) {
                    rememberMeCheckbox.checked = true;
                }
            } else {
                localStorage.removeItem('class7d_login');
            }
        } catch (e) {
            localStorage.removeItem('class7d_login');
        }
    }
    
    if (!username) {
        username = sessionStorage.getItem('class7d_login');
    }
    
    if (username) {
        autoLoginProcessed = true;
        performAutoLogin(username);
    }
}

function performAutoLogin(username) {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (user) {
        currentUser = {
            username: user.username,
            fullname: user.fullname
        };
        isLoggedIn = true;
        isGuestMode = false;
        
        showPage('anggota-kelas');
        
        setTimeout(() => {
            showNotification(`Selamat datang kembali, ${user.fullname}!`);
        }, 100);
        
        if (window.anggotaData) renderAnggotaKelas();
    }
}

function clearLoginData() {
    localStorage.removeItem('class7d_login');
    sessionStorage.removeItem('class7d_login');
    autoLoginProcessed = false;
}

function toggleSidebar() {
    if (!hamburger || !sidebar) return;
    
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('active');
    
    if (!sidebar.classList.contains('active')) {
        document.querySelectorAll('.accordion-item').forEach(item => {
            item.classList.remove('active');
            const content = item.querySelector('.accordion-content');
            if (content) content.classList.remove('active');
        });
    }
}

function showPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
    
    if (hamburger) {
        if (pageId === 'login-page') {
            hamburger.style.display = 'none';
            if (themeToggle) themeToggle.style.display = 'none';
        } else {
            hamburger.style.display = 'flex';
            if (themeToggle) themeToggle.style.display = 'flex';
        }
    }
    
    if (window.innerWidth < 768 && sidebar && sidebar.classList.contains('active')) {
        toggleSidebar();
    }
}

function handleLogin() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;
    
    if (!usernameInput || !passwordInput) {
        showNotification('Form login tidak ditemukan!', true);
        return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        showNotification('Username dan password harus diisi!', true);
        return;
    }
    
    let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
        user = users.find(u => u.fullname.toLowerCase().includes(username.toLowerCase()));
    }
    
    if (user) {
        const expectedPassword = user.username.toLowerCase() + "123";
        
        if (password === expectedPassword) {
            currentUser = {
                username: user.username,
                fullname: user.fullname
            };
            isLoggedIn = true;
            isGuestMode = false;
            autoLoginProcessed = true;
            
            saveLoginData(user.username, rememberMe);
            
            passwordInput.value = '';
            showPage('anggota-kelas');
            showNotification(`Selamat datang, ${user.fullname}!`);
            if (window.anggotaData) renderAnggotaKelas();
        } else {
            showNotification('Password salah! Password harus: ' + user.username + '123', true);
            passwordInput.value = '';
            passwordInput.focus();
        }
    } else {
        showNotification('Username tidak ditemukan!', true);
        usernameInput.value = '';
        passwordInput.value = '';
        usernameInput.focus();
    }
}

function enterGuestMode() {
    isGuestMode = true;
    isLoggedIn = false;
    currentUser = null;
    autoLoginProcessed = true;
    
    clearLoginData();
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (rememberMeCheckbox) rememberMeCheckbox.checked = false;
    
    showPage('anggota-kelas');
    showNotification("Anda masuk sebagai pengunjung. Fitur terbatas.");
    if (window.anggotaData) renderAnggotaKelas();
}

function showNotification(message, isError = false) {
    if (!notification || !notificationText) return;
    
    notificationText.textContent = message;
    notification.classList.remove('error', 'show');
    
    if (isError) notification.classList.add('error');
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function openUserModal(absen) {
    if (!modalOverlay) return;
    
    const anggota = window.anggotaData ? window.anggotaData.find(a => a.absen === absen) : null;
    if (!anggota) {
        showNotification('Data anggota tidak ditemukan!', true);
        return;
    }
    
    const userInfo = document.getElementById('user-info');
    if (!userInfo) return;
    
    userInfo.innerHTML = `
        <div class="user-photo">
            <img src="anggota/icon/absen${absen}.jpg" alt="${anggota.nama}" 
                 onerror="this.onerror=null; handleMissingProfile(this, ${absen});">
        </div>
        <div class="user-details">
            <h2>${anggota.nama}</h2>
            <p><span class="detail-label">Absen:</span> ${anggota.absen}</p>
            <p><span class="detail-label">Kedudukan:</span> ${anggota.kedudukan}</p>
            <p><span class="detail-label">Kelas:</span> 7D - Esphero</p>
            <p><span class="detail-label">Sekolah:</span> SMPN 2 Banjarnegara</p>
        </div>
    `;
    
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function handleMissingProfile(imgElement, absen) {
    const defaultProfileUrl = 'https://upload.wikimedia.org/wikipedia/commons/0/03/Twitter_default_profile_400x400.png';
    
    imgElement.src = 'anggota/icon/default.jpg';
    
    imgElement.onerror = function() {
        imgElement.src = defaultProfileUrl;
        imgElement.onerror = null;
        imgElement.classList.add('default-profile');
    };
}

function closeModal() {
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function filterAnggota() {
    if (!searchInput || !window.anggotaData) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderAnggotaKelas(window.anggotaData);
        return;
    }
    
    const filteredAnggota = window.anggotaData.filter(anggota => {
        return (
            anggota.nama.toLowerCase().includes(searchTerm) ||
            anggota.absen.toString().includes(searchTerm) ||
            (anggota.kedudukan && anggota.kedudukan.toLowerCase().includes(searchTerm))
        );
    });
    
    renderAnggotaKelas(filteredAnggota);
}

function renderAnggotaKelas(data = window.anggotaData) {
    const cardGrid = document.getElementById('anggota-container');
    if (!cardGrid) return;
    
    cardGrid.innerHTML = '';
    
    if (!data || !Array.isArray(data) || data.length === 0) {
        cardGrid.innerHTML = '<p class="no-result">Tidak ada anggota yang ditemukan</p>';
        return;
    }
    
    data.forEach((anggota, index) => {
        const card = document.createElement('div');
        card.className = 'card animate-card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        
        card.addEventListener('click', () => openUserModal(anggota.absen));
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') openUserModal(anggota.absen);
        });
        
        card.innerHTML = `
            <div class="card-img">
                <img src="anggota/icon/absen${anggota.absen}.jpg" 
                     alt="Foto ${anggota.nama}" 
                     loading="lazy"
                     onerror="this.onerror=null; handleCardMissingProfile(this, ${anggota.absen});">
            </div>
            <div class="card-content">
                <h3>${anggota.nama}</h3>
                <p>Absen: ${anggota.absen}</p>
                <p>${anggota.kedudukan || 'Anggota'}</p>
            </div>
        `;
        
        cardGrid.appendChild(card);
    });
}

function handleCardMissingProfile(imgElement, absen) {
    const defaultProfileUrl = 'https://upload.wikimedia.org/wikipedia/commons/0/03/Twitter_default_profile_400x400.png';
    
    imgElement.src = 'anggota/icon/default.jpg';
    
    imgElement.onerror = function() {
        imgElement.src = defaultProfileUrl;
        imgElement.onerror = null;
        imgElement.classList.add('default-profile');
        
        const card = imgElement.closest('.card');
        if (card) {
            const badge = document.createElement('span');
            badge.className = 'profile-badge';
            badge.textContent = '';
            imgElement.parentElement.appendChild(badge);
        }
    };
}

function openPhoto(album, index) {
    if (!photoModal || !album || !album.photos || album.photos.length === 0) return;
    
    currentAlbum = album;
    currentPhotoIndex = index;
    
    const photo = album.photos[index];
    const modalPhoto = document.getElementById('modal-photo');
    const photoInfo = document.getElementById('photo-info');
    
    if (modalPhoto && photoInfo) {
        modalPhoto.src = photo.url;
        modalPhoto.alt = photo.caption || 'Foto';
        photoInfo.innerHTML = `
            <h3>${photo.caption || 'Tanpa Keterangan'}</h3>
            <p>${photo.uploadDate || ''}</p>
        `;
    }
    
    photoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePhotoModal() {
    if (photoModal) {
        photoModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showPrevPhoto() {
    if (!currentAlbum || !currentAlbum.photos || currentAlbum.photos.length === 0) return;
    
    currentPhotoIndex = (currentPhotoIndex - 1 + currentAlbum.photos.length) % currentAlbum.photos.length;
    openPhoto(currentAlbum, currentPhotoIndex);
}

function showNextPhoto() {
    if (!currentAlbum || !currentAlbum.photos || currentAlbum.photos.length === 0) return;
    
    currentPhotoIndex = (currentPhotoIndex + 1) % currentAlbum.photos.length;
    openPhoto(currentAlbum, currentPhotoIndex);
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('class7d_darkmode', 'true');
        showNotification('Mode gelap diaktifkan');
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('class7d_darkmode', 'false');
        showNotification('Mode terang diaktifkan');
    }
}

function loadDarkModePreference() {
    const savedDarkMode = localStorage.getItem('class7d_darkmode');
    
    if (savedDarkMode === 'true') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        isDarkMode = false;
        document.body.classList.remove('dark-mode');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    if (savedDarkMode === null && prefersDarkScheme.matches) {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('class7d_darkmode', 'true');
    }
}

document.addEventListener('keydown', function(e) {
    if (photoModal && photoModal.classList.contains('active')) {
        if (e.key === 'Escape') {
            closePhotoModal();
        } else if (e.key === 'ArrowLeft') {
            showPrevPhoto();
        } else if (e.key === 'ArrowRight') {
            showNextPhoto();
        }
    }
    
    if (modalOverlay && modalOverlay.classList.contains('active')) {
        if (e.key === 'Escape') closeModal();
    }
    
    const passwordInput = document.getElementById('password');
    if (passwordInput && e.key === 'Enter' && document.activeElement === passwordInput) {
        handleLogin();
    }
    
    if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        toggleDarkMode();
    }
});

window.addEventListener('resize', function() {
    if (window.innerWidth >= 768 && sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
    }
});

if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') e.preventDefault();
    });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    const savedDarkMode = localStorage.getItem('class7d_darkmode');
    if (savedDarkMode === null) {
        if (e.matches) {
            isDarkMode = true;
            document.body.classList.add('dark-mode');
            if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            isDarkMode = false;
            document.body.classList.remove('dark-mode');
            if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
});
