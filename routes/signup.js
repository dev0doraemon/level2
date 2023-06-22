const express = require("express");
const router = express.Router();
const Users = require("../schemas/user");

router
    .route("/")
    .post(async (req, res) => {
        const { nickname, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res
                .status(412)
                .json({ errorMessage: "패스워드가 일치하지 않습니다." });
        }
        // # 412 닉네임 형식이 비정상적인 경우
        // {"errorMessage": "닉네임의 형식이 일치하지 않습니다."}
        // 처리 완료 # 412 password가 일치하지 않는 경우
        // {"errorMessage": "패스워드가 일치하지 않습니다."}
        // # 412 password 형식이 비정상적인 경우
        // {"errorMessage": "패스워드 형식이 일치하지 않습니다.}
        // # 412 password에 닉네임이 포함되어있는 경우
        // {"errorMessage": "패스워드에 닉네임이 포함되어 있습니다."}
        // # 412 닉네임이 중복된 경우
        // {"errorMessage": "중복된 닉네임입니다."}
        // # 400 예외 케이스에서 처리하지 못한 에러
        // {"errorMessage": "요청한 데이터 형식이 올바르지 않습니다."}
        try {
            const existsUser = await Users.findOne({ nickname });
            if (existsUser) {
                return res.status(400).json({
                    errorMessage: "이메일 또는 닉네임이 이미 사용중입니다.",
                });
            }

            const user = new Users({ nickname, password });
            await user.save();

            res.status(201).json({ message: "회원 가입에 성공하였습니다." });
        } catch (err) {
            console.error(`POST /signup Error Message: ${err}`);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    })
    .get(async (req, res) => {
        console.log("get");
        return res.status(200).json({ message: "get" });
    });

module.exports = router;
