const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

let corsOptions = {
  origin: [
    'https://cultured-abaft-antimony.glitch.me',
    'https://sirgeckt0r.github.io',
  ],
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const db = require('./app/models');
const Role = db.role;

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

db.sequelize.sync({ force: true }).then(() => {
  console.log('Drop and Resync Database with { force: true }');
  initial();
});
app.get('/', (req, res) => {
  res.json({ message: 'Test lab 6!' });
});

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

function initial() {
  Role.create({
    id: 1,
    name: 'user',
  });
  Role.create({
    id: 2,
    name: 'admin',
  });
}

module.exports = app;
