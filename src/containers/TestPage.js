import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';

import {connect} from 'react-redux';


const styles = {
  
  div:{
    display: 'flex',
    flexDirection: 'row wrap',
    padding: 20,
    width: '90%'
  },
  paperLeft:{
    flex: 2,
    height: 600,
    margin: 10,
    textAlign: 'center',
    padding: 10
  },
};//styles


//---------------------------------------------------
//
//        TEST PAGE
//
//---------------------------------------------------
class TestPage extends React.Component {

  // ------------------------
  // constructor
  // ------------------------
  constructor(props) {
    super(props);

    //this.state = {   
      //audioChunks: [],
    //};

    this.audioChunks = [];
    this.rec         = null;
    
    this.abc = 12;//dummy

    this.setupMediaDevice   = this.setupMediaDevice.bind(this);
    this.initializeRecorder = this.initializeRecorder.bind(this);
    this.startRecording     = this.startRecording.bind(this);
    this.stopRecording      = this.stopRecording.bind(this);
    this.playRecording      = this.playRecording.bind(this);
    this.saveRecording      = this.saveRecording.bind(this);


    this.setupMediaDevice();
  }


  setupMediaDevice() {
    console.log('-- setupRecorder --');

    //-------------------------------------
    //   ensure getUserMedia is supported
    //-------------------------------------
    if (!navigator.mediaDevices) {
      console.log("getUserMedia not supported on your browser!");
      return;
    }
    if(!navigator.mediaDevices.getUserMedia) {
      console.log("getUserMedia not supported on your browser!");
      return;
    }

    console.log("GOOD: getUserMedia not supported on your browser!");

    //----------------------------------------------------
    // keep the this var in page, as in nested callback
    // this cant be the page/current class/component
    //----------------------------------------------------
    var page = this;

    // constraints - only audio needed for this app
    navigator.mediaDevices.getUserMedia ({audio: true})
      .then(function(stream) {
        console.log("getUserMedia ok!");
        page.initializeRecorder(stream);
      })
      .catch(function(err) {
         console.log('The following gUM error occured: ' + err);
      }
    );
    
  }

  initializeRecorder(stream) {
    console.log("-- initializeRecorder --");

    console.log("-- abc: " + this.abc);


    var recordedAudio = document.getElementById("recordedAudio");
    var audioDownload = document.getElementById("audioDownload");

    var page = this;
    this.rec = new MediaRecorder(stream);
    this.rec.ondataavailable = e => {
      page.audioChunks.push(e.data);
      if (page.rec.state == "inactive"){
        
        let blob = new Blob(page.audioChunks,{type:'audio/x-mpeg-3'});
        
        recordedAudio.src       = URL.createObjectURL(blob);
        recordedAudio.controls  = true;
        recordedAudio.autoplay  = false;
        
        audioDownload.href      = recordedAudio.src;
        audioDownload.download  = 'mp3';
        audioDownload.innerHTML = 'download';
      }
    }//ondataavailable
  
  }//initializeRecorder

  startRecording() {
    console.log("-- startRecording --");
    this.audioChunks = [];
    this.rec.start();
    console.log("-- startRecording done");
  }

  stopRecording() {
    console.log("-- stopRecording --");
    this.rec.stop();
  }

  playRecording() {
    console.log("-- playRecording --");

  }

  saveRecording() {
    console.log("-- saveRecording --");
  }

  render() {
    return (
      <div>
        <MuiThemeProvider>
          <div>
            <div style={styles.div}>
              <Paper zDepth={3} style={styles.paperLeft}>
                <h4>Record & Test</h4>
                STEP-1: <RaisedButton label="RECORD" primary={true} onClick={this.startRecording}/> <RaisedButton label="STOP" primary={true} onClick={this.stopRecording}/><br /><br /><br />
                STEP-2: <RaisedButton label="PLAY" primary={true} onClick={this.playRecording}/><br /><br /><br />
                STEP-3: <RaisedButton label="SAVE" primary={true} onClick={this.saveRecording}/><br /><br /><br />
                <audio id="recordedAudio"></audio>
                <a id="audioDownload"></a>
              </Paper>
            </div>
          </div>
        </MuiThemeProvider>
      </div>
    );
  }//render
}//TestPage


function mapStateToProps(state) {
  const {alert} = state;
  return {
    alert,
  };
}

const connectedTestPage= connect(mapStateToProps)(TestPage);
export {connectedTestPage as TestPage};