import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: [ 'user', 'ai' ],
            required: true,
        },
        // set when the AI prepared an email for the user to review and send
        emailDraft: {
            type: new mongoose.Schema(
                {
                    to: { type: String, default: '' },
                    subject: { type: String, default: '' },
                    body: { type: String, default: '' },
                    status: { type: String, enum: [ 'draft', 'sent' ], default: 'draft' },
                    sentAt: { type: Date },
                },
                { _id: false }
            ),
            default: undefined,
        },
    },
    { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: 1 });

const messageModel = mongoose.model('Message', messageSchema);

export default messageModel;