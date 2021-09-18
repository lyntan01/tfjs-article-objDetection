import React, { useEffect, useState, useRef } from "react";
import {
  TextField,
  Grid,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
} from "@material-ui/core";
import './App.css'
import DeleteOutlineTwoToneIcon from "@material-ui/icons/DeleteOutlineTwoTone";
import { makeStyles } from "@material-ui/core/styles";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
// import {loadGraphModel} from '@tensorflow/tfjs-converter';

// import * as posenet from '@tensorflow-models/posenet';
import Webcam from "react-webcam";
import { createWorker,createScheduler  } from 'tesseract.js';
// import * as cvstfjs from '@microsoft/customvision-tfjs';


function App() {

  const url = {model: './tfjsmodel/model.json'}

  const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    dustbinIcon: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }));
  const classes = useStyles();

  
  const webcamRef = React.useRef(null);

  const [videoWidth, setVideoWidth] = useState(853);
  const [videoHeight, setVideoHeight] = useState(480);


  const [model, setModel] = useState();
  const [prediction, setPrediction] = useState("");
  const [message, setMessage] = useState("Press 'Start Detect' to start!");

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function getPredictionMesage(category) {
    if (category != "Trash") {
      return "This item belongs to the " + category + " bin!";
    } else {
      return "This item cannot be recycled. Please throw it in a nearby wastebin."
    }
  }
  
  async function loadModel(url) {
    try {

      // For layered model
      // const mode = await tf.loadLayersModel(url.model);

      const model = await cocoSsd.load();
      setModel(model);
      console.log("Load model success");
    } catch (err) {
      console.log(err);
      console.log("Failed load model");
    }
  }

  
  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);


  async function predictionFunction() {
    const predictions = await model.detect(document.getElementById("img"));
    // setVideoHeight(webcamRef.current.video.videoHeight);
    // setVideoWidth(webcamRef.current.video.videoWidth);
    var cnvs = document.getElementById("myCanvas");

    // cnvs.style.position = "absolute";

    var ctx = cnvs.getContext("2d");
    ctx.clearRect(
      0,
      0,
      webcamRef.current.video.videoWidth,
      webcamRef.current.video.videoHeight
    );

    setMessage("No item detected");

    if (predictions.length > 0) {

      // setPredictionData(predictions);
      console.log(predictions);
      for (let n = 0; n < predictions.length; n++) {
        // Check scores
        console.log(n);

        if (predictions[n].score > 0.7) {

          // if prediction score > 70%, update prediction
          setPrediction(capitalizeFirstLetter(predictions[n].class));
          setMessage(getPredictionMesage(prediction));

          let bboxLeft = predictions[n].bbox[0];
          let bboxTop = predictions[n].bbox[1];
          let bboxWidth = predictions[n].bbox[2];
          let bboxHeight = predictions[n].bbox[3] - bboxTop;

          console.log("bboxLeft: " + bboxLeft);
          console.log("bboxTop: " + bboxTop);

          console.log("bboxWidth: " + bboxWidth);

          console.log("bboxHeight: " + bboxHeight);

          ctx.beginPath();
          ctx.font = "28px Arial";
          ctx.fillStyle = "red";

          ctx.fillText(
            predictions[n].class +
              ": " +
              Math.round(parseFloat(predictions[n].score) * 100) +
              "%",
            bboxLeft,
            bboxTop
          );

          ctx.rect(bboxLeft, bboxTop, bboxWidth, bboxHeight);
          ctx.strokeStyle = "#FF0000";

          ctx.lineWidth = 3;
          ctx.stroke();

          console.log("detected");
        }
      }
    }

    // setTimeout(() => predictionFunction(), 500);
  }


  // useEffect(() => {
  //   //prevent initial triggering
  //   if (mounted.current) {
  //     predictionFunction();
   
  //   } else {
  //     mounted.current = true;
  //   }
  // }, [start]);



 
  const videoConstraints = {
    height: 480,
    width: 853,
    maxWidth: "100vw",
    facingMode: "environment",
  };

  return (
    <div class="container">
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.dustbinIcon}
            color="inherit"
            aria-label="menu"
          >
            <DeleteOutlineTwoToneIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Trash Classification System
          </Typography>
        </Toolbar>
      </AppBar>

      <Box mt={1} />
      <Grid
        container
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          // padding: 20,
        }}
      >
        <Grid
          item
          xs={12}
          md={12}
          style={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2>{message}</h2>
          <>
            <Box mt={2} />
            {
              <Button
                variant={"contained"}
                style={{
                  color: "white",
                  backgroundColor: "blueviolet",
                  width: "50%",
                  maxWidth: "250px",
                }}
                onClick={() => {
                  predictionFunction();
                }}
              >
                Start Detect
              </Button>
            }
            <Box mt={2} />{" "}
          </>
          <div style={{ position: "absolute", top: "250px", zIndex: "9999" }}>
            <canvas
              id="myCanvas"
              width={videoWidth}
              height={videoHeight}
              style={{ backgroundColor: "transparent" }}
            />
          </div>
          <div style={{ position: "absolute", top: "250px" }}>
            {/* <img
          style={{ width: videoWidth, objectFit: "fill" }}
          id="img"
          src={imageData}
        ></img>   <Webcam
        audio={false}
        id="img2"
        ref={webcamRef}
        // width={640}
        screenshotQuality={1}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      /> */}
            <Webcam
              audio={false}
              id="img"
              ref={webcamRef}
              // width={640}
              screenshotQuality={1}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
            />
          </div>
        </Grid>
        <Grid item xs={12} md={12}></Grid>
      </Grid>
    </div>
  );
}

export default App;
