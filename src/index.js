const express = require('express');
const cors = require('cors');
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const { Database, Resource } = require('@adminjs/prisma');
const prisma = require('./config/prisma');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const start = async () => {
    const app = express();

    // Register AdminJS Adapter
    AdminJS.registerAdapter({ Database, Resource });

    // Configure AdminJS
    const adminOptions = {
        resources: [
            { resource: { model: prisma.user, client: prisma }, options: {} },
            { resource: { model: prisma.ticket, client: prisma }, options: {} },
            { resource: { model: prisma.comment, client: prisma }, options: {} },
        ],
        rootPath: '/admin',
    };

    const admin = new AdminJS(adminOptions);

    // AdminJS Router (builds on top of Express)
    const adminRouter = AdminJSExpress.buildAuthenticateRouter(admin, {
        authenticate: async (email, password) => {
            const user = await prisma.user.findUnique({ where: { email } });
            if (user && user.role === 'ADMIN') {
                // In production use bcrypt check here, for Admin interface simple check
                const bcrypt = require('bcryptjs');
                if (await bcrypt.compare(password, user.password)) {
                    return user;
                }
            }
            return false;
        },
        cookiePassword: 'super-secret-cookie-password',
    }, null, {
        resave: false,
        saveUninitialized: true,
    });

    // Mount Admin Router BEFORE body parsers for admin routes to handle forms correctly
    app.use(admin.options.rootPath, adminRouter);

    // APIs
    app.use(cors());
    app.use(express.json());

    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/tickets', ticketRoutes);

    app.get('/', (req, res) => {
        res.send('Support Ticket System API Running. Admin at /admin');
    });

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Admin Interface on http://localhost:${PORT}/admin`);
    });
};

start();
