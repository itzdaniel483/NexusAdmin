const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '..', 'data', 'users.json');

class UserStore {
    constructor() {
        this.users = [];
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        await fs.ensureFile(DATA_FILE);
        try {
            const data = await fs.readFile(DATA_FILE, 'utf8');
            if (data) {
                this.users = JSON.parse(data);
            }
        } catch (err) {
            console.error('Failed to load users:', err);
        }

        // Create default admin if no users exist
        if (this.users.length === 0) {
            console.log('No users found. Creating default admin account.');
            await this.addUser('admin', 'admin', 'admin');
        }

        this.initialized = true;
    }

    async save() {
        await fs.writeFile(DATA_FILE, JSON.stringify(this.users, null, 2));
    }

    async addUser(username, password, role = 'user') {
        // Check if user already exists
        if (this.users.find(u => u.username === username)) {
            throw new Error('Username already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = {
            id: uuidv4(),
            username,
            passwordHash,
            role,
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        await this.save();
        return { id: newUser.id, username: newUser.username, role: newUser.role };
    }

    async authenticate(username, password) {
        await this.init();
        const user = this.users.find(u => u.username === username);
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, username: user.username, role: user.role };
    }

    async getUsers() {
        await this.init();
        return this.users.map(u => ({
            id: u.id,
            username: u.username,
            role: u.role,
            createdAt: u.createdAt
        }));
    }

    async deleteUser(id) {
        await this.init();
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1) throw new Error('User not found');

        // Prevent deleting the last admin
        const user = this.users[index];
        if (user.role === 'admin') {
            const adminCount = this.users.filter(u => u.role === 'admin').length;
            if (adminCount <= 1) {
                throw new Error('Cannot delete the last admin user');
            }
        }

        this.users.splice(index, 1);
        await this.save();
    }

    async changePassword(userId, currentPassword, newPassword) {
        await this.init();
        const user = this.users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) throw new Error('Current password is incorrect');

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update password
        user.passwordHash = passwordHash;
        await this.save();

        return { success: true };
    }
}

const userStore = new UserStore();
module.exports = userStore;
