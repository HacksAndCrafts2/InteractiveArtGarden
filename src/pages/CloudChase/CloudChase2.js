import React, { useRef, useEffect } from "react";
import cloud_1_img from '../../assets/img/cloud_1.png'
import cloud_2_img from '../../assets/img/cloud_2.png'
import gardener_img from '../../assets/img/gardener.png'
import trail_img from '../../assets/img/trail.png'
import water1_img from '../../assets/img/wateringCan_empty.png'
import water2_img from '../../assets/img/wateringCan_half.png'
import water3_img from '../../assets/img/wateringCan_full.png'
import * as PIXI from "pixi.js"

import { Application , Rectangle, Sprite} from "pixi.js";

export default function CloudChase2({ }) {
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
    const cloud1 = PIXI.Sprite.from(cloud_1_img);
    const cloud2 = PIXI.Sprite.from(cloud_2_img);
    const cloud3 = PIXI.Sprite.from(cloud_1_img);
    const cloud4 = PIXI.Sprite.from(cloud_2_img);
    
    const water1 = PIXI.Texture.from(water1_img);
    const water2 = PIXI.Texture.from(water2_img);
    const water3 = PIXI.Texture.from(water3_img);
    const watering_can = new PIXI.Sprite(water1);
    cloud1.buttonMode = true;
    cloud1.anchor.set(0.5);
    cloud3.anchor.set(1);
    cloud2.anchor.set(0.1)
    cloud4.anchor.set(0.1)
    cloud1.x = app.screen.width / 2;
    cloud1.y = app.screen.height / 5;
    cloud1.interactive = true;
    cloud1.cursor = 'pointer'

    cloud3.x = (app.screen.width / 5)-200;
    cloud3.y = app.screen.height / 4;
    cloud3.interactive = true;
    cloud3.cursor = 'pointer'
    watering_can.anchor.set(0);
    watering_can.x = 0;
    watering_can.y = 0;
    // cloud1.hitArea = new Rectangle(0, 0, 100, 50);
    cloud1.on('mouseover', (event) => {
      // console.log('tapped');
      cloud1.x -=5;
      cloud1.y +=10;
  });

  cloud3.on('mouseover', (event) => {
    // console.log('tapped');
    cloud3.x -=5;
    cloud3.y +=10;
});
    cloud2.x = app.screen.width / 10;
    cloud2.y = app.screen.height / 8;
    cloud4.x = (app.screen.width / 10)-500;
    cloud4.y = app.screen.height / 8;
    app.stage.addChild(cloud1);
    app.stage.addChild(cloud2);
    app.stage.addChild(cloud3);
    app.stage.addChild(cloud4);
    app.stage.addChild(watering_can);
    // app.stage.addChild(cloud2);
    // app.stage.addChild(cloud3);

    const gardener =  PIXI.Sprite.from(gardener_img);
    gardener.y = app.screen.height/1.5;
    app.stage.addChild(gardener);


   



    // Get the texture for rope.
    const trailTexture = PIXI.Texture.from(trail_img);
    const historyX = [];
    const historyY = [];
    // historySize determines how long the trail will be.
    const historySize = 20;
    // ropeSize determines how smooth the trail will be.
    const ropeSize = 100;
    const points = [];

    // Create history array.
    for (let i = 0; i < historySize; i++) {
      historyX.push(0);
      historyY.push(0);
    }
    // Create rope points.
    for (let i = 0; i < ropeSize; i++) {
      points.push(new PIXI.Point(0, 0));
    }

    // Create the rope
    const rope = new PIXI.SimpleRope(trailTexture, points);

    // Set the blendmode
    rope.blendmode = PIXI.BLEND_MODES.ADD;

    app.stage.addChild(rope);

    // console.log('HELLO!');

    let mouseposition = null;

    app.stage.interactive = true;
    app.stage.hitArea = app.screen;
    app.stage.on('mousemove', (event) => {
      mouseposition = mouseposition || { x: 0, y: 0 };
      mouseposition.x = event.global.x;
      mouseposition.y = event.global.y;
      // console.log(mouseposition.y)
      if (mouseposition.x <2.5){
        gardener.x = 2.5;
      }else if (mouseposition.x>620){
        gardener.x = 620;
      }else{
        gardener.x = mouseposition.x;
      }

      if (cloud1.y>430){
        //remove instance add point
        app.stage.removeChild(cloud1);
        cloud1.y = 0;
        waterlevel = 1;
        console.log("WATERED");
      }

      if (cloud3.y>430){
        //remove instance add point
        app.stage.removeChild(cloud3);
        cloud3.y = 0;
        waterlevel=2;
        console.log("DONE");
      }

      if (waterlevel==1){
        watering_can.texture = water2;
      }else if (waterlevel==2){
        watering_can.texture = water3;
      }
  

    });


    // Listen for animate update
    app.ticker.add((delta) => {
      // just for fun, let's rotate mr rabbit a little
      // delta is 1 if running at 100% performance
      // creates frame-independent transformation
      cloud1.x += 0.25 * delta;
      cloud3.x += 0.25 * delta;
      cloud2.x += 0.1 * delta;
      cloud4.x += 0.1 * delta;


      if (!mouseposition) return;

      // Update the mouse values to history
      historyX.pop();
      historyX.unshift(mouseposition.x);
      historyY.pop();
      historyY.unshift(mouseposition.y);
      // Update the points to correspond with history.
      for (let i = 0; i < ropeSize; i++) {
        const p = points[i];

        // Smooth the curve with cubic interpolation to prevent sharp edges.
        const ix = cubicInterpolation(historyX, i / ropeSize * historySize);
        const iy = cubicInterpolation(historyY, i / ropeSize * historySize);

        p.x = ix;
        p.y = iy;
      }

      /**
       * Cubic interpolation based on https://github.com/osuushi/Smooth.js
       */
      function clipInput(k, arr) {
        if (k < 0) k = 0;
        if (k > arr.length - 1) k = arr.length - 1;
        return arr[k];
      }

      function getTangent(k, factor, array) {
        return factor * (clipInput(k + 1, array) - clipInput(k - 1, array)) / 2;
      }

      function cubicInterpolation(array, t, tangentFactor) {
        if (tangentFactor == null) tangentFactor = 1;

        const k = Math.floor(t);
        const m = [getTangent(k, tangentFactor, array), getTangent(k + 1, tangentFactor, array)];
        const p = [clipInput(k, array), clipInput(k + 1, array)];
        t -= k;
        const t2 = t * t;
        const t3 = t * t2;
        return (2 * t3 - 3 * t2 + 1) * p[0] + (t3 - 2 * t2 + t) * m[0] + (-2 * t3 + 3 * t2) * p[1] + (t3 - t2) * m[1];
      }


    });
    return () => {
      // On unload completely destroy the application and all of it's children
      app.destroy(true, true);
    };
  }, []);


  const createCloud = () => {

  }

  return (
    <div>
      <h1>Cloud Chase Pixi page</h1>
      <div ref={ref} />
    </div>
  );
}
