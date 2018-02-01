import React from 'react';
import { connect } from 'react-redux';
import { studyActions } from '../actions';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import ReactFileReader from 'react-file-reader';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import '../index.js'

//----------------------------------------------------------------
//
//          HOME PAGE
//
//----------------------------------------------------------------
class HomePage extends React.Component {
  // ------------------------
  // constructor
  // ------------------------
  constructor(props) {
    super(props);
  }

  // ------------------------
  // componentDidMount
  // ------------------------
  componentDidMount() {
    const { dispatch } = this.props;

    var user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
      this.props.history.push('/login');
    } else {
      console.log('dispatching -> get api');
      dispatch(studyActions.getAll(this.props.history));
    }

    this.handleRowSelection = this.handleRowSelection.bind(this);
    this.handleFiles = this.handleFiles.bind(this);
  }

  componentWillRecieveProps(NextProps) {
    const { dispatch } = this.props;
    dispatch(studyActions.getAll(this.props.history));
  }

  // ------------------------
  // handleRowSelection
  // ------------------------
  handleRowSelection = key => {
    const { dispatch } = this.props;
    dispatch(studyActions.selectedStudy(key));

    console.log('row is selected, key=' + key);
    this.props.history.push('/speechTest');
  };

  handleFiles = files => {
    let url = 'http://52.230.8.132:8080/api/add_study';
    let file = new FormData();
    file.append('study_file', files[0], files[0].name);

    axios
      .post(url, file)
      .then(response => console.log('SUCCESSFULLY UPLOADED FILE', response))
      .catch(err => console.log('ERROR UPLOADING FILE', err));

  };

  // ------------------------
  // render
  // ------------------------
  render() {
    console.log(
      '--- Home Page render got studies:' + JSON.stringify(this.props.studies),
    );

    //----------------------------
    // fill up studies table data
    //----------------------------
    var tableBody = [];
    if (this.props.studies) {
      for (var i = 0; i < this.props.studies.length; i++) {
        //console.log("study " + (i+1) + ":" + JSON.stringify(this.props.studies[i]));
        var study = this.props.studies[i];
        tableBody.push(
          <TableRow key={study.id}>
            console.log("got study: " + study.Date_of_Upload);
            <TableRowColumn>{study.id}</TableRowColumn>
            <TableRowColumn>{study.created_at}</TableRowColumn>
            <TableRowColumn>{study.Paragraph_Text}</TableRowColumn>
            <TableRowColumn>{study.GCS_Output}</TableRowColumn>
            <TableRowColumn>{study.Word_Count}</TableRowColumn>
            <TableRowColumn>{study.Status}</TableRowColumn>
            <TableRowColumn>{study.GCS_Acc}</TableRowColumn>
            <TableRowColumn>{study.GCS_Conf}</TableRowColumn>
          </TableRow>,
        );
      }
    }

    return (
      <MuiThemeProvider>
        <div className='container'>
          <ReactFileReader handleFiles={this.handleFiles} fileTypes={'.csv'}>
            <RaisedButton primary={true} className='btn' label="UPLOAD CSV" />
          </ReactFileReader>
          <Table onRowSelection={this.handleRowSelection} className='table'>
            <TableHeader>
              <TableRow style={{backgroundColor: 'rgb(236, 236, 236)'}}>
                <TableHeaderColumn>id</TableHeaderColumn>
                <TableHeaderColumn>Date</TableHeaderColumn>
                <TableHeaderColumn>Text</TableHeaderColumn>
                <TableHeaderColumn>Output</TableHeaderColumn>
                <TableHeaderColumn>Word</TableHeaderColumn>
                <TableHeaderColumn>Status</TableHeaderColumn>
                <TableHeaderColumn>GCS%</TableHeaderColumn>
                <TableHeaderColumn>GCS conf</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody showRowHover={true}>{tableBody}</TableBody>
          </Table>
        </div>
      </MuiThemeProvider>
    );
  } //render
} //HomePage

function mapStateToProps(state) {
  console.log(']----> Home Page got state: ' + JSON.stringify(state));
  //console.log("--- Home Page got studies: " + JSON.stringify(state.studies.studies) );
  return {
    studies: state.studies,
  };
}

const connectedHomePage = connect(mapStateToProps)(HomePage);

export { connectedHomePage as HomePage };
