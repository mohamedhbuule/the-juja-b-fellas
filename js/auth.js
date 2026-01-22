// Authentication System
class Auth {
  constructor() {
    this.users = this.loadUsers();
    this.currentUser = this.getCurrentUser();
  }

  // Load users from localStorage
  loadUsers() {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  }

  // Save users to localStorage
  saveUsers() {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  // Register new user
  register(username, email, password) {
    // Check if username already exists
    if (this.users.find(u => u.username === username)) {
      return { success: false, message: 'Username already exists' };
    }

    // Check if email already exists
    if (this.users.find(u => u.email === email)) {
      return { success: false, message: 'Email already registered' };
    }

    // Create user object
    const user = {
      id: Date.now().toString(),
      username,
      email,
      password: this.hashPassword(password),
      createdAt: new Date().toISOString()
    };

    // Add user
    this.users.push(user);
    this.saveUsers();

    return { success: true, user };
  }

  // Login user
  login(username, password) {
    const user = this.users.find(
      u => u.username === username && u.password === this.hashPassword(password)
    );

    if (!user) {
      return { success: false, message: 'Invalid username or password' };
    }

    // Set current user
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));

    return { success: true, user };
  }

  // Logout user
  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  }

  // Get current user
  getCurrentUser() {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Hash password (simple hash for demo - in production use proper hashing)
  hashPassword(password) {
    // Simple hash function (for demo purposes only)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  // Protect route - redirect to login if not authenticated
  protectRoute() {
    if (!this.isAuthenticated()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }
}

// Initialize auth
const auth = new Auth();

// Auto-protect pages (except login and register)
if (!window.location.pathname.includes('index.html') && 
    !window.location.pathname.includes('register.html')) {
  if (!auth.protectRoute()) {
    // Redirect will happen in protectRoute
  }
}
