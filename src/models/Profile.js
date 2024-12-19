import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema(
  {
    name: String,
    link: String,
    headline: String,
    location: String,
    userId: String,
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {versionKey: false}
)

const Profile = mongoose.model('Profile', profileSchema)

export default Profile
