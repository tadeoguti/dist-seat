module.exports = function sanitizeBodyRequest(Sanitizer) {
  return (req, res, next) => {
    if (req.body) {
      Sanitizer.sanitizeObject(req.body);
    }
    if (req.query) {
      Sanitizer.sanitizeObject(req.query);
    }
    if (req.user) {
      Sanitizer.sanitizeObject(req.user);
    }
    next();
  };
};