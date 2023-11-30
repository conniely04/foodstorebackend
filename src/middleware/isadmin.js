// middleware/isAdmin.js
export default function isAdmin(req, res, next) {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).send("Access denied.");
  }
}
