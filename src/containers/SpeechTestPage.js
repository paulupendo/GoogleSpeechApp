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
    width: '100%'
  },
  paperLeft:{
    flex: 2,
    height: 600,
    margin: 10,
    textAlign: 'center',
    padding: 10
  },
  paperRight:{
    height: 600,
    flex: 3,
    margin: 10,
    textAlign: 'center',
  }
};//styles


//---------------------------------------------------
//
//        SPEECH TEST PAGE
//
//---------------------------------------------------
class SpeechTestPage extends React.Component {

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
        
        //page.blob = new Blob(page.audioChunks,{type:'audio/x-mpeg-3'});
        page.blob = new Blob(page.audioChunks,{type:'audio/ogg'});
        
        //page.blob = new Blob(page.audioChunks,{type:'audio/wav'});
        
        recordedAudio.src       = URL.createObjectURL(page.blob);
        recordedAudio.controls  = true;
        recordedAudio.autoplay  = false;
        audioDownload.href      = recordedAudio.src;

        console.log("---> audio src: " + recordedAudio.src);

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

    //var rec_file      = document.getElementById("rec_file");
    //rec_file.data     = this.blob;


    //var dataFile = new File(this.blob, "rec_file");

    var form = new FormData(document.getElementById("my_form"));
    //form.append("rec_file", dataFile);
    form.append("text", "hello");
    form.append("rec_file", this.blob, "rec_data1.wav");

    //form.append("rec_file", rec_file, "rec_file");


    var request = new XMLHttpRequest();
    var async = true;
    request.open("POST", "http://52.230.8.132:8080/api/matching_test", async);
    if (async) {
        request.onreadystatechange = function() {
            if(request.readyState == 4 && request.status == 200) {
                var response = null;
                try {
                    response = JSON.parse(request.responseText);
                } catch (e) {
                    response = request.responseText;
                }
                //uploadFormCallback(response);
                console.log("--- response: " + JSON.stringify(response) );
            }
        }
    }
    request.send(form);

  }

  saveRecording1() {
    console.log("-- saveRecording --");

    var form1      = document.getElementById("form1");
    var rec_file   = document.getElementById("rec_file");
    rec_file.data  = this.blob;

    form1.submit();

    console.log("-- saveRecording done --");

        return true;

  }
   
  render() {

    var paragraphText = '';

    if(this.props.studies && this.props.selectedStudy) {
      // use first element of selectedStudy
      const study = this.props.studies[this.props.selectedStudy[0]];
      console.log(">>>>>>>>> SpeechTestPage got study: " + JSON.stringify(study) );

      if(study) { paragraphText = study.Paragraph_Text; }
    }

    return (
      <div>
        <MuiThemeProvider>
          <div>
            <div style={styles.div}>
              <Paper zDepth={3} style={styles.paperLeft}>
                <h4>Paragraph</h4>
                <p>
                  {paragraphText}
                </p>
              </Paper>
              <Paper zDepth={3} style={styles.paperRight}>
                <h4>Record & Test</h4>
                <form id="form1" action="http://52.230.8.132:8080/api/matching_test"  enctype="multipart/form-data" method="post"  >
                <input type="hidden" name="text" value="text" />
                STEP-1: <RaisedButton label="RECORD" primary={true} onClick={this.startRecording}/> <RaisedButton label="STOP" primary={true} onClick={this.stopRecording}/><br /><br /><br />
                STEP-2: <RaisedButton label="PLAY" primary={true} onClick={this.playRecording}/><br /><br /><br />
                STEP-3: <RaisedButton label="SAVE" primary={true}  onClick={this.saveRecording} /><br /><br /><br />
                <audio id="recordedAudio"></audio><br />
                <a id="audioDownload"></a>
                </form>
              </Paper>
            </div>
          </div>
        </MuiThemeProvider>
      </div>
    );
  }//render
}//SpeechTestPage


function mapStateToProps(state) {
  console.log(")====> SpeechTestPage got state: " + JSON.stringify(state) );
  return {
    studies: state.studies,
    selectedStudy: state.selectedStudy
  };

}

const connectedSpeechTestPage= connect(mapStateToProps)(SpeechTestPage);
export {connectedSpeechTestPage as SpeechTestPage};