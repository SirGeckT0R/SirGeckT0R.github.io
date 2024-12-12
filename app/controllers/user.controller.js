exports.allAccess = (req, res) => {
  res.status(200).send('Test info lab6.');
};

exports.userBoard = (req, res) => {
  res.status(200).send('Test User lab6.');
};

exports.adminBoard = (req, res) => {
  res.status(200).send('Test Admin lab6.');
};
