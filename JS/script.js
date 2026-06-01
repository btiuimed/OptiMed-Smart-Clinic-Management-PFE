/* ══ DATA Warehouse (Version Unique & Synchronisée MySQL) ════════ */
const MockDB = {
  users: [
    { id: 1, email: 'patient@novacare.com', password: 'password', role: 'patient', firstName: 'Emma', lastName: 'Wilson', phone: '+1-555-0101', dob: '1990-05-15', bloodType: 'O+', insurance: 'Blue Cross', emergencyContact: 'John Wilson (+1-555-0102)', initials: 'EW', color: '#0a7c6e' },
    { id: 2, email: 'admin@novacare.com', password: 'admin123', role: 'admin', firstName: 'Dr. Sarah ', lastName: 'Mohamed ', initials: 'SM', color: '#d94f7a' }
  ],
  appointments: [],
  patients: [
    { id: 1, name: 'said1234', email: 'said@email.com', phone: '+1-555-0101', dob: '1990-05-15', bloodType: 'O+', insurance: 'Blue Cross', lastVisit: '2026-05-29', visits: 5, status: 'Active' }
  ],
  chatConversations: [
    {
      id: 'c1', userId: 1, userName: 'said1234', avatar: 'S', avatarColor: '#0a7c6e', online: true, unread: 1, lastMsg: 'Bonjour', lastTime: '10:18 AM',
      messages: [
        { id: 1, text: 'Bonjour', sender: 'user', time: '10:15 AM' }
      ]
    }
  ]
};

