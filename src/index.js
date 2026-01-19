import express from 'express';
import cors from 'cors';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { Database, Resource } from '@adminjs/prisma';
import prisma from './config/prisma.js';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;

const start = async () => {
    const app = express();

    // Register AdminJS Adapter
    // console.log('Database:', Database);
    // console.log('Resource:', Resource);
    // AdminJS.registerAdapter({ Database, Resource });

    // Configure AdminJS
    // const adminOptions = {
    //   resources: [
    //     { resource: { model: prisma.user, client: prisma }, options: {} },
    //     { resource: { model: prisma.ticket, client: prisma }, options: {} },
    //     { resource: { model: prisma.comment, client: prisma }, options: {} },
    //   ],
    //   rootPath: '/admin',
    // };

    // const admin = new AdminJS(adminOptions);

    // AdminJS Router
    // const adminRouter = AdminJSExpress.buildAuthenticateRouter(admin, {
    //   authenticate: async (email, password) => {
    //     const user = await prisma.user.findUnique({ where: { email } });
    //     if (user && user.role === 'ADMIN') {
    //        if (await bcrypt.compare(password, user.password)) {
    //            return user;
    //        }
    //     }
    //     return false;
    //   },
    //   cookiePassword: 'super-secret-cookie-password',
    // }, null, {
    //     resave: false,
    //     saveUninitialized: true,
    // });

    // Mount Admin Router
    // app.use(admin.options.rootPath, adminRouter);

    // APIs
    app.use(cors());
    app.use(express.json());

    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/tickets', ticketRoutes);

    app.use(express.static(join(__dirname, '../public')));

    // app.get('/', (req, res) => {
    //     res.send('Support Ticket System API Running. Admin Interface temporarily disabled.');
    // });

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        // console.log(`Admin Interface on http://localhost:${PORT}/admin`);
    });
};

start();
