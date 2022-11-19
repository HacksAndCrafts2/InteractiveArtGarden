import React from "react";
import Webcam from "react-webcam";


export default function TrackerTest({}) {
    // play webcam video
    // https://www.npmjs.com/package/react-webcam
    
    const WebcamComponent = () => <Webcam />;
    const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
    };

    const WebcamCapture = () => (
    <Webcam
        audio={false}
        height={720}
        screenshotFormat="image/jpeg"
        width={1280}
        videoConstraints={videoConstraints}
    >
        {({ getScreenshot }) => (
        <button
            onClick={() => {
            const imageSrc = getScreenshot()
            }}
        >
            Capture photo
        </button>
        )}
    </Webcam>
    );

  return (
    <div>
      <h1>Tracker Test</h1>
      <div id="tracker-main">
        <div class="container">
          {
            <WebcamCapture />
          }


        </div>
      </div>
    </div>
  );
}
