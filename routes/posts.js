const express = require("express");
const router = express.Router();
const Post = require("../schemas/post");
const User = require("../schemas/user");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const authMiddleware = require("../security/auth-middleware");

// router.use(authMiddleware);

router
    .route("/")
    .get(async (req, res) => {
        try {
            const result = await Post.find({}).sort({ createdAt: -1 }).populate("userId").exec();
            console.log(result);
            return res.status(200).json({
                posts: result.map((data) => {
                    return {
                        postId: data._id,
                        userId: data.userId._id,
                        nickname: data.userId.nickname,
                        title: data.title,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt
                    };
                }),
            });
        } catch (err) {
            console.error(`GET /api/posts Error Message: ${err}`);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    })
    .post(authMiddleware, async (req, res) => {
        // const { user, password, title, content } = req.body;
        const { nickname, _id } = res.locals.user;
        const { title, content } = req.body;

        // 완료?    # 412 body 데이터가 정상적으로 전달되지 않는 경우
        //          {"errorMessage": "데이터 형식이 올바르지 않습니다."}
        // # 412 Title의 형식이 비정상적인 경우
        // {"errorMessage": "게시글 제목의 형식이 일치하지 않습니다."}
        // # 412 Content의 형식이 비정상적인 경우
        // {"errorMessage": "게시글 내용의 형식이 일치하지 않습니다."}
        // # 403 Cookie가 존재하지 않을 경우
        // {"errorMessage": "로그인이 필요한 기능입니다."}
        // # 403 Cookie가 비정상적이거나 만료된 경우
        // {"errorMessage": "전달된 쿠키에서 오류가 발생하였습니다."}
        // # 400 예외 케이스에서 처리하지 못한 에러
        // {"errorMessage": "게시글 작성에 실패하였습니다."}
        if (!title || !content) {
            return res
                .status(412)
                .json({ message: "데이터 형식이 올바르지 않습니다." });
        }

        try {
            await Post.create({ userId: _id, user: nickname, title, content });
            return res
                .status(201)
                .json({ message: "게시글을 생성하였습니다." });
        } catch (err) {
            console.error(`POST /api/posts error message: ${err}`);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

router
    .route("/:id")
    .get(async (req, res) => {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res
                .status(400)
                .json({ message: "데이터 형식이 올바르지 않습니다." });
        } else {
            try {
                const result = await Post.findOne({ _id: id });

                if (result) {
                    return res.status(200).send({
                        postId: result._id,
                        user: result.user,
                        title: result.title,
                        content: result.content,
                        createdAt: result.createdAt,
                    });
                } else {
                    return res
                        .status(400)
                        .json({ message: "게시글 조회에 실패하였습니다." });
                }
            } catch (err) {
                console.error(`GET /api/posts/:id Error Message: ${err}`);
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
        }
    })
    .put(async (req, res) => {
        const { id } = req.params;
        const { user, content, password, title } = req.body;

        if (!ObjectId.isValid(id) || !user || !password || !title | !content) {
            res.status(400).json({
                message: "데이터 형식이 올바르지 않습니다.",
            });
        } else {
            try {
                const post = await Post.findOne({ _id: id });

                if (!post) {
                    return res
                        .status(400)
                        .json({ message: "게시글 조회에 실패하였습니다." });
                } else {
                    if (post.password === password) {
                        await Post.updateOne(
                            { _id: id },
                            { user, content, title }
                        );
                        return res
                            .status(200)
                            .json({ message: "게시글을 수정하였습니다." });
                    } else {
                        return res
                            .status(400)
                            .json({ message: "비밀번호가 일치하지 않습니다." });
                    }
                }
            } catch (err) {
                console.error(`PUT /api/posts/:id Error Message: ${err}`);
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
        }
    })
    .delete(async (req, res) => {
        const { id } = req.params;
        const { password } = req.body;

        if (!ObjectId.isValid(id) || !password) {
            res.status(400).json({
                message: "데이터 형식이 올바르지 않습니다.",
            });
        } else {
            try {
                const post = await Post.findOne({ _id: id });

                if (!post) {
                    res.status(400).json({
                        message: "게시글 조회에 실패하였습니다.",
                    });
                } else {
                    if (post.password === password) {
                        await Post.deleteOne({ _id: id });
                        return res
                            .status(200)
                            .json({ message: "게시글은 삭제하였습니다." });
                    } else {
                        return res
                            .status(400)
                            .json({ message: "비밀번호가 일치하지 않습니다." });
                    }
                }
            } catch (err) {
                console.error(`DELETE /api/posts/:id Error Message: ${err}`);
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
        }
    });

module.exports = router;
