module.exports = (req, res, next) => {
  try {
    // 🔐 Check if user exists (from auth middleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please login.' });
    }

    // 🔒 Check admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    return res.status(500).json({ message: 'Server error in admin auth' });
  }
};