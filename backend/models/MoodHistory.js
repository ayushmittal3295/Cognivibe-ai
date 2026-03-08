const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MoodHistory = sequelize.define('MoodHistory', {
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
  emotion: {
    type: DataTypes.ENUM('happy', 'sad', 'angry', 'stressed', 'bored', 'focused', 'neutral'),
    allowNull: false
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 1
    }
  },
  source: {
    type: DataTypes.ENUM('webcam', 'text', 'manual'),
    defaultValue: 'webcam'
  },
  intensity: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 10
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = MoodHistory;