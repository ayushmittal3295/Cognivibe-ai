const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LearningPath = sequelize.define('LearningPath', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false
  },
  currentLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  progress: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  recommendations: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  lastAccessed: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = LearningPath;