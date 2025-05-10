const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Compound index to ensure unique pending requests
friendRequestSchema.index(
    { fromUser: 1, toUser: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
);

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
module.exports = FriendRequest; 