// User Profile Controller
// Task 3.1: REST API endpoints for User Profile Service

import { Request, Response } from 'express';
import { UserProfileRepository } from '../repositories/UserProfileRepository';
import logger from '../config/logger';
import Joi from 'joi';

export class UserProfileController {
  constructor(private repository: UserProfileRepository) {}

  /**
   * Task 3.1.1: POST /users - Create new user profile
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const schema = Joi.object({
        declaredMonthlyIncome: Joi.number().positive().required(),
        incomeType: Joi.string()
          .valid('SALARIED', 'FREELANCE', 'BUSINESS', 'STUDENT')
          .required(),
        locationType: Joi.string().valid('URBAN', 'RURAL').required(),
        locationState: Joi.string().required(),
        locationCity: Joi.string().required(),
        algorandAddress: Joi.string().length(58).required(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.details[0].message,
          },
          meta: {
            requestId: req.headers['x-request-id'] || 'unknown',
            timestamp: new Date().toISOString(),
            version: 'v1',
          },
        });
        return;
      }

      const userProfile = await this.repository.createUserProfile(value);

      res.status(201).json({
        success: true,
        data: userProfile,
        error: null,
        meta: {
          requestId: req.headers['x-request-id'] || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    } catch (error) {
      logger.error('Error in createUser', { error });
      res.status(500).json({
        success: false,
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create user profile',
        },
        meta: {
          requestId: req.headers['x-request-id'] || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    }
  };

  /**
   * Task 3.1.2: GET /users/:userId - Get user profile
   */
  getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const userProfile = await this.repository.getUserProfile(userId);

      if (!userProfile) {
        res.status(404).json({
          success: false,
          data: null,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User profile not found',
          },
          meta: {
            requestId: req.headers['x-request-id'] || 'unknown',
            timestamp: new Date().toISOString(),
            version: 'v1',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: userProfile,
        error: null,
        meta: {
          requestId: req.headers['x-request-id'] || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    } catch (error) {
      logger.error('Error in getUser', { error });
      res.status(500).json({
        success: false,
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve user profile',
        },
        meta: {
          requestId: req.headers['x-request-id'] || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    }
  };

  /**
   * Task 3.1.3: PATCH /users/:userId - Update user profile
   */
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const schema = Joi.object({
        declaredMonthlyIncome: Joi.number().positive().optional(),
        incomeType: Joi.string()
          .valid('SALARIED', 'FREELANCE', 'BUSINESS', 'STUDENT')
          .optional(),
        locationType: Joi.string().valid('URBAN', 'RURAL').optional(),
        locationState: Joi.string().optional(),
        locationCity: Joi.string().optional(),
        householdConfig: Joi.object().optional(),
        consentFlags: Joi.object().optional(),
        notificationPreferences: Joi.object().optional(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.details[0].message,
          },
          meta: {
            requestId: req.headers['x-request-id'] || 'unknown',
            timestamp: new Date().toISOString(),
            version: 'v1',
          },
        });
        return;
      }

      const userProfile = await this.repository.updateUserProfile(
        userId,
        value
      );

      if (!userProfile) {
        res.status(404).json({
          success: false,
          data: null,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User profile not found',
          },
          meta: {
            requestId: req.headers['x-request-id'] || 'unknown',
            timestamp: new Date().toISOString(),
            version: 'v1',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: userProfile,
        error: null,
        meta: {
          requestId: req.headers['x-request-id'] || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    } catch (error) {
      logger.error('Error in updateUser', { error });
      res.status(500).json({
        success: false,
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update user profile',
        },
        meta: {
          requestId: req.headers['x-request-id'] || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    }
  };

  /**
   * Task 3.1.4: GET /users/:userId/league - Get league assignment
   */
  getLeague = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const league = await this.repository.getLeagueAssignment(userId);

      if (!league) {
        res.status(404).json({
          success: false,
          data: null,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User profile not found',
          },
          meta: {
            requestId: req.headers['x-request-id'] || 'unknown',
            timestamp: new Date().toISOString(),
            version: 'v1',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: league,
        error: null,
        meta: {
          requestId: req.headers['x-request-id'] || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    } catch (error) {
      logger.error('Error in getLeague', { error });
      res.status(500).json({
        success: false,
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve league assignment',
        },
        meta: {
          requestId: req.headers['x-request-id'] || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    }
  };

  /**
   * Task 3.1.5: POST /users/:userId/income - Submit income declaration
   */
  updateIncome = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const schema = Joi.object({
        monthlyIncome: Joi.number().positive().required(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.details[0].message,
          },
          meta: {
            requestId: req.headers['x-request-id'] || 'unknown',
            timestamp: new Date().toISOString(),
            version: 'v1',
          },
        });
        return;
      }

      const userProfile = await this.repository.updateIncome(
        userId,
        value.monthlyIncome
      );

      if (!userProfile) {
        res.status(404).json({
          success: false,
          data: null,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User profile not found',
          },
          meta: {
            requestId: req.headers['x-request-id'] || 'unknown',
            timestamp: new Date().toISOString(),
            version: 'v1',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: userProfile,
        error: null,
        meta: {
          requestId: req.headers['x-request-id'] || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    } catch (error) {
      logger.error('Error in updateIncome', { error });
      res.status(500).json({
        success: false,
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update income',
        },
        meta: {
          requestId: req.headers['x-request-id'] || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    }
  };

  /**
   * Task 3.1.6: GET /users/:userId/settings - Get notification preferences
   */
  getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const settings = await this.repository.getSettings(userId);

      if (!settings) {
        res.status(404).json({
          success: false,
          data: null,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User profile not found',
          },
          meta: {
            requestId: req.headers['x-request-id'] || 'unknown',
            timestamp: new Date().toISOString(),
            version: 'v1',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: settings,
        error: null,
        meta: {
          requestId: req.headers['x-request-id'] || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    } catch (error) {
      logger.error('Error in getSettings', { error });
      res.status(500).json({
        success: false,
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve settings',
        },
        meta: {
          requestId: req.headers['x-request-id'] || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    }
  };

  /**
   * Task 3.1.7: PATCH /users/:userId/settings - Update notification preferences
   */
  updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const schema = Joi.object({
        notificationPreferences: Joi.object().optional(),
        consentFlags: Joi.object().optional(),
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.details[0].message,
          },
          meta: {
            requestId: req.headers['x-request-id'] || 'unknown',
            timestamp: new Date().toISOString(),
            version: 'v1',
          },
        });
        return;
      }

      const settings = await this.repository.updateSettings(userId, value);

      if (!settings) {
        res.status(404).json({
          success: false,
          data: null,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User profile not found',
          },
          meta: {
            requestId: req.headers['x-request-id'] || 'unknown',
            timestamp: new Date().toISOString(),
            version: 'v1',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: settings,
        error: null,
        meta: {
          requestId: req.headers['x-request-id'] || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    } catch (error) {
      logger.error('Error in updateSettings', { error });
      res.status(500).json({
        success: false,
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update settings',
        },
        meta: {
          requestId: req.headers['x-request-id'] || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    }
  };
}

export default UserProfileController;
