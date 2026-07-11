const STORAGE_KEY = 'barangay_local_db_v2';
const SESSION_KEY = 'barangay_session_v2';

const seedData = {
  users: [
    {
      id: 'super-admin-1',
      email: 'superadmin@barangay.local',
      password: 'superadmin123',
      role: 'super_admin',
      profile: {
        name: 'Super Admin',
      },
    },
  ],
  residents: [],
  staffAccounts: [],
};

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readDb() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return structuredClone(seedData);
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      residents: Array.isArray(parsed.residents) ? parsed.residents : [],
      staffAccounts: Array.isArray(parsed.staffAccounts) ? parsed.staffAccounts : [],
      requests: Array.isArray(parsed.requests) ? parsed.requests : [],
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      ...parsed
    };
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return structuredClone(seedData);
  }
}

function writeDb(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  
  // Sync to local.json through the dev server middleware silently
  fetch('/api/sync-local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(e => console.warn('Failed to sync to local.json:', e));
}

function setSession(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      userId: user.id,
      role: user.role,
      email: user.email,
    }),
  );
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getSessionUser() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    const db = readDb();
    return db.users.find((u) => u.id === session.userId) || null;
  } catch {
    clearSession();
    return null;
  }
}

function login(email, password, role) {
  const db = readDb();
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === String(email).trim().toLowerCase() &&
      u.password === password &&
      u.role === role,
  );

  if (!user) {
    throw new Error('Invalid email, password, or role.');
  }

  if (role === 'resident') {
    const resident = db.residents.find((r) => r.userId === user.id);
    if (!resident) {
      throw new Error('Resident profile not found.');
    }
  }

  setSession(user);
  return user;
}

function registerResident(payload) {
  const db = readDb();
  const exists = db.users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase());
  if (exists) {
    throw new Error('Email is already registered.');
  }

  const userId = createId('resident-user');
  const residentId = createId('resident');
  const createdAt = nowIso();

  db.users.push({
    id: userId,
    email: payload.email,
    password: payload.password,
    role: 'resident',
    status: 'pending_validation',
    isApproved: false,
    createdAt,
    updatedAt: createdAt,
    profile: {
      name: payload.name,
      contact: payload.contact,
      address: payload.address,
      birthdate: payload.birthdate,
      gender: payload.gender,
      age: payload.age,
      civilStatus: payload.civilStatus || '',
      barangayName: payload.barangayName || '',
      createdAt,
    },
  });

  db.residents.push({
    id: residentId,
    userId,
    name: payload.name,
    email: payload.email,
    contact: payload.contact,
    address: payload.address,
    birthdate: payload.birthdate,
    gender: payload.gender,
    age: payload.age,
    civilStatus: payload.civilStatus || '',
    barangayName: payload.barangayName || '',
    barangayIdImage: payload.barangayIdImage,
    status: 'pending_validation',
    rejectionMessage: '',
    createdAt,
    updatedAt: createdAt,
  });

  writeDb(db);
  return residentId;
}

function createBarangayStaff({ name, email, contact, defaultPassword, createdBy }) {
  const db = readDb();
  const exists = db.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    throw new Error('Email is already registered.');
  }

  const userId = createId('staff-user');
  const staffId = createId('staff');
  const createdAt = nowIso();

  db.users.push({
    id: userId,
    email,
    password: defaultPassword,
    role: 'barangay_staff',
    createdAt,
    profile: {
      name: name || email.split('@')[0],
      contact: contact || '',
      createdAt,
    },
  });

  db.staffAccounts.push({
    id: staffId,
    userId,
    name: name || email.split('@')[0],
    email,
    contact: contact || '',
    defaultPassword,
    mustChangePassword: true,
    createdBy,
    createdAt,
    updatedAt: createdAt,
  });

  writeDb(db);
  return staffId;
}

function changeStaffPassword(userId, newPassword) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId && u.role === 'barangay_staff');
  const staff = db.staffAccounts.find((s) => s.userId === userId);
  if (!user || !staff) throw new Error('Staff account not found.');

  user.password = newPassword;
  staff.mustChangePassword = false;
  staff.updatedAt = nowIso();
  writeDb(db);
}

function getStaffAccountByUserId(userId) {
  const db = readDb();
  return db.staffAccounts.find((s) => s.userId === userId) || null;
}

function getPendingResidents() {
  return readDb().residents.filter((r) => r.status === 'pending_validation');
}

function getResidentById(residentId) {
  return readDb().residents.find((r) => r.id === residentId) || null;
}

function updateResidentValidation(residentId, action, rejectionMessage = '') {
  const db = readDb();
  const resident = db.residents.find((r) => r.id === residentId);
  if (!resident) throw new Error('Resident not found.');

  if (action === 'approve') {
    resident.status = 'active';
    resident.rejectionMessage = '';
  } else if (action === 'reject') {
    if (!rejectionMessage.trim()) {
      throw new Error('Rejection reason is required.');
    }
    resident.status = 'rejected';
    resident.rejectionMessage = rejectionMessage.trim();
  } else {
    throw new Error('Invalid validation action.');
  }
  resident.updatedAt = nowIso();
  writeDb(db);
}

function createRequest(requestData) {
  const db = readDb();
  if (!db.requests) db.requests = [];
  db.requests.push(requestData);
  writeDb(db);
}

function getMessages() {
  const db = readDb();
  if (!db.messages) db.messages = [];
  return db.messages;
}

function sendMessage(messageData) {
  const db = readDb();
  if (!db.messages) db.messages = [];
  const newMessage = {
    id: createId('msg'),
    createdAt: nowIso(),
    isRead: false,
    ...messageData
  };
  db.messages.push(newMessage);
  writeDb(db);
  return newMessage;
}

export default {
  readDb,
  login,
  registerResident,
  createBarangayStaff,
  changeStaffPassword,
  getSessionUser,
  clearSession,
  getStaffAccountByUserId,
  getPendingResidents,
  getResidentById,
  updateResidentValidation,
  writeDb,
  createRequest,
  getMessages,
  sendMessage
};