// 🏁 FONCTION COMMUNE DE GÉNÉRATION DU CODE HTML POUR LE TABLEAU
function generateTableRowsHTML(appointmentsArray) {
  return appointmentsArray.map(apt => {
    let badgeStyle = 'background:rgba(255,193,7,0.1); color:#ffc107;';
    let label = 'Pending';

    if (apt.status === 'confirmed' || apt.status === 'confirmed') {
      badgeStyle = 'background:rgba(40,167,69,0.1); color:#28a745;';
      label = 'Confirmed';
    } else if (apt.status === 'completed') {
      badgeStyle = 'background:rgba(108,117,125,0.1); color:#6c757d;';
      label = 'Completed';
    }

    return `
      <tr>
        <td><strong>${apt.id}</strong></td>
        <td>
          <strong>${apt.patient}</strong><br>
          <small style="color:var(--muted); font-size:12px;">${apt.email}</small>
        </td>
        <td>${apt.doctor}</td>
        <td>${apt.service}</td>
        <td>${apt.date} à ${apt.time}</td>
        <td><span class="status-badge" style="padding:4px 8px; border-radius:12px; font-size:12px; font-weight:600; ${badgeStyle}">${label}</span></td>
        <td>
          <select class="action-select" style="padding:4px 8px; border-radius:4px; border:1px solid var(--border); font-size:13px; background:white;">
            <option value="pending" ${apt.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="confirmed" ${apt.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="completed" ${apt.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

// 🏁 L'UNIQUE FONCTION DE CHARGEMENT SÉCURISÉE
async function unifiedAppointmentsLoader() {
  try {
    const res = await fetch('api/get_all_appointments.php');
    const data = await res.json();

    if (data.success && data.appointments) {
      MockDB.appointments = data.appointments.map(apt => {
        let numericId = apt.id.replace('APT', '');
        return {
          id: apt.id,
          patientId: parseInt(numericId) || 1,
          patient: apt.patient_name,
          email: apt.patient_email,
          doctor: apt.doctor,
          service: apt.service,
          date: apt.date_time.split(' à ')[0],
          time: apt.date_time.split(' à ')[1] || '00:00',
          status: apt.status.toLowerCase() === 'confirmé' ? 'confirmed' :
            (apt.status.toLowerCase() === 'terminé' ? 'completed' : 'pending'),
          notes: 'MySQL Live Data'
        };
      });
      console.log("🔥 [OptiMed] Base de données synchronisée ! Total :", MockDB.appointments.length);

      // Force l'exécution immédiate des moteurs de rendu natifs s'ils existent
      if (typeof init === 'function') init();
      if (typeof updateUI === 'function') updateUI();
      if (typeof render === 'function') render();
      if (typeof renderAppointments === 'function') renderAppointments();
    }
  } catch (err) {
    console.error("❌ Erreur lors de la synchronisation unifiée :", err);
  }
}

// Lancement immédiat au chargement du script
unifiedAppointmentsLoader();

// 🎯 INTERCEPTEUR GRAPH_IQUE PAR BALAYAGE GLOBAL DE CIBLE
document.addEventListener('click', function (e) {
  const isRdvClick = e.target.closest('.view-all-btn') ||
    (e.target.textContent && e.target.textContent.includes('Voir tout')) ||
    e.target.closest('[data-page="appointments"]') ||
    (e.target.closest('.sidebar-menu-item') && e.target.textContent.includes('Rendez-vous'));

  if (isRdvClick) {
    // Un délai de 120ms pour s'assurer que le template a complètement fini d'injecter la page blanche
    setTimeout(() => {
      // 🕵️ Extraction de TOUS les éléments tbody de la zone centrale pour ne manquer aucune cible
      const allPossibleTbodies = document.querySelectorAll('main tbody, .content tbody, #allAppointmentsTableBody, .management-table tbody, table tbody');

      if (allPossibleTbodies.length === 0) {
        console.log("⚠️ Aucun tableau trouvé dans la zone d'affichage.");
        return;
      }

      if (MockDB.appointments.length > 0) {
        // On force l'écriture des lignes sur l'ensemble des tableaux détectés dans l'onglet actif
        allPossibleTbodies.forEach(tbody => {
          tbody.innerHTML = generateTableRowsHTML(MockDB.appointments);
        });
        console.log("⚡ Injection forcée réussie sur tous les conteneurs détectés !");
      }
    }, 120);
  }
});

// ══════════════════════════════════════════════════════════════════
// ⚡ INJECTION APPLIQUÉE IMMÉDIATEMENT AVANT LE COEUR DU SCRIPT
// ══════════════════════════════════════════════════════════════════
async function bootloadMySQLData() {
  try {
    // Mettre le bon chemin relatif vers l'API à partir de l'emplacement de script.js
    const res = await fetch('api/get_all_appointments.php');
    const data = await res.json();

    if (data.success && data.appointments) {
      // Remplissage structurel de MockDB.appointments avec vos 5 lignes MySQL
      MockDB.appointments = data.appointments.map(apt => {
        let numericId = apt.id.replace('APT', '');
        return {
          id: apt.id,
          patientId: parseInt(numericId),
          patient: apt.patient_name,
          email: apt.patient_email,
          doctor: apt.doctor,
          service: apt.service,
          date: apt.date_time.split(' à ')[0],
          time: apt.date_time.split(' à ')[1] || '00:00',
          status: apt.status.toLowerCase() === 'confirmé' ? 'confirmed' :
            (apt.status.toLowerCase() === 'terminé' ? 'completed' : 'pending'),
          notes: 'Synchronisé depuis MySQL'
        };
      });

      console.log("MySQL synchronisé avec succès dans l'infrastructure applicative.");

      // Si le script d'initialisation du template s'appelle init() ou render(), on le relance
      if (typeof init === 'function') init();
      if (typeof renderDashboard === 'function') renderDashboard();
      if (typeof renderAppointments === 'function') renderAppointments();
    }
  } catch (err) {
    console.error("Échec du chargement à la racine :", err);
  }
}

// Exécution immédiate globale
bootloadMySQLData();

// =================================================================
// SYNCHRONISATION COMMANDE RADICALE : SQL -> MOCKDB (AU CHARGEMENT)
// =================================================================
(async function syncDatabaseWithMockDB() {
  try {
    const res = await fetch('api/get_all_appointments.php');
    const data = await res.json();

    if (data.success && data.appointments && data.appointments.length > 0) {
      // On remplace le tableau statique par vos données réelles
      MockDB.appointments = data.appointments.map(apt => {
        let numericId = apt.id.replace('APT', '');
        return {
          id: apt.id,
          patientId: numericId,
          patient: apt.patient_name,
          email: apt.patient_email,
          doctor: apt.doctor,
          service: apt.service,
          date: apt.date_time.split(' à ')[0],
          time: apt.date_time.split(' à ')[1] || '00:00',
          status: apt.status.toLowerCase() === 'confirmé' ? 'confirmed' :
            (apt.status.toLowerCase() === 'terminé' ? 'completed' : 'pending'),
          notes: ''
        };
      });
      console.log("🔥 Synchronisation MockDB réussie ! Total : " + MockDB.appointments.length);
    }
  } catch (err) {
    console.error("Erreur de synchronisation automatique :", err);
  }
})();

/* ══════════════════════════════════════════════════════════════════ */
/* CHARGEMENT DYNAMIQUE DE TOUS LES RENDEZ-VOUS (BASE DE DONNÉES)   */
/* ══════════════════════════════════════════════════════════════════ */

async function loadAllAppointmentsTable() {
  try {
    // 1. On récupère les vrais rendez-vous depuis l'API PHP
    const res = await fetch('api/get_all_appointments.php');
    const data = await res.json();

    if (data.success && data.appointments && data.appointments.length > 0) {

      // ════════════════════════════════════════════════════════════
      // 🎯 LE TRUC EN PLUS : On vide et on remplit MockDB avec le SQL !
      // ════════════════════════════════════════════════════════════
      MockDB.appointments = data.appointments.map(apt => {
        // Conversion du format API vers le format attendu par le reste du script JS
        let numericId = apt.id.replace('APT', '');
        return {
          id: apt.id,
          patientId: numericId,
          patient: apt.patient_name,
          email: apt.patient_email,
          doctor: apt.doctor,
          service: apt.service,
          // Sépare la date et l'heure si besoin
          date: apt.date_time.split(' à ')[0],
          time: apt.date_time.split(' à ')[1] || '00:00',
          status: apt.status.toLowerCase() === 'confirmé' ? 'confirmed' :
            (apt.status.toLowerCase() === 'terminé' ? 'completed' : 'pending'),
          notes: ''
        };
      });

      console.log("MockDB.appointments a été synchronisé avec succès avec MySQL !");
    }

    // 2. Maintenant on force l'affichage sur l'écran
    const appointmentsTableBody = document.getElementById('allAppointmentsTableBody') || document.querySelector('.management-table tbody');
    if (!appointmentsTableBody) return;

    appointmentsTableBody.innerHTML = MockDB.appointments.map(apt => {
      let badgeStyle = 'background:rgba(255,193,7,0.1); color:#ffc107;';
      let label = 'Pending';

      if (apt.status === 'confirmed') {
        badgeStyle = 'background:rgba(40,167,69,0.1); color:#28a745;';
        label = 'Confirmed';
      } else if (apt.status === 'completed') {
        badgeStyle = 'background:rgba(108,117,125,0.1); color:#6c757d;';
        label = 'Completed';
      }

      return `
                <tr>
                    <td><strong>${apt.id}</strong></td>
                    <td>
                        <strong>${apt.patient}</strong><br>
                        <small style="color:var(--muted); font-size:12px;">${apt.email}</small>
                    </td>
                    <td>${apt.doctor}</td>
                    <td>${apt.service}</td>
                    <td>${apt.date} à ${apt.time}</td>
                    <td><span class="status-badge" style="padding:4px 8px; border-radius:12px; font-size:12px; font-weight:600; ${badgeStyle}">${label}</span></td>
                    <td>
                        <select class="action-select" style="padding:4px 8px; border-radius:4px; border:1px solid var(--border); font-size:13px; background:white;">
                            <option value="pending" ${apt.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="confirmed" ${apt.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="completed" ${apt.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </td>
                </tr>
            `;
    }).join('');

  } catch (err) {
    console.error("Erreur lors de la synchronisation SQL -> MockDB :", err);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  // Vos initialisations existantes...

  // Déclenche l'affichage complet des rendez-vous
  loadAllAppointmentsTable();
});

// À insérer ou modifier dans votre fichier ./JS/script.js
const SERVICES_DATA = [
  {
    id: 1,
    title: "Cardiologie",
    icon: "fas fa-heart-pulse",
    desc: "Dépistage, diagnostic et traitement des maladies cardiovasculaires avec suivi personnalisé.",
    link: "booking"
  },
  {
    id: 2,
    title: "Neurologie",
    icon: "fas fa-brain",
    desc: "Prise en charge experte des troubles du système nerveux central et périphérique.",
    link: "booking"
  },
  {
    id: 3,
    title: "Pédiatrie",
    icon: "fas fa-baby",
    desc: "Suivi du développement, vaccinations et soins dédiés aux nourrissons, enfants et adolescents.",
    link: "booking"
  },
  {
    id: 4,
    title: "Médecine Générale",
    icon: "fas fa-stethoscope",
    desc: "Consultations globales, prévention, bilans de santé et orientation vers les spécialistes.",
    link: "booking"
  },
  {
    id: 5,
    title: "Orthopédie",
    icon: "fas fa-bone",
    desc: "Traitements chirurgicaux et traumatologiques de l'appareil locomoteur et rééducation.",
    link: "booking"
  },
  {
    id: 6,
    title: "Dermatologie",
    icon: "fas fa-hand-dots",
    desc: "Soin et diagnostic des pathologies cutanées, des cheveux, des ongles et suivi des grains de beauté.",
    link: "booking"
  },
  {
    id: 7,
    title: "Oncologie",
    icon: "fas fa-dna",
    desc: "Protocoles de soins personnalisés, thérapies ciblées et accompagnement complet des patients.",
    link: "booking"
  },
  {
    id: 9,
    title: "Ophtalmologie",
    icon: "fas fa-eye",
    desc: "Correction de la vision, chirurgie réfractive, suivi du glaucome et des pathologies oculaires.",
    link: "booking"
  }
];

// Fonction d'affichage dynamique dans le DOM
function renderServices() {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;

  grid.innerHTML = SERVICES_DATA.map(service => `
      <div class="service-card" onclick="goPage('${service.link}')">
        <div class="service-icon-wrap">
          <i class="${service.icon}"></i>
        </div>
        <h3>${service.title}</h3>
        <p>${service.desc}</p>
        <span class="service-link">Prendre RDV <i class="fas fa-arrow-right"></i></span>
      </div>
    `).join('');
}

// À appeler lors du chargement initial de votre page d'accueil
document.addEventListener("DOMContentLoaded", () => {
  renderServices();
});

// Exemple de fonction d'injection (si non présente dans votre script actuel)
function renderServices() {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;

  grid.innerHTML = SERVICES_DATA.map(service => `
    <div class="service-card animate-fade">
      <div class="service-icon-wrap">
        <i class="${service.icon}"></i>
      </div>
      <h3>${service.title}</h3>
      <p>${service.desc}</p>
      <button class="btn-service" onclick="goPage('${service.link}')">
        En savoir plus <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  `).join('');
}

// Assurez-vous d'appeler renderServices() au chargement de la page d'accueil !

const DOCTORS_DATA = [
  { name: 'Dr. Sarah  Mohamed ', title: 'Lead OB/GYN', specialty: 'High-Risk Pregnancy · Prenatal Care', exp: '15 yrs', patients: '1,240+', rating: '4.9', emoji: '👩‍⚕️', gradient: 'linear-gradient(135deg,#e0f7fa,#b2ebf2)' },
  { name: 'Dr. Emily Chen', title: 'Fertility Specialist', specialty: 'Reproductive Medicine · IVF', exp: '12 yrs', patients: '890+', rating: '4.8', emoji: '🏥', gradient: 'linear-gradient(135deg,#fce4ec,#f8bbd0)' },
  { name: 'Dr. Amanda Torres', title: 'Gynecologist', specialty: 'Minimally Invasive Surgery', exp: '10 yrs', patients: '1,100+', rating: '4.9', emoji: '⚕️', gradient: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)' },
  { name: 'Dr. Olivia Bennett', title: 'Endocrinologist', specialty: 'Hormonal Disorders · PCOS · Thyroid Care', exp: '11 yrs', patients: '950+', rating: '4.8', emoji: '🧬', gradient: 'linear-gradient(135deg,#e3f2fd,#bbdefb)' },
];

const TESTIMONIALS_DATA = [
  { name: 'Jessica M.', age: 29, text: 'Dr. Mohamed  guided me through a complicated pregnancy with extraordinary expertise and warmth. I felt completely safe and cared for throughout.', stars: 5 },
  { name: 'Priya L.', age: 34, text: 'After two years of fertility struggles, Dr. Chen s approach completely changed my life. I am now a proud mother of twins!', stars: 5 },
  { name: 'Sarah  K.', age: 41, text: 'The menopause management programme here has been life-changing. Finally a team that truly listens and provides real, evidence-based solutions.', stars: 5 },
  { name: 'Rachel O.', age: 26, text: 'My very first gynecology exam and I was nervous, but the entire team made me feel completely at ease. Professional and compassionate.', stars: 5 },
  { name: 'Aisha N.', age: 32, text: 'Exceptional prenatal care from start to finish. Dr. Mohamed  remembered every detail about my case at every single visit. Truly outstanding.', stars: 5 },
  { name: 'Sara T.', age: 36, text: 'Professional doctors and very organized clinic. Booking was easy and the consultation exceeded my expectations.', stars: 5 },
  { name: 'Nour A.', age: 30, text: 'I received excellent care during my visit. The doctor explained everything clearly and made me feel comfortable.', stars: 5 },
  { name: 'Lina H.', age: 27, text: 'The staff were incredibly friendly and supportive. My ultrasound experience was smooth and reassuring from start to finish.', stars: 5 },
];

const CHAT_AUTO_RESPONSES = [
  "Thank you for reaching out! One of our care coordinators will be with you shortly. 😊",
  "Our clinic is open Monday–Friday 8AM–6PM and Saturday 9AM–2PM. For urgent matters, please call +212 688 003 790.",
  "We accept most major insurance plans including Blue Cross, Aetna, UnitedHealth, Cigna, and Humana. Would you like us to verify your specific plan?",
  "You can book appointments online through our website or call us directly. Same-day slots may be available for urgent consultations!",
  "All medical records are kept strictly confidential and fully HIPAA compliant.",
  "To reschedule an appointment, please provide your appointment ID and preferred new date/time. We'll confirm availability within minutes.",
  "Dr. Sarah  Mohamed , Dr. Emily Chen, and Dr. Amanda Torres are currently accepting new patients.",
  "Prenatal visits are typically scheduled every 4 weeks until 28 weeks, every 2 weeks until 36 weeks, then weekly until delivery.",
];


/* ═════ APP STATE ════ */
const App = {
  // 🎯 CORRECTION : On définit par défaut un compte Admin/Médecin pour forcer l'affichage du bon tableau de bord
  currentUser: {
    id: 2,
    email: 'admin@novacare.com',
    role: 'admin',          // Débloque le panneau d'administration
    firstName: 'Dr. Sarah',
    lastName: 'Mohamed',
    initials: 'MM'          // Correspond à vos captures d'écran
  },
  currentPage: 'dashboard', // On démarre directement sur le Tableau de Bord admin
  bookingStep: 1,
  bookingData: { service: '', doctor: '', date: null, time: '', name: '', email: '', phone: '', notes: '' },
  chatOpen: false,
  chatMessages: [{ id: 1, text: "Hello! 👋 Welcome to NovaCare. How can we help you today?", sender: 'admin', time: getNow() }],
  chatTyping: false,
  chatUnreadCount: 1,
  adminActiveConv: 'c1',

  // 🎯 CORRECTION CRITIQUE : Liaison directe dynamique avec MockDB (qui contient vos données MySQL désormais)
  get appointments() { return MockDB.appointments; },
  set appointments(val) { },

  get patients() { return MockDB.patients; },
  set patients(val) { },

  adminConvs: MockDB.chatConversations.map(c => ({ ...c, messages: [...c.messages] })),
  filterApts: '',
  filterAptStatus: '',
  calendarDate: new Date(),
};

function getNow() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function getToday() { return new Date().toISOString().split('T')[0]; }

/* Load persisted user */
(function () {
  try {
    const u = JSON.parse(sessionStorage.getItem('ncUser'));
    if (u) {
      App.currentUser = u;
      updateNavForUser();

      // Restore role class so CSS works after a page reload
      const fullName = `${u.firstName} ${u.lastName || ''}`.trim();
      setDashboardRole(u.role, fullName);

      // 🎯 NETTOYAGE CHIRURGICAL : Si l'utilisateur est un docteur ou un admin, on liquide le menu patient
      if (u.role === 'doctor' || u.role === 'admin') {
        setTimeout(() => {
          // 1. On cherche et on masque le titre de la section "Portail Patient"
          const headers = document.querySelectorAll('.sidebar-header, .menu-title, div, h3');
          headers.forEach(h => {
            if (h.textContent.trim().toUpperCase() === 'PORTAIL PATIENT') {
              h.style.display = 'none';
            }
          });

          // 2. On masque les boutons spécifiques au patient (Vue d'ensemble, Nouveau RDV...)
          const patientItems = document.querySelectorAll('[data-page="dashboard-patient"], [data-page="new-appointment"], [data-page="patient-dashboard"]');
          patientItems.forEach(item => item.style.display = 'none');

          // 3. Si le bouton "Nouveau RDV" ou "Vue d'ensemble" est une simple liste sans data-page
          const allLinks = document.querySelectorAll('.sidebar-menu-item, .nav-link');
          allLinks.forEach(link => {
            const text = link.textContent.toLowerCase();
            if (text.includes('nouveau rdv') || (text.includes('vue d\'ensemble') && !link.textContent.includes('Médical'))) {
              link.style.display = 'none';
            }
          });

          console.log("🧼 Menu patient nettoyé avec succès de l'espace praticien.");
        }, 50); // Un léger délai pour laisser updateNavForUser() finir son travail
      }
    }
  } catch (e) { }
})();

/* ══ PAGE ROUTING ═══════ */
function goPage(name) {
  if (['dashboard', 'booking'].includes(name) && !App.currentUser) {
    showToast('Please sign in to access this page.', 'info'); goPage('login'); return;
  }
  if (name === 'admin' && (!App.currentUser || App.currentUser.role !== 'admin')) {
    showToast('Admin access required.', 'error'); return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`page-${name}`);
  if (!page) return;
  page.classList.add('active');
  App.currentPage = name;

  // Update navbar links active state
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navEl = document.getElementById(`nav-${name}`);
  if (navEl) navEl.classList.add('active');

  // Navbar appearance
  const navbar = document.getElementById('navbar');
  const lightPages = ['home'];
  navbar.classList.toggle('dark-nav', lightPages.includes(name) && window.scrollY < 50);

  // Page-specific init
  if (name === 'home') initHome();
  if (name === 'booking') initBooking();
  if (name === 'dashboard') initDashboard();
  if (name === 'admin') initAdmin();
  if (name === 'contact') { }

  window.scrollTo(0, 0);
  closeMobileMenu();

  const roleClass = document.body.classList.contains('role-doctor') ? 'role-doctor'
    : document.body.classList.contains('role-patient') ? 'role-patient'
      : '';
  document.body.className = (name === 'home' ? 'page-home' : 'page-' + name)
    + (roleClass ? ' ' + roleClass : '');
}

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 20) { navbar.classList.add('scrolled'); navbar.classList.remove('dark-nav'); }
  else { navbar.classList.remove('scrolled'); if (App.currentPage === 'home') navbar.classList.add('dark-nav'); }
});

/* -------- AUTH --------- */
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pwd = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');

  setBtnLoading(btn, 'loginBtnText', true);

  try {
    const res = await fetch('api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pwd }),
    });
    const data = await res.json();

    if (!data.success) {
      document.getElementById('loginPassword').classList.add('error');
      showToast(data.message || 'Invalid email or password.', 'error');
      return;
    }

    App.currentUser = data.user;
    // sessionStorage mirrors the server session for quick UI reads
    sessionStorage.setItem('ncUser', JSON.stringify(data.user));
    updateNavForUser();
    showToast(`Welcome back, ${data.user.firstName}! 🎉`, 'success');
    data.user.role === 'admin' ? goPage('admin') : goPage('dashboard');

  } catch (err) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    setBtnLoading(btn, 'loginBtnText', false);
  }
}

async function handleRegister(e) {
  e.preventDefault();

  // ── Client-side validation (unchanged) ──────────────────────────────────
  let valid = true;
  const first = document.getElementById('regFirst').value.trim();
  const last = document.getElementById('regLast').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pwd = document.getElementById('regPassword').value;
  const conf = document.getElementById('regConfirm').value;
  const terms = document.getElementById('regTerms').checked;

  clearFieldErrors(['errFirst', 'errEmail', 'errPwd', 'errConfirm', 'errTerms']);
  if (first.length < 2) { showFieldError('errFirst', '<i class="fas fa-exclamation-circle"></i> First name too short'); valid = false; }
  if (!email.match(/\S+@\S+\.\S+/)) { showFieldError('errEmail', '<i class="fas fa-exclamation-circle"></i> Invalid email address'); valid = false; }
  if (pwd.length < 8) { showFieldError('errPwd', '<i class="fas fa-exclamation-circle"></i> Minimum 8 characters required'); valid = false; }
  else if (!/[A-Z]/.test(pwd)) { showFieldError('errPwd', '<i class="fas fa-exclamation-circle"></i> Must include uppercase letter'); valid = false; }
  else if (!/[0-9]/.test(pwd)) { showFieldError('errPwd', '<i class="fas fa-exclamation-circle"></i> Must include a number'); valid = false; }
  if (pwd !== conf) { showFieldError('errConfirm', '<i class="fas fa-exclamation-circle"></i> Passwords do not match'); valid = false; }
  if (!terms) { showFieldError('errTerms', '<i class="fas fa-exclamation-circle"></i> You must accept the terms'); valid = false; }
  if (!valid) return;
  // ────────────────────────────────────────────────────────────────────────

  const btn = document.getElementById('regBtn');
  setBtnLoading(btn, 'regBtnText', true);

  try {
    const res = await fetch('api/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: first,
        lastName: last,
        email,
        password: pwd,
        phone: document.getElementById('regPhone').value,
        dob: document.getElementById('regDob').value,
      }),
    });
    const data = await res.json();

    if (!data.success) {
      // Surface server-side errors (e.g. duplicate email) to the right field
      if (res.status === 409) showFieldError('errEmail', `<i class="fas fa-exclamation-circle"></i> ${data.message}`);
      else showToast(data.message || 'Registration failed.', 'error');
      return;
    }

    App.currentUser = data.user;
    sessionStorage.setItem('ncUser', JSON.stringify(data.user));
    updateNavForUser();
    showToast('Account created! Welcome to NovaCare 🌸', 'success');
    goPage('dashboard');

  } catch (err) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    setBtnLoading(btn, 'regBtnText', false);
  }
}


// ── setDashboardRole ────────────────────────────────────────────────────────
// Pose la classe CSS de rôle sur <body> et met à jour le nom affiché.
// Le CSS dans styles.css pilote ensuite la visibilité de .patient-only / .doctor-only
function setDashboardRole(role, fullName) {
  // 1. Nettoyer les classes de rôle précédentes
  document.body.classList.remove('role-patient', 'role-doctor', 'role-admin');

  // 2. Poser la nouvelle classe
  const cssRole = (role === 'doctor') ? 'role-doctor'
    : (role === 'admin') ? 'role-doctor'  // admin uses same sidebar as doctor
      : 'role-patient';
  document.body.classList.add(cssRole);

  // 3. Mettre à jour le nom affiché selon le rôle
  if (role === 'doctor') {
    const el = document.getElementById('dashDocName');
    if (el) el.textContent = 'Dr. ' + fullName;
  } else {
    const el = document.getElementById('dashUserName');
    if (el) el.textContent = fullName.split(' ')[0];
    const dateEl = document.getElementById('dashDate');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString(
      'fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    );
  }
}

function doLogout() {
  App.currentUser = null;
  sessionStorage.removeItem('ncUser');
  updateNavForUser();
  showToast('You have been signed out.', 'info');
  goPage('home');
}

function updateNavForUser() {
  const user = App.currentUser;
  const loginBtn = document.getElementById('navLoginBtn');
  const bookBtn = document.getElementById('navBookBtn');
  const userArea = document.getElementById('navUserArea');
  const adminLink = document.getElementById('nav-admin');
  const avatar = document.getElementById('navAvatar');
  if (user) {
    loginBtn.style.display = 'none'; bookBtn.style.display = 'none';
    userArea.style.display = 'flex';
    if (avatar) { avatar.textContent = user.initials; avatar.style.background = user.color; }
    if (adminLink) adminLink.style.display = user.role === 'admin' ? 'block' : 'none';
  } else {
    loginBtn.style.display = ''; bookBtn.style.display = '';
    userArea.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
  }
}

/* --------- HOME INIT --------- */

function initHome() {
  // Services
  const sg = document.getElementById('servicesGrid');
  if (sg && !sg.hasChildNodes()) sg.innerHTML = SERVICES_DATA.map(s => `
      <div class="service-card" onclick="goPage('booking')">
        <div class="service-icon" style="background:${s.color};"><span style="font-size:24px;">${s.icon}</span></div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        <div class="service-link">${s.link} <i class="fas fa-arrow-right"></i></div>
      </div>`).join('');

  // Doctors
  const dg = document.getElementById('doctorsGrid');
  if (dg && !dg.hasChildNodes()) dg.innerHTML = DOCTORS_DATA.map(d => `
      <div class="doctor-card">
        <div class="doctor-img" style="background:${d.gradient};">${d.emoji}</div>
        <div class="doctor-body">
          <div class="doctor-name">${d.name}</div>
          <div class="doctor-title">${d.title}</div>
          <div class="doctor-spec">${d.specialty}</div>
          <div class="doctor-stats">
            <div><div class="doctor-stat-val">${d.rating}★</div><div class="doctor-stat-lbl">Rating</div></div>
            <div><div class="doctor-stat-val">${d.exp}</div><div class="doctor-stat-lbl">Experience</div></div>
            <div><div class="doctor-stat-val">${d.patients}</div><div class="doctor-stat-lbl">Patients</div></div>
          </div>
        </div>
      </div>`).join('');

  // Testimonials
  const tg = document.getElementById('testimonialsGrid');
  if (tg && !tg.hasChildNodes()) tg.innerHTML = TESTIMONIALS_DATA.map(t => `
      <div class="testimonial-card">
        <div class="testimonial-stars">${'★'.repeat(t.stars)}</div>
        <div class="testimonial-text">"${t.text}"</div>
        <div class="testimonial-author">
          <div class="testimonial-avatar">${t.name[0]}</div>
          <div><div class="testimonial-name">${t.name}</div><div class="testimonial-age">Age ${t.age}</div></div>
        </div>
      </div>`).join('');

  document.getElementById('navbar').classList.add('dark-nav');
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------
   BOOKING
--------- */
const TAKEN_SLOTS = ['9:30 AM', '11:00 AM', '3:30 PM'];
const ALL_SLOTS = ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'];

function initBooking() {
  App.bookingStep = 1;
  App.dynamicDoctors = null;
  App.bookingData = {
    service: '',
    doctor: '',
    doctorId: '', // 💡 Added tracking variable
    date: null,
    time: '',
    name: App.currentUser?.firstName || '',
    email: App.currentUser?.email || '',
    phone: App.currentUser?.phone || '',
    notes: ''
  };
  App.calendarDate = new Date();
  updateStepper();
  renderBookingStep();
}

function updateStepper() {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`step${i}`);
    if (!el) continue;
    el.classList.remove('active', 'done');
    if (i === App.bookingStep) el.classList.add('active');
    if (i < App.bookingStep) { el.classList.add('done'); el.querySelector('.step-num').innerHTML = '<i class="fas fa-check"></i>'; }
    else el.querySelector('.step-num').textContent = i === App.bookingStep ? (i === 1 ? '' : '' + i) : i;
  }
  // step 1 icon
  const s1num = document.getElementById('step1')?.querySelector('.step-num');
  if (s1num && App.bookingStep === 1) s1num.innerHTML = '<i class="fas fa-stethoscope"></i>';
}

function renderBookingStep() {
  const c = document.getElementById('bookingContent');
  if (!c) return;
  if (App.bookingStep === 1) c.innerHTML = renderStep1();
  if (App.bookingStep === 2) c.innerHTML = renderStep2();
  if (App.bookingStep === 3) c.innerHTML = renderStep3();
  if (App.bookingStep === 4) c.innerHTML = renderStep4();
}

// Map department names directly to their specific Font Awesome icons
const DEPARTMENT_ICONS = {
  "Cardiologie": "fas fa-heart-pulse",
  "Neurologie": "fas fa-brain",
  "Pédiatrie": "fas fa-baby",
  "Médecine Générale": "fas fa-stethoscope",
  "Orthopédie": "fas fa-bone",
  "Chirurgie": "fas fa-hand-holding-medical",
  "Dermatologie": "fas fa-hand-dots",
  "Oncologie": "fas fa-dna",
  "Ophtalmologie": "fas fa-eye",
  "Gastro-entérologie": "fas fa-stomach"
};

function renderStep1() {
  // 1. Fetch live doctors from database if not already loaded
  if (!App.dynamicDoctors) {
    App.dynamicDoctors = [];
    fetch('api/get_doctors.php', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          App.dynamicDoctors = data.doctors;
          renderBookingStep(); // Re-render once data arrives
        }
      })
      .catch(err => console.error("Error loading booking doctors:", err));
  }

  // Visual presets for doctor avatars (fallback style)
  const designPresets = [
    { emoji: '👩‍⚕️', gradient: 'linear-gradient(135deg,#e0f7fa,#b2ebf2)' },
    { emoji: '🏥', gradient: 'linear-gradient(135deg,#fce4ec,#f8bbd0)' },
    { emoji: '⚕️', gradient: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)' },
    { emoji: '🧬', gradient: 'linear-gradient(135deg,#e3f2fd,#bbdefb)' }
  ];

  // 2. Robust Filtering System (.trim() removes any hidden spaces from DB or UI array)
  const selectedService = App.bookingData.service ? App.bookingData.service.trim() : "";

  const filteredDoctors = App.dynamicDoctors.filter(d => {
    if (!selectedService) return true; // Show all doctors if no service chosen
    return d.department_name && d.department_name.trim() === selectedService;
  });

  return `
    <div class="booking-card anim-fadeUp">
      <h3><i class="fas fa-stethoscope"></i> Choose Service & Doctor</h3>
      
      <div class="form-group">
        <label class="form-label">Select Service *</label>
        <select class="form-control" id="bkService" onchange="App.bookingData.service=this.value; App.bookingData.doctor=''; renderBookingStep();" required>
          <option value="">-- Select a service --</option>
          ${SERVICES_DATA.map(s => `
            <option value="${s.title}" ${App.bookingData.service === s.title ? 'selected' : ''}>
              ${s.title}
            </option>
          `).join('')}
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Preferred Doctor *</label>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
          ${App.dynamicDoctors.length === 0 ?
      `<div style="text-align:center; padding: 20px; color: var(--muted);"><i class="fas fa-spinner fa-spin"></i> Loading available doctors...</div>`
      :
      filteredDoctors.length === 0 ?
        `<div style="text-align:center; padding: 30px; color: var(--rose); font-weight:600; border: 2px dashed var(--border); border-radius:14px; background:var(--surface);">
              <i class="fas fa-user-slash" style="font-size:24px; margin-bottom:8px; display:block;"></i> 
              Aucun médecin disponible en "${selectedService}" actuellement.
             </div>`
        :
        filteredDoctors.map((d, index) => {
          const preset = designPresets[index % designPresets.length];
          const docFullName = `Dr. ${d.first_name} ${d.last_name}`;
          const isSelected = App.bookingData.doctor === docFullName;

          // Find the right icon or fallback to medical icon
          const deptIconClass = DEPARTMENT_ICONS[d.department_name] || "fas fa-stethoscope";

          return `
  <div onclick="App.bookingData.doctor='${docFullName}'; App.bookingData.doctorId='${d.id}'; document.querySelectorAll('.doc-opt').forEach(el=>el.classList.remove('selected')); this.classList.add('selected');"
    class="doc-opt ${isSelected ? 'selected' : ''}"
                  style="display:flex;align-items:center;gap:14px;padding:14px;border-radius:14px;border:2px solid ${isSelected ? 'var(--teal)' : 'var(--border)'};background:${isSelected ? 'var(--teal-pale)' : 'var(--surface)'};cursor:pointer;transition:.2s;">
                  
                  <div style="width:48px;height:48px;border-radius:14px;background:var(--teal-pale);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">
                    ${preset.emoji}
                  </div>
                  
                  <div style="flex:1;">
                    <div style="font-weight:700;font-size:14px;color:var(--text);">${docFullName}</div>
                    <div style="font-size:12px;color:var(--teal);font-weight:600;display:flex;align-items:center;gap:6px;margin-top:2px;">
                      <i class="${deptIconClass}"></i> ${d.department_name || 'Généraliste'}
                    </div>
                    <div style="font-size:11px;color:var(--muted);margin-top:2px;">
                      <i class="fas fa-phone-alt" style="font-size:9px;"></i> ${d.phone || 'Pas de téléphone'}
                    </div>
                  </div>
                  
                  <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${isSelected ? 'var(--teal)' : 'var(--border)'};background:${isSelected ? 'var(--teal)' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    ${isSelected ? '<i class="fas fa-check" style="color:#fff;font-size:9px;"></i>' : ''}
                  </div>
                </div>`;
        }).join('')
    }
        </div>
      </div>
    </div>
    
    <div class="booking-nav">
      <div></div>
      <button class="btn-next" onclick="nextBookingStep()">Continue <i class="fas fa-arrow-right"></i></button>
    </div>`;
}

function renderStep2() {
  const yr = App.calendarDate.getFullYear(), mo = App.calendarDate.getMonth();
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS_SH = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMo = new Date(yr, mo + 1, 0).getDate();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMo; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const calHtml = cells.map(d => {
    if (!d) return '<div class="cal-day"></div>';
    const dt = new Date(yr, mo, d);
    const isSel = App.bookingData.date && App.bookingData.date.toDateString() === dt.toDateString();
    const isDisabled = dt < today || dt.getDay() === 0;
    const isTod = dt.toDateString() === today.toDateString();
    const cls = isDisabled ? 'cal-disabled' : isSel ? 'cal-selected' : isTod ? 'cal-today' : '';
    return `<div class="cal-day ${cls}" ${!isDisabled ? `onclick="selectBookingDate(${yr},${mo},${d})"` : ''}>${d}</div>`;
  }).join('');

  const selDateStr = App.bookingData.date ? App.bookingData.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';

  return `
      <div class="booking-card anim-fadeUp">
        <h3><i class="fas fa-calendar-days"></i> Select Date & Time</h3>
        <div class="grid-2">
          <div>
            <label class="form-label mb-2">Choose Date *</label>
            <div class="calendar-wrap">
              <div class="cal-header">
                <button class="cal-nav" onclick="calNav(-1)"><i class="fas fa-chevron-left"></i></button>
                <span class="cal-month">${MONTHS[mo]} ${yr}</span>
                <button class="cal-nav" onclick="calNav(1)"><i class="fas fa-chevron-right"></i></button>
              </div>
              <div class="cal-days-hdr">${DAYS_SH.map(d => `<div class="cal-day-hdr">${d}</div>`).join('')}</div>
              <div class="cal-days">${calHtml}</div>
            </div>
            ${App.bookingData.date ? `<div style="margin-top:10px;background:var(--teal-pale);border:1px solid var(--teal-mid);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--teal-dk);font-weight:600;"><i class="fas fa-calendar-check" style="margin-right:6px;"></i>${selDateStr}</div>` : ''}
          </div>
          <div>
            <label class="form-label mb-2">Select Time *</label>
            <div class="slots-grid">
              ${ALL_SLOTS.map(slot => {
    const taken = TAKEN_SLOTS.includes(slot);
    const sel = App.bookingData.time === slot;
    return `<div class="slot ${taken ? 'slot-taken' : sel ? 'slot-selected' : ''}" ${!taken ? `onclick="App.bookingData.time='${slot}';renderBookingStep();"` : ''}>${slot}</div>`;
  }).join('')}
            </div>
            <div style="display:flex;gap:12px;margin-top:14px;flex-wrap:wrap;">
              <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);"><div style="width:12px;height:12px;border-radius:4px;background:var(--teal);"></div>Selected</div>
              <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);"><div style="width:12px;height:12px;border-radius:4px;background:var(--border);"></div>Booked</div>
              <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);"><div style="width:12px;height:12px;border-radius:4px;border:1.5px solid var(--border);"></div>Available</div>
            </div>
          </div>
        </div>
      </div>
      <div class="booking-nav">
        <button class="btn-back" onclick="prevBookingStep()"><i class="fas fa-arrow-left"></i> Back</button>
        <button class="btn-next" onclick="nextBookingStep()">Continue <i class="fas fa-arrow-right"></i></button>
      </div>`;
}

function renderStep3() {
  return `
      <div class="booking-card anim-fadeUp">
        <h3><i class="fas fa-user"></i> Patient Information</h3>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Full Name *</label><div class="input-icon-wrap"><i class="fas fa-user"></i><input type="text" class="form-control" id="bkName" value="${App.bookingData.name}" oninput="App.bookingData.name=this.value" placeholder="Jane Doe"></div></div>
          <div class="form-group"><label class="form-label">Phone *</label><div class="input-icon-wrap"><i class="fas fa-phone"></i><input type="tel" class="form-control" id="bkPhone" value="${App.bookingData.phone}" oninput="App.bookingData.phone=this.value" placeholder="+1 (555) 000-0000"></div></div>
        </div>
        <div class="form-group"><label class="form-label">Email *</label><div class="input-icon-wrap"><i class="fas fa-envelope"></i><input type="email" class="form-control" id="bkEmail" value="${App.bookingData.email}" oninput="App.bookingData.email=this.value" placeholder="jane@example.com"></div></div>
        <div class="form-group"><label class="form-label">Special Notes / Symptoms</label><textarea class="form-control" id="bkNotes" rows="3" oninput="App.bookingData.notes=this.value" placeholder="Any symptoms, concerns, or special requests…" style="resize:vertical;">${App.bookingData.notes}</textarea></div>
        <div style="background:var(--teal-pale);border-radius:12px;padding:14px;margin-top:4px;font-size:12px;color:var(--teal-dk);line-height:1.6;"><i class="fas fa-shield-halved" style="margin-right:6px;"></i><strong>Privacy Notice:</strong> Your information is protected under HIPAA and will never be shared without your consent.</div>
      </div>
      <div class="booking-nav">
        <button class="btn-back" onclick="prevBookingStep()"><i class="fas fa-arrow-left"></i> Back</button>
        <button class="btn-next" onclick="nextBookingStep()">Review Booking <i class="fas fa-arrow-right"></i></button>
      </div>`;
}

function renderStep4() {
  const d = App.bookingData;
  const dateStr = d.date ? d.date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '';
  return `
      <div class="booking-card anim-fadeUp" id="bookingReviewCard">
        <h3><i class="fas fa-check-double"></i> Review & Confirm</h3>
        <div class="booking-summary">
          ${[
      { icon: 'stethoscope', lbl: 'Service', val: d.service },
      { icon: 'user-md', lbl: 'Doctor', val: d.doctor },
      { icon: 'calendar', lbl: 'Date', val: dateStr },
      { icon: 'clock', lbl: 'Time', val: d.time },
      { icon: 'user', lbl: 'Patient', val: d.name },
      { icon: 'phone', lbl: 'Phone', val: d.phone },
      { icon: 'envelope', lbl: 'Email', val: d.email },
    ].map(r => `
            <div class="summary-row">
              <div class="summary-icon"><i class="fas fa-${r.icon}"></i></div>
              <div><div class="summary-lbl">${r.lbl}</div><div class="summary-val">${r.val || '—'}</div></div>
            </div>`).join('')}
          ${d.notes ? `<div class="summary-row"><div class="summary-icon"><i class="fas fa-sticky-note"></i></div><div><div class="summary-lbl">Notes</div><div class="summary-val">${d.notes}</div></div></div>` : ''}
        </div>
        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:14px;margin-top:14px;font-size:12px;color:#92400e;line-height:1.6;display:flex;gap:10px;"><i class="fas fa-exclamation-triangle" style="margin-top:2px;flex-shrink:0;"></i><span><strong>Cancellation Policy:</strong> Please cancel or reschedule at least 24 hours before your appointment. A confirmation email will be sent to ${d.email}.</span></div>
      </div>
      <div class="booking-nav">
        <button class="btn-back" onclick="prevBookingStep()"><i class="fas fa-arrow-left"></i> Edit</button>
        <button class="btn-next" onclick="submitBooking()" id="confirmBookBtn"><i class="fas fa-check"></i> Confirm Booking</button>
      </div>`;
}

function selectBookingDate(yr, mo, d) {
  App.bookingData.date = new Date(yr, mo, d);
  App.bookingData.time = '';
  renderBookingStep();
}
function calNav(dir) {
  App.calendarDate = new Date(App.calendarDate.getFullYear(), App.calendarDate.getMonth() + dir, 1);
  renderBookingStep();
}

function nextBookingStep() {
  // If the user is on Step 1, make sure they chose a doctor/service before going to Step 2
  if (App.bookingStep === 1) {
    if (!App.bookingData.service || !App.bookingData.doctor) {
      showToast("Erreur", "Veuillez choisir un service et un médecin.", "error");
      return;
    }
    App.bookingStep = 2;

    // If on Step 2, make sure they picked a date and time slot
  } else if (App.bookingStep === 2) {
    if (!App.bookingData.date || !App.bookingData.time) {
      showToast("Erreur", "Veuillez choisir une date et un horaire.", "error");
      return;
    }
    App.bookingStep = 3;

    // If on Step 3, validate patient info input fields before showing Step 4 Review
  } else if (App.bookingStep === 3) {
    if (!App.bookingData.name || !App.bookingData.phone || !App.bookingData.email) {
      showToast("Erreur", "Veuillez remplir tous les champs obligatoires (*).", "error");
      return;
    }
    App.bookingStep = 4; // Move to the Summary / Review Step!

    // 💡 NEW CRITICAL LOGIC: If on Step 4 (The Review Screen) and they hit click...
  } else if (App.bookingStep === 4) {
    submitBooking(); // 🔥 Call the backend database save sequence here!
    return; // Halt layout re-rendering so the fetch promise handles step advancement instead
  }

  // Standard step rendering updating the top progression indicator dots
  if (typeof updateStepper === 'function') updateStepper();
  renderBookingStep();
}

function prevBookingStep() {
  if (App.bookingStep > 1) { App.bookingStep--; updateStepper(); renderBookingStep(); }
}

function submitBooking() {

  if (typeof App === 'undefined' || !App.bookingData) {
    showToast('Erreur système : données de réservation introuvables.', 'error');
    return;
  }

  // ── Formatage de la date ──────────────────────────────────────────
  let formattedDate = '';
  try {
    if (App.bookingData.date) {
      formattedDate = App.bookingData.date instanceof Date
        ? App.bookingData.date.toISOString().split('T')[0]
        : String(App.bookingData.date).split('T')[0];
    }
  } catch (e) {
    formattedDate = App.bookingData.date || '';
  }

  // ── Conversion heure 12h → 24h ────────────────────────────────────
  function formatTimeTo24h(timeStr) {
    if (!timeStr) return '';
    if (!timeStr.includes('AM') && !timeStr.includes('PM')) return timeStr;
    const [time, modifier] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  const payload = {
    doctor_id: App.bookingData.doctorId ? parseInt(App.bookingData.doctorId, 10) : 0,
    appointment_date: formattedDate,
    appointment_time: formatTimeTo24h(App.bookingData.time || ''),
    reason: App.bookingData.notes || 'Consultation',
  };

  console.log('[submitBooking] payload envoyé :', payload);

  const btn = document.getElementById('confirmBookBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi…'; }

  fetch('api/create_appointment.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
    .then(async res => {
      const text = await res.text();
      console.log('[submitBooking] réponse brute serveur :', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('[submitBooking] réponse non-JSON :', text);
        showToast('Erreur serveur — voir console pour détails.', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Confirm Booking'; }
        return;
      }

      if (!data.success) {
        console.error('[submitBooking] échec API :', data.message);
        showToast(data.message || 'Erreur lors de la réservation.', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Confirm Booking'; }
        return;
      }

      // ── Succès ────────────────────────────────────────────────────
      const container = document.getElementById('bookingContent');
      if (container) {
        const d = App.bookingData;
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const displayDate = d.date instanceof Date
          ? d.date.toLocaleDateString('fr-FR', dateOptions)
          : d.date;

        container.innerHTML = `
          <div class="booking-card anim-fadeUp"
               style="text-align:center;padding:50px 30px;background:#fff;border-radius:20px;
                      box-shadow:0 10px 30px rgba(0,0,0,.04);max-width:600px;margin:30px auto;">
            <div style="width:90px;height:90px;background:#ecfdf5;color:#10b981;border-radius:50%;
                        display:flex;align-items:center;justify-content:center;font-size:46px;
                        margin:0 auto 24px;box-shadow:0 10px 20px rgba(16,185,129,.1);">
              <i class="fas fa-check-circle"></i>
            </div>
            <h2 style="color:#1e293b;font-weight:800;font-size:26px;margin-bottom:10px;">
              Rendez-vous Confirmé !
            </h2>
            <p style="color:#64748b;font-size:15px;margin-bottom:35px;line-height:1.6;">
              Merci <strong>${d.name || 'Patient'}</strong>, votre demande a été enregistrée.
            </p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;
                        padding:24px;text-align:left;margin-bottom:40px;">
              <h4 style="margin:0 0 16px;font-size:14px;color:#1e293b;text-transform:uppercase;
                         letter-spacing:.5px;display:flex;align-items:center;gap:8px;">
                <i class="fas fa-receipt" style="color:#0284c7;"></i> Détails de la consultation
              </h4>
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
                          gap:16px;font-size:14px;color:#475569;">
                <div><span style="color:#94a3b8;">Médecin :</span><br>
                     <strong style="color:#1e293b;">${d.doctor || '—'}</strong></div>
                <div><span style="color:#94a3b8;">Spécialité :</span><br>
                     <strong style="color:#1e293b;">${d.service || 'Consultation Générale'}</strong></div>
                <div><span style="color:#94a3b8;">Date :</span><br>
                     <strong style="color:#1e293b;text-transform:capitalize;">${displayDate || '—'}</strong></div>
                <div><span style="color:#94a3b8;">Heure :</span><br>
                     <strong style="color:#1e293b;">${d.time || '—'}</strong></div>
              </div>
            </div>
            <button onclick="goPage('dashboard')"
              style="background:var(--teal,#0284c7);color:#fff;border:none;padding:14px 32px;
                     border-radius:12px;font-weight:600;font-size:15px;cursor:pointer;
                     box-shadow:0 4px 12px rgba(2,132,199,.2);">
              Voir mes rendez-vous
              <i class="fas fa-arrow-right" style="margin-left:8px;font-size:13px;"></i>
            </button>
          </div>`;

        const globalNav = document.querySelector('.booking-nav');
        if (globalNav) globalNav.style.display = 'none';
        document.getElementById('step4')?.classList.add('completed');
        if (typeof initDashboard === 'function') initDashboard();
      }
    })
    .catch(err => {
      console.error('[submitBooking] erreur réseau :', err);
      showToast('Erreur réseau. Vérifiez votre connexion et réessayez.', 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Confirm Booking'; }
    });
}


/* ---------
   PATIENT DASHBOARD
--------- */
async function initDashboard() {
  const user = App.currentUser;
  if (!user) return;

  // ── Role separation ─────────────────────────────────────────
  const fullName = `${user.firstName} ${user.lastName || ''}`.trim();
  setDashboardRole(user.role, fullName);  // ← THIS IS THE CRITICAL CALL

  // If doctor, nothing else in initDashboard applies (it's patient-only data)
  if (user.role === 'doctor') {
    initDoctorDashboard();  // ← fetch live stats
    return;
  }
  // ────────────────────────────────────────────────────────────

  document.getElementById('dashUserName').textContent = user.firstName;
  document.getElementById('dashDate').textContent = new Date().toLocaleDateString(
    'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  // ── Fetch appointments from the server ────────────────────────────────
  let myApts = [];
  try {
    const res = await fetch('api/get_appointments.php', { credentials: 'include' });
    const data = await res.json();
    if (data.success) {
      myApts = data.appointments;
      App.appointments = myApts; // keep in-memory state in sync
    } else {
      showToast('Could not load appointments.', 'error');
    }
  } catch (err) {
    showToast('Network error loading appointments.', 'error');
  }
  // ─────────────────────────────────────────────────────────────────────

  const upcoming = myApts.filter(a => ['confirmed', 'pending'].includes(a.status));
  const completed = myApts.filter(a => a.status === 'completed');

  // ── Stats (unchanged rendering logic) ────────────────────────────────
  const dashStats = document.getElementById('dashStats');
  if (dashStats) dashStats.innerHTML = [
    { icon: 'calendar-check', color: '#e0f7fa', iconColor: 'var(--teal)', val: upcoming.length, lbl: 'Upcoming Visits', trend: '+1', up: true },
    { icon: 'check-circle', color: '#e8f5e9', iconColor: '#388e3c', val: completed.length, lbl: 'Completed', trend: `${myApts.length} total`, up: true },
    { icon: 'clock', color: '#fff3e0', iconColor: '#f57c00', val: upcoming[0]?.date || 'None', lbl: 'Next Appointment', trend: '', up: true },
    { icon: 'shield-halved', color: '#f3e5f5', iconColor: '#7b1fa2', val: 'Active', lbl: 'Insurance Status', trend: 'Verified', up: true },
  ].map(s => `
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon" style="background:${s.color};color:${s.iconColor};">
            <i class="fas fa-${s.icon}"></i>
          </div>
          <div class="stat-trend ${s.up ? 'up' : 'down'}">
            ${s.trend ? `<i class="fas fa-arrow-${s.up ? 'up' : 'down'}"></i>${s.trend}` : ''}
          </div>
        </div>
        <div class="stat-val">${s.val}</div>
        <div class="stat-lbl">${s.lbl}</div>
      </div>`).join('');

  // ── Upcoming list, quick actions, tables (unchanged rendering logic) ──
  const upEl = document.getElementById('dashUpcoming');
  if (upEl) upEl.innerHTML = upcoming.length
    ? upcoming.slice(0, 3).map(apt => `
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:10px;display:flex;align-items:center;gap:14px;">
            <div style="width:44px;height:44px;background:var(--teal-pale);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="fas fa-stethoscope" style="color:var(--teal);"></i>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-weight:700;font-size:14px;">${apt.service}</div>
              <div style="font-size:12px;color:var(--teal);font-weight:600;">${apt.doctor}</div>
              <div style="font-size:11px;color:var(--muted);margin-top:2px;">
                <i class="fas fa-calendar" style="margin-right:4px;"></i>${apt.date} · ${apt.time}
              </div>
            </div>
            <span class="status-badge status-${apt.status}">${apt.status}</span>
          </div>`).join('')
    : `<div style="text-align:center;padding:30px;color:var(--muted);font-size:13px;background:var(--surface);border-radius:14px;border:1px dashed var(--border);">
           No upcoming appointments.<br>
           <a style="color:var(--teal);font-weight:700;cursor:pointer;" onclick="goPage('booking')">Book one now →</a>
         </div>`;

  const qa = document.getElementById('quickActions');
  if (qa) qa.innerHTML = [
    { icon: 'calendar-plus', title: 'Book Appointment', desc: 'Schedule a new visit', color: 'var(--teal)', action: `goPage('booking')` },
    { icon: 'comment-dots', title: 'Live Chat Support', desc: 'Chat with our team', color: '#7b1fa2', action: `openChat()` },
    { icon: 'phone-alt', title: 'Call Us', desc: '+212 688 003 790', color: '#388e3c', action: `showToast('Calling +212 688 003 790…','info')` },
    { icon: 'file-medical', title: 'Medical Records', desc: 'View your documents', color: '#f57c00', action: `showToast('Medical records coming soon','info')` },
  ].map(a => `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:.2s;"
           onmouseover="this.style.borderColor='var(--teal)'" onmouseout="this.style.borderColor='var(--border)'"
           onclick="${a.action}">
        <div style="width:40px;height:40px;background:${a.color}1a;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fas fa-${a.icon}" style="color:${a.color};"></i>
        </div>
        <div><div style="font-weight:700;font-size:13px;">${a.title}</div><div style="font-size:12px;color:var(--muted);">${a.desc}</div></div>
        <i class="fas fa-chevron-right" style="margin-left:auto;color:var(--muted);font-size:12px;"></i>
      </div>`).join('');

  renderPatientApptsTable(myApts);
  renderHistory(myApts.filter(a => a.status === 'completed' || a.status === 'cancelled'));
  renderProfileCard(user);
}

async function initDoctorDashboard() {
  try {
    const res = await fetch('api/get_doctor_stats.php', { credentials: 'include' });
    const data = await res.json();

    if (!data.success) {
      showToast('Impossible de charger les données du planning.', 'error');
      return;
    }

    const { total_today, pending, completed, next_apt } = data.stats;

    // ── Badge date du jour ─────────────────────────────────────────
    const badge = document.getElementById('docTodayDateBadge');
    if (badge) {
      badge.textContent = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long'
      });
    }

    // ── KPI Cards ──────────────────────────────────────────────────
    const statsGrid = document.getElementById('docStatsGrid');
    if (statsGrid) {
      const cards = [
        {
          icon: 'calendar-day',
          bg: 'linear-gradient(135deg,#0a7c6e,#0fb8a4)',
          val: total_today,
          lbl: 'Consultations du Jour',
          sub: total_today > 0 ? `${completed} terminée(s)` : 'Aucune programmée',
        },
        {
          icon: 'hourglass-half',
          bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
          val: pending,
          lbl: 'En Attente',
          sub: pending > 0 ? 'En salle d\'attente' : 'File vide',
        },
        {
          icon: 'check-circle',
          bg: 'linear-gradient(135deg,#388e3c,#4caf50)',
          val: completed,
          lbl: 'Terminées',
          sub: total_today > 0
            ? `${Math.round(completed / total_today * 100)}% du planning`
            : '—',
        },
        {
          icon: 'user-clock',
          bg: 'linear-gradient(135deg,#7b1fa2,#ab47bc)',
          val: next_apt ? next_apt.appointment_time : '—',
          lbl: 'Prochain Patient',
          sub: next_apt ? next_apt.patient_name : 'Aucun à venir',
        },
      ];

      statsGrid.innerHTML = cards.map(c => `
        <div style="
          background:${c.bg};
          border-radius:16px;
          padding:20px 22px;
          color:#fff;
          box-shadow:0 4px 20px rgba(0,0,0,.08);
          position:relative;
          overflow:hidden;
        ">
          <!-- Cercle décoratif -->
          <div style="position:absolute;right:-16px;top:-16px;width:80px;height:80px;
                      border-radius:50%;background:rgba(255,255,255,.12);"></div>
          <div style="position:absolute;right:16px;bottom:-20px;width:60px;height:60px;
                      border-radius:50%;background:rgba(255,255,255,.08);"></div>

          <div style="display:flex;align-items:center;justify-content:space-between;
                      margin-bottom:16px;position:relative;">
            <div style="width:42px;height:42px;background:rgba(255,255,255,.2);
                        border-radius:12px;display:flex;align-items:center;
                        justify-content:center;font-size:18px;">
              <i class="fas fa-${c.icon}"></i>
            </div>
          </div>

          <div style="font-size:28px;font-weight:800;letter-spacing:-1px;
                      margin-bottom:4px;position:relative;">
            ${c.val}
          </div>
          <div style="font-size:13px;font-weight:600;opacity:.9;
                      margin-bottom:4px;position:relative;">
            ${c.lbl}
          </div>
          <div style="font-size:11px;opacity:.7;position:relative;">
            ${c.sub}
          </div>
        </div>`).join('');
    }

    // ── Planning du jour ───────────────────────────────────────────
    const listContainer = document.getElementById('docTodayList');
    if (listContainer) {
      if (!data.today_list || !data.today_list.length) {
        listContainer.innerHTML = `
          <div style="text-align:center;padding:40px;color:var(--muted);">
            <i class="fas fa-calendar-check"
               style="font-size:32px;margin-bottom:12px;opacity:.3;display:block;"></i>
            <div style="font-weight:600;margin-bottom:4px;">
              Aucune consultation programmée pour aujourd'hui
            </div>
            <div style="font-size:12px;">
              Consultez le planning pour les autres jours.
            </div>
          </div>`;
      } else {
        const statusLabel = {
          pending: 'En attente',
          confirmed: 'Confirmé',
          completed: 'Terminé',
          cancelled: 'Annulé',
        };
        const statusStyle = {
          pending: 'background:#fff8e1;color:#b45309;',
          confirmed: 'background:#e0f7fa;color:#0a7c6e;',
          completed: 'background:#e8f5e9;color:#388e3c;',
          cancelled: 'background:#fce4ec;color:#c62828;',
        };

        listContainer.innerHTML = data.today_list.map((apt, i) => `
          <div style="
            display:flex;align-items:center;gap:14px;
            padding:14px 20px;
            border-bottom:${i < data.today_list.length - 1 ? '1px solid var(--border)' : 'none'};
            transition:background .15s;
          " onmouseover="this.style.background='var(--bg)'"
             onmouseout="this.style.background='transparent'">

            <!-- Heure -->
            <div style="width:52px;flex-shrink:0;text-align:center;">
              <div style="font-size:15px;font-weight:800;color:var(--teal);">
                ${apt.time}
              </div>
            </div>

            <!-- Séparateur vertical -->
            <div style="width:2px;height:36px;background:var(--border);
                        border-radius:2px;flex-shrink:0;"></div>

            <!-- Avatar + infos -->
            <div style="width:36px;height:36px;border-radius:50%;
                        background:var(--teal-pale);color:var(--teal);
                        display:flex;align-items:center;justify-content:center;
                        font-weight:700;font-size:13px;flex-shrink:0;">
              ${apt.patient_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>

            <div style="flex:1;min-width:0;">
              <div style="font-weight:700;font-size:14px;margin-bottom:2px;">
                ${apt.patient_name}
              </div>
              <div style="font-size:12px;color:var(--muted);
                          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${apt.reason || 'Consultation générale'}
              </div>
            </div>

            <!-- Badge statut -->
            <span style="padding:4px 12px;border-radius:20px;font-size:11px;
                         font-weight:700;flex-shrink:0;
                         ${statusStyle[apt.status] || ''}">
              ${statusLabel[apt.status] || apt.status}
            </span>
          </div>`).join('');
      }
    }

  } catch (err) {
    showToast('Erreur réseau lors du chargement des stats.', 'error');
    console.error('initDoctorDashboard error:', err);
  }
}

// ── Doctor Schedule (tab-doc-schedule) ────────────────────────────────────────
let docScheduleWeekStart = null; // tracks currently displayed week

async function initDocSchedule(weekStart = null) {
  const container = document.getElementById('docScheduleContainer');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center;padding:40px;color:var(--muted);">
      <i class="fas fa-spinner fa-spin" style="font-size:24px;"></i>
    </div>`;

  try {
    const url = 'api/get_doctor_schedule.php' + (weekStart ? `?week_start=${weekStart}` : '');
    const res = await fetch(url, { credentials: 'include' });
    const data = await res.json();

    if (!data.success) {
      container.innerHTML = `<p style="color:var(--rose);padding:20px;">${data.message}</p>`;
      return;
    }

    docScheduleWeekStart = data.week_start;
    renderWeekCalendar(container, data);

  } catch (err) {
    container.innerHTML = `<p style="color:var(--rose);padding:20px;">Erreur réseau.</p>`;
    console.error('initDocSchedule:', err);
  }
}

// ── Doctor Patient List (tab-doc-patients) ────────────────────────────────────
let docPatientsCache = null; // avoid re-fetching when just filtering

async function initDocPatients() {
  const container = document.getElementById('docPatientsContainer');
  if (!container) return;

  // Use cache if available, re-fetch if explicitly null
  if (!docPatientsCache) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px;color:var(--muted);">
        <i class="fas fa-spinner fa-spin" style="font-size:24px;"></i>
      </div>`;

    try {
      const res = await fetch('api/get_doctor_patients.php', { credentials: 'include' });
      const data = await res.json();
      if (!data.success) {
        container.innerHTML = `<p style="color:var(--rose);padding:20px;">${data.message}</p>`;
        return;
      }
      docPatientsCache = data;
    } catch (err) {
      container.innerHTML = `<p style="color:var(--rose);padding:20px;">Erreur réseau.</p>`;
      console.error('initDocPatients:', err);
      return;
    }
  }

  renderDocPatients(container, docPatientsCache, '');
}

function renderDocPatients(container, data, searchTerm) {
  const term = searchTerm.toLowerCase().trim();

  const filtered = data.patients.filter(p =>
    !term
    || p.full_name.toLowerCase().includes(term)
    || (p.email && p.email.toLowerCase().includes(term))
    || (p.phone && p.phone.includes(term))
  );

  const statusColors = {
    confirmed: { bg: '#e0f7fa', color: '#0a7c6e' },
    pending: { bg: '#fff8e1', color: '#b45309' },
    completed: { bg: '#e8f5e9', color: '#388e3c' },
    cancelled: { bg: '#fce4ec', color: '#c62828' },
  };

  // ── Summary bar ──────────────────────────────────────────────────────────
  const summaryHtml = `
    <div style="display:flex;align-items:center;justify-content:space-between;
                flex-wrap:wrap;gap:12px;margin-bottom:16px;">
      <div style="font-size:13px;color:var(--muted);">
        <strong style="color:var(--text);">${filtered.length}</strong>
        patient${filtered.length !== 1 ? 's' : ''} trouvé${filtered.length !== 1 ? 's' : ''}
        ${term ? `pour "<em>${searchTerm}</em>"` : 'au total'}
      </div>
      <button onclick="docPatientsCache=null; initDocPatients();"
              style="font-size:12px;color:var(--teal);background:var(--teal-pale);
                     border:none;padding:6px 14px;border-radius:8px;font-weight:700;cursor:pointer;">
        <i class="fas fa-sync-alt"></i> Actualiser
      </button>
    </div>`;

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!filtered.length) {
    container.innerHTML = summaryHtml + `
      <div style="text-align:center;padding:50px;color:var(--muted);">
        <i class="fas fa-user-slash" style="font-size:32px;margin-bottom:12px;display:block;opacity:.4;"></i>
        ${term ? 'Aucun patient ne correspond à cette recherche.'
        : 'Aucun patient trouvé pour votre service.'}
      </div>`;
    return;
  }

  // ── Patient rows ──────────────────────────────────────────────────────────
  const rows = filtered.map(p => {
    const sc = statusColors[p.last_status] || { bg: '#f1f5f9', color: '#64748b' };
    const initials = p.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const dob = p.dob ? new Date(p.dob).toLocaleDateString('fr-FR') : '—';
    const history = (data.history[p.patient_id] || []).slice(0, 5); // last 5 visits

    // Build collapsible history rows
    const historyRows = history.length
      ? history.map(h => `
          <tr style="background:#f8fafc;">
            <td style="font-size:11px;color:var(--muted);padding:6px 12px;">${h.date}</td>
            <td style="font-size:11px;color:var(--muted);padding:6px 12px;">${h.time}</td>
            <td style="font-size:11px;padding:6px 12px;">${h.reason || 'Consultation générale'}</td>
            <td style="padding:6px 12px;">
              <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;
                           background:${(statusColors[h.status] || { bg: '#f1f5f9' }).bg};
                           color:${(statusColors[h.status] || { color: '#64748b' }).color};">
                ${h.status}
              </span>
            </td>
          </tr>`).join('')
      : `<tr><td colspan="4" style="padding:10px 12px;font-size:12px;color:var(--muted);">
           Aucun historique disponible.
         </td></tr>`;

    return `
      <tr style="border-bottom:1px solid var(--border);cursor:pointer;"
          onclick="togglePatientHistory('ph-${p.patient_id}')">
        <td style="padding:14px 12px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:38px;height:38px;border-radius:12px;background:var(--teal-pale);
                        color:var(--teal);font-weight:800;font-size:13px;flex-shrink:0;
                        display:flex;align-items:center;justify-content:center;">
              ${initials}
            </div>
            <div>
              <div style="font-weight:700;font-size:13px;">${p.full_name}</div>
              <div style="font-size:11px;color:var(--muted);">${p.email}</div>
            </div>
          </div>
        </td>
        <td style="padding:14px 12px;font-size:13px;">
          ${p.phone || '<span style="color:var(--muted);">—</span>'}
        </td>
        <td style="padding:14px 12px;font-size:13px;color:var(--muted);">${dob}</td>
        <td style="padding:14px 12px;font-size:13px;text-align:center;">
          <strong style="color:var(--teal);">${p.total_visits}</strong>
        </td>
        <td style="padding:14px 12px;font-size:12px;color:var(--muted);">${p.last_visit || '—'}</td>
        <td style="padding:14px 12px;">
          <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:8px;
                       background:${sc.bg};color:${sc.color};">
            ${p.last_status || '—'}
          </span>
        </td>
        <td style="padding:14px 12px;font-size:12px;color:var(--teal);">
          <i class="fas fa-chevron-down" style="font-size:10px;"></i> Historique
        </td>
      </tr>
      <!-- Expandable history sub-table -->
      <tr id="ph-${p.patient_id}" style="display:none;">
        <td colspan="7" style="padding:0 12px 12px 60px;background:#f8fafc;">
          <div style="font-size:12px;font-weight:700;color:var(--muted);
                      text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;padding-top:10px;">
            <i class="fas fa-history" style="margin-right:6px;color:var(--teal);"></i>
            Dernières consultations
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="font-size:11px;color:var(--muted);text-transform:uppercase;">
                <th style="padding:4px 12px;text-align:left;">Date</th>
                <th style="padding:4px 12px;text-align:left;">Heure</th>
                <th style="padding:4px 12px;text-align:left;">Motif</th>
                <th style="padding:4px 12px;text-align:left;">Statut</th>
              </tr>
            </thead>
            <tbody>${historyRows}</tbody>
          </table>
        </td>
      </tr>`;
  }).join('');

  container.innerHTML = summaryHtml + `
    <div style="overflow-x:auto;">
      <table class="data-table" style="width:100%;">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Téléphone</th>
            <th>Date de naissance</th>
            <th style="text-align:center;">Visites</th>
            <th>Dernière visite</th>
            <th>Dernier statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function togglePatientHistory(rowId) {
  const row = document.getElementById(rowId);
  if (!row) return;
  const isHidden = row.style.display === 'none';
  row.style.display = isHidden ? 'table-row' : 'none';
}

async function initDocStatus() {
  const container = document.getElementById('docStatusContainer');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center;padding:40px;color:var(--muted);">
      <i class="fas fa-spinner fa-spin" style="font-size:24px;"></i>
    </div>`;

  try {
    const res = await fetch('api/get_doctor_stats.php', { credentials: 'include' });
    const data = await res.json();

    if (!data.success) {
      container.innerHTML = `<p style="color:var(--rose);padding:20px;">${data.message}</p>`;
      return;
    }

    if (!data.today_list || !data.today_list.length) {
      container.innerHTML = `
        <div style="text-align:center;padding:50px 20px;color:var(--muted);">
          <i class="fas fa-calendar-check"
             style="font-size:36px;margin-bottom:14px;opacity:.35;display:block;"></i>
          <div style="font-weight:600;margin-bottom:6px;">Aucun rendez-vous aujourd'hui</div>
          <div style="font-size:12px;">Consultez le planning pour les autres jours.</div>
        </div>`;
      return;
    }

    const labelMap = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      completed: 'Terminé',
      cancelled: 'Annulé',
    };
    const styleMap = {
      pending: 'background:#fff8e1;color:#b45309;',
      confirmed: 'background:#e0f7fa;color:#0a7c6e;',
      completed: 'background:#e8f5e9;color:#388e3c;',
      cancelled: 'background:#fce4ec;color:#c62828;',
    };
    const nextActions = {
      pending: [{ label: 'Confirmer', icon: 'check', next: 'confirmed' },
      { label: 'Annuler', icon: 'times', next: 'cancelled' }],
      confirmed: [{ label: 'Terminer', icon: 'flag-checkered', next: 'completed' },
      { label: 'Annuler', icon: 'times', next: 'cancelled' }],
      completed: [],
      cancelled: [],
    };
    const btnColor = { confirmed: 'var(--teal)', completed: '#388e3c', cancelled: '#d94f7a' };

    const rows = data.today_list.map(apt => {
      const actions = (nextActions[apt.status] || []).map(a => `
        <button
          onclick="changeAppointmentStatus(${apt.id}, '${a.next}')"
          style="font-size:11px;font-weight:700;color:#fff;
                 background:${btnColor[a.next] || 'var(--teal)'};
                 border:none;padding:5px 12px;border-radius:8px;
                 cursor:pointer;margin-right:4px;white-space:nowrap;">
          <i class="fas fa-${a.icon}" style="margin-right:4px;"></i>${a.label}
        </button>`).join('');

      return `
        <tr id="status-row-${apt.id}" style="transition:opacity .3s;">
          <td style="font-weight:600;">${apt.patient_name}</td>
          <td style="color:var(--muted);font-size:13px;">${apt.time}</td>
          <td style="font-size:12px;color:var(--muted);">${apt.reason || 'Consultation'}</td>
          <td>
            <span style="padding:4px 10px;border-radius:10px;font-size:12px;
                         font-weight:700;${styleMap[apt.status] || ''}">
              ${labelMap[apt.status] || apt.status}
            </span>
          </td>
          <td style="white-space:nowrap;">
            ${actions || '<span style="color:var(--muted);font-size:12px;">—</span>'}
          </td>
        </tr>`;
    }).join('');

    container.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="data-table" style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;padding:10px 12px;font-size:12px;
                         color:var(--muted);border-bottom:1px solid var(--border);">Patient</th>
              <th style="text-align:left;padding:10px 12px;font-size:12px;
                         color:var(--muted);border-bottom:1px solid var(--border);">Heure</th>
              <th style="text-align:left;padding:10px 12px;font-size:12px;
                         color:var(--muted);border-bottom:1px solid var(--border);">Motif</th>
              <th style="text-align:left;padding:10px 12px;font-size:12px;
                         color:var(--muted);border-bottom:1px solid var(--border);">Statut</th>
              <th style="text-align:left;padding:10px 12px;font-size:12px;
                         color:var(--muted);border-bottom:1px solid var(--border);">Actions</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

  } catch (err) {
    container.innerHTML = `<p style="color:var(--rose);padding:20px;">Erreur réseau. Réessayez.</p>`;
    console.error('initDocStatus:', err);
  }
}

async function changeAppointmentStatus(aptId, newStatus) {
  const row = document.getElementById('status-row-' + aptId);
  if (row) row.style.opacity = '0.4';

  try {
    const res = await fetch('api/update_appointment_status.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: aptId, status: newStatus }),
    });
    const data = await res.json();

    if (data.success) {
      const labels = { confirmed: 'Confirmé ✓', completed: 'Terminé ✓', cancelled: 'Annulé' };
      showToast(`Statut mis à jour : ${labels[newStatus] || newStatus}`, 'success');
      initDocStatus();
      const overviewTab = document.getElementById('tab-doc-overview');
      if (overviewTab && overviewTab.classList.contains('active')) {
        initDoctorDashboard();
      }
    } else {
      if (row) row.style.opacity = '1';
      showToast(data.message || 'Erreur lors de la mise à jour.', 'error');
    }

  } catch (err) {
    if (row) row.style.opacity = '1';
    showToast('Erreur réseau.', 'error');
    console.error('changeAppointmentStatus:', err);
  }
}

function filterDocPatients(term) {
  const container = document.getElementById('docPatientsContainer');
  if (!container || !docPatientsCache) return;
  renderDocPatients(container, docPatientsCache, term);
}


// Parse 'YYYY-MM-DD' en heure LOCALE — évite le décalage UTC de new Date('YYYY-MM-DD')
function parseLocalDate(str) {
  if (!str) return new Date(NaN);
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}
// Formate un Date local en 'YYYY-MM-DD' sans passer par toISOString()
function fmtLocalDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function renderWeekCalendar(container, data) {
  const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  // Build array of 7 date strings for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = parseLocalDate(data.week_start);
    d.setDate(d.getDate() + i);
    return fmtLocalDate(d);
  });

  const today = fmtLocalDate(new Date());

  // Group appointments by date
  const byDate = {};
  (data.appointments || []).forEach(apt => {
    if (!apt.date) return;
    if (!byDate[apt.date]) byDate[apt.date] = [];
    byDate[apt.date].push(apt);
  });

  // Prev / Next week dates
  const prevWeek = parseLocalDate(data.week_start);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = parseLocalDate(data.week_start);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const fmt = d => fmtLocalDate(d);

  // Header label e.g. "26 Mai – 1 Jun 2026"
  const startD = parseLocalDate(data.week_start);
  const endD = parseLocalDate(data.week_end);
  const weekLabel = `${startD.getDate()} ${MONTHS_FR[startD.getMonth()]} – ${endD.getDate()} ${MONTHS_FR[endD.getMonth()]} ${endD.getFullYear()}`;

  container.innerHTML = `
    <!-- Week navigator -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
      <button onclick="initDocSchedule('${fmt(prevWeek)}')"
              style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:8px 16px;cursor:pointer;font-weight:600;color:var(--text);">
        <i class="fas fa-chevron-left"></i> Semaine préc.
      </button>
      <span style="font-weight:700;font-size:15px;color:var(--text);">
        <i class="fas fa-calendar-week" style="color:var(--teal);margin-right:8px;"></i>${weekLabel}
      </span>
      <button onclick="initDocSchedule('${fmt(nextWeek)}')"
              style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:8px 16px;cursor:pointer;font-weight:600;color:var(--text);">
        Semaine suiv. <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- 7-column grid -->
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px;">
      ${weekDates.map((dateStr, i) => {
    const d = parseLocalDate(dateStr);
    const isToday = dateStr === today;
    const slots = byDate[dateStr] || [];

    return `
          <div style="
            background:${isToday ? 'var(--teal-pale)' : 'var(--surface)'};
            border:2px solid ${isToday ? 'var(--teal)' : 'var(--border)'};
            border-radius:14px;
            padding:12px 8px;
            min-height:140px;
          ">
            <!-- Day header -->
            <div style="text-align:center;margin-bottom:10px;">
              <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;">
                ${DAYS_FR[i]}
              </div>
              <div style="
                font-size:18px;font-weight:800;
                color:${isToday ? 'var(--teal)' : 'var(--text)'};
                width:32px;height:32px;border-radius:50%;
                background:${isToday ? 'var(--teal)' : 'transparent'};
                color:${isToday ? '#fff' : 'var(--text)'};
                display:flex;align-items:center;justify-content:center;margin:4px auto 0;
              ">${d.getDate()}</div>
            </div>

            <!-- Slots -->
            ${slots.length === 0
        ? `<div style="text-align:center;font-size:11px;color:var(--muted);margin-top:16px;opacity:.6;">
                   <i class="fas fa-moon"></i><br>Libre
                 </div>`
        : slots.map(apt => `
                  <div style="
                    background:${statusSlotColor(apt.status)};
                    border-radius:8px;
                    padding:6px 8px;
                    margin-bottom:6px;
                    cursor:default;
                  " title="${apt.patient_name} — ${apt.reason || 'Consultation'}">
                    <div style="font-size:11px;font-weight:700;color:#fff;">
                      ${apt.time}
                    </div>
                    <div style="font-size:10px;color:rgba(255,255,255,.85);
                                white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;">
                      ${apt.patient_name}
                    </div>
                  </div>`).join('')
      }
          </div>`;
  }).join('')}
    </div>

    <!-- Legend -->
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:16px;font-size:12px;color:var(--muted);">
      ${[
      ['#0a7c6e', 'Confirmé'],
      ['#f59e0b', 'En attente'],
      ['#388e3c', 'Terminé'],
      ['#d94f7a', 'Annulé'],
    ].map(([c, lbl]) => `
        <span style="display:flex;align-items:center;gap:6px;">
          <span style="width:12px;height:12px;border-radius:4px;background:${c};display:inline-block;"></span>${lbl}
        </span>`).join('')}
    </div>`;
}

function statusSlotColor(status) {
  return {
    confirmed: '#0a7c6e',
    pending: '#f59e0b',
    completed: '#388e3c',
    cancelled: '#94a3b8',
  }[status] || '#64748b';
}

function renderPatientApptsTable(apts) {
  const el = document.getElementById('patientApptsTable');
  if (!el) return;
  if (!apts.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);">No appointments yet. <a style="color:var(--teal);font-weight:700;cursor:pointer;" onclick="goPage(\'booking\')">Book your first appointment →</a></div>'; return; }
  el.innerHTML = `<div style="overflow-x:auto;"><table class="data-table">
      <thead><tr><th>Appointment</th><th>Doctor</th><th>Date & Time</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${apts.map(a => `
        <tr>
          <td><div style="font-weight:700;font-size:13px;">${a.service}</div><div style="font-size:11px;color:var(--muted);">#${a.id}</div></td>
          <td>${a.doctor}</td>
          <td><div style="font-weight:600;">${a.date}</div><div style="font-size:11px;color:var(--muted);">${a.time}</div></td>
          <td><span class="status-badge status-${a.status}">${a.status}</span></td>
          <td>${['pending', 'confirmed'].includes(a.status) ? `<button onclick="cancelPatientApt('${a.id}')" style="font-size:11px;color:var(--rose);background:var(--rose-lt);border:none;padding:4px 10px;border-radius:8px;font-weight:700;cursor:pointer;">Cancel</button>` : ''}</td>
        </tr>`).join('')}
      </tbody></table></div>`;
}

function cancelPatientApt(id) {
  const apt = App.appointments.find(a => a.id === id);
  if (!apt) return;
  apt.status = 'cancelled';
  showToast('Appointment cancelled.', 'info');
  initDashboard();
}

function renderHistory(apts) {
  const el = document.getElementById('historyList');
  if (!el) return;
  if (!apts.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted);">No past appointments found.</div>'; return; }
  el.innerHTML = apts.map(a => `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:10px;display:flex;align-items:center;gap:16px;opacity:${a.status === 'cancelled' ? .65 : 1}">
        <div style="width:48px;height:48px;background:${a.status === 'completed' ? 'var(--teal-pale)' : 'var(--rose-lt)'};border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas fa-${a.status === 'completed' ? 'check-circle' : 'times-circle'}" style="color:${a.status === 'completed' ? 'var(--teal)' : 'var(--rose)'};font-size:18px;"></i></div>
        <div style="flex:1;"><div style="font-weight:700;font-size:14px;">${a.service}</div><div style="font-size:12px;color:var(--teal);font-weight:600;">${a.doctor}</div><div style="font-size:11px;color:var(--muted);margin-top:3px;"><i class="fas fa-calendar" style="margin-right:4px;"></i>${a.date} · ${a.time}${a.notes ? ` · <em>${a.notes}</em>` : ''}</div></div>
        <span class="status-badge status-${a.status}">${a.status}</span>
      </div>`).join('');
}

function renderProfileCard(user) {
  const pc = document.getElementById('profileCard');
  if (pc) pc.innerHTML = `
      <div class="profile-card">
        <div class="profile-header"></div>
        <div class="profile-avatar">${user.initials}</div>
        <div class="profile-body">
          <div class="profile-name">${user.firstName} ${user.lastName || ''}</div>
          <div class="profile-role">Patient · NovaCare</div>
          <div class="profile-info-grid">
            ${[{ lbl: 'Email', val: user.email }, { lbl: 'Phone', val: user.phone || '—' }, { lbl: 'Date of Birth', val: user.dob || '—' }, { lbl: 'Blood Type', val: user.bloodType || '—' }, { lbl: 'Insurance', val: user.insurance || '—' }, { lbl: 'Emergency Contact', val: user.emergencyContact || '—' }].map(f => `
              <div class="profile-info-item"><div class="profile-info-lbl">${f.lbl}</div><div class="profile-info-val">${f.val}</div></div>`).join('')}
          </div>
          <button class="edit-profile-btn" onclick="showToast('Profile editing coming soon!','info')"><i class="fas fa-edit"></i> Edit Profile</button>
        </div>
      </div>`;

  const pf = document.getElementById('profileForm');
  if (pf) pf.innerHTML = `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:24px;">
        <h3 style="font-weight:700;font-size:16px;margin-bottom:20px;">Update Information</h3>
        <div class="form-row">
          <div class="form-group"><label class="form-label">First Name</label><input class="form-control" type="text" value="${user.firstName}" id="pfFirst"></div>
          <div class="form-group"><label class="form-label">Last Name</label><input class="form-control" type="text" value="${user.lastName || ''}" id="pfLast"></div>
        </div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-control" type="email" value="${user.email}" id="pfEmail"></div>
        <div class="form-group"><label class="form-label">Phone</label><input class="form-control" type="tel" value="${user.phone || ''}" id="pfPhone"></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Blood Type</label><select class="form-control" id="pfBlood"><option>—</option>${['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => `<option ${user.bloodType === b ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Insurance</label><input class="form-control" type="text" value="${user.insurance || ''}" id="pfInsurance"></div>
        </div>
        <button class="btn-submit" onclick="saveProfile()"><i class="fas fa-save"></i> Save Changes</button>
      </div>`;
}

function saveProfile() {
  if (!App.currentUser) return;
  App.currentUser.firstName = document.getElementById('pfFirst').value;
  App.currentUser.lastName = document.getElementById('pfLast').value;
  App.currentUser.email = document.getElementById('pfEmail').value;
  App.currentUser.phone = document.getElementById('pfPhone').value;
  App.currentUser.bloodType = document.getElementById('pfBlood').value;
  App.currentUser.insurance = document.getElementById('pfInsurance').value;
  App.currentUser.initials = (App.currentUser.firstName[0] + (App.currentUser.lastName?.[0] || '')).toUpperCase();
  sessionStorage.setItem('ncUser', JSON.stringify(App.currentUser));
  updateNavForUser();
  renderProfileCard(App.currentUser);
  showToast('Profile updated successfully!', 'success');
}

function switchDashTab(tab) {
  document.querySelectorAll('#page-dashboard .dash-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('[id^="sdb-"]').forEach(i => i.classList.remove('active'));
  document.getElementById(`tab-${tab}`)?.classList.add('active');
  document.getElementById(`sdb-${tab}`)?.classList.add('active');

  // Lazy-load data for tabs that need it
  if (tab === 'doc-schedule') initDocSchedule();
  if (tab === 'doc-patients') initDocPatients();   // task #3 — stub for now
  if (tab === 'doc-status') initDocStatus();     // task #4 — stub for now
}

/* ---------
   ADMIN DASHBOARD
--------- */
function initAdmin() {
  const now = new Date();
  document.getElementById('adminDate').textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  // Stats, recent apts, patients & activity feed are all loaded dynamically
  loadAdminDashboard();
  renderAdminChat();
  renderSettings();
}

function renderAdminStats() {
  const el = document.getElementById('adminStats');
  if (!el) return;
  const total = App.appointments.length;
  const pending = App.appointments.filter(a => a.status === 'pending').length;
  const confirmed = App.appointments.filter(a => a.status === 'confirmed').length;
  const patients = App.patients.length;
  el.innerHTML = [
    { icon: 'calendar-alt', color: '#e0f7fa', iconColor: 'var(--teal)', val: total, lbl: 'Total Appointments', trend: '+3 today', up: true },
    { icon: 'clock', color: '#fff3e0', iconColor: '#f57c00', val: pending, lbl: 'Pending Review', trend: 'Need attention', up: false },
    { icon: 'check-circle', color: '#e8f5e9', iconColor: '#388e3c', val: confirmed, lbl: 'Confirmed', trend: 'This week', up: true },
    { icon: 'users', color: '#f3e5f5', iconColor: '#7b1fa2', val: patients, lbl: 'Total Patients', trend: '+1 new', up: true },
  ].map(s => `
      <div class="stat-card">
        <div class="stat-top">
          <div class="stat-icon" style="background:${s.color};color:${s.iconColor};"><i class="fas fa-${s.icon}"></i></div>
          <div class="stat-trend ${s.up ? 'up' : 'down'}"><i class="fas fa-arrow-${s.up ? 'up' : 'down'}"></i>${s.trend}</div>
        </div>
        <div class="stat-val">${s.val}</div>
        <div class="stat-lbl">${s.lbl}</div>
      </div>`).join('');
}

function renderAdminRecentApts() {
  const el = document.getElementById('adminRecentApts');
  if (!el) return;
  el.innerHTML = `<div style="overflow-x:auto;"><table class="data-table">
      <thead><tr><th>Patient</th><th>Service</th><th>Date</th><th>Status</th></tr></thead>
      <tbody>${App.appointments.slice(0, 5).map(a => `
        <tr>
          <td style="font-weight:600;">${a.patient}</td>
          <td style="font-size:12px;color:var(--muted);">${a.service}</td>
          <td style="font-size:12px;">${a.date}</td>
          <td><span class="status-badge status-${a.status}">${a.status}</span></td>
        </tr>`).join('')}
      </tbody></table></div>`;
}

function formatActivityTime(dateStr) {
  if (!dateStr) return '—';
  // Replace '-' with '/' to make it compatible across all browser engines
  const date = new Date(dateStr.replace(/-/g, '/'));
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

async function loadAdminDashboard() {
  const recentTable = document.getElementById('adminRecentAppointmentsTable');
  const feedContainer = document.getElementById('adminActivityFeed');

  try {
    const res = await fetch('api/get_admin_dashboard.php', { credentials: 'include' });

    // Si le fichier PHP renvoie une erreur système (ex: Erreur 500)
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Erreur brute du serveur:", errorText);
      if (recentTable) recentTable.innerHTML = `<tr><td colspan="4" style="color:red; padding:10px;">Erreur Serveur HTTP ${res.status}</td></tr>`;
      return;
    }

    const data = await res.json();

    // Si le script PHP a intercepté une mauvaise colonne ou table SQL
    if (!data.success) {
      console.error("Détails de l'erreur renvoyée par le PHP:", data.message);
      if (recentTable) recentTable.innerHTML = `<tr><td colspan="4" style="color:red; padding:15px; font-weight:bold;"><i class="fas fa-exclamation-triangle"></i> ${data.message}</td></tr>`;
      if (feedContainer) feedContainer.innerHTML = `<div style="color:red; padding:15px;">Détails : ${data.message}</div>`;
      return;
    }

    // 1. Remplissage des compteurs
    if (data.stats) {
      if (document.getElementById('stat-total-appointments')) document.getElementById('stat-total-appointments').innerText = data.stats.total_appointments;
      if (document.getElementById('stat-pending-review')) document.getElementById('stat-pending-review').innerText = data.stats.pending_reviews;
      if (document.getElementById('stat-confirmed-appointments')) document.getElementById('stat-confirmed-appointments').innerText = data.stats.confirmed_appointments;
      if (document.getElementById('stat-total-patients')) document.getElementById('stat-total-patients').innerText = data.stats.total_patients;
    }

    // 2. Remplissage du tableau des rendez-vous
    if (recentTable) {
      if (!data.recent_appointments || data.recent_appointments.length === 0) {
        recentTable.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--muted);">Aucun rendez-vous trouvé dans la base.</td></tr>`;
      } else {
        recentTable.innerHTML = data.recent_appointments.map(apt => {
          let badgeStyle = 'background:rgba(255,193,7,0.1); color:#ffc107;';
          let statusLabel = 'En attente';

          if (apt.status === 'confirmed' || apt.status === 'Confirmé') {
            badgeStyle = 'background:rgba(40,167,69,0.1); color:#28a745;';
            statusLabel = 'Confirmé';
          } else if (apt.status === 'completed' || apt.status === 'Terminé') {
            badgeStyle = 'background:rgba(108,117,125,0.1); color:#6c757d;';
            statusLabel = 'Terminé';
          }

          return `
                        <tr>
                            <td><strong>${apt.patient_name}</strong></td>
                            <td style="color:var(--muted); font-size:14px;">${apt.reason}</td>
                            <td>${apt.appointment_date}</td>
                            <td><span class="status-badge" style="padding:4px 8px; border-radius:12px; font-size:12px; font-weight:600; ${badgeStyle}">${statusLabel}</span></td>
                        </tr>
                    `;
        }).join('');
      }
    }

    // 3. Remplissage du flux d'activité
    if (feedContainer) {
      if (!data.activities || data.activities.length === 0) {
        feedContainer.innerHTML = `<div style="padding:20px; text-align:center; color:var(--muted);">Aucune activité récente.</div>`;
      } else {
        feedContainer.innerHTML = data.activities.map(act => {
          return `
                        <div style="display:flex; align-items:center; gap:15px; padding:12px 0; border-bottom:1px solid var(--border);">
                            <div style="background:#e0f7fa; color:var(--teal); width:35px; height:35px; display:flex; align-items:center; justify-content:center; border-radius:50%;"><i class="far fa-calendar-alt"></i></div>
                            <div style="flex:1;">
                                <p style="margin:0; font-size:14px;">Rendez-vous trouvé pour <strong>${act.patient_name}</strong></p>
                                <small style="color:var(--muted);">${act.activity_time}</small>
                            </div>
                        </div>`;
        }).join('');
      }
    }

  } catch (err) {
    console.error("Erreur critique JS:", err);
    if (recentTable) recentTable.innerHTML = `<tr><td colspan="4" style="color:red; padding:10px;">Erreur de décodage JSON ou réseau.</td></tr>`;
  }
}

let _adminAptsCache = [];

async function initAdminAppointments() {
  const el = document.getElementById('adminAptsTable');
  if (!el) return;

  el.innerHTML = `
    <div style="text-align:center;padding:40px;color:var(--muted);">
      <i class="fas fa-spinner fa-spin" style="font-size:24px;"></i>
    </div>`;

  try {
    const res = await fetch('api/get_all_appointments.php', { credentials: 'include' });
    const data = await res.json();
    if (!data.success) {
      el.innerHTML = `<p style="color:var(--rose);padding:20px;">${data.message}</p>`;
      return;
    }
    _adminAptsCache = data.appointments;
    renderAdminAptsTable(_adminAptsCache);
  } catch (err) {
    el.innerHTML = `<p style="color:var(--rose);padding:20px;">Erreur réseau.</p>`;
    console.error('initAdminAppointments:', err);
  }
}

function renderAdminAptsTable(apts) {
  const el = document.getElementById('adminAptsTable');
  if (!el) return;

  const statusLabel = {
    pending: 'En attente', confirmed: 'Confirmé',
    completed: 'Terminé', cancelled: 'Annulé'
  };
  const statusStyle = {
    pending: 'background:#fff8e1;color:#b45309;',
    confirmed: 'background:#e0f7fa;color:#0a7c6e;',
    completed: 'background:#e8f5e9;color:#388e3c;',
    cancelled: 'background:#fce4ec;color:#c62828;',
  };

  if (!apts.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:50px;color:var(--muted);">
        <i class="fas fa-calendar-times"
           style="font-size:32px;margin-bottom:12px;display:block;opacity:.4;"></i>
        Aucun rendez-vous trouvé.
      </div>`;
    return;
  }

  el.innerHTML = `
    <div style="overflow-x:auto;">
      <table class="data-table" style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="padding:10px 12px;font-size:12px;color:var(--muted);
                       border-bottom:1px solid var(--border);text-align:left;">ID</th>
            <th style="padding:10px 12px;font-size:12px;color:var(--muted);
                       border-bottom:1px solid var(--border);text-align:left;">Patient</th>
            <th style="padding:10px 12px;font-size:12px;color:var(--muted);
                       border-bottom:1px solid var(--border);text-align:left;">Médecin</th>
            <th style="padding:10px 12px;font-size:12px;color:var(--muted);
                       border-bottom:1px solid var(--border);text-align:left;">Service</th>
            <th style="padding:10px 12px;font-size:12px;color:var(--muted);
                       border-bottom:1px solid var(--border);text-align:left;">Date & Heure</th>
            <th style="padding:10px 12px;font-size:12px;color:var(--muted);
                       border-bottom:1px solid var(--border);text-align:left;">Statut</th>
            <th style="padding:10px 12px;font-size:12px;color:var(--muted);
                       border-bottom:1px solid var(--border);text-align:left;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${apts.map(a => {
    const canConfirm = a.status === 'pending';
    const canComplete = a.status === 'confirmed';
    const canCancel = ['pending', 'confirmed'].includes(a.status);
    return `
              <tr style="border-bottom:1px solid var(--border);">
                <td style="padding:10px 12px;font-family:monospace;
                           font-size:11px;color:var(--muted);">#${a.id}</td>
                <td style="padding:10px 12px;">
                  <div style="font-weight:700;font-size:13px;">${a.patient}</div>
                  <div style="font-size:11px;color:var(--muted);">${a.email}</div>
                </td>
                <td style="padding:10px 12px;font-size:13px;">${a.doctor}</td>
                <td style="padding:10px 12px;font-size:12px;
                           color:var(--muted);">${a.service}</td>
                <td style="padding:10px 12px;">
                  <div style="font-weight:600;font-size:13px;">${a.date}</div>
                  <div style="font-size:11px;color:var(--muted);">${a.time}</div>
                </td>
                <td style="padding:10px 12px;">
                  <span style="padding:4px 10px;border-radius:10px;font-size:12px;
                               font-weight:700;${statusStyle[a.status] || ''}">
                    ${statusLabel[a.status] || a.status}
                  </span>
                </td>
                <td style="padding:10px 12px;white-space:nowrap;">
                  ${canConfirm ? `<button onclick="updateAdminAptStatus(${a.id},'confirmed')"
                    style="font-size:11px;color:#fff;background:var(--teal);border:none;
                           padding:5px 10px;border-radius:7px;cursor:pointer;
                           margin-right:4px;font-weight:700;">
                    <i class="fas fa-check" style="margin-right:3px;"></i>Confirmer
                  </button>` : ''}
                  ${canComplete ? `<button onclick="updateAdminAptStatus(${a.id},'completed')"
                    style="font-size:11px;color:#fff;background:#388e3c;border:none;
                           padding:5px 10px;border-radius:7px;cursor:pointer;
                           margin-right:4px;font-weight:700;">
                    <i class="fas fa-flag-checkered" style="margin-right:3px;"></i>Terminer
                  </button>` : ''}
                  ${canCancel ? `<button onclick="updateAdminAptStatus(${a.id},'cancelled')"
                    style="font-size:11px;color:#fff;background:#d94f7a;border:none;
                           padding:5px 10px;border-radius:7px;cursor:pointer;font-weight:700;">
                    <i class="fas fa-times" style="margin-right:3px;"></i>Annuler
                  </button>` : ''}
                  ${!canConfirm && !canComplete && !canCancel
        ? '<span style="font-size:12px;color:var(--muted);">—</span>' : ''}
                </td>
              </tr>`;
  }).join('')}
        </tbody>
      </table>
    </div>`;
}

async function updateAdminAptStatus(id, newStatus) {
  try {
    const res = await fetch('api/update_appointment_status.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: parseInt(id, 10), status: newStatus }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Statut mis à jour avec succès.', 'success');
      initAdminAppointments();
    } else {
      showToast(data.message || 'Erreur lors de la mise à jour.', 'error');
    }
  } catch (err) {
    showToast('Erreur réseau.', 'error');
    console.error('updateAdminAptStatus:', err);
  }
}

function filterAdminApts(q) {
  App.filterApts = (q || '').toLowerCase();
  _applyAdminAptFilters();
}
function filterAdminAptsByStatus(s) {
  App.filterAptStatus = s || '';
  _applyAdminAptFilters();
}
function _applyAdminAptFilters() {
  let apts = _adminAptsCache;
  if (App.filterApts) {
    const q = App.filterApts;
    apts = apts.filter(a =>
      (a.patient || '').toLowerCase().includes(q) ||
      (a.doctor || '').toLowerCase().includes(q) ||
      (a.service || '').toLowerCase().includes(q) ||
      String(a.id).includes(q)
    );
  }
  if (App.filterAptStatus) {
    apts = apts.filter(a => a.status === App.filterAptStatus);
  }
  renderAdminAptsTable(apts);
}

function renderAdminPatientsTable(pts) {
  const el = document.getElementById('adminPatientTable');
  if (!el) return;
  if (!pts.length) {
    el.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--muted);">No patients registered</td></tr>`;
    return;
  }
  el.innerHTML = pts.map(p => `
        <tr>
          <td><div style="font-weight:700;">${p.name}</div><div style="font-size:11px;color:var(--muted);">#PAT00${p.id}</div></td>
          <td><div style="font-size:12px;">${p.email}</div><div style="font-size:11px;color:var(--muted);">${p.phone}</div></td>
          <td style="font-weight:700;">${p.bloodType}</td>
          <td style="font-size:12px;">${p.insurance}</td>
          <td style="font-weight:700;text-align:center;">${p.visits}</td>
          <td style="font-size:12px;">${p.lastVisit}</td>
          <td><span class="status-badge status-confirmed">${p.status}</span></td>
        </tr>`).join('');
}
function filterPatients(q) {
  const pts = App.patients.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.email.toLowerCase().includes(q.toLowerCase()));
  renderAdminPatientsTable(pts);
}

function renderAdminChat() {
  const el = document.getElementById('adminChatLayout');
  if (!el) return;
  const convs = App.adminConvs;
  el.innerHTML = `
      <div class="chat-users-list">
        <div class="chat-users-header">
          <div class="chat-users-title">Conversations <span style="font-size:11px;background:var(--rose);color:#fff;padding:2px 7px;border-radius:10px;margin-left:6px;">${convs.reduce((s, c) => s + c.unread, 0)}</span></div>
          <div class="chat-users-search"><i class="fas fa-search"></i><input type="text" placeholder="Search users…"></div>
        </div>
        <div class="chat-users-items">
          ${convs.map(c => `
            <div class="chat-user-item ${c.id === App.adminActiveConv ? 'active' : ''}" onclick="selectAdminConv('${c.id}')">
              <div class="chat-user-avatar" style="background:${c.avatarColor};">${c.avatar}${c.online ? '<div class="online-dot"></div>' : ''}</div>
              <div style="flex:1;min-width:0;">
                <div class="chat-user-name">${c.userName}</div>
                <div class="chat-user-last">${c.lastMsg}</div>
              </div>
              <div class="chat-user-meta">
                <div class="chat-user-time">${c.lastTime}</div>
                ${c.unread > 0 ? `<div class="chat-unread">${c.unread}</div>` : ''}
              </div>
            </div>`).join('')}
        </div>
      </div>
      ${renderAdminChatWindow(App.adminActiveConv)}`;
}

function renderAdminChatWindow(convId) {
  const conv = App.adminConvs.find(c => c.id === convId);
  if (!conv) return '<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--muted);">Select a conversation</div>';
  return `
      <div class="admin-chat-window">
        <div class="admin-chat-header">
          <div class="chat-user-avatar" style="background:${conv.avatarColor};width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;flex-shrink:0;">${conv.avatar}</div>
          <div><div style="font-weight:700;font-size:14px;">${conv.userName}</div><div style="font-size:11px;color:${conv.online ? '#22c55e' : 'var(--muted)'};">${conv.online ? '● Online' : '● Offline'}</div></div>
        </div>
        <div class="admin-chat-msgs" id="adminChatMsgs">
          ${conv.messages.map(m => `
            <div style="display:flex;${m.sender === 'admin' ? 'justify-content:flex-end;' : ''}gap:8px;align-items:flex-end;">
              ${m.sender === 'user' ? `<div style="width:28px;height:28px;border-radius:50%;background:${conv.avatarColor};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0;">${conv.avatar}</div>` : ''}
              <div>
                <div style="max-width:320px;padding:10px 14px;border-radius:${m.sender === 'admin' ? '16px 4px 16px 16px' : '4px 16px 16px 16px'};font-size:13px;background:${m.sender === 'admin' ? 'linear-gradient(135deg,var(--teal),var(--teal-lt))' : 'var(--surface2)'};color:${m.sender === 'admin' ? '#fff' : 'var(--text)'};border:${m.sender === 'user' ? '1px solid var(--border)' : 'none'};">${m.text}</div>
                <div style="font-size:10px;color:var(--muted);margin-top:3px;${m.sender === 'admin' ? 'text-align:right;' : ''}">${m.time}</div>
              </div>
            </div>`).join('')}
        </div>
        <div class="admin-chat-input-bar">
          <input type="text" class="admin-chat-input" id="adminChatInput" placeholder="Type a reply…" onkeydown="if(event.key==='Enter')sendAdminMsg()">
          <button class="admin-chat-send" onclick="sendAdminMsg()"><i class="fas fa-paper-plane"></i> Send</button>
        </div>
      </div>`;
}

function selectAdminConv(id) {
  App.adminActiveConv = id;
  const c = App.adminConvs.find(x => x.id === id);
  if (c) c.unread = 0;
  renderAdminChat();
  setTimeout(() => { const el = document.getElementById('adminChatMsgs'); if (el) el.scrollTop = el.scrollHeight; }, 50);
}

function sendAdminMsg() {
  const inp = document.getElementById('adminChatInput');
  if (!inp || !inp.value.trim()) return;
  const conv = App.adminConvs.find(c => c.id === App.adminActiveConv);
  if (!conv) return;
  conv.messages.push({ id: Date.now(), text: inp.value.trim(), sender: 'admin', time: getNow() });
  conv.lastMsg = inp.value.trim(); conv.lastTime = 'Just now';
  inp.value = '';
  renderAdminChat();
  setTimeout(() => { const el = document.getElementById('adminChatMsgs'); if (el) el.scrollTop = el.scrollHeight; }, 50);
}

function renderSettings() {
  const el = document.getElementById('settingsContent');
  if (!el) return;
  el.innerHTML = `
      <div class="grid-2">
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:24px;">
          <h3 style="font-weight:700;font-size:16px;margin-bottom:20px;">Clinic Information</h3>
          <div class="form-group"><label class="form-label">Clinic Name</label><input class="form-control" type="text" value="OptiMed Clinic"></div>
          <div class="form-group"><label class="form-label">Phone</label><input class="form-control" type="text" value="+212 688 003 790"></div>
          <div class="form-group"><label class="form-label">Email</label><input class="form-control" type="email" value="contact@optimed.com"></div>
          <div class="form-group"><label class="form-label">Address</label><textarea class="form-control" rows="2">400, Tetouan, 43000</textarea></div>
          <button class="btn-submit" onclick="showToast('Settings saved!','success')"><i class="fas fa-save"></i> Save Changes</button>
        </div>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:24px;">
          <h3 style="font-weight:700;font-size:16px;margin-bottom:20px;">Working Hours</h3>
          ${[['Monday', '8:00 AM', '6:00 PM'], ['Tuesday', '8:00 AM', '6:00 PM'], ['Wednesday', '8:00 AM', '6:00 PM'], ['Thursday', '8:00 AM', '6:00 PM'], ['Friday', '8:00 AM', '6:00 PM'], ['Saturday', '9:00 AM', '2:00 PM'], ['Sunday', 'Closed', '—']].map(([day, open, close]) => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
              <span style="font-size:13px;font-weight:600;width:90px;flex-shrink:0;">${day}</span>
              <input class="form-control" type="text" value="${open}" style="flex:1;font-size:12px;padding:8px 10px;">
              <span style="color:var(--muted);font-size:12px;">–</span>
              <input class="form-control" type="text" value="${close}" style="flex:1;font-size:12px;padding:8px 10px;">
            </div>`).join('')}
          <button class="btn-submit mt-6" onclick="showToast('Hours updated!','success')"><i class="fas fa-clock"></i> Save Hours</button>
        </div>
      </div>`;
}

function switchAdminTab(tab) {
  document.querySelectorAll('#page-admin .dash-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('[id^="asdb-"]').forEach(i => i.classList.remove('active'));
  document.getElementById(`atab-${tab}`)?.classList.add('active');
  document.getElementById(`asdb-${tab}`)?.classList.add('active');
  if (tab === 'appointments') initAdminAppointments();
}

/* ---------
   CONTACT
--------- */
async function handleContactSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('ctBtn');
  setBtnLoading(btn, 'ctBtnText', true);
  await fakeDelay(1000);
  setBtnLoading(btn, 'ctBtnText', false);
  showToast('Message sent! We\'ll reply within 24 hours. 📧', 'success');
  e.target.reset();
}

/* ---------
   CHAT WIDGET
--------- */
function openChat() {
  App.chatOpen = true;
  document.getElementById('chatBox').classList.add('open');
  document.getElementById('chatFab').style.display = 'none';
  App.chatUnreadCount = 0;
  document.getElementById('chatUnread').style.display = 'none';
  renderChatMessages();
  setTimeout(() => {
    const el = document.getElementById('chatMessages');
    if (el) el.scrollTop = el.scrollHeight;
    document.getElementById('chatInput')?.focus();
  }, 300);
}
function closeChat() {
  App.chatOpen = false;
  document.getElementById('chatBox').classList.remove('open');
  document.getElementById('chatFab').style.display = 'flex';
}

function renderChatMessages() {
  const el = document.getElementById('chatMessages');
  if (!el) return;
  el.innerHTML = App.chatMessages.map(m => `
      <div class="chat-msg ${m.sender}">
        <div class="chat-msg-avatar">${m.sender === 'admin' ? '🏥' : '👤'}</div>
        <div>
          <div class="chat-bubble">${m.text}</div>
          <div class="chat-bubble-time">${m.time}</div>
        </div>
      </div>`).join('');
  if (App.chatTyping) el.innerHTML += `
      <div class="chat-msg admin">
        <div class="chat-msg-avatar">🏥</div>
        <div>
          <div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>
          <div class="typing-label">Admin is typing…</div>
        </div>
      </div>`;
  el.scrollTop = el.scrollHeight;
}

function sendChatMsg() {
  const inp = document.getElementById('chatInput');
  const text = inp?.value.trim();
  if (!text) return;
  App.chatMessages.push({ id: Date.now(), text, sender: 'user', time: getNow() });
  inp.value = '';
  autoResizeChatInput(inp);
  renderChatMessages();
  App.chatTyping = true;
  renderChatMessages();
  const delay = 1200 + Math.random() * 600;
  setTimeout(() => {
    App.chatTyping = false;
    const resp = CHAT_AUTO_RESPONSES[Math.floor(Math.random() * CHAT_AUTO_RESPONSES.length)];
    App.chatMessages.push({ id: Date.now() + 1, text: resp, sender: 'admin', time: getNow() });
    renderChatMessages();
    if (!App.chatOpen) { App.chatUnreadCount++; const ud = document.getElementById('chatUnread'); if (ud) { ud.style.display = 'flex'; ud.textContent = App.chatUnreadCount; } }
  }, delay);
}

function sendQuickReply(text) {
  if (!App.chatOpen) openChat();
  App.chatMessages.push({ id: Date.now(), text, sender: 'user', time: getNow() });
  renderChatMessages();
  App.chatTyping = true;
  renderChatMessages();
  setTimeout(() => {
    App.chatTyping = false;
    const resp = CHAT_AUTO_RESPONSES[Math.floor(Math.random() * CHAT_AUTO_RESPONSES.length)];
    App.chatMessages.push({ id: Date.now() + 1, text: resp, sender: 'admin', time: getNow() });
    renderChatMessages();
  }, 1400);
}

function chatKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMsg(); }
}
function autoResizeChatInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 80) + 'px';
}

/* ---------
   TOAST
--------- */
function showToast(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  const icons = { success: 'check-circle', error: 'exclamation-triangle', info: 'info-circle', warning: 'exclamation-circle' };
  const titles = { success: 'Success', error: 'Error', info: 'Info', warning: 'Warning' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `
      <div class="toast-icon"><i class="fas fa-${icons[type] || 'info-circle'}"></i></div>
      <div style="flex:1;"><div class="toast-title">${titles[type]}</div><div class="toast-msg">${msg}</div></div>
      <div class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></div>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 4500);
}

