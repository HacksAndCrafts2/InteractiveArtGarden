// game imports
import React, { useRef, useEffect } from "react";
import cloud_1_img from '../../assets/img/cloud_1.png'
import cloud_2_img from '../../assets/img/cloud_2.png'
import gardener_img from '../../assets/img/gardener.png'
import trail_img from '../../assets/img/trail.png'
import water1_img from '../../assets/img/wateringCan_empty.png'
import water2_img from '../../assets/img/wateringCan_half.png'
import water3_img from '../../assets/img/wateringCan_full.png'
import * as PIXI from "pixi.js"

//tracker imports
import Webcam from "react-webcam";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

import { Application, Rectangle, Sprite } from "pixi.js";

export default function CloudChase2({ }) {
    // tracker test module
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

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
                // Make Detections
                const poses = await detector.estimatePoses(video);
                //   console.log(poses);
                // Draw poses on the canvas
                drawCanvas(poses, video, videoWidth, videoHeight, canvasRef);
            } catch (e) {
                console.log(e)
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

    const ref = useRef(null);
    useEffect(() => {
        // On first render create our application
        const app = new Application({
            width: 800,
            height: 600,
            backgroundColor: 0x22A7F0,
        });

        // Add app to DOM
        ref.current.appendChild(app.view);
        // Start the PixiJS app
        app.start();

        let waterlevel = 0;
        const rainCloudTexture = PIXI.Texture.from(cloud_1_img);
        const normalCLoudTexture = PIXI.Texture.from(cloud_2_img);
        // const cloud3 = PIXI.Sprite.from(cloud_1_img);
        // const cloud4 = PIXI.Sprite.from(cloud_2_img);

        const water1 = PIXI.Texture.from(water1_img);
        const water2 = PIXI.Texture.from(water2_img);
        const water3 = PIXI.Texture.from(water3_img);
        const watering_can = new PIXI.Sprite(water1);

        const armLeftTexture = await PIXI.Texture.from(ArmLeftPath);
        const armRightTexture = await PIXI.Texture.from(ArmRightPath);

        // cloud1.buttonMode = true;
        // cloud1.anchor.set(0.5);
        cloud3.anchor.set(1);

        // cloud1.x = app.screen.width / 2;
        // cloud1.y = app.screen.height / 5;
        // cloud1.interactive = true;
        // cloud1.cursor = 'pointer'

        cloud3.x = (app.screen.width / 5) - 200;
        cloud3.y = app.screen.height / 4;
        cloud3.interactive = true;
        cloud3.cursor = 'pointer'
        watering_can.anchor.set(0);
        watering_can.x = 0;
        watering_can.y = 0;
        // cloud1.hitArea = new Rectangle(0, 0, 100, 50);
        cloud1.on('mouseover', (event) => {
            // console.log('tapped');
            cloud1.x -= 5;
            cloud1.y += 10;
        });

        cloud3.on('mouseover', (event) => {
            // console.log('tapped');
            cloud3.x -= 5;
            cloud3.y += 10;
        });
        cloud2.anchor.set(0.1)
        cloud4.anchor.set(0.1)
        cloud2.x = app.screen.width / 10;
        cloud2.y = app.screen.height / 8;
        cloud4.x = (app.screen.width / 10) - 500;
        cloud4.y = app.screen.height / 8;

        // create a new Sprite using the texture
        armLeftSprite = await new Sprite(armLeftTexture);
        armRightSprite = await new Sprite(armRightTexture);

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

        app.stage.addChild(cloud1);
        app.stage.addChild(cloud2);
        app.stage.addChild(cloud3);
        app.stage.addChild(cloud4);
        app.stage.addChild(watering_can);
        app.stage.addChild(armLeftSprite);
        app.stage.addChild(armRightSprite);

        const gardener = PIXI.Sprite.from(gardener_img);
        gardener.y = app.screen.height / 1.5;
        app.stage.addChild(gardener);

        app.ticker.add(() => {
            updateGame();
        });

        const spawnRainCloud = () => {
            var rainCloudSprite = new Sprite(rainCloudTexture);

            //resize cloud
            rainCloudSprite.width = 100
            rainCloudSprite.height = 100
            rainCloudSprite.buttonMode = true;
            rainCloudSprite.anchor.set(0.5);
            rainCloudSprite.x = app.screen.width / 2;
            rainCloudSprite.y = app.screen.height / 5;
            rainCloudSprite.interactive = true;
            rainCloudSprite.cursor = 'pointer'



            // Listen for animate update
            app.ticker.add((delta) => {
                // just for fun, let's rotate mr rabbit a little
                // delta is 1 if running at 100% performance
                // creates frame-independent transformation
                rainCloudSprites.forEach((rainCloudSprite) => {
                    rainCloudSprite.x += 0.25 * delta;
                    rainCloudSprite.x += 0.25 * delta;
                })

            })
            rainCloudSprites.push({
                sprite: rainCloudSprite,
                status: "alive",
            });

            app.stage.addChild(rainCloudSprite);
        };

        loadStage();

        app.stage.interactive = true;
        app.stage.hitArea = app.screen;
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
                x: armLeftSprite.x + (playerSize - handDistFromWrists) * Math.sin(armLeftSprite.rotation),
                y: armLeftSprite.y - (playerSize - handDistFromWrists) * Math.cos(armLeftSprite.rotation),
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
                x: armRightSprite.x + (playerSize - handDistFromWrists) * Math.sin(armRightSprite.rotation),
                y: armRightSprite.y - (playerSize - handDistFromWrists) * Math.cos(armRightSprite.rotation),
            };



            app.stage.on('mousemove', (event) => {
                mouseposition = mouseposition || { x: 0, y: 0 };
                mouseposition.x = hand_mouseposition.x;
                mouseposition.y = hand_mouseposition.y;
                console.log(mouseposition.x, mouseposition.y)
                // console.log(mouseposition.y)
                if (mouseposition.x < 2.5) {
                    gardener.x = 2.5;
                } else if (mouseposition.x > 620) {
                    gardener.x = 620;
                } else {
                    gardener.x = mouseposition.x;
                }

                if (cloud1.y > 430) {
                    //remove instance add point
                    app.stage.removeChild(cloud1);
                    cloud1.y = 0;
                    waterlevel = 1;
                    console.log("WATERED");
                }

                if (cloud3.y > 430) {
                    //remove instance add point
                    app.stage.removeChild(cloud3);
                    cloud3.y = 0;
                    waterlevel = 2;
                    console.log("DONE");
                }

                if (waterlevel == 1) {
                    watering_can.texture = water2;
                } else if (waterlevel == 2) {
                    watering_can.texture = water3;
                }


            });


            // // Listen for animate update
            // app.ticker.add((delta) => {
            //     // just for fun, let's rotate mr rabbit a little
            //     // delta is 1 if running at 100% performance
            //     // creates frame-independent transformation
            //     rainCloudSprites.forEach((rainCloudSprite)=>{
            //         rainCloudSprite.x += 0.25 * delta;
            //         rainCloudSprite.x += 0.25 * delta;
            //     })
            // cloud1.x += 0.25 * delta;
            // cloud3.x += 0.25 * delta;
            cloud2.x += 0.1 * delta;
            cloud4.x += 0.1 * delta;

        });


    return () => {
        // On unload completely destroy the application and all of it's children
        app.destroy(true, true);
    };
}, []);




return (
    <div>
        <h1>Cloud Chase Pixi page</h1>
        <p>drag the clouds to collect water for the plants!</p>
        {/* tracker body */}
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

                {/* create game body */}
                <div id="cloud-container" className="container" style={{
                    position: "absolute",
                    left: marginLeftPixi,
                    top: marginTopPixi,
                    zIndex: 1,
                }}
                >
                    <div id="pixi-main" ref={ref} ></div>
                </div>
            </div>
        </div>
    </div>
);
}
