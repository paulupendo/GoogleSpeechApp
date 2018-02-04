import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ToastContainer, toast } from 'react-toastify';
import { studyActions } from '../actions';

const styles = {
  div: {
    display: 'flex',
    flexDirection: 'row wrap',
    padding: 20,
    position: 'relative',
  },
  paperLeft: {
    flex: 2,
    height: 600,
    margin: 10,
    textAlign: 'center',
  },
  paperRight: {
    height: 600,
    flex: 1,
    margin: '10px 15px 10px 10px',
    textAlign: 'center',
  },
  buttonsDiv: {
    display: 'flex',
    flexDirection: 'column',
  },
  individualButtons: {
    marginBottom: '20px',
    width: '80%',
    marginLeft: '50px',
  },
}; //styles
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
    this.state = {
      study: {},
      recording: false,
      transcribed_text: '',
    };

    this.audioChunks = [];
    this.rec = null;
    this.comparison = '';

    this.abc = 12; //dummy

    this.setupMediaDevice = this.setupMediaDevice.bind(this);
    this.initializeRecorder = this.initializeRecorder.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.playRecording = this.playRecording.bind(this);
    this.saveRecording = this.saveRecording.bind(this);
    this.accuracy_comparison = this.accuracy_comparison.bind(this);

    this.setupMediaDevice();
  }
  componentWillMount() {
    if (this.props.studies && this.props.selectedStudy) {
      // use first element of selectedStudy
      const study = this.props.studies[this.props.selectedStudy[0]];
      console.log(
        '>>>>>>>>> SpeechTestPage got study: ' + JSON.stringify(study),
      );

      this.setState({
        study,
      });
    }
  }

  setupMediaDevice() {
    console.log('-- setupRecorder --');

    //-------------------------------------
    //   ensure getUserMedia is supported
    //-------------------------------------
    if (!navigator.mediaDevices) {
      console.log('getUserMedia not supported on your browser!');
      return;
    }
    if (!navigator.mediaDevices.getUserMedia) {
      console.log('getUserMedia not supported on your browser!');
      return;
    }

    console.log('GOOD: getUserMedia not supported on your browser!');

    //----------------------------------------------------
    // keep the this var in page, as in nested callback
    // this cant be the page/current class/component
    //----------------------------------------------------
    var page = this;

    // constraints - only audio needed for this app
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function(stream) {
        console.log('getUserMedia ok!');
        page.initializeRecorder(stream);
      })
      .catch(function(err) {
        console.log('The following gUM error occured: ' + err);
      });
  }

  initializeRecorder(stream) {
    console.log('-- initializeRecorder --');

    console.log('-- abc: ' + this.abc);

    var recordedAudio = document.getElementById('recordedAudio');
    var audioDownload = document.getElementById('audioDownload');

    var page = this;
    this.rec = new MediaRecorder(stream);
    this.rec.ondataavailable = e => {
      page.audioChunks.push(e.data);
      if (page.rec.state == 'inactive') {
        //page.blob = new Blob(page.audioChunks,{type:'audio/x-mpeg-3'});
        page.blob = new Blob(page.audioChunks, { type: 'audio/ogg' });

        //page.blob = new Blob(page.audioChunks,{type:'audio/wav'});

        recordedAudio.src = URL.createObjectURL(page.blob);
        recordedAudio.controls = true;
        recordedAudio.autoplay = false;
        audioDownload.href = recordedAudio.src;

        console.log('---> audio src: ' + recordedAudio.src);

        audioDownload.download = 'mp3';
        audioDownload.innerHTML = 'download';
      }
    }; //ondataavailable
  } //initializeRecorder

  startRecording() {
    this.audioChunks = [];
    this.rec.start();
    this.setState({
      recording: true,
    });
  }

  stopRecording() {
    this.rec.stop();
    this.setState({
      recording: false,
    });
  }

  playRecording() {
    console.log('-- playRecording --');
  }

  saveRecording = () => {
    console.log('-- saveRecording --');


    let form = new FormData();
    let user = JSON.parse(localStorage.getItem('user'));
   
    form.append('id', this.state.study.id);
    if (user) {
      form.append('user', user.email);
    }
    form.append('text', document.getElementById('text').innerHTML);
    form.append('rec_file', this.blob, 'rec_data1.wav');

    var request = new XMLHttpRequest();
    var async = true;
    let that = this;
    request.open('POST', 'http://52.230.8.132:8080/api/matching_test', async);
    if (async) {
      request.onreadystatechange = () => {
        if (request.readyState == 4 && request.status == 200) {
          var response = null;
          try {
            response = JSON.parse(request.responseText);
          } catch (e) {
            response = request.responseText;
          }
          //uploadFormCallback(response);

          this.comparison = response.Comparison_percentage;
          if (this.comparison) {
            this.comparison.length > 0 ? this.accuracy_comparison() : null;
          } else {
            toast.success('No Recording', {
              position: toast.POSITION.TOP_RIGHT,
            });
          }

          this.setState({
            transcribed_text: response.transcribed_text,
          });

          if (this.state.transcribed_text === undefined) {
            toast.success('No transcribed text', {
              position: toast.POSITION.TOP_RIGHT,
            });
          }
        }
      };
    }
    request.send(form);
  };

  handleNextParagraph = () => {
    if (Object.keys(this.state.study).length > 0) {
      const study = this.props.studies[
        this.props.studies.indexOf(this.state.study) + 1
      ];
      this.setState({
        study,
        transcribed_text: '',
      });
    } else {
      toast.error('No Paragraph Selected', {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  accuracy_comparison = () => {
    console.log(this.comparison);
    toast.success('Accuracy score: ' + this.comparison, {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 15000,
    });
  };

  saveRecording1() {
    console.log('-- saveRecording --');

    var form1 = document.getElementById('form1');
    var rec_file = document.getElementById('rec_file');
    rec_file.data = this.blob;

    form1.submit();

    console.log('-- saveRecording done --');

    return true;
  }

  render() {
    return (
      <MuiThemeProvider>
        <div>
          <div style={styles.div}>
            <Paper zDepth={3} style={styles.paperLeft}>
              <div
                style={{
                  backgroundColor: '#000',
                  width: '100%',
                  marginTop: '0px',
                  color: '#fff',
                  paddingTop: '15px',
                  height: '5%',
                  fontSize: '0.9em',
                  marginBottom: '30px',
                }}
              >
                Paragraph
              </div>
              <p id="text" style={{ margin: '0px', padding: '0px 20px' }}>
                {this.state.study.Paragraph_Text}
              </p>
              <div
                style={{
                  backgroundColor: '#15A9E1',
                  width: '100%',
                  marginTop: '0px',
                  color: '#fff',
                  paddingTop: '15px',
                  height: '5%',
                  fontSize: '0.9em',
                  position: 'absolute',
                  top: '48%',
                  width: '63.2%',
                }}
              >
                Transcribed Audio Results
              </div>
              {this.state.transcribed_text !== undefined ? (
                <p style={{ position: 'absolute', top: '55%', width: '63.2%' }}>
                  {this.state.transcribed_text}
                </p>
              ) : null}
            </Paper>
            <Paper zDepth={3} style={styles.paperRight}>
              <div
                style={{
                  backgroundColor: '#000',
                  width: '100%',
                  marginTop: '0px',
                  color: '#fff',
                  paddingTop: '15px',
                  height: '5%',
                  fontSize: '0.9em',
                  marginBottom: '30px',
                }}
              >
                Record and Analyse
              </div>
              <form
                id="form1"
                action="http://52.230.8.132:8080/api/matching_test"
                encType="multipart/form-data"
                method="post"
              >
                <input type="hidden" name="text" value="text" />
                <div style={styles.buttonsDiv}>
                  {this.state.recording === true ? (
                    <RaisedButton
                      style={styles.individualButtons}
                      buttonStyle={{ height: '50px' }}
                      backgroundColor={'darkgray'}
                      overlayStyle={{ height: '50px' }}
                      label="Recording....."
                      labelStyle={{ textTransform: 'none', fontSize: '1em' }}
                      labelColor={'#fff'}
                    />
                  ) : (
                    <RaisedButton
                      style={styles.individualButtons}
                      backgroundColor={'#15A9E1'}
                      buttonStyle={{ height: '50px' }}
                      overlayStyle={{ height: '50px' }}
                      label="Record"
                      labelStyle={{ textTransform: 'none', fontSize: '1em' }}
                      labelColor={'#fff'}
                      onClick={this.startRecording}
                    />
                  )}
                  <RaisedButton
                    style={styles.individualButtons}
                    buttonStyle={{ height: '50px' }}
                    overlayStyle={{ height: '50px' }}
                    label="Stop"
                    labelStyle={{ textTransform: 'none', fontSize: '1em' }}
                    labelColor={'#fff'}
                    backgroundColor={'#15A9E1'}
                    onClick={this.stopRecording}
                  />
                  {this.state.recording === true ? null : (
                    <RaisedButton
                      style={styles.individualButtons}
                      buttonStyle={{ height: '50px' }}
                      overlayStyle={{ height: '50px' }}
                      label="Analyse"
                      labelStyle={{ textTransform: 'none', fontSize: '1em' }}
                      labelColor={'#fff'}
                      backgroundColor={'#15A9E1'}
                      onClick={this.saveRecording}
                    />
                  )}
                  <ToastContainer autoClose={8000} />
                  {this.state.recording === true ? null : (
                    <RaisedButton
                      label="Next Paragraph"
                      labelColor={'#fff'}
                      labelStyle={{ textTransform: 'none', fontSize: '1em' }}
                      style={styles.individualButtons}
                      buttonStyle={{ height: '50px' }}
                      overlayStyle={{ height: '50px' }}
                      backgroundColor={'#15A9E1'}
                      onClick={this.handleNextParagraph}
                    />
                  )}
                </div>
                <audio id="recordedAudio" />
                <a id="audioDownload" />
              </form>
            </Paper>
          </div>
        </div>
      </MuiThemeProvider>
    );
  } //render
} //SpeechTestPage

function mapStateToProps(state) {
  return {
    studies: state.studies,
    selectedStudy: state.selectedStudy,
  };
}

const connectedSpeechTestPage = connect(mapStateToProps)(SpeechTestPage);
export { connectedSpeechTestPage as SpeechTestPage };
