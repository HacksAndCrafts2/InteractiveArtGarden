import React from "react";
import Webcam from "react-webcam";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
// import '@tensorflow/tfjs-backend-wasm';

import IMAGES from "../../assets/Assets";

export default function TrackerTest({}) {
  const webcamRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const pompomCanvasRef = React.useRef(null);

  const videoConstraints = {
    width: 800,
    height: 600,
    facingMode: "user",
  };

  const marginTopCamera = 100;
  const marginLeftCamera = window.innerWidth / 2 - videoConstraints.width / 2;

  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  };

  var leftWristToElbowDistance = 100;
  var rightWristToElbowDistance = 100;

  var leftElbow = null;
  var rightElbow = null;

  var leftWrist = null;
  var rightWrist = null;

  // Main function
  const runPoseDetection = async () => {
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );

    console.log("detector", detector);

    setInterval(() => {
      detect(detector);
    }, 1000 / 30);
  };

  const detect = async (detector) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Make Detections
      const poses = await detector.estimatePoses(video);
      //   console.log(poses);

      // Draw poses on the canvas
      drawCanvas(poses, video, videoWidth, videoHeight, canvasRef);
    }
  };

  const drawPoint = (ctx, keypoint, options = {}) => {
    const { color = "red", radius = 3 } = options;

    ctx.beginPath();
    ctx.arc(
      videoConstraints.width - keypoint.x,
      keypoint.y,
      radius,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = color;
    ctx.fill();
  };

  const drawSegment = ([ay, ax], [by, bx], color, ctx) => {
    ctx.beginPath();
    ctx.moveTo(videoConstraints.width - ax, ay);
    ctx.lineTo(videoConstraints.width - bx, by);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  const drawCanvas = async (poses, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    // // draw video
    // ctx.translate(-videoWidth, 0);
    // ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

    poses.forEach(async ({ keypoints }) => {
      if (keypoints[0].score > 0.2) {
        const leftShoulder = keypoints[5];
        const rightShoulder = keypoints[6];

        leftElbow = keypoints[7];
        rightElbow = keypoints[8];

        leftWrist = keypoints[9];
        rightWrist = keypoints[10];

        // draw the shoulders, elbows, and wrists
        drawPoint(ctx, leftShoulder, { color: "red" });
        drawPoint(ctx, leftElbow, { color: "red" });
        drawPoint(ctx, leftWrist, { color: "red" });

        drawPoint(ctx, rightShoulder, { color: "blue" });
        drawPoint(ctx, rightElbow, { color: "blue" });
        drawPoint(ctx, rightWrist, { color: "blue" });

        // draw the lines between the points
        drawSegment(
          [leftShoulder.y, leftShoulder.x],
          [leftElbow.y, leftElbow.x],
          "red",
          ctx
        );
        drawSegment(
          [leftElbow.y, leftElbow.x],
          [leftWrist.y, leftWrist.x],
          "red",
          ctx
        );

        drawSegment(
          [rightShoulder.y, rightShoulder.x],
          [rightElbow.y, rightElbow.x],
          "blue",
          ctx
        );
        drawSegment(
          [rightElbow.y, rightElbow.x],
          [rightWrist.y, rightWrist.x],
          "blue",
          ctx
        );

        // green line between shoulders
        drawSegment(
          [leftShoulder.y, leftShoulder.x],
          [rightShoulder.y, rightShoulder.x],
          "green",
          ctx
        );

        leftWristToElbowDistance = Math.sqrt(
          Math.pow(leftWrist.x - leftElbow.x, 2) +
            Math.pow(leftWrist.y - leftElbow.y, 2)
        );

        rightWristToElbowDistance = Math.sqrt(
          Math.pow(rightWrist.x - rightElbow.x, 2) +
            Math.pow(rightWrist.y - rightElbow.y, 2)
        );

        drawPomPoms();
      }
    });
  };

  const drawPomPoms = async () => {
    const ctx = pompomCanvasRef.current.getContext("2d");

    // pom pom image
    const pomPomImage = new Image();
    const pomPomPath = await IMAGES.PomPom;
    pomPomImage.src = pomPomPath;

    // Draw pom poms on wrists
    // scale pom pom to be 1/4 the size of the wrist to elbow distance

    const scaleLeft = leftWristToElbowDistance / 4 / pomPomImage.width;

    ctx.drawImage(
      pomPomImage,
      videoConstraints.width -
        leftWrist.x -
        (pomPomImage.width * scaleLeft) / 2,
      leftWrist.y - (pomPomImage.height * scaleLeft) / 2,
      pomPomImage.width * scaleLeft,
      pomPomImage.height * scaleLeft
    );

    const scaleRight = rightWristToElbowDistance / 4 / pomPomImage.width;

    ctx.drawImage(
      pomPomImage,
      videoConstraints.width -
        rightWrist.x -
        (pomPomImage.width * scaleRight) / 2,
      rightWrist.y - (pomPomImage.height * scaleRight) / 2,
      pomPomImage.width * scaleRight,
      pomPomImage.height * scaleRight
    );
  };

  runPoseDetection();

  return (
    <div>
      <h1>Tracker Test</h1>
      <div id="tracker-main">
        <div id="canvas-container" className="container">
          <canvas
            ref={canvasRef}
            style={{
              width: videoConstraints.width,
              height: videoConstraints.height,
              position: "absolute",
              left: marginLeftCamera,
              top: marginTopCamera,
              zIndex: 3,
            }}
          />
        </div>

        <div id="pompom-container" className="container">
          <canvas
            ref={pompomCanvasRef}
            style={{
              width: videoConstraints.width,
              height: videoConstraints.height,
              position: "absolute",
              left: marginLeftCamera,
              top: marginTopCamera,
              zIndex: 2,
            }}
          />
        </div>

        <div id="webcam-container" className="container">
          <Webcam
            ref={webcamRef}
            audio={false}
            height={videoConstraints.height}
            screenshotFormat="image/jpeg"
            width={videoConstraints.width}
            videoConstraints={videoConstraints}
            mirrored={true}
            style={{
              position: "absolute",
              left: marginLeftCamera,
              top: marginTopCamera,
              zIndex: 1,
            }}
          ></Webcam>
        </div>
      </div>
    </div>
  );
}
