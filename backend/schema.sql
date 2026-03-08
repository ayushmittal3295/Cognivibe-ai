-- Create database
CREATE DATABASE IF NOT EXISTS cognivibe_db;
USE cognivibe_db;

-- Users table
CREATE TABLE IF NOT EXISTS Users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    learningLevel ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    preferredTopics JSON,
    lastActive DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Mood History table
CREATE TABLE IF NOT EXISTS MoodHistories (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    emotion ENUM('happy', 'sad', 'angry', 'stressed', 'bored', 'focused', 'neutral') NOT NULL,
    confidence FLOAT NOT NULL,
    source ENUM('webcam', 'text', 'manual') DEFAULT 'webcam',
    intensity INT,
    notes TEXT,
    metadata JSON,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_createdAt (createdAt)
);

-- Quiz Results table
CREATE TABLE IF NOT EXISTS QuizResults (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    quizType VARCHAR(255) NOT NULL,
    score FLOAT NOT NULL,
    totalQuestions INT NOT NULL,
    correctAnswers INT NOT NULL,
    timeSpent INT,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    topics JSON,
    emotionDuringQuiz VARCHAR(50),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_createdAt (createdAt)
);

-- Learning Paths table
CREATE TABLE IF NOT EXISTS LearningPaths (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    currentLevel INT DEFAULT 1,
    progress FLOAT DEFAULT 0,
    recommendations JSON,
    lastAccessed DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_topic (userId, topic),
    INDEX idx_userId (userId)
);