import React from "react";
import Webcam from "react-webcam";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

import * as PIXI from "pixi.js";
import { Application, Sprite } from "pixi.js";
import IMAGES from "../../assets/Assets";

import "./BugSwat.css";

export default function BugSwat({}) {
  const webcamRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  // Constants ----------------------------------------------------------------
  const videoConstraints = {
    width: 600,
    height: 450,
    facingMode: "user",
  };

  const marginTopCamera = 150;
  const marginLeftCamera = window.innerWidth / 2 - videoConstraints.width - 5;

  const marginTopPixi = 150;
  const marginLeftPixi = marginLeftCamera + videoConstraints.width + 10;

  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  };

  const framerate = 10;

  const defaultImageSize = 600;

  // Game variables -----------------------------------------------------------
  // relative to the 600 x 450 video (need to update if the videoConstraints are changed)
  const bugSize = 25;
  const bugSpeed = 3;
  const bugSpawnTime = 1000;

  var bugTexture = null;

  const plantSize = 100;
  const plantRadius = 20;

  const playerSize = 100;
  const handRadius = 15;
  const handDistFromWrists = 20;

  const maxNumberOfBugs = 5;
  var bugsToKill = 20;

  var gameState = "init";
  var gameWon = false;
  var gameTimer = 0;
  var lastBugSpawnTime = 0;

  var app = null;

  var bugsKilled = 0;
  var livesLeft = 3;

  var scoreText = null;
  var livesText = null;

  var bugSprites = [];
  var armLeftSprite = null;
  var armRightSprite = null;
  var plantSprite = null;

  // other sprites
  var winScreenSprite = null;
  var loseScreenSprite = null;

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
        alert(e);
        // console.log(e);
        // // go back to home page
        // window.location.href = "/";
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
    app = await new Application({
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
    const winScreenPath = await IMAGES.WinScreen;
    const loseScreenPath = await IMAGES.LoseScreen;

    // load the texture we need
    bugTexture = await PIXI.Texture.from(BugPath);
    const armLeftTexture = await PIXI.Texture.from(ArmLeftPath);
    const armRightTexture = await PIXI.Texture.from(ArmRightPath);
    const plantTexture = await PIXI.Texture.from(plantPath);
    const winScreenTexture = await PIXI.Texture.from(winScreenPath);
    const loseScreenTexture = await PIXI.Texture.from(loseScreenPath);

    // create a new Sprite using the texture
    armLeftSprite = await new Sprite(armLeftTexture);
    armRightSprite = await new Sprite(armRightTexture);
    plantSprite = await new Sprite(plantTexture);
    winScreenSprite = await new Sprite(winScreenTexture);
    loseScreenSprite = await new Sprite(loseScreenTexture);

    // armLeftSprite ------------------------------
    // Resize the armLeftSprite
    armLeftSprite.width = playerSize;
    armLeftSprite.height = playerSize;

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
    armRightSprite.width = playerSize;
    armRightSprite.height = playerSize;

    // center the sprite's anchor point
    armRightSprite.anchor.set(0.5, 1);

    // move the sprite to the center of the screen
    armRightSprite.position.set(
      videoConstraints.width / 2,
      videoConstraints.height / 2
    );

    app.stage.addChild(armRightSprite);

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

    // winScreenSprite ------------------------------
    winScreenSprite.anchor.set(0.5, 0.5);

    winScreenSprite.position.set(
      videoConstraints.width / 2,
      videoConstraints.height / 2
    );

    app.stage.addChild(winScreenSprite);

    winScreenSprite.visible = false;

    // loseScreenSprite ------------------------------

    loseScreenSprite.anchor.set(0.5, 0.5);

    loseScreenSprite.position.set(
      videoConstraints.width / 2,
      videoConstraints.height / 2
    );

    app.stage.addChild(loseScreenSprite);

    // Make invisible
    loseScreenSprite.visible = false;

    // Score Text ------------------------------
    scoreText = new PIXI.Text(`Bugs killed: ${bugsKilled}/${bugsToKill}`, {
      fontFamily: "Arial",
      fontSize: 24,
      fill: 0x000000,
      align: "center",
    });

    scoreText.anchor.set(0, 0);

    scoreText.position.set(10, 10);

    app.stage.addChild(scoreText);

    // Lives Text ------------------------------

    livesText = new PIXI.Text(`Lives left: ${livesLeft}`, {
      fontFamily: "Arial",
      fontSize: 24,
      fill: 0x000000,
      align: "center",
    });

    livesText.anchor.set(0, 0);

    livesText.position.set(10, 40);

    app.stage.addChild(livesText);

    // // Hand circle ------------------------------
    // // create a new Graphics
    // handCircle = new PIXI.Graphics();

    // // set a fill and line style
    // handCircle.beginFill(0xff0000);
    // handCircle.lineStyle(4, 0xff0000, 1);

    // // draw a circle
    // handCircle.drawCircle(0, 0, 2);

    // // set the circle's x and y position
    // handCircle.x = 0;
    // handCircle.y = 0;

    // // add the circle to the stage
    // app.stage.addChild(handCircle);

    // Listen for frame updates
    app.ticker.add(() => {
      updateGame();
    });

    // Hide restart button
    document.getElementById("restartGame").style.display = "none";
    document.getElementById("nextPage").style.display = "none";

    logVars();
  };

  // var handCircle = null;

  const updateGame = () => {
    // UPDATE POSITIONS -------------------------------------------------------
    // armLeftSprite ------------------------------
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

    // get the hand position based on the armLeftSprite wrist position and the armLeftSprite rotation
    const leftHandPos = {
      x:
        armLeftSprite.x +
        (playerSize - handDistFromWrists) * Math.sin(armLeftSprite.rotation),
      y:
        armLeftSprite.y -
        (playerSize - handDistFromWrists) * Math.cos(armLeftSprite.rotation),
    };

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

    const rightHandPos = {
      x:
        armRightSprite.x +
        (playerSize - handDistFromWrists) * Math.sin(armRightSprite.rotation),
      y:
        armRightSprite.y -
        (playerSize - handDistFromWrists) * Math.cos(armRightSprite.rotation),
    };

    // Update the bugs --------------------------------------------------------

    if (gameState === "playing") {
      if (bugSprites.length < maxNumberOfBugs) {
        // check that bug spawn time has passed
        if (Date.now() - lastBugSpawnTime > bugSpawnTime) {
          // spawn a bug
          spawnBug();

          // reset the last bug spawn time
          lastBugSpawnTime = Date.now();
        }
      }

      // bugSprites ------------------------------
      bugSprites.forEach((bugSprite) => {
        // Get the distance between the bug and the plant
        const distance = Math.sqrt(
          Math.pow(plantSprite.x - bugSprite.sprite.x, 2) +
            Math.pow(plantSprite.y - bugSprite.sprite.y, 2)
        );

        if (bugSprite.status === "alive") {
          // Move the bug sprite from where it is towards the plant by bugSpeed pixels
          bugSprite.sprite.position.set(
            bugSprite.sprite.position.x +
              ((plantSprite.position.x - bugSprite.sprite.position.x) /
                distance) *
                bugSpeed,
            bugSprite.sprite.position.y +
              ((plantSprite.position.y - bugSprite.sprite.position.y) /
                distance) *
                bugSpeed
          );
        } else if (bugSprite.status === "dead") {
          bugSprite.sprite.rotation += 0.2;

          // Move away from the plant by bugSpeed pixels
          bugSprite.sprite.position.set(
            bugSprite.sprite.position.x +
              ((bugSprite.sprite.position.x - plantSprite.position.x) /
                distance) *
                bugSpeed,
            bugSprite.sprite.position.y +
              ((bugSprite.sprite.position.y - plantSprite.position.y) /
                distance) *
                bugSpeed
          );
        }

        // UPDATE COLLISIONS ------------------------------------------------------
        // Check if the bug is off the screen
        if (
          bugSprite.sprite.x + bugSize / 2 < 0 ||
          bugSprite.sprite.x - bugSize / 2 > videoConstraints.width ||
          bugSprite.sprite.y + bugSize / 2 < 0 ||
          bugSprite.sprite.y - bugSize / 2 > videoConstraints.height
        ) {
          bugSprite.status = "despawn";
        }

        // Check if the bug is touching the plant
        if (
          distance < plantRadius + bugSize / 2 &&
          bugSprite.status === "alive"
        ) {
          // Kill the bug
          bugSprite.status = "exit";

          // reduce lives left
          livesLeft--;
          updateStats();
        }

        // Check if the bug is touching the left hand
        if (
          Math.sqrt(
            Math.pow(leftHandPos.x - bugSprite.sprite.x, 2) +
              Math.pow(leftHandPos.y - bugSprite.sprite.y, 2)
          ) <
            handRadius + bugSize / 2 &&
          bugSprite.status === "alive"
        ) {
          // Kill the bug
          bugSprite.status = "dead";

          // increase score
          bugsKilled++;
          updateStats();
        }

        // Check if the bug is touching the right hand
        if (
          Math.sqrt(
            Math.pow(rightHandPos.x - bugSprite.sprite.x, 2) +
              Math.pow(rightHandPos.y - bugSprite.sprite.y, 2)
          ) <
            handRadius + bugSize / 2 &&
          bugSprite.status === "alive"
        ) {
          // Kill the bug
          bugSprite.status = "dead";

          // increase score
          bugsKilled++;
          updateStats();
        }

        // Check if game over
        if (livesLeft <= 0) {
          gameLoss();
        }
        if (bugsKilled >= bugsToKill) {
          gameWin();
        }
      });

      // for each bug if it is despawned remove it from the bugSprites array and remove it from the stage
      bugSprites.forEach((bugSprite, index) => {
        if (bugSprite.status === "despawn") {
          bugSprites.splice(index, 1);
          app.stage.removeChild(bugSprite.sprite);
        }
      });
    }
  };

  const updateStats = () => {
    scoreText.text = `Bugs killed: ${bugsKilled}/${bugsToKill}`;
    livesText.text = `Lives left: ${livesLeft}`;
  };

  const spawnBug = () => {
    // create a new Sprite using the texture
    // bugSprite ------------------------------
    var bugSprite = new Sprite(bugTexture);

    // Resize the bugSprite
    bugSprite.width = bugSize;
    bugSprite.height = bugSize;

    // center the sprite's anchor point
    bugSprite.anchor.set(0.5, 0.5);

    // random spawn at top or sides of screen
    const spawnSide = Math.floor(Math.random() * 3);
    if (spawnSide === 0) {
      // right
      bugSprite.position.set(
        videoConstraints.width + bugSize / 2,
        Math.floor(((Math.random() * videoConstraints.height) / 4) * 3)
      );
    } else if (spawnSide === 1) {
      // left
      bugSprite.position.set(
        -bugSize / 2,
        Math.floor(((Math.random() * videoConstraints.height) / 4) * 3)
      );
    } else {
      // top
      bugSprite.position.set(
        Math.floor(Math.random() * videoConstraints.width),
        -bugSize / 2
      );
    }

    // Rotate the bug sprite towards the plant
    bugSprite.rotation = Math.atan2(
      plantSprite.position.x - bugSprite.position.x,
      bugSprite.position.y - plantSprite.position.y
    );

    bugSprites.push({
      sprite: bugSprite,
      status: "alive",
    });

    app.stage.addChild(bugSprite);
  };

  loadStage();

  // Game --------------------------------------------------------------------
  const startGame = () => {
    // Start the game loop
    gameState = "playing";
    // get current time in milliseconds
    gameTimer = Date.now();
    lastBugSpawnTime = Date.now();

    updateStats();

    // hide the start button
    document.getElementById("startGame").style.display = "none";
    // show restart button
    document.getElementById("restartGame").style.display = "block";

    logVars();
  };

  const restartGame = () => {
    // reset game variables
    bugsKilled = 0;
    livesLeft = 3;
    gameTimer = 0;
    lastBugSpawnTime = 0;


    gameState = "playing";

    // Remove the Game over or the You win image if any
    loseScreenSprite.visible = false;
    winScreenSprite.visible = false;

    updateStats();

    logVars();
  };

  const removeAllBugs = () => {
    
    // remove all bugs from the stage
    bugSprites.forEach((bugSprite) => {
      app.stage.removeChild(bugSprite.sprite);
    });

    // clear the bugSprites array
    bugSprites = [];
  };

  const gameLoss = () => {
    // End the game loop
    gameState = "gameOver";
    gameWon = false;

    removeAllBugs();

    loseScreenSprite.visible = true;

    logVars();
  };

  const gameWin = () => {
    // End the game loop
    gameState = "gameOver";
    gameWon = true;

    removeAllBugs();

    winScreenSprite.visible = true;

    document.getElementById("nextPage").style.display = "block";

    logVars();
  };

  const goToNextPage = () => {
    window.location.href = "https://www.google.com";
  };

  const logVars = () => {
    console.log(bugSprites);
    //print bugSprites position
    bugSprites.forEach((bugSprite) => {
      console.log(bugSprite.sprite.position);
    });

    console.log("bugsKilled: " + bugsKilled);
    console.log("livesLeft: " + livesLeft);
    console.log("gameState: " + gameState);
    console.log("gameWon: " + gameWon);
  };

  return (
    <div>
      <h1>Bug Swat</h1>
      <p>Swat the bugs with your hands and protect your plant!</p>
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
            <div id="buttons-container">
              <button onClick={loadStage}>Load Stage</button>

              <button id="startGame" onClick={startGame}>
                Start Game
              </button>
              <button id="restartGame" onClick={restartGame}>
                Restart Game
              </button>
              <button id="nextPage" onClick={goToNextPage}>
                Next
              </button>

              {/* <button onClick={logVars}>Log Vars</button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
