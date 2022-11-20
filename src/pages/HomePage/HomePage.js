import React from "react";
import * as PIXI from "pixi.js";

export default function HomePage({}) {
  const pixiBannerSize = {
    width: 800,
    height: 400,
  };

  // var app = new PIXI.Application(800, 600, {
  //   antialias: true,
  //   backgroundColor: 0x1099bb,
  // });

  // var img = new Image();
  // img.src = "https://picsum.photos/1920/108";

  // var baseTexture = new PIXI.BaseTexture(img);
  // var texture = new PIXI.Texture(baseTexture);
  // var bg = new PIXI.Sprite(texture);
  // document.body.appendChild(app.view);

  // app.stage.interactive = true;

  // var g1 = new PIXI.Graphics();
  // g1.beginFill(0xe63946, 1);
  // g1.drawRect(50, 100, 420, 120);
  // g1.endFill();

  // var g2 = new PIXI.Graphics();
  // g2.beginFill(0xe63946, 1);
  // g2.drawRect(350, 250, 120, 120);
  // g2.endFill();

  // var noise = new PIXI.filters.NoiseFilter();
  // var textobj = new PIXI.Text("套用google正黑體", {
  //   font: "50px cwTeXHei",
  //   fill: "#DCC9DD",
  // });
  // var f = new PIXI.filters.ColorMatrixFilter();

  // var blurfilter = new PIXI.filters.BlurFilter();
  // g1.filters = [blurfilter, f];
  // //g2.filters = [blurfilter,f];
  // f.matrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];

  // //app.stage.addChild(g1,g2);
  // app.stage.addChild(bg);
  // app.stage.addChild(textobj);
  // bg.mask = textobj;
  // // var tween = TweenMax.to(textobj, 2, { y: "280", repeat: 99, yoyo: true });

  return (
    <div>
      {/* Hero */}
      <div class="">
        <div class="jumbotron" id="jumbotron-header">
          <div id="pixi-main"></div>
          {/* <h1 class="display-4">Hello, world!</h1> */}
          <p class="lead">
            This is a simple hero unit, a simple jumbotron-style component for
            calling extra attention to featured content or information.
          </p>
          <hr class="my-4" />
          <p>
            It uses utility classes for typography and spacing to space content
            out within the larger container.
          </p>
          <a class="btn btn-primary btn-lg" href="#" role="button">
            Learn more
          </a>
        </div>
      </div>

      {/* Bootstrap cards */}
      {/* 
      make cards for each of these
     
      <Route path="/" element={<HomePage />} />
          <Route path="/tracker-test" element={<TrackerTest />} />
          <Route path="/bug-swat" element={<BugSwat />} />
          <Route path="/pixi-test" element={<PixiTest />} />
          <Route path="/generate-test" element={<GenerativeTest />} />
          <Route path="*" element={<HomePage /> /* <NotFound /> 
      
    
      */}
      <div class="card-deck">
        <div className="card" style={{ width: "18rem" }}>
          <div className="card-body">
            <h5 className="card-title">Tracker Test</h5>
            <p className="card-text">
              The initial test we did trying to figure out the Tensorflow.js
              pose-detection API.
            </p>
            <a href="/tracker-test" className="btn btn-primary">
              Go to Tracker Test
            </a>
          </div>
        </div>

        <div className="card" style={{ width: "18rem" }}>
          <div className="card-body">
            <h5 className="card-title">Pixi Test</h5>
            <p className="card-text">
              The initial test we did to figure out how to use Pixi.js with
              React
            </p>
            <a href="/pixi-test" className="btn btn-primary">
              Go to Pixi Test
            </a>
          </div>
        </div>

        <div className="card" style={{ width: "18rem" }}>
          <div className="card-body">
            <h5 className="card-title">Bug Swat</h5>
            <p className="card-text">
              A minigame integrating the pose-detection API with Pixi.js
            </p>
            <a href="/bug-swat" className="btn btn-primary">
              Go to Bug Swat
            </a>
          </div>
        </div>

        <div className="card" style={{ width: "18rem" }}>
          <div className="card-body">
            <h5 className="card-title">Generative Art</h5>
            <p className="card-text">
              Testing Generative art with randomly generated shapes to form
              flowers in Pixi.js
            </p>
            <a href="/generate-test" className="btn btn-primary">
              Go to Generative Art
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
