import React from "react";
import styled from "styled-components";
import "@tensorflow/tfjs";
import * as automl from "@tensorflow/tfjs-automl";

const Header = styled.h1`
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 3px;
  padding: 0 1rem;
`;

const ArmyEmoji = styled.img`
  height: 15px;
  width: 15px;
`;

const HeaderContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  position: fixed;
  z-index: 2;
`;

const VideoCanvasContainer = styled.div`
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const StyledVideo = styled.video`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
`;

const StyledCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
`;

const DescriptionContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  position: fixed;
  z-index: 2;
  bottom: 7vh;
`;

const Description = styled.div`
  background: rgba(255, 255, 255, 0.8);
  max-width: 60vw;
  font-weight: bold;
  border-radius: 3px;
  text-align: center;
  padding: 0.5rem;
`;

const modelUrl = "model/model.json"; // URL to the model.json file.

class App extends React.Component {
  videoRef = React.createRef();
  canvasRef = React.createRef();

  componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const webCamPromise = navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "environment"
          }
        })
        .then(stream => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;
          return new Promise((resolve, reject) => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        });
      // const modelPromise = cocoSsd.load();
      const modelPromise = automl.loadObjectDetection(modelUrl);
      Promise.all([modelPromise, webCamPromise])
        .then(values => {
          this.detectFrame(this.videoRef.current, values[0]);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  detectFrame = (video, model) => {
    const options = { score: 0.985, iou: 0.8, topk: 3 };
    model.detect(video, options).then(predictions => {
      this.renderPredictions(predictions);
      requestAnimationFrame(() => {
        this.detectFrame(video, model);
      });
    });
  };

  renderPredictions = predictions => {
    const ctx = this.canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach(prediction => {
      const x = prediction.box.left;
      const y = prediction.box.top;
      const width = prediction.box.width;
      const height = prediction.box.height;
      // Draw the bounding box.
      ctx.strokeStyle = "#326B33";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = "#326B33";
      const textWidth = ctx.measureText("Kamuflert flaske").width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach(prediction => {
      const x = prediction.box.left;
      const y = prediction.box.top;
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText("Kamuflert flaske", x, y);
    });
  };

  render() {
    const videoAndCanvasHeight = window.innerHeight;
    const videoAndCanvasWidth = window.innerWidth;
    return (
      <div>
        <HeaderContainer>
          {/* <Header>Flaskefinner</Header> */}
          <ArmyEmoji src="army_emoji2.jpg"></ArmyEmoji>
        </HeaderContainer>
        <VideoCanvasContainer>
          <StyledVideo autoPlay playsInline muted ref={this.videoRef} />
        </VideoCanvasContainer>
        <StyledCanvas
          ref={this.canvasRef}
          width={videoAndCanvasWidth}
          height={videoAndCanvasHeight}
        />
        <DescriptionContainer>
          <Description>
            Pek meg rundt omkring, og jeg vil finne flasken for deg🤓
          </Description>
        </DescriptionContainer>
      </div>
    );
  }
}

export default App;
