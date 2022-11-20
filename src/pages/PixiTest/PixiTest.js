import React from "react";
import * as PIXI from "pixi.js";
import { Application, Sprite } from "pixi.js";
import IMAGES from "../../assets/Assets";
import { eye } from "@tensorflow/tfjs-core";

// import eyeLeft from '../../assets/eyeLeft.png';

export default function PixiTest({}) {
  const videoConstraints = {
    width: 800,
    height: 600,
    facingMode: "user",
  };

  var eyesArray = [];
  var trackerPosition = {
    x: 50,
    y: 250,
  }
  var trackerSpeed = 10;

  // Async load the stage
  const loadStage = async () => {
    var app = await new Application({
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

    var EyePath = await IMAGES.EyeUp;

    // load the texture we need
    const eyeTexture = PIXI.Texture.from(EyePath);

    // Create a grid of eyes
    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < 10; j++) {
        var eye = new PIXI.Sprite(eyeTexture);
        eye.x = (i * videoConstraints.width) / 10 + 35;
        eye.y = (j * videoConstraints.height) / 10 + 35;
        eye.width = 50;
        eye.height = 50;

        eye.anchor.set(0.5, 0.5);

        app.stage.addChild(eye);
        eyesArray.push({
          eyeSprite: eye,
        });
      }
    }

    // get mouse position
    // // create a new Sprite using the texture
    // const eye = await new Sprite(eyeTexture);

    // console.log(eye)

    // // Setup the position of the bunny
    // eye.x = app.renderer.width / 2;
    // eye.y = app.renderer.height / 2;

    // // center the sprite's anchor point
    // eye.anchor.set(0.5, 0.5)

    // // move the sprite to the center of the screen
    // eye.position.set(videoConstraints.width / 2, videoConstraints.height / 2);

    // // Add the eye to the scene we are building
    // app.stage.addChild(eye);

    // Listen for frame updates
    app.ticker.add(() => {
      updateRotations();
    });
  };

  const updateRotations = () => {
    // Update tracker position to bounce around the screen
    if (trackerPosition.x > videoConstraints.width) {
      trackerSpeed = -10;
    } else if (trackerPosition.x < 0) {
      trackerSpeed = 10;
    }

    trackerPosition.x += trackerSpeed;

    if (trackerPosition.y > videoConstraints.height) {
      trackerSpeed = -10;
    } else if (trackerPosition.y < 0) {
      trackerSpeed = 10;
    }

    trackerPosition.y += trackerSpeed;


    // each frame we spin the eye around a bit
    for (var i = 0; i < eyesArray.length; i++) {
      // get the direction pointing from the eye to the tracker
      var direction = {
        x: trackerPosition.x - eyesArray[i].eyeSprite.x,
        y: trackerPosition.y - eyesArray[i].eyeSprite.y,
      };

      // get the angle of the direction
      var angle = Math.atan2(direction.y, direction.x);

      // rotate the eye to face the tracker
      eyesArray[i].eyeSprite.rotation = angle + Math.PI / 2;
    }
  };

  loadStage();

  return (
    <div>
      <h1>Pixi Test</h1>
      {/* <img src={IMAGES.Grass} alt="eyeLeft" /> */}

      <button onClick={loadStage}>Load Stage</button>

      <div id="pixi-main"></div>
    </div>
  );
}
