// User Profile Routes
// Task 3.1: REST API routes for User Profile Service

import { Router } from 'express';
import { UserProfileController } from '../controllers/UserProfileController';
import { UserProfileRepository } from '../repositories/UserProfileRepository';
import pool from '../config/database';

const router = Router();
const repository = new UserProfileRepository(pool);
const controller = new UserProfileController(repository);

// Task 3.1.1: POST /users - Create new user profile
router.post('/', controller.createUser);

// Task 3.1.2: GET /users/:userId - Get user profile
router.get('/:userId', controller.getUser);

// Task 3.1.3: PATCH /users/:userId - Update user profile
router.patch('/:userId', controller.updateUser);

// Task 3.1.4: GET /users/:userId/league - Get league assignment
router.get('/:userId/league', controller.getLeague);

// Task 3.1.5: POST /users/:userId/income - Submit income declaration
router.post('/:userId/income', controller.updateIncome);

// Task 3.1.6: GET /users/:userId/settings - Get notification preferences
router.get('/:userId/settings', controller.getSettings);

// Task 3.1.7: PATCH /users/:userId/settings - Update notification preferences
router.patch('/:userId/settings', controller.updateSettings);

export default router;
