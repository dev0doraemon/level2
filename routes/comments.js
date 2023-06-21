const express = require("express");
const router = express.Router();
const Comment = require("../schemas/comment");
const mongoose = require("mongoose");
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
    .post(async (req, res) => {
        const { postId } = req.params;
        const { user, password, content } = req.body;

        if (!content) {
            return res
                .status(400)
                .json({ message: "댓글 내용을 입력해주세요." });
        } else if (!ObjectId.isValid(postId) || !postId || !user || !password) {
            return res
                .status(400)
                .json({ message: "데이터 형식이 올바르지 않습니다." });
        } else {
            try {
                await Comment.create({ postId, user, password, content });

                return res
                    .status(200)
                    .json({ message: "댓글을 생성하였습니다." });
            } catch (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
        }
    });

router
    .route("/:id")
    .put(async (req, res) => {
        const { id } = req.params;
        const { content, password } = req.body;

        if (!content) {
            return res
                .status(400)
                .json({ message: "댓글 내용을 입력해주세요" });
        } else if (!ObjectId.isValid(id) || !password) {
            return res
                .status(400)
                .json({ message: "데이터 형식이 올바르지 않습니다." });
        } else {
            try {
                const comment = await Comment.findOne({ _id: id });

                if (!comment) {
                    return res
                        .status(400)
                        .json({ message: "댓글 조회에 실패하였습니다." });
                } else {
                    if (comment.password === password) {
                        await Comment.updateOne(
                            { _id: id, password },
                            { content }
                        );
                        return res
                            .status(200)
                            .json({ message: "댓글을 수정하였습니다." });
                    } else {
                        return res
                            .status(400)
                            .json({ message: "비밀번호가 일치하지 않습니다." });
                    }
                }
            } catch (err) {
                console.error(`comment put error : ${err}`);
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
            return res
                .status(400)
                .json({ message: "데이터 형식이 올바르지 않습니다." });
        } else {
            try {
                const comment = await Comment.findOne({ _id: id });

                if (!comment) {
                    res.status(400).json({
                        message: "댓글 조회에 실패하였습니다.",
                    });
                } else {
                    if (comment.password === password) {
                        await Comment.deleteOne({ _id: id, password });
                        return res
                            .status(200)
                            .json({ message: "댓글을 삭제하였습니다." });
                    } else {
                        return res
                            .status(400)
                            .json({ message: "비밀번호가 일치하지 않습니다." });
                    }
                }
            } catch (err) {
                console.error(`comments delete error message: ${err}`);
                return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
            }
        }
    });

module.exports = router;
