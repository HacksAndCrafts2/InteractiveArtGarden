import React from "react";
import * as PIXI from "pixi.js";

// import @pixi/graphics-extras
import { Graphics } from "@pixi/graphics-extras";
import { Application, Sprite } from "pixi.js";
import IMAGES from "../../assets/Assets";

export default function GenerativeTest({}) {
  const videoConstraints = {
    width: 800,
    height: 600,
    facingMode: "user",
  };

  var flower = null;

  var flowerProperties = {
    innerPattern: {
      count: 5,
      radius: 50,
      innerRadius: 40,
      rotation: 0,
      color: 0x00ff00,
    },
    flowerCenter: {
      position: {
        x: 0,
        y: 0,
      },
      radius: 50,
      sides: 10,
      cornerPixels: 10,
      color: 0x00ff00,
      rotation: 0,
    },
    petal: {
      count: 10,
      radius: 50,
      sides: 10,
      cornerPixels: 10,
      color: 0x00ff00,
      rotation: 0,
      stretch: 2,
      outline: {
        color: 0x00ff00,
        width: 2,
      },
    },
  };

  const randomizeFlower = async () => {
    flowerProperties.innerPattern.count = Math.floor(Math.random() * 10) + 5;
    flowerProperties.innerPattern.radius = Math.floor(Math.random() * 50) + 10;
    flowerProperties.innerPattern.innerRadius =
      Math.floor(Math.random() * 20) + flowerProperties.innerPattern.radius;
    flowerProperties.innerPattern.rotation =
      Math.floor(Math.random() * 360) + 1;

    flowerProperties.flowerCenter.radius =
      Math.floor(Math.random() * 50) + flowerProperties.innerPattern.radius;
    flowerProperties.flowerCenter.sides = Math.floor(Math.random() * 10) + 5;
    flowerProperties.flowerCenter.cornerPixels =
      Math.floor(Math.random() * 10) + 5;
    flowerProperties.flowerCenter.rotation =
      Math.floor(Math.random() * 360) + 1;

    flowerProperties.petal.count = Math.floor(Math.random() * 10) + 5;
    flowerProperties.petal.radius = Math.floor(Math.random() * 30) + flowerProperties.flowerCenter.radius;
    flowerProperties.petal.sides = Math.floor(Math.random() * 10) + 5;
    flowerProperties.petal.cornerPixels = Math.floor(Math.random() * 10) + 5;
    flowerProperties.petal.rotation = Math.floor(Math.random() * 360) + 1;
    flowerProperties.petal.stretch = (Math.random() * 3) + 1;

    flowerProperties.petal.outline.width = Math.floor(Math.random() * 5) + 1;

    var colorSet = await generateColorSet();

    flowerProperties.innerPattern.color = colorSet[2];
    flowerProperties.flowerCenter.color = colorSet[0];
    flowerProperties.petal.color = colorSet[1];
    flowerProperties.petal.outline.color = colorSet[2];

    loadStage();
  };

  // const componentToHex = (c) => {
  //   var hex = c.toString(16);
  //   return hex.length == 1 ? "0" + hex : hex;
  // };

  // const rgbToHex = (r, g, b) => {
  //   return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  // };

  const rgbToDecimal = (r, g, b) => {
    return r * 65536 + g * 256 + b;
  };

  const generateColorSet = async () => {
    var compColors = require("complementary-colors");

    var randomColor = getRandomValidColor();

    // Parse to string check length
    var colorString = randomColor.toString(16);
    while (colorString.length < 6) {
      colorString = "0" + colorString;
    }

    // Convert to hex
    var colorHex = "#" + colorString;

    var myColor = new compColors(colorHex);

    var colorSet = [];

    var colorsGenerated = myColor.triad();

    for (var i = 0; i < colorsGenerated.length; i++) {
      console.log(colorsGenerated[i]);
      var color = rgbToDecimal(
        colorsGenerated[i].r,
        colorsGenerated[i].g,
        colorsGenerated[i].b
      );
      colorSet.push(color);
    }

    return colorSet;
  };

  const getRandomValidColor = () => {
    var color = Math.floor(Math.random() * 0xffffff);
    if (color === 0x000000) {
      color = getRandomValidColor();
    }

    // get data type
    var type = typeof color;
    console.log("type: " + type);

    return color;
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

    // Create polygon for flower center
    var flowerCenter = new PIXI.Graphics();
    flowerCenter.beginFill(flowerProperties.flowerCenter.color);
    flowerCenter.drawRoundedPolygon(
      flowerProperties.flowerCenter.position.x,
      flowerProperties.flowerCenter.position.y,
      flowerProperties.flowerCenter.radius,
      flowerProperties.flowerCenter.sides,
      flowerProperties.flowerCenter.cornerPixels,
      flowerProperties.flowerCenter.rotation
    );
    flowerCenter.endFill();

    // Create flower inner pattern
    var flowerInnerPattern = new PIXI.Graphics();
    flowerInnerPattern.beginFill(flowerProperties.innerPattern.color);
    flowerInnerPattern.drawStar(
      flowerProperties.flowerCenter.position.x,
      flowerProperties.flowerCenter.position.y,
      flowerProperties.innerPattern.count,
      flowerProperties.innerPattern.radius,
      flowerProperties.innerPattern.innerRadius,
      flowerProperties.innerPattern.rotation
    );
    flowerInnerPattern.endFill();

    // Create petal container
    var petalContainer = new PIXI.Container();

    // Create flower petals
    for (var i = 0; i < flowerProperties.petal.count; i++) {
      var petal = new PIXI.Graphics();
      petal.beginFill(flowerProperties.petal.color);
      petal.drawRoundedPolygon(
        flowerProperties.flowerCenter.position.x,
        flowerProperties.flowerCenter.position.y,
        flowerProperties.petal.radius,
        flowerProperties.petal.sides,
        flowerProperties.petal.cornerPixels,
        flowerProperties.petal.rotation
      );
      petal.endFill();

      // Create petal outline
      var petalOutline = new PIXI.Graphics();
      petalOutline.lineStyle(
        flowerProperties.petal.outline.width,
        flowerProperties.petal.outline.color
      );

      petalOutline.drawRoundedPolygon(
        flowerProperties.flowerCenter.position.x,
        flowerProperties.flowerCenter.position.y,
        flowerProperties.petal.radius,
        flowerProperties.petal.sides,
        flowerProperties.petal.cornerPixels,
        flowerProperties.petal.rotation
      );

      petal.rotation = ((Math.PI * 2) / flowerProperties.petal.count) * i;
      petal.scale.x = flowerProperties.petal.stretch;

      petalOutline.rotation =
        ((Math.PI * 2) / flowerProperties.petal.count) * i;
      petalOutline.scale.x = flowerProperties.petal.stretch;

      petalContainer.addChild(petal);
      petalContainer.addChild(petalOutline);
    }

    // Create flower
    flower = new PIXI.Container();
    flower.addChild(petalContainer);
    flower.addChild(flowerCenter);
    flower.addChild(flowerInnerPattern);

    // Move the flower to the center of the screen
    flower.position.set(
      videoConstraints.width / 2,
      videoConstraints.height / 2
    );

    // Add to stage
    app.stage.addChild(flower);

    // Listen for frame updates
    app.ticker.add(() => {
      // each frame we spin the bunny around a bit
      updateAnimation();
    });
  };

  const updateAnimation = () => {
    flower.rotation += 0.002;
  };

  // loadStage();
  randomizeFlower();

  return (
    <div>
      <h1>Generative Art Test</h1>

      <button onClick={loadStage}>Load Stage</button>
      <button onClick={randomizeFlower}>Randomize Flower</button>

      <div id="pixi-main"></div>
    </div>
  );
}
