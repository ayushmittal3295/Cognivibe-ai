const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');

class EmotionDetectionService {
  constructor() {
    this.faceModel = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Load face emotion detection model
      // Note: In production, you'd load a proper model like face-api.js or custom model
      this.faceModel = await tf.loadLayersModel('file://./models/emotion_model/model.json');
      this.initialized = true;
      console.log('Emotion detection service initialized');
    } catch (error) {
      console.error('Failed to initialize emotion detection:', error);
    }
  }

  async detectFromImage(imageData) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Process image data and run inference
      // This is a simplified example - in production you'd do proper preprocessing
      const tensor = tf.tensor(imageData).reshape([1, 48, 48, 1]);
      const prediction = await this.faceModel.predict(tensor);
      const emotions = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral'];
      const emotionIndex = prediction.argMax(1).dataSync()[0];
      const confidence = prediction.max().dataSync()[0];

      return {
        emotion: emotions[emotionIndex],
        confidence,
        allEmotions: emotions.map((e, i) => ({
          emotion: e,
          score: prediction.dataSync()[i]
        }))
      };
    } catch (error) {
      console.error('Error detecting emotion from image:', error);
      throw error;
    }
  }

  async detectFromText(text) {
    try {
      const tokenizer = new natural.WordTokenizer();
      const tokens = tokenizer.tokenize(text.toLowerCase());
      
      // Use AFINN lexicon for sentiment
      const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
      const score = analyzer.getSentiment(tokens);

      // Map sentiment to emotion
      let emotion, confidence;
      if (score > 0.3) {
        emotion = 'happy';
        confidence = Math.min(0.5 + score, 1);
      } else if (score < -0.3) {
        emotion = score < -0.6 ? 'angry' : 'sad';
        confidence = Math.min(0.5 + Math.abs(score), 1);
      } else {
        emotion = 'neutral';
        confidence = 0.6;
      }

      return {
        emotion,
        confidence,
        score,
        tokens: tokens.length
      };
    } catch (error) {
      console.error('Error detecting emotion from text:', error);
      throw error;
    }
  }

  async detectFromVoice(audioBuffer) {
    // Voice emotion detection would go here
    // This would use speech-to-text and then analyze the text
    // Or use audio features directly
    throw new Error('Voice emotion detection not implemented');
  }
}

module.exports = new EmotionDetectionService();