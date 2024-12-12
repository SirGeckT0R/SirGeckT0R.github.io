const request = require('supertest');
const express = require('express');
const userController = require('../app/controllers/user.controller');

const app = express();

app.get('/all', userController.allAccess);
app.get('/user', userController.userBoard);
app.get('/admin', userController.adminBoard);

describe('User Controller', () => {
  describe('GET /all', () => {
    it('should return 200 with the correct message', async () => {
      const res = await request(app).get('/all');
      expect(res.status).toBe(200);
      expect(res.text).toBe('Test info lab6.');
    });
  });

  describe('GET /user', () => {
    it('should return 200 with the correct message', async () => {
      const res = await request(app).get('/user');
      expect(res.status).toBe(200);
      expect(res.text).toBe('Test User l.');
    });
  });

  describe('GET /admin', () => {
    it('should return 200 with the correct message', async () => {
      const res = await request(app).get('/admin');
      expect(res.status).toBe(200);
      expect(res.text).toBe('Test Admin lab6.');
    });
  });
});
