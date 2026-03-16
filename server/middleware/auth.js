export const authenticateUser = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  next();
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.session.role || !roles.includes(req.session.role)) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    next();
  };
};