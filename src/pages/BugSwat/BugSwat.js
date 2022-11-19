import React from "react";
import Webcam from "react-webcam";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs-core";
// Register one of the TF.js backends.
import "@tensorflow/tfjs-backend-webgl";
// import '@tensorflow/tfjs-backend-wasm';

export default function BugSwat({}) {
  const webcamRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const videoConstraints = {
    width: 800,
    height: 600,
    facingMode: "user",
  };

  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  };

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

  const drawCanvas = (poses, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    // // draw video
    // ctx.translate(-videoWidth, 0);
    // ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

    poses.forEach(({ keypoints }) => {
      if (keypoints[0].score > 0.2) {
        const leftShoulder = keypoints[5];
        const rightShoulder = keypoints[6];

        const leftElbow = keypoints[7];
        const rightElbow = keypoints[8];

        const leftWrist = keypoints[9];
        const rightWrist = keypoints[10];

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
      }
    });
  };

  runPoseDetection();

  return (
    <div>
      <h1>Bug Swat Test</h1>
      <div id="bug-swat-main">


        <div id="canvas-container" className="container">
          <canvas
            ref={canvasRef}
            style={{
              width: videoConstraints.width,
              height: videoConstraints.height,
              position: "absolute",
              left: 0,
              top: 0,
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
              left: 0,
              top: 0,
              zIndex: 1,
            }}

          ></Webcam>
        </div>
      </div>
    </div>
  );
}
