const jwt = require("jsonwebtoken");

const verifyAccessToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
      return res.status(401).json({
          status: "error", 
          message: "Unauthorized: Authentication required",
          data: {}
      });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
      if (err) {
      return res.status(401).json({
          status: "error", 
          message: "Unauthorized: Invalid Authentication",
          data: {}
      });
      }

      req.user = decoded;
      next();
  });
};

const verifyRefreshToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
      return res.status(401).json({
          status: "error", 
          message: "Unauthorized: Authentication required",
          data: {}
      });
  }

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
      return res.status(401).json({
          status: "error", 
          message: "Unauthorized: Invalid Authentication",
          data: {}
      });
      }

      req.user = decoded;
      next();
  });
};

module.exports = {
    verifyAccessToken,
    verifyRefreshToken
};