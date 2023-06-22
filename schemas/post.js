const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        user: {
            type: String,
            required: true,
        },
        // password: {
        //     type: String,
        //     required: true
        // },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// postSchema.virtual('userId', {
//     ref: 'User',
//     localField: '_id',
//     foreignField: '_id'
// });

module.exports = mongoose.model("Post", postSchema);
