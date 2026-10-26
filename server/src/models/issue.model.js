import mongoose, { Schema } from 'mongoose'

const issueSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            required: true
        },
        requiredSkills: {
            type: [String],
            default: []
        },
        status: {
            type: String,
            enum: ['open', 'claimed', 'completed', 'closed'],
            default: 'open'
        },
        claimedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        claimedAt: Date,
        completedAt: Date,
        verifiedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    {
        timestamps: true
    }
)

const Issue = mongoose.model('Issue', issueSchema)

export default Issue
