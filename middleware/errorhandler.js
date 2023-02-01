// E R R O R   H A N D L E R
const errorHandler = (err, req, res, next) => {
  // CONSOLE OUTPUT
  console.log('error: ',  err);

  // RESPONSE OUTPUT
  const statusCode = err.statusCode ?? 500; 
  res.status(statusCode).send({
    error: {
      status: false,
      statusCode: statusCode,
      message: err.message
    }
  });
};

export {errorHandler};