const jwt = require('jsonwebtoken');
const authJwt = require('../app/middleware/authJwt');
const db = require('../app/models');

jest.mock('jsonwebtoken');
jest.mock('../app/models', () => ({
  user: {
    findByPk: jest.fn(),
  },
}));

describe('Auth Middleware', () => {
  describe('verifyToken', () => {
    const mockRequest = (cookies) => ({
      cookies,
    });

    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.send = jest.fn().mockReturnValue(res);
      return res;
    };

    const mockNext = jest.fn();

    it('should call next if token is valid', () => {
      const req = mockRequest({ 'access-token': 'valid-token' });
      const res = mockResponse();

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, { id: 1 });
      });

      authJwt.verifyToken(req, res, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-token',
        expect.any(String),
        expect.any(Function)
      );
      expect(req.userId).toBe(1);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      const req = mockRequest({ 'access-token': 'invalid-token' });
      const res = mockResponse();

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Invalid token'), null);
      });

      authJwt.verifyToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ message: 'Unauthorized!' });
    });
  });

  describe('isAdmin', () => {
    it('should return 403 if the user is not an admin', async () => {
      const req = { userId: 1 };
      const res = {
        status: jest.fn(() => res),
        send: jest.fn(),
      };
      const next = jest.fn();

      const mockUser = {
        getRoles: jest.fn().mockResolvedValue([{ name: 'user' }]),
      };

      db.user.findByPk.mockResolvedValue(mockUser);
      mockUser.getRoles.mockResolvedValue([{ name: 'user' }]);

      await authJwt.isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Require Admin Role!',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if the user is an admin', async () => {
      const req = { userId: 1 };
      const res = {};
      const next = jest.fn();

      const mockUser = {
        getRoles: jest.fn().mockResolvedValue([{ name: 'admin' }]),
      };

      db.user.findByPk.mockResolvedValue(mockUser);
      mockUser.getRoles.mockResolvedValue([{ name: 'admin' }]);

      await authJwt.isAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    // it('should return 403 if user is not found', async () => {
    //   const req = { userId: 1 };
    //   const res = {
    //     status: jest.fn(() => res),
    //     send: jest.fn(),
    //   };
    //   const next = jest.fn();

    //   const mockUser = {
    //     getRoles: jest.fn().mockResolvedValue([{ name: 'admin' }]),
    //   };

    //   db.user.findByPk.mockResolvedValue(null);
    //   mockUser.getRoles.mockResolvedValue([{ name: 'user' }]);

    //   await authJwt.isAdmin(req, res, next);
    //   console.log('hey', res.status.mock.calls);
    //   expect(res.status).toHaveBeenCalledWith(403);
    //   expect(res.send).toHaveBeenCalledWith({ message: 'Require Admin Role!' });
    //   expect(next).not.toHaveBeenCalled();
    // });
  });
});
