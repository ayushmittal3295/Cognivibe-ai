import * as faceapi from 'face-api.js';

class EmotionDetector {
  constructor() {
    this.faceapiLoaded = false;
    this.video = null;
    this.isDetecting = false;
    this.detectionInterval = null;
  }

  async initialize() {
    try {
      console.log('Loading face detection models from /models...');
      
      // Load face-api.js models with better configuration
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
      ]);
      
      this.faceapiLoaded = true;
      console.log('✅ Emotion detector initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize emotion detector:', error);
      this.faceapiLoaded = false;
      return false;
    }
  }

  async startWebcam(videoElement) {
    if (!this.faceapiLoaded) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Failed to load face detection models');
      }
    }

    this.video = videoElement;
    
    try {
      console.log('📷 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: 640,
          height: 480,
          facingMode: 'user',
          frameRate: { ideal: 30 }
        } 
      });
      
      this.video.srcObject = stream;
      
      return new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play()
            .then(() => {
              console.log('✅ Camera started successfully');
              resolve(true);
            })
            .catch(err => {
              console.error('Error playing video:', err);
              resolve(false);
            });
        };
      });
    } catch (error) {
      console.error('❌ Error accessing webcam:', error);
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera access denied. Please allow camera access.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera found. Please connect a camera.');
      } else {
        throw error;
      }
    }
  }

  stopWebcam() {
    if (this.video && this.video.srcObject) {
      const tracks = this.video.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      this.video.srcObject = null;
    }
    this.isDetecting = false;
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    console.log('Camera stopped');
  }

  async detectEmotion() {
    if (!this.faceapiLoaded || !this.video || this.video.paused || this.video.readyState < 2) {
      return null;
    }

    try {
      // Use smaller input size for faster detection
      const detections = await faceapi
        .detectSingleFace(this.video, new faceapi.TinyFaceDetectorOptions({
          inputSize: 160, // Smaller = faster detection
          scoreThreshold: 0.3 // Lower threshold to detect faces more easily
        }))
        .withFaceExpressions();

      if (detections && detections.expressions) {
        const expressions = detections.expressions;
        
        // Get the dominant emotion with highest confidence
        let dominantEmotion = 'neutral';
        let maxConfidence = 0;

        for (const [emotion, confidence] of Object.entries(expressions)) {
          if (confidence > maxConfidence) {
            maxConfidence = confidence;
            dominantEmotion = emotion;
          }
        }

        // Only return if confidence is high enough
        if (maxConfidence > 0.4) {
          console.log(`Detected emotion: ${dominantEmotion} (${(maxConfidence * 100).toFixed(1)}%)`);
          
          return {
            emotion: dominantEmotion,
            confidence: maxConfidence,
            allEmotions: expressions,
            timestamp: new Date().toISOString()
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error detecting emotion:', error);
      return null;
    }
  }

  startContinuousDetection(callback, interval = 500) { // Reduced to 500ms for faster updates
    this.isDetecting = true;
    
    // Clear any existing interval
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
    
    // Use setInterval for more consistent timing
    this.detectionInterval = setInterval(async () => {
      if (!this.isDetecting) return;
      
      const result = await this.detectEmotion();
      if (result) {
        callback(result);
      }
    }, interval);
    
    console.log(`Started continuous detection with ${interval}ms interval`);
  }

  stopContinuousDetection() {
    this.isDetecting = false;
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    console.log('Stopped continuous detection');
  }

  getEmotionColor(emotion) {
    const colors = {
      happy: '#FFD700',
      sad: '#4169E1',
      angry: '#DC143C',
      fearful: '#800080',
      surprised: '#FFA500',
      disgusted: '#228B22',
      neutral: '#808080',
      stressed: '#AA44FF',
      bored: '#88AAFF',
      focused: '#44FFAA'
    };
    
    return colors[emotion] || colors.neutral;
  }

  // Get emoji for emotion (optional)
  getEmotionEmoji(emotion) {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      fearful: '😨',
      surprised: '😲',
      disgusted: '🤢',
      neutral: '😐',
      stressed: '😫',
      bored: '😴',
      focused: '🤓'
    };
    
    return emojis[emotion] || '😐';
  }
}

export default new EmotionDetector();