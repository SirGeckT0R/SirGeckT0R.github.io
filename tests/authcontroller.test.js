const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const db = require('../app/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authController = require('../app/controllers/auth.controller');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.post('/signup', authController.signup);
app.post('/signin', authController.signin);
app.post('/refreshToken', authController.refreshToken);
app.post('/logout', authController.logout);

const User = db.user;
const Role = db.role;

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Signup', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        setRoles: jest.fn().mockResolvedValue(),
      };

      User.create = jest.fn().mockResolvedValue(mockUser);
      Role.findAll = jest.fn().mockResolvedValue([{ id: 1, name: 'user' }]);

      const res = await request(app)
        .post('/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password',
          roles: ['user'],
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'User registered successfully!' });
    });

    it('should return 500 on error', async () => {
      User.create = jest.fn().mockRejectedValue(new Error('Database error'));

      const res = await request(app).post('/signup').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
      });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Database error' });
    });
  });

  describe('Signin', () => {
    it('should sign in the user successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: bcrypt.hashSync('password', 8),
        getRoles: jest.fn().mockResolvedValue([{ name: 'user' }]),
        update: jest.fn(),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compareSync = jest.fn().mockReturnValue(true);
      jwt.sign = jest.fn().mockReturnValue('access-token');

      const res = await request(app).post('/signin').send({
        username: 'testuser',
        password: 'password',
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: 1,
          username: 'testuser',
          roles: ['ROLE_USER'],
        })
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1 },
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should return 404 if user not found', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      const res = await request(app).post('/signin').send({
        username: 'unknownuser',
        password: 'password',
      });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'User Not found.' });
    });

    it('should return 401 for invalid password', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        password: bcrypt.hashSync('password', 8),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compareSync = jest.fn().mockReturnValue(false);

      const res = await request(app).post('/signin').send({
        username: 'testuser',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: 'Invalid Password!' });
    });
  });

  describe('Refresh Token', () => {
    it('should refresh the access token successfully', async () => {
      const mockUser = {
        id: 1,
        expiresRefreshToken: (Date.now() + 10000).toString(),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      jwt.sign = jest.fn().mockReturnValue('new-access-token');

      const res = await request(app)
        .post('/refreshToken')
        .set('Cookie', 'refresh-token=valid-refresh-token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Refresh successful' });
    });

    it('should return 403 for expired refresh token', async () => {
      const mockUser = {
        id: 1,
        expiresRefreshToken: (Date.now() - 10000).toString(),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/refreshToken')
        .set('Cookie', 'refresh-token=expired-refresh-token');

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ message: 'Refresh token has expired!' });
    });
  });

  describe('Logout', () => {
    it('should clear cookies and log out successfully', async () => {
      const mockUser = {
        update: jest.fn(),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/logout')
        .set('Cookie', 'refresh-token=valid-refresh-token');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Logout successful with user' });
    });
  });
});
