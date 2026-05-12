const bcrypt = require('bcryptjs');

const users = [
  {
    id: 'user-acme-admin',
    name: 'Acme Admin',
    email: 'admin@acme.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    tenantId: 'acme'
  },
  {
    id: 'user-acme-member',
    name: 'Acme Member',
    email: 'member@acme.com',
    passwordHash: bcrypt.hashSync('member123', 10),
    role: 'member',
    tenantId: 'acme'
  },
  {
    id: 'user-beta-admin',
    name: 'Beta Admin',
    email: 'admin@beta.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    tenantId: 'beta'
  }
];

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function findUserByEmail(email) {
  return users.find((user) => user.email.toLowerCase() === String(email || '').toLowerCase()) || null;
}

function listUsers(tenantId) {
  return users.filter((user) => !tenantId || user.tenantId === tenantId).map(sanitizeUser);
}

module.exports = {
  findUserByEmail,
  listUsers,
  sanitizeUser
};