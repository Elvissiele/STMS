const prisma = require('../config/prisma');

const createTicket = async (req, res) => {
    try {
        const { title, description, priority } = req.body;
        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                priority: priority || 'MEDIUM',
                authorId: req.user.id,
            },
        });
        res.status(201).json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating ticket' });
    }
};

const getTickets = async (req, res) => {
    try {
        const { role, id } = req.user;
        let tickets;

        if (role === 'CUSTOMER') {
            tickets = await prisma.ticket.findMany({
                where: { authorId: id },
                include: { author: { select: { name: true, email: true } } },
            });
        } else {
            // AGENT or ADMIN see all
            tickets = await prisma.ticket.findMany({
                include: {
                    author: { select: { name: true, email: true } },
                    assignedTo: { select: { name: true, email: true } }
                },
            });
        }
        res.json(tickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching tickets' });
    }
};

const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assignedToId, priority } = req.body;

        // Verify existence
        const ticket = await prisma.ticket.findUnique({ where: { id: parseInt(id) } });
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // Logic handled by authorizedRole middleware, assuming this route is protected for Agents/Admins
        // However, we might want to allow CUSTOMER to close their own ticket? 
        // For simplicity based on requirements: "Update status/assign (Agent/Admin)"

        const updatedTicket = await prisma.ticket.update({
            where: { id: parseInt(id) },
            data: {
                status,
                priority,
                assignedToId: assignedToId ? parseInt(assignedToId) : undefined,
            },
        });
        res.json(updatedTicket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating ticket' });
    }
};

const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const ticket = await prisma.ticket.findUnique({ where: { id: parseInt(id) } });
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // RBAC Check: Is user author or Agent/Admin?
        if (req.user.role === 'CUSTOMER' && ticket.authorId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                ticketId: parseInt(id),
                authorId: req.user.id,
            },
        });
        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding comment' });
    }
};

const getTicketDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
            include: {
                comments: { include: { author: { select: { name: true } } } },
                author: { select: { name: true, email: true } },
                assignedTo: { select: { name: true } }
            }
        });

        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // Access control
        if (req.user.role === 'CUSTOMER' && ticket.authorId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        res.json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching ticket details' });
    }
}

module.exports = { createTicket, getTickets, updateTicket, addComment, getTicketDetails };
