const jwt = require("jsonwebtoken");
const User = require("../schemas/user");
const key = require("./key");

module.exports = async (req, res, next) => {
    if (!req.cookies) {
        return res.status(403).json({ errorMessage: "로그인이 필요한 기능입니다." });
    }

    const { Authorization } = req.cookies;
    const [authType, authToken] = (Authorization ?? "").split(" ");
    // console.log(`authType: ${authType}`);
    // console.log(`authToken: ${authToken}`);

    if (!authToken || authType !== "Bearer") {
        return res.status(401).send({
            errorMessage: "로그인 후 이용 가능한 기능입니다.",
        });
    }

    try {
        const { userId } = jwt.verify(authToken, key);
        const user = await User.findById(userId);
        // 아래 코드 다시 보기
        if (!user) {
            return res.status(404).json({ errorMessage: "존재하지 않는 유저입니다." });
        }
        res.locals.user = user;
        // console.log(`res.locals.user: ${res.locals.user}`);
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).send({
            errorMessage: "로그인 후 이용 가능한 기능입니다.",
        });
    }
};