export const isManager = (req, res, next) => {
    if (req.user && req.user.Role === 'Manager') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Manager only.' });
    }
  };
  