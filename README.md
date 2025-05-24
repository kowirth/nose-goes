# 🎯 Nose Goes - Digital Drinking Game

A modern, AI-powered version of the classic "Nose Goes" drinking game using webcam hand and face tracking!

## 🎮 How to Play

1. **Setup**: Make sure you have a webcam connected and allow camera permissions when prompted
2. **Start**: Click "Start Game" once the AI models have loaded
3. **Countdown**: Get ready during the "3, 2, 1, GO!" countdown
4. **Race**: Be the first person to touch your nose with your finger!
5. **Winner**: The first person detected touching their nose wins and gets a crown animation
6. **Celebration**: Enjoy the confetti and winner screen with a screenshot of the victor

## 🚀 Features

- **Real-time Hand & Face Tracking**: Uses TensorFlow.js for accurate detection
- **Multi-player Support**: Tracks multiple people simultaneously
- **Beautiful UI**: Modern design with smooth animations
- **Sound Effects**: Audio countdown for better game experience
- **Winner Screenshot**: Automatically captures and displays the winner
- **Confetti Animation**: Celebration effects for the winner
- **Responsive Design**: Works on desktop and mobile devices

## 🛠 Technical Stack

- **React**: Frontend framework
- **TensorFlow.js**: AI/ML for hand and face detection
- **HTML5 Canvas**: For video processing and overlays
- **Web Audio API**: For countdown sound effects
- **CSS3**: Modern styling with animations
- **html2canvas**: For screenshot functionality

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser with webcam support
- Good lighting for optimal face/hand detection

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nose-goes
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Game Rules

- **Traditional Rule**: In the original drinking game, the last person to touch their nose has to drink
- **Digital Version**: First person to touch their nose wins (reversed for more excitement!)
- **Detection**: The AI detects when your index finger touches your nose area
- **Fair Play**: Make sure all players are visible in the camera frame

## 🔧 Troubleshooting

### Camera Issues
- Ensure camera permissions are granted
- Check if another application is using the camera
- Try refreshing the page

### Detection Issues
- Ensure good lighting
- Keep hands and face clearly visible
- Avoid wearing gloves or face coverings
- Position yourself at a reasonable distance from the camera

### Performance Issues
- Close other browser tabs
- Ensure good internet connection for model loading
- Use a modern browser (Chrome, Firefox, Safari, Edge)

## 🎨 Customization

You can customize various aspects of the game:

- **Detection Sensitivity**: Adjust the distance thresholds in `processDetections()`
- **Countdown Duration**: Modify the countdown timer
- **Styling**: Update CSS for different themes
- **Sound Effects**: Replace audio generation with custom sounds

## 📱 Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (not supported)

## 🤝 Contributing

Feel free to contribute to this project! Some ideas:
- Add more sound effects
- Implement different game modes
- Add player name input
- Create tournament brackets
- Add gesture recognition for other games

## 📄 License

This project is open source and available under the MIT License.

## 🎉 Have Fun!

Enjoy playing Nose Goes with your friends! Perfect for parties, gatherings, or just having fun with AI technology.

---

**Note**: This game requires camera access and works best with good lighting and clear visibility of players' faces and hands.
