const jwt = require("jsonwebtoken");

const signAccessToken = (user, expire=process.env.JWT_ACCESS_SECRET_DEFAULT_EXPIRE) => {
    return jwt.sign(
        user,
        process.env.JWT_ACCESS_SECRET,
        { 
            expiresIn: expire 
        }
    );
};

const signRefreshToken = (user, expire=process.env.JWT_REFRESH_SECRET_DEFAULT_EXPIRE) => {
    return jwt.sign(
        user,
        process.env.JWT_REFRESH_SECRET,
        { 
            expiresIn: expire 
        }
    );
};

module.exports = {
    signAccessToken,
    signRefreshToken
};