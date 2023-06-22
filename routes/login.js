const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../schemas/user");
const key = require("../security/key");

router.route("/").post(async (req, res) => {
    const { nickname, password } = req.body;

    try {
        const user = await User.findOne({ nickname });

        if (!user || password !== user.password) {
            return res
                .status(412)
                .json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
        } else {
            if (password === user.password) {
                const token = jwt.sign({ userId: user.userId }, key);

                res.cookie("Authorization", `Bearer ${token}`);
                return res.status(200).json({ token });
            } else {
                return res.status(400).json({ errorMessage: "로그인에 실패하였습니다." });
            }
        }
    } catch (err) {
        console.error(`POST /api/login error message: ${err}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
