// E R R O R   H A N D L E R
const errorHandler = (err, req, res, next) => {
  // CONSOLE OUTPUT
  console.log('err.name: ',  err.name);
  console.log('err.message: ', err.message);
  console.log('err.statusCode: ', err.statusCode);

  // RESPONSE OUTPUT
  const statusCode = err.statusCode ?? 500; 
  res.status(statusCode).send({
    error: {
      status: statusCode,
      message: err.message
    }
  });
};

export {errorHandler};