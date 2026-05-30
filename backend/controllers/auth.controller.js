const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validationResult } = require('express-validator');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name
    });

    const token = generateToken(user);
    const userData = user.toJSON();
    delete userData.password;

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last active
    await user.update({ lastActive: new Date() });

    const token = generateToken(user);
    const userData = user.toJSON();
    delete userData.password;

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

const verifyFirebaseIdToken = async (idToken) => {
  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('FIREBASE_API_KEY is not configured in backend .env');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    }
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error?.message || 'Invalid Firebase ID token');
  }

  const data = await response.json();
  const userRecord = data.users?.[0];
  if (!userRecord || !userRecord.email) {
    throw new Error('Invalid Firebase token payload');
  }

  return userRecord;
};

const loginWithGoogle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { idToken } = req.body;
    const payload = await verifyFirebaseIdToken(idToken);

    const email = payload.email;
    const name = payload.displayName || email.split('@')[0];
    const avatar = payload.photoUrl || null;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        email,
        name,
        password: Math.random().toString(36).slice(-12),
        avatar
      });
    }

    await user.update({ lastActive: new Date() });

    const token = generateToken(user);
    const userData = user.toJSON();
    delete userData.password;

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: error.message || 'Error during Google login' });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, learningLevel, preferredTopics } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      name: name || user.name,
      learningLevel: learningLevel || user.learningLevel,
      preferredTopics: preferredTopics || user.preferredTopics
    });

    const userData = user.toJSON();
    delete userData.password;

    res.json({
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

module.exports = {
  signup,
  login,
  loginWithGoogle,
  getProfile,
  updateProfile
};