import React from "react";
import * as PIXI from "pixi.js";
import "./HomePage.css";

export default function HomePage({}) {
  const pixiBannerSize = {
    width: 800,
    height: 400,
  };

  return (
    <div>
      {/* Hero */}
      <div class="">
        <div class="jumbotron" id="jumbotron-header">
          <div id="pixi-main"></div>
          <h1 class="display-4">Interactive Art Garden</h1>
          <p class="lead">
            A fun little project to explore the use of Tensorflow js pre-trained
            models in a web app, and to play around with Pixi.js in React.
          </p>
          <hr class="my-4" />
          <p>Come explore our weird and whacky Interactive Art Garden</p>

        </div>
      </div>

      {/* Bootstrap cards */}
      <div class="cards-container">
        <div className="card" style={{ width: "18rem" }}>
          <div className="card-body">
            <h5 className="card-title">Bug Swat</h5>
            <p className="card-text">
              A minigame integrating the pose-detection API with Pixi.js by
              punching bugs to protect your plant
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

        <div className="card" style={{ width: "18rem" }}>
          <div className="card-body">
            <h5 className="card-title">CloudChase2</h5>
            <p className="card-text">
              CloudChase2 is a game where you harvest clouds to water your plant
            </p>
            <a href="/cloud-chase2" className="btn btn-primary">
              Go to CloudChase2
            </a>
          </div>
        </div>

        <div className="card" style={{ width: "18rem" }}>
          <div className="card-body">
            <h5 className="card-title">CloudChase</h5>
            <p className="card-text">
              CloudChase is similar to CloudChase2 but using pose-detection
              controls
            </p>
            <a href="/cloud-chase" className="btn btn-primary">
              Go to CloudChase
            </a>
          </div>
        </div>

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
      </div>
    </div>
  );
}
