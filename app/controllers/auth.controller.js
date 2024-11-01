const db = require('../models');
const config = require('../config/auth.config');
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

let jwt = require('jsonwebtoken');
let bcrypt = require('bcryptjs');

exports.signup = (req, res) => {
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  })
    .then((user) => {
      user;

      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles,
            },
          },
        }).then((roles) => {
          user.setRoles(roles).then(() => {
            res.send({ message: 'User registered successfully!' });
          });
        });
      } else {
        user.setRoles([1]).then(() => {
          res.send({ message: 'User registered successfully!' });
        });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

const crypto = require('crypto');

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'User Not found.' });
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          message: 'Invalid Password!',
        });
      }

      const token = jwt.sign({ id: user.id }, config.secret, {
        algorithm: 'HS256',
        allowInsecureKeySizes: true,
        expiresIn: 60,
      });

      const refreshToken = crypto.randomBytes(64).toString('hex');
      const refreshTokenExpiration = Date.now() + 24 * 60 * 60 * 1000;

      user.update({
        refreshToken: refreshToken,
        expiresRefreshToken: refreshTokenExpiration.toString(),
      });

      // res.header('Authorization', token);

      // res.cookie('refresh-token', refreshToken, {
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: 'Strict',
      //   maxAge: 24 * 60 * 60 * 1000,
      // });

      res.cookie('access-token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 60 * 1000,
      });
      res.cookie('refresh-token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      const authorities = [];
      user.getRoles().then((roles) => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push('ROLE_' + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          refreshToken: user.refreshToken,
          expiresRefreshToken: user.expiresRefreshToken,
          roles: authorities,
        });
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.refreshToken = (req, res) => {
  let refreshToken = req.cookies['refresh-token'];

  if (!refreshToken) {
    return res.status(403).send({ message: 'No refresh token provided!' });
  }

  User.findOne({
    where: {
      refreshToken: refreshToken,
    },
  })
    .then((user) => {
      if (!user) {
        return res.status(403).send({ message: 'Refresh token is not valid!' });
      }

      if (Date.now() > parseInt(user.expiresRefreshToken)) {
        return res.status(403).send({ message: 'Refresh token has expired!' });
      }

      const newAccessToken = jwt.sign({ id: user.id }, config.secret, {
        algorithm: 'HS256',
        allowInsecureKeySizes: true,
        expiresIn: 60,
      });

      // res.header('Authorization', newAccessToken);
      res.cookie('access-token', newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 60 * 1000,
      });
      res.status(200).send({ message: 'Refresh successful' });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.logout = (req, res) => {
  const refreshToken = req.cookies['refresh-token'];

  if (!refreshToken) {
    return res.status(200).send({ message: 'No token, Logout successful' });
  }

  User.findOne({
    where: {
      refreshToken: refreshToken,
    },
  })
    .then((user) => {
      if (user) {
        user.update({
          refreshToken: null,
          expiresRefreshToken: null,
        });

        res.cookie('refresh-token', '', {
          httpOnly: true,
          secure: true,
          sameSite: 'Strict',
          maxAge: 0,
        });

        res.cookie('access-token', '', {
          httpOnly: true,
          secure: true,
          sameSite: 'Strict',
          maxAge: 0,
        });

        return res.status(200).send({ message: 'Logout successful with user' });
      }

      return res.status(200).send({ message: 'Logout successful' });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
