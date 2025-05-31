const { signAccessToken, signRefreshToken } = require('../../../utils/auth/jwt/sign');

const refresh = async (req, res) => {
    const userTokenSign = {
        email: req.user.email
    };

    return res.status(200).json({
        status: 'success',
        message: "Token Refresh Success",
        data: {
            email: req.user.email,
            access_token: signAccessToken(userTokenSign),
            refresh_token: signRefreshToken(userTokenSign)
        }
    });
};

module.exports = {
    refresh
};