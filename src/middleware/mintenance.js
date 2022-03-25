const mintenanceHandler = (req, res, next) => {
  console.log(req.method, req.path);
  res.status(503).send({
    conten: 'Mintenance mode is on.\nCome back later',
  });
};

module.exports = mintenanceHandler;
