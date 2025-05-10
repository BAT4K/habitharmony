const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  type: String,
  name: String,
  description: String,
  unlockedAt: { type: Date, default: Date.now }
});

const LeaderboardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  habitsCompleted: { type: Number, default: 0 },
  challengesWon: { type: Number, default: 0 },
  achievements: { type: [AchievementSchema], default: [] },
  lastUpdated: { type: Date, default: Date.now },
  rank: { type: Number, default: 0 }
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema); 