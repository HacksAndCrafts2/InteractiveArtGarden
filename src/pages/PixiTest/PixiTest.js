import React from "react";
import * as PIXI from 'pixi.js'
import { Application, Sprite } from 'pixi.js';
import IMAGES from '../../assets/Assets';

// import ArmLeft from '../../assets/ArmLeft.png';

export default function PixiTest({}) {

  const videoConstraints = {
    width: 800,
    height: 600,
    facingMode: "user",
  };


  // Async load the stage
  const loadStage = async () => {
    const app = await new Application({
      width: videoConstraints.width,
      height: videoConstraints.height,
      transparent: false,
      antialias: true,
    });

    // change the color of the canvas
    app.renderer.backgroundColor = 0xD4F5FF;

    // get the pixi-main element
    const pixiMain = document.getElementById('pixi-main');

    // remove all children from the element
    while (pixiMain.firstChild) {
      console.log(pixiMain.firstChild);
      pixiMain.removeChild(pixiMain.firstChild);
    }

    // add the canvas to the pixi-main element
    pixiMain.appendChild(app.view);

    var BugPath = await IMAGES.Bug

    console.log(BugPath)

    // load the texture we need
    const armTexture = PIXI.Texture.from(BugPath);

    // create a new Sprite using the texture
    const arm = await new Sprite(armTexture);

    console.log(arm)

    // Setup the position of the bunny
    arm.x = app.renderer.width / 2;
    arm.y = app.renderer.height / 2;

    // center the sprite's anchor point
    arm.anchor.set(0.5, 1)

    // move the sprite to the center of the screen
    arm.position.set(videoConstraints.width / 2, videoConstraints.height / 2);

    // Add the bunny to the scene we are building
    app.stage.addChild(arm);

    // Listen for frame updates
    app.ticker.add(() => {
      // each frame we spin the bunny around a bit
      arm.rotation += 0.1;
    });
  }


  loadStage();


  return (
    <div>
      <h1>Pixi Test</h1>
      {/* <img src={IMAGES.Grass} alt="ArmLeft" /> */}

      <button onClick={loadStage}>Load Stage</button>

      <div id="pixi-main">


      </div>
    </div>
  );
}
