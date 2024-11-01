const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

let corsOptions = {
  origin: 'http://localhost:8888',
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const db = require('./app/models');
const Role = db.role;

db.sequelize.sync({ force: true }).then(() => {
  console.log('Drop and Resync Database with { force: true }');
  initial();
});

app.get('/', (req, res) => {
  res.json({ message: 'Test lab 4!' });
});

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

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
