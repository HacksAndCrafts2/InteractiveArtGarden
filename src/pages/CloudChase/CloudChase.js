import React, { useRef, useEffect } from "react";
import Webcam from "react-webcam";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

import * as PIXI from "pixi.js";
import { Application, Sprite } from "pixi.js";

import cloud_1_img from '../../assets/img/cloud_1.png'
import cloud_2_img from '../../assets/img/cloud_2.png'
import gardener_img from '../../assets/img/gardener.png'
import trail_img from '../../assets/img/trail.png'
import water1_img from '../../assets/img/wateringCan_empty.png'
import water2_img from '../../assets/img/wateringCan_half.png'
import water3_img from '../../assets/img/wateringCan_full.png'
import armLeft_img from '../../assets/ArmLeft.png'
import armRight_img from '../../assets/ArmRight.png'
import winScreen_img from '../../assets/WinScreen.png'
import loseScreen_img from '../../assets/LoseScreen.png'


// import "./CloudChase.css";
import { time } from "@tensorflow/tfjs-core";
import { update } from "@tensorflow/tfjs-layers/dist/variables";

export default function CloudChase({ }) {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

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
    // relative to the 600 x 450 video
    const cloudWidth = 100;
    const cloudHeight = 90;
    const cloudWidth_st = 120;
    const cloudHeight_st = 85;
    const cloudSpawnTime = 4000;
    

    var cloudTexture = null;
    var cloudStTexture = null;

    const gardenerSize = 100;
    const gardenerRadius = 20;

    const playerSize = 100;
    const handRadius = 15;
    const handDistFromWrists = 20;

    const maxNumberOfclouds = 8;
    const maxNumberOfStClouds = 3;
    var cloudsToCollect = 15;

    var gameState = "init";
    var gameWon = false;
    var countDownTimer = 50;
    var gameTimer = 0;
    var lastcloudSpawnTime = 0;

    var app = null;

    var cloudsCollected = 0;
    var randomCloud = 0;


    var scoreText = null;
    var countDownTimerText = null;


    var cloudSprites = [];
    var cloudStSprites = [];
    var armLeftSprite = null;
    var armRightSprite = null;
    var gardenerSprite = null;

    // other sprites
    var winScreenSprite = null;
    var loseScreenSprite = null;
    var wateringCanSprite = null;

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

    var cloud = {
        x: 0,
        y: 0,
    };

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

                armLeft.elbow.x = leftElbow.x;
                armLeft.elbow.y = leftElbow.y;

                armLeft.wrist.x = leftWrist.x;
                armLeft.wrist.y = leftWrist.y;

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
        app.renderer.backgroundColor = 0x22A7F0;

        // get the pixi-main element
        const pixiMain = document.getElementById("pixi-main");

        // remove all children from the element
        while (pixiMain.firstChild) {
            console.log(pixiMain.firstChild);
            pixiMain.removeChild(pixiMain.firstChild);
        }

        // add the canvas to the pixi-main element
        pixiMain.appendChild(app.view);


        // load the texture we need
        cloudTexture = await PIXI.Texture.from(cloud_1_img);
        cloudStTexture = await PIXI.Texture.from(cloud_2_img);

        const armLeftTexture = await PIXI.Texture.from(armLeft_img);
        const armRightTexture = await PIXI.Texture.from(armRight_img);

        const winScreenTexture = await PIXI.Texture.from(winScreen_img);
        const loseScreenTexture = await PIXI.Texture.from(loseScreen_img);
        const water1 = PIXI.Texture.from(water1_img);
        const water2 = PIXI.Texture.from(water2_img);
        const water3 = PIXI.Texture.from(water3_img);
        const gardenerTexture = PIXI.Texture.from(gardener_img);


        // create a new Sprite using the texture
        armLeftSprite = await new Sprite(armLeftTexture);
        armRightSprite = await new Sprite(armRightTexture);
        gardenerSprite = await new Sprite(gardenerTexture);
        winScreenSprite = await new Sprite(winScreenTexture);
        loseScreenSprite = await new Sprite(loseScreenTexture);
        wateringCanSprite = new PIXI.Sprite(water1);

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

        // gardenerSprite ------------------------------
        // Resize the gardenerSprite
        gardenerSprite.width = gardenerSize;
        gardenerSprite.height = gardenerSize;

        // center the sprite's anchor point
        gardenerSprite.anchor.set(0.5, 0.5);

        // move the sprite to the center of the screen
        gardenerSprite.position.set(
            videoConstraints.width / 2,
            videoConstraints.height - gardenerSize / 2
        );

        app.stage.addChild(gardenerSprite);

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
        scoreText = new PIXI.Text(`clouds collected: ${cloudsCollected}/${cloudsToCollect}`, {
            fontFamily: "Arial",
            fontSize: 24,
            fill: 0x000000,
            align: "center",
        });

        scoreText.anchor.set(0, 0);

        scoreText.position.set(10, 10);

        app.stage.addChild(scoreText);

        countDownTimerText = new PIXI.Text(`Time left: ${countDownTimer}`, {
            fontFamily: "Arial",
            fontSize: 24,
            fill: 0x000000,
            align: "center",
          });
      
          countDownTimerText.anchor.set(0, 0);
      
          countDownTimerText.position.set(10, 40);
      
          app.stage.addChild(countDownTimerText);

        

        // Listen for frame updates
        app.ticker.add(() => {
            
            updateGame();
        });
        setInterval(updateCountDown,1000)

        // Hide restart button
        document.getElementById("restartGame").style.display = "none";
        document.getElementById("nextPage").style.display = "none";

        logVars();
    };

    const updateCountDown = () =>{
        let seconds = countDownTimer
        seconds = seconds<10 ?'0' + seconds : seconds;
        if(countDownTimer<=-1){
            return
        }
        countDownTimer--;
        updateStats();
    }

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

        // Update the clouds --------------------------------------------------------

        if (gameState === "playing") {
            if (cloudSprites.length< maxNumberOfclouds || cloudStSprites.length<maxNumberOfStClouds) {
                // check that cloud spawn time has passed
                if (Date.now() - lastcloudSpawnTime > cloudSpawnTime) {
                    // spawn a cloud
                    spawncloud();
                    spawncloudSt();

                    // reset the last cloud spawn time
                    lastcloudSpawnTime = Date.now();
                }
            }

            cloudStSprites.forEach((cloudStSprite) => {
                cloudStSprite.sprite.x += 0.15;
            })

            // cloudSprites ------------------------------
            cloudSprites.forEach((cloudSprite) => {
                // Get the distance between the cloud and the gardener
                const distance = Math.sqrt(
                    Math.pow(gardenerSprite.x - cloudSprite.sprite.x, 2) +
                    Math.pow(gardenerSprite.y - cloudSprite.sprite.y, 2)
                );

                if (cloudSprite.status === "untouch") {
                    // Move the cloud sprite from where it is towards the gardener by cloudSpeed pixels
                    randomCloud += 1;
                    cloudSprite.sprite.x += 0.25;
                    if (randomCloud % 20 == 0) {
                        cloudSprite.sprite.position.y -=
                            ((gardenerSprite.position.y - cloudSprite.sprite.position.y) /
                                distance)

                        randomCloud = 0;
                    }

                } else if (cloudSprite.status === "touch") {
                    cloudSprite.sprite.position.set(
                        cloudSprite.sprite.position.x +
                        ((gardenerSprite.position.x - cloudSprite.sprite.position.x) /
                            distance) *
                        2,
                        cloudSprite.sprite.position.y +
                        ((gardenerSprite.position.y - cloudSprite.sprite.position.y) /
                            distance) *
                        2
                    );
                    // cloudSprite.sprite.x -=5;
                    // cloudSprite.sprite.y +=10;
                    cloudSprite.status = "untouch"

                }

                // UPDATE COLLISIONS ------------------------------------------------------
                // Check if the cloud is off the screen
                if (
                    cloudSprite.sprite.x + cloudWidth / 2 < 0 ||
                    cloudSprite.sprite.x - cloudWidth / 2 > videoConstraints.width ||
                    cloudSprite.sprite.y + cloudHeight / 2 < 0 ||
                    cloudSprite.sprite.y - cloudHeight / 2 > videoConstraints.height
                ) {
                    cloudSprite.status = "despawn";
                }

                // Check if the cloud is touching the gardener
                if (
                    distance < gardenerRadius + cloudHeight / 2 &&
                    cloudSprite.status === "untouch"
                ) {
                    // Kill the cloud, cloud touched gardener
                    cloudSprite.status = "despawn";

                    // reduce lives left
                    cloudsCollected++;
                    //   livesLeft--;
                    updateStats();
                }

                // Check if the cloud is touching the left hand
                if (
                    Math.sqrt(
                        Math.pow(leftHandPos.x - cloudSprite.sprite.x, 2) +
                        Math.pow(leftHandPos.y - cloudSprite.sprite.y, 2)
                    ) <
                    handRadius + cloudHeight / 2 &&
                    cloudSprite.status === "untouch"
                ) {
                    //move cloud to farmer
                    cloudSprite.status = "touch";


                    updateStats();
                }

                // Check if the cloud is touching the right hand
                if (
                    Math.sqrt(
                        Math.pow(rightHandPos.x - cloudSprite.sprite.x, 2) +
                        Math.pow(rightHandPos.y - cloudSprite.sprite.y, 2)
                    ) <
                    handRadius + cloudHeight / 2 &&
                    cloudSprite.status === "untouch"
                ) {
                    //move cloud to farmer
                    cloudSprite.status = "touch";



                    updateStats();
                }

                // Check if game over
                if (countDownTimer <= 0) {
                  gameLoss();
                }
                if (cloudsCollected >= cloudsToCollect) {
                    gameWin();
                }
            });

            // for each cloud if it is despawned remove it from the cloudSprites array and remove it from the stage
            cloudSprites.forEach((cloudSprite, index) => {
                if (cloudSprite.status === "despawn") {
                    cloudSprites.splice(index, 1);
                    app.stage.removeChild(cloudSprite.sprite);
                }
            });
        }
    };

    const updateStats = () => {
        scoreText.text = `clouds collected: ${cloudsCollected}/${cloudsToCollect}`;
        countDownTimerText.text = `Time left: ${countDownTimer}`;
    };

    const spawncloud = () => {
        // create a new Sprite using the texture
        // cloudSprite ------------------------------
        var cloudSprite = new Sprite(cloudTexture);

        // Resize the cloudSprite
        cloudSprite.width = cloudWidth;
        cloudSprite.height = cloudHeight;

        // center the sprite's anchor point
        cloudSprite.anchor.set(0.5);

        // left
        cloudSprite.position.set(
            -cloudHeight / 2,
            Math.floor(((Math.random() * videoConstraints.height) / 4) * 3)
        );

        cloudSprites.push({
            sprite: cloudSprite,
            status: "untouch",
        });

        app.stage.addChild(cloudSprite);
    };

    const spawncloudSt = () => {
        // create a new Sprite using the texture
        // stationary cloudSprite ------------------------------
        var cloudStSprite = new Sprite(cloudStTexture);

        // Resize the cloudSprite
        cloudStSprite.width = cloudWidth_st;
        cloudStSprite.height = cloudHeight_st;

        // center the sprite's anchor point
        cloudStSprite.anchor.set(0.5);

        // left
        cloudStSprite.position.set(
            -cloudHeight_st / 2,
            Math.floor(((Math.random() * videoConstraints.height) / 4) * 3)
        );

        cloudStSprites.push({
            sprite: cloudStSprite,
            status: "untouched",
        });

        // app.stage.addChild(cloudStSprite);
    };

    loadStage();

    // Game --------------------------------------------------------------------
    const startGame = () => {
        // Start the game loop
        gameState = "playing";
        // get current time in milliseconds
        gameTimer = Date.now();
        lastcloudSpawnTime = Date.now();

        updateStats();

        // hide the start button
        document.getElementById("startGame").style.display = "none";
        // show restart button
        document.getElementById("restartGame").style.display = "block";

        logVars();
    };

    const restartGame = () => {
        // reset game variables
        cloudsCollected = 0;
        // livesLeft = 3;
        countDownTimer = 50;
        gameTimer = 0;
        lastcloudSpawnTime = 0;


        gameState = "playing";

        // Remove the Game over or the You win image if any
        loseScreenSprite.visible = false;
        winScreenSprite.visible = false;

        updateStats();

        logVars();
    };

    const removeAllclouds = () => {

        // remove all clouds from the stage
        cloudSprites.forEach((cloudSprite) => {
            app.stage.removeChild(cloudSprite.sprite);
        });

        // clear the cloudSprites array
        cloudSprites = [];
    };

    const gameLoss = () => {
        // End the game loop
        gameState = "gameOver";
        gameWon = false;

        removeAllclouds();

        loseScreenSprite.visible = true;

        logVars();
    };

    const gameWin = () => {
        // End the game loop
        gameState = "gameOver";
        gameWon = true;

        removeAllclouds();

        winScreenSprite.visible = true;

        document.getElementById("nextPage").style.display = "block";

        logVars();
    };

    const goToNextPage = () => {
        window.location.href = "https://www.google.com";
    };

    const logVars = () => {
        console.log(cloudSprites);
        //print cloudSprites position
        cloudSprites.forEach((cloudSprite) => {
            console.log(cloudSprite.sprite.position);
        });

        console.log("cloudsCollected: " + cloudsCollected);
        console.log("gameState: " + gameState);
        console.log("gameWon: " + gameWon);
    };

    return (
        <div>
            <h1>cloud chasing </h1>
            <p>Collect water form the clouds!</p>
            <div id="cloud-swat-main">
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
                        id="cloud-container"
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
