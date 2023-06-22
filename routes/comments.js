const express = require("express");
const router = express.Router();
const Comment = require("../schemas/comment");
const Post = require("../schemas/post");
const mongoose = require("mongoose");
const authMiddleware = require("../security/auth-middleware");
const { ObjectId } = mongoose.Types;

router
    .route("/:postId")
    .get(async (req, res) => {
        const { postId } = req.params;

        if (!ObjectId.isValid(postId)) {
            return res
                .status(400)
                .json({ message: "데이터 형식이 올바르지 않습니다." });
        } else {
            try {
                const result = await Comment.find({ postId }).sort({
                    createdAt: -1,
                });
                // 아래 부분 다시 보기
                res.status(200).send(
                    result.map((data) => {
                        return {
                            commentId: data._id,
                            user: data.user,
                            content: data.content,
                            createdAt: data.createdAt,
                        };
                    })
                );
            } catch (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
        }
    })
    .post(authMiddleware, async (req, res) => {
        const { postId } = req.params;
        const { content } = req.body;
        const { nickname } = res.locals.user;

        try {
            const post = await Post.findOne({ _id: postId }).exec();
            if (!post) {
                return res
                    .status(404)
                    .json({ errorMessage: "게시글이 존재하지 않습니다." });
            }

            if (!content) {
                return res
                    .status(400)
                    .json({ message: "댓글 내용을 입력해주세요." });
            }
            if (!ObjectId.isValid(postId) || !postId) {
                return res
                    .status(412)
                    .json({ message: "데이터 형식이 올바르지 않습니다." });
            }
            await Comment.create({ postId, user: nickname, content });

            return res.status(201).json({ message: "댓글을 생성하였습니다." });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

router
    .route("/:id")
    .put(authMiddleware, async (req, res) => {
        const { id } = req.params;
        const { content } = req.body;
        const { nickname } = res.locals.user;

        if (!content) {
            return res
                .status(400)
                .json({ message: "댓글 내용을 입력해주세요" });
        }

        if (!ObjectId.isValid(id)) {
            return res
                .status(400)
                .json({ message: "데이터 형식이 올바르지 않습니다." });
        } else {
            try {
                const comment = await Comment.findOne({ _id: id });

                if (!comment) {
                    return res
                        .status(404)
                        .json({ message: "댓글이 존재하지 않습니다." });
                }
                if (nickname !== comment.user) {
                    return res.status(403).json({
                        errorMessage: "댓글의 수정 권한이 존재하지 않습니다.",
                    });
                }

                await Comment.updateOne({ _id: id }, { content });
                return res
                    .status(200)
                    .json({ message: "댓글을 수정하였습니다." });
            } catch (err) {
                console.error(`comment put error : ${err}`);
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
        }
    })
    .delete(authMiddleware, async (req, res) => {
        const { id } = req.params;
        const { nickname } = res.locals.user;

        if (!ObjectId.isValid(id)) {
            return res
                .status(400)
                .json({ message: "데이터 형식이 올바르지 않습니다." });
        }

        try {
            const comment = await Comment.findOne({ _id: id });

            if (!comment) {
                return res.status(404).json({
                    message: "댓글이 존재하지 않습니다.",
                });
            }

            if (nickname !== comment.user) {
                return res
                    .status(403)
                    .json({
                        errorMessage: "댓글의 삭제 권한이 존재하지 않습니다.",
                    });
            }

            await Comment.deleteOne({ _id: id });
            return res.status(200).json({ message: "댓글을 삭제하였습니다." });
        } catch (err) {
            console.error(`comments delete error message: ${err}`);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

module.exports = router;
