const User = require('./User');
const MoodHistory = require('./MoodHistory');
const QuizResult = require('./QuizResult');
const LearningPath = require('./LearningPath');

// Define associations
User.hasMany(MoodHistory, { foreignKey: 'userId', onDelete: 'CASCADE' });
MoodHistory.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(QuizResult, { foreignKey: 'userId', onDelete: 'CASCADE' });
QuizResult.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(LearningPath, { foreignKey: 'userId', onDelete: 'CASCADE' });
LearningPath.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  MoodHistory,
  QuizResult,
  LearningPath
};