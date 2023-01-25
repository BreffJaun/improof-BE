// S E T:  C O N T R O L L E R

// For Wrong Paths
const wrongGetController = (req, res, next) => {
  try {
    res.status(404).json(`Unknown GET path ${req.url}! Please check your path!`);
  } catch (err) {
    console.log(err);
  }
};

const wrongPutController = (req, res, next) => {
  try {
    res.status(404).json(`Unknown PUT path ${req.url}! Please check your path!`);
  } catch (err) {
    console.log(err);
  }
};

const wrongPostController = (req, res, next) => {
  try {
    res.status(404).json(`Unknown POST path ${req.url}! Please check your path!`);
  } catch (err) {
    console.log(err);
  }
};

const wrongDeleteController = (req, res, next) => {
  try {
    res.status(404).json(`Unknown DELETE path ${req.url}! Please check your path!`);
  } catch (err) {
    console.log(err);
  }
}

export {
  wrongGetController,
  wrongPutController,
  wrongPostController,
  wrongDeleteController
}