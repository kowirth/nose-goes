import React, { useState, useRef, useEffect } from 'react';
import Confetti from 'react-confetti';
import html2canvas from 'html2canvas';
import './App.css';

const App = () => {
  const [gameState, setGameState] = useState('waiting'); // waiting, countdown, playing, winner
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState(null);
  const [winnerImage, setWinnerImage] = useState(null);
  const [players, setPlayers] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [latestHands, setLatestHands] = useState([]);
  const [latestFaces, setLatestFaces] = useState([]);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handModelRef = useRef(null);
  const faceModelRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  
  // Handle video ready state
  const handleVideoReady = () => {
    console.log('Video loadeddata event fired');
    if (videoRef.current) {
      console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
      console.log('Video readyState:', videoRef.current.readyState);
      
      if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
        setVideoReady(true);
        console.log('Video is ready for processing');
      } else {
        console.log('Video dimensions are still 0, waiting...');
      }
    } else {
      console.log('Video ref is null in handleVideoReady');
    }
  };
  
  // Audio for countdown
  const playCountdownSound = (number) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(number === 0 ? 800 : 400, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Initialize models and webcam
  useEffect(() => {
    const initializeModels = async () => {
      try {
        // Load MediaPipe scripts from CDN
        const loadScript = (src) => {
          return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
              resolve();
              return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        };

        // Load MediaPipe scripts
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');

        // Wait for MediaPipe to be available
        while (!window.Hands || !window.FaceMesh) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Initialize MediaPipe Hands
        const hands = new window.Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });
        
        hands.setOptions({
          maxNumHands: 4,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        hands.onResults((results) => {
          setLatestHands(results.multiHandLandmarks || []);
        });
        
        handModelRef.current = hands;
        
        // Initialize MediaPipe Face Mesh
        const faceMesh = new window.FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
        });
        
        faceMesh.setOptions({
          maxNumFaces: 4,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        faceMesh.onResults((results) => {
          setLatestFaces(results.multiFaceLandmarks || []);
        });
        
        faceModelRef.current = faceMesh;
        
        setModelsLoaded(true);
        console.log('MediaPipe models loaded successfully');
      } catch (error) {
        console.error('Error loading MediaPipe models:', error);
      }
    };
    
    initializeModels();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Detection loop
  useEffect(() => {
    const detectPoses = async () => {
      if (
        videoRef.current &&
        handModelRef.current &&
        faceModelRef.current &&
        gameState === 'playing' &&
        modelsLoaded &&
        videoReady &&
        videoRef.current.videoWidth > 0 &&
        videoRef.current.videoHeight > 0
      ) {
        try {
          // Create a canvas to process the video frame
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          
          // Draw the current video frame to canvas
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          
          // Process with MediaPipe (we'll handle results in callbacks)
          await handModelRef.current.send({ image: canvas });
          await faceModelRef.current.send({ image: canvas });
          
        } catch (error) {
          console.error('Detection error:', error);
        }
      }
      
      if (gameState === 'playing' && modelsLoaded && videoReady) {
        animationRef.current = requestAnimationFrame(detectPoses);
      }
    };
    
    if (gameState === 'playing' && modelsLoaded && videoReady) {
      detectPoses();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, modelsLoaded, videoReady]);

  // Process detections when new results are available
  useEffect(() => {
    if (gameState === 'playing' && (latestHands.length > 0 || latestFaces.length > 0)) {
      processDetections();
    }
  }, [latestHands, latestFaces, gameState]);

  const processDetections = () => {
    const newPlayers = [];
    
    // Create player objects for each detected face
    latestFaces.forEach((face, faceIndex) => {
      const player = {
        id: faceIndex,
        face: face,
        hands: [],
        touchingNose: false
      };
      
      // Find hands that belong to this face (simplified proximity check)
      latestHands.forEach((hand) => {
        // MediaPipe hand landmarks: 9 is middle finger MCP
        const handCenter = hand[9];
        // MediaPipe face landmarks: 1 is nose tip
        const noseTip = face[1];
        
        if (handCenter && noseTip) {
          const distance = Math.sqrt(
            Math.pow((handCenter.x * videoRef.current.videoWidth) - (noseTip.x * videoRef.current.videoWidth), 2) + 
            Math.pow((handCenter.y * videoRef.current.videoHeight) - (noseTip.y * videoRef.current.videoHeight), 2)
          );
          
          // If hand is close to face, assign it to this player
          if (distance < 200) {
            player.hands.push(hand);
            
            // Check if touching nose - MediaPipe hand landmarks: 8 is index finger tip
            const fingerTip = hand[8];
            
            const noseDistance = Math.sqrt(
              Math.pow((fingerTip.x * videoRef.current.videoWidth) - (noseTip.x * videoRef.current.videoWidth), 2) + 
              Math.pow((fingerTip.y * videoRef.current.videoHeight) - (noseTip.y * videoRef.current.videoHeight), 2)
            );
            
            if (noseDistance < 50) {
              player.touchingNose = true;
              console.log('Nose touched');
              handleWinner(faceIndex);
            }
          }
        }
      });
      
      newPlayers.push(player);
    });
    
    setPlayers(newPlayers);
  };

  const initializeCamera = async () => {
    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
      });
      
      console.log('Camera stream obtained:', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraReady(true);
        console.log('Video stream set to video element');
      } else {
        console.error('Video ref is null');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied. Please allow camera access and refresh the page.');
    }
  };

  const handleWinner = async (playerId) => {
    if (winner) return; // Already have a winner
    
    setWinner(playerId);
    
    // Take screenshot of winner's face
    try {
      const canvas = await html2canvas(videoRef.current, {
        useCORS: true,
        allowTaint: true
      });
      
      setWinnerImage(canvas.toDataURL());
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
    
    // Keep the webcam footage visible for 3 seconds to show the crown
    setTimeout(() => {
      setGameState('winner');
    }, 3000);
  };

  const startGame = async () => {
    if (!modelsLoaded) {
      alert('Models are still loading, please wait...');
      return;
    }
    
    setGameState('countdown');
    setCountdown(3);
    setWinner(null);
    setWinnerImage(null);
    setPlayers([]);
    
    // Initialize camera when we switch to countdown (video element is now rendered)
    setTimeout(async () => {
      await initializeCamera();
    }, 100); // Small delay to ensure video element is rendered
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          playCountdownSound(0); // "Go!" sound
          setTimeout(() => {
            setGameState('playing');
          }, 1000);
          clearInterval(countdownInterval);
          return 0;
        } else {
          playCountdownSound(prev - 1);
          return prev - 1;
        }
      });
    }, 1000);
  };

  const resetGame = () => {
    setGameState('waiting');
    setCountdown(3);
    setWinner(null);
    setWinnerImage(null);
    setPlayers([]);
  };

  return (
    <div className="App">
      {gameState === 'waiting' && (
        <div className="start-screen">
          <h1>🎯 NOSE GOES!</h1>
          <p>The ultimate drinking game digitized!</p>
          <p>When the countdown ends, be the first to touch your nose!</p>
          {!modelsLoaded && <p>Loading AI models...</p>}
          {!cameraReady && modelsLoaded && <p>Click Start Game to enable camera</p>}
          {cameraReady && !videoReady && <p>Camera ready, waiting for video...</p>}
          {modelsLoaded && cameraReady && videoReady && <p>All systems ready!</p>}
          <button 
            onClick={startGame} 
            className="start-button"
            disabled={!modelsLoaded}
          >
            {modelsLoaded ? 'Start Game' : 'Loading...'}
          </button>
        </div>
      )}

      {gameState === 'countdown' && (
        <div className="countdown-screen">
          <div className="countdown-number">
            {countdown === 0 ? 'GO!' : countdown}
          </div>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'countdown') && (
        <div className="game-screen">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="webcam-video"
            onLoadedData={handleVideoReady}
          />
          <canvas ref={canvasRef} className="overlay-canvas" />
          
          {players.map((player, index) => (
            player.face && player.touchingNose && (
              <div
                key={player.id}
                className="crown"
                style={{
                  left: `${(player.face[10].x) * 100}%`,
                  top: `${(player.face[10].y) * 100 - 8}%`
                }}
              >
                👑
              </div>
            )
          ))}
        </div>
      )}

      {gameState === 'winner' && (
        <div className="winner-screen">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={200}
            recycle={false}
          />
          <div className="winner-content">
            <h1 className="winner-text">🎉 WINNER! 🎉</h1>
            {winnerImage && (
              <img 
                src={winnerImage} 
                alt="Winner" 
                className="winner-image"
              />
            )}
            <button onClick={resetGame} className="play-again-button">
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
