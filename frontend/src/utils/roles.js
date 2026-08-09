// 'superadmin' is the only elevated role the backend ever actually assigns
// (see backend/models/user.model.js) — centralized here so every admin
// check in the app agrees on that instead of copy-pasting the condition.
export const isSuperAdmin = (roles = []) => roles.includes('superadmin');
