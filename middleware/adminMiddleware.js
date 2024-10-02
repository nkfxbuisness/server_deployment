const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');

const authenticateAdmin = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: 'Admin not found, authorization denied' });
    }

    req.admin = admin; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorizeAdminRoles = (allowedRoles) => {
  return (req, res, next) => {
    const adminRoles = req.admin.roles;
    
    const hasRole = allowedRoles.some(role => adminRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};