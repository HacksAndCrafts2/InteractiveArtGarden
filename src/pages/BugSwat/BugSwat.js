import React from "react";
import Webcam from "react-webcam";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

import * as PIXI from "pixi.js";
import { Application, Sprite } from "pixi.js";
import IMAGES from "../../assets/Assets";

export default function BugSwat({}) {
  const webcamRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  // Constants ----------------------------------------------------------------
  const videoConstraints = {
    width: 600,
    height: 450,
    facingMode: "user",
  };

  const marginTopCamera = 100;
  const marginLeftCamera = 10;

  const marginTopPixi = 100;
  const marginLeftPixi = marginLeftCamera + videoConstraints.width + 10;

  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  };

  const framerate = 10;

  const defaultImageSize = 600;

  // Game variables -----------------------------------------------------------
  const bugSize = 50;
  const bugSpeed = 1;
  const bugSpawnRate = 1000;
  const bugRadius = 50;

  const plantSize = 100;

  var bugSprite = null;
  var armLeftSprite = null;
  var armRightSprite = null;
  var plantSprite = null;

  // Controls positions -------------------------------------------------------
  var armLeft = {
    shoulder: { x: 0, y: 0 },
    elbow: { x: 0, y: 0 },
    wrist: { x: 0, y: 0 },
  };

  var armRight = {
    shoulder: { x: 0, y: 0 },
    elbow: { x: 0, y: 0 },
    wrist: { x: 0, y: 0 },
  };

  var bug = {
    x: 0,
    y: 0,
  };

  // Get the webcam video stream ------------------------------------------------
  // const getUserMedia = async (constraints) => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia(constraints);
  //     return getCurrentFrame(stream);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // const getCurrentFrame = (stream) => {
  //   console.log(stream)
  // }

  // getUserMedia({
  //   audio: false,
  //   video: { width: videoConstraints.width, height: videoConstraints.height }
  // })

  // Pose Detection --------------------------------------------------------------------
  // Main function for pose detection
  const runPoseDetection = async () => {
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );

    console.log("detector", detector);

    setInterval(() => {
      detect(detector);
    }, 1000 / framerate);
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

      try {
        const poses = await detector.estimatePoses(video);

        // Draw poses on the canvas
        drawCanvas(poses, video, videoWidth, videoHeight, canvasRef);
      } catch (e) {
        console.log(e);
        // refresh page
        window.location.reload();
      }
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

    poses.forEach(({ keypoints }) => {
      if (keypoints[0].score > 0.2) {
        const leftShoulder = keypoints[5];
        const rightShoulder = keypoints[6];

        const leftElbow = keypoints[7];
        const rightElbow = keypoints[8];

        const leftWrist = keypoints[9];
        const rightWrist = keypoints[10];

        // Get points to variables -----------------------------------------------
        // armLeft.shoulder.x = leftShoulder.x;
        // armLeft.shoulder.y = leftShoulder.y;

        armLeft.elbow.x = leftElbow.x;
        armLeft.elbow.y = leftElbow.y;

        armLeft.wrist.x = leftWrist.x;
        armLeft.wrist.y = leftWrist.y;

        // armRight.shoulder.x = rightShoulder.x;
        // armRight.shoulder.y = rightShoulder.y;

        armRight.elbow.x = rightElbow.x;
        armRight.elbow.y = rightElbow.y;

        armRight.wrist.x = rightWrist.x;
        armRight.wrist.y = rightWrist.y;

        // draw the shoulders, elbows, and wrists -------------------------------
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

  // Pixi --------------------------------------------------------------------
  // Async load the stage
  const loadStage = async () => {
    const app = await new Application({
      width: videoConstraints.width,
      height: videoConstraints.height,
      transparent: false,
      antialias: true,
    });

    // change the color of the canvas
    app.renderer.backgroundColor = 0xd4f5ff;

    // get the pixi-main element
    const pixiMain = document.getElementById("pixi-main");

    // remove all children from the element
    while (pixiMain.firstChild) {
      console.log(pixiMain.firstChild);
      pixiMain.removeChild(pixiMain.firstChild);
    }

    // add the canvas to the pixi-main element
    pixiMain.appendChild(app.view);

    const BugPath = await IMAGES.Bug;
    const ArmLeftPath = await IMAGES.ArmLeft;
    const ArmRightPath = await IMAGES.ArmRight;
    const plantPath = await IMAGES.Plant;

    // load the texture we need
    const bugTexture = await PIXI.Texture.from(BugPath);
    const armLeftTexture = await PIXI.Texture.from(ArmLeftPath);
    const armRightTexture = await PIXI.Texture.from(ArmRightPath);
    const plantTexture = await PIXI.Texture.from(plantPath);

    // create a new Sprite using the texture
    bugSprite = await new Sprite(bugTexture);
    armLeftSprite = await new Sprite(armLeftTexture);
    armRightSprite = await new Sprite(armRightTexture);
    plantSprite = await new Sprite(plantTexture);

    // armLeftSprite ------------------------------
    // Resize the armLeftSprite
    armLeftSprite.width = 100;
    armLeftSprite.height = 100;

    // center the sprite's anchor point
    armLeftSprite.anchor.set(0.5, 1);

    // move the sprite to the center of the screen
    armLeftSprite.position.set(
      videoConstraints.width / 2,
      videoConstraints.height / 2
    );

    app.stage.addChild(armLeftSprite);

    // armRightSprite ------------------------------
    // Resize the armRightSprite
    armRightSprite.width = 100;
    armRightSprite.height = 100;

    // center the sprite's anchor point
    armRightSprite.anchor.set(0.5, 1);

    // move the sprite to the center of the screen
    armRightSprite.position.set(
      videoConstraints.width / 2,
      videoConstraints.height / 2
    );

    app.stage.addChild(armRightSprite);

    // bugSprite ------------------------------
    // Resize the bugSprite
    bugSprite.width = bugSize;
    bugSprite.height = bugSize;

    // center the sprite's anchor point
    bugSprite.anchor.set(0.5, 0.5);

    // move the sprite to the center of the screen
    bugSprite.position.set(
      videoConstraints.width / 2,
      0
    );

    app.stage.addChild(bugSprite);

    // plantSprite ------------------------------
    // Resize the plantSprite
    plantSprite.width = plantSize;
    plantSprite.height = plantSize;

    // center the sprite's anchor point
    plantSprite.anchor.set(0.5, 0.5);

    // move the sprite to the center of the screen
    plantSprite.position.set(
      videoConstraints.width / 2,
      videoConstraints.height - plantSize / 2
    );

    app.stage.addChild(plantSprite);

    // Listen for frame updates
    app.ticker.add(() => {
      updateGame();
    });
  };

  const updateGame = () => {
    // UPDATE POSITIONS -------------------------------------------------------
    // armLeftSprite ------------------------------
    // // Set the armLeft length
    // armLeftSprite.height = armLeftSprite.width = Math.sqrt(
    //   Math.pow(armLeft.elbow.x - armLeft.wrist.x, 2) +
    //     Math.pow(armLeft.elbow.y - armLeft.wrist.y, 2)
    // );

    // Set the angle
    armLeftSprite.rotation = Math.atan2(
      armLeft.elbow.x - armLeft.wrist.x,
      armLeft.elbow.y - armLeft.wrist.y
    );

    // Set the position
    armLeftSprite.position.set(
      videoConstraints.width - armLeft.wrist.x,
      armLeft.elbow.y
    );

    // armRightSprite ------------------------------
    // Set the angle
    armRightSprite.rotation = Math.atan2(
      armRight.elbow.x - armRight.wrist.x,
      armRight.elbow.y - armRight.wrist.y
    );

    // Set the position
    armRightSprite.position.set(
      videoConstraints.width - armRight.wrist.x,
      armRight.elbow.y
    );

    // bugSprite ------------------------------
    // Move the bug sprite from where it is towards the plant by bugSpeed pixels
    bugSprite.position.set(
      bugSprite.position.x +
        (plantSprite.position.x - bugSprite.position.x) / 100,
      bugSprite.position.y +
        (plantSprite.position.y - bugSprite.position.y) / 100
    );

    // Rotate the bug sprite towards the plant
    bugSprite.rotation = Math.atan2(
      plantSprite.position.x - bugSprite.position.x,
      bugSprite.position.y - plantSprite.position.y
    );
  };

  loadStage();

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

          <div
            id="bug-container"
            className="container"
            style={{
              position: "absolute",
              left: marginLeftPixi,
              top: marginTopPixi,
              zIndex: 1,
            }}
          >
            <div id="pixi-main"></div>
            <button onClick={loadStage}>Load Stage</button>
          </div>
        </div>
      </div>
    </div>
  );
}