/* ---------
   UTILITIES
--------- */
function fakeDelay(ms) { return new Promise(r => setTimeout(r, ms)); }

function setBtnLoading(btn, textId, loading) {
  if (!btn) return;
  btn.disabled = loading;
  const el = document.getElementById(textId);
  if (loading) btn.innerHTML = '<div class="btn-spinner"></div>';
  else if (el) btn.innerHTML = `<span id="${textId}">${el.innerHTML}</span>`;
}

function showFieldError(id, msg) { const el = document.getElementById(id); if (el) { el.style.display = 'flex'; el.innerHTML = msg; } }
function clearFieldErrors(ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; }); }

function togglePassword(inputId, iconId) {
  const inp = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!inp || !icon) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  icon.className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

function checkPwdStrength(pwd) {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  const bar = document.getElementById('pwdBar');
  const lbl = document.getElementById('pwdStrengthLabel');
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  if (bar) { bar.style.width = (s / 4 * 100) + '%'; bar.style.background = colors[s - 1] || '#ef4444'; }
  if (lbl) { lbl.textContent = s > 0 ? labels[s - 1] : ''; lbl.style.color = colors[s - 1] || 'var(--muted)'; }
}

function toggleMobileMenu() { document.getElementById('navLinks')?.classList.toggle('show'); }
function closeMobileMenu() { document.getElementById('navLinks')?.classList.remove('show'); }

