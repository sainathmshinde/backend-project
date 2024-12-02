//Higher oreder function as Wraper function for the code base with promise

const asyncHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
};

export { asyncHandler };

// -------------------------------------------------------

/* const asyncHandler = () => {};
const asyncHandler = (func) => () => {};
const asyncHandler = (func) => async () => {}; */

//Higher order function as Wraper function for the code base with async await

/* const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(err.code || 500).json({
      success: false,
      message: err.message,
    });
  }
}; */
