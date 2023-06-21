const express = require("express");
const router = express.Router();
const Post = require("../schemas/post");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

router
    .route("/")
    .get(async (req, res) => {
        try {
            const result = await Post.find({}).sort({ createdAt: -1 });
            return res.status(200).send(
                result.map((data) => {
                    return {
                        postId: data._id,
                        user: data.user,
                        title: data.title,
                        createdAt: data.createdAt,
                    };
                })
            );
        } catch (err) {
            console.error(`GET / Error Message: ${err}`);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    })
    .post(async (req, res) => {
        const { user, password, title, content } = req.body;

        if (!user || !password || !title || !content) {
            return res
                .status(400)
                .json({ message: "데이터 형식이 올바르지 않습니다." });
        } else {
            try {
                await Post.create({ user, password, title, content });
                return res
                    .status(200)
                    .json({ message: "게시글을 생성하였습니다." });
            } catch (err) {
                console.error(`POST / error message: ${err}`);
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
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
                console.error(`GET /:id Error Message: ${err}`);
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
                console.error(`PUT /:id Error Message: ${err}`);
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
                console.error(`DELETE /:id Error Message: ${err}`);
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
        }
    });

router.use((err, req, res, next) => {
    console.error(`Error Message: ${err.stack}`);
    return res.status(500).send("Internal Server Error");
});

module.exports = router;
