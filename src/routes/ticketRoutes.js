import express from 'express';
import { createTicket, getTickets, updateTicket, addComment, getTicketDetails } from '../controllers/ticketController.js';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

router.post('/', createTicket); // Any auth user (Customer/Agent)
router.get('/', getTickets);
router.get('/:id', getTicketDetails);

// Only Agents and Admins can update status/assignment
router.patch('/:id', authorizeRole(['AGENT', 'ADMIN']), updateTicket);

// Commenting
router.post('/:id/comments', addComment);

export default router;
