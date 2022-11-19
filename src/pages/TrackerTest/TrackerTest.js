import React from "react";

export default function TrackerTest({}) {
  return (
    <div>
      <h1>Tracker Test</h1>
      <div id="main">
        <div class="container">
          <div class="canvas-wrapper">
            <canvas id="output"></canvas>
            <video
              id="video"
            ></video>
          </div>
          <div id="scatter-gl-container"></div>
        </div>
      </div>
    </div>
  );
}