/* ---------
   MOBILE NAV STYLES INJECTION
--------- */
const mobileStyle = document.createElement('style');
mobileStyle.textContent = `
    @media(max-width:768px){
      .nav-links.show{display:flex!important;flex-direction:column;position:fixed;top:72px;left:0;right:0;background:rgba(255,255,255,.97);backdrop-filter:blur(20px);padding:16px;box-shadow:0 8px 30px rgba(0,0,0,.1);z-index:799;gap:4px;}
      .nav-links.show .nav-link{padding:12px 16px;}
    }`;
document.head.appendChild(mobileStyle);

async function submitNewDoctor() {
  // ── Validation ────────────────────────────────────────────────────────
  let valid = true;
  const first = document.getElementById('docFirst').value.trim();
  const last = document.getElementById('docLast').value.trim();
  const email = document.getElementById('docEmail').value.trim();
  const pwd = document.getElementById('docPassword').value;
  const phone = document.getElementById('docPhone').value.trim();
  const deptId = document.getElementById('docDepartment').value;

  clearFieldErrors(['errDocFirst', 'errDocLast', 'errDocEmail', 'errDocPassword']);

  if (first.length < 2) { showFieldError('errDocFirst', '<i class="fas fa-exclamation-circle"></i> First name too short'); valid = false; }
  if (last.length < 2) { showFieldError('errDocLast', '<i class="fas fa-exclamation-circle"></i> Last name too short'); valid = false; }
  if (!email.match(/\S+@\S+\.\S+/)) { showFieldError('errDocEmail', '<i class="fas fa-exclamation-circle"></i> Invalid email address'); valid = false; }
  if (pwd.length < 8) { showFieldError('errDocPassword', '<i class="fas fa-exclamation-circle"></i> Minimum 8 characters'); valid = false; }
  if (!valid) return;
  // ─────────────────────────────────────────────────────────────────────

  const btn = document.getElementById('addDoctorBtn');
  setBtnLoading(btn, 'addDoctorBtnText', true);

  try {
    const res = await fetch('api/add_doctor.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: first,
        last_name: last,
        email,
        password: pwd,
        phone,
        department_id: deptId || null,
      }),
    });
    const data = await res.json();

    if (!data.success) {
      if (res.status === 409) showFieldError('errDocEmail', `<i class="fas fa-exclamation-circle"></i> ${data.message}`);
      else showToast(data.message || 'Failed to add doctor.', 'error');
      return;
    }

    showToast(`Dr. ${first} ${last} added successfully! 🩺`, 'success');
    closeAddDoctorModal();
    // Optionally refresh the doctors list:
    // await loadDoctorsTable();

  } catch (err) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    setBtnLoading(btn, 'addDoctorBtnText', false);
  }
}

function closeAddDoctorModal() {
  document.getElementById('addDoctorModal').style.display = 'none';
  ['docFirst', 'docLast', 'docEmail', 'docPassword', 'docPhone'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('docDepartment').value = '';
  clearFieldErrors(['errDocFirst', 'errDocLast', 'errDocEmail', 'errDocPassword']);
}

// Call once when the admin page loads to populate the <select>
async function loadDepartments() {
  try {
    const res = await fetch('api/get_departments.php', { credentials: 'include' });
    const data = await res.json();
    if (!data.success) return;
    const sel = document.getElementById('docDepartment');
    data.departments.forEach(dept => {
      const opt = document.createElement('option');
      opt.value = dept.id;
      opt.textContent = dept.name;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.error('Could not load departments', err);
  }
}

/* ---------
   INIT
--------- */
initHome();
document.getElementById('navbar').classList.add('dark-nav');
