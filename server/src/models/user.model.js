import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ['student', 'maintainer', 'admin'],
      default: 'student'
    },

    bio: {
      type: String,
      trim: true
    },

    skills: {
      type: [String]
    },

    projectsContributedTo: {
      type: [Schema.Types.ObjectId],
      ref: 'Project'
    },

    completedContributions: {
      type: [Schema.Types.ObjectId],
      ref: 'Contribution'
    }
  },
  {
    timestamps: true
  }
)

const User = mongoose.model('User', userSchema)

export default User