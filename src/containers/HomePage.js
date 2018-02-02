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
import { studyService } from '../services/study.service'
const styles = {
  tableRows: {
    textAlign: 'center',
    width: '200px'
  }
}

class HomePage extends React.Component {

  constructor(props) {
    super(props);
  }
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
    let url = 'http://0.0.0.0:8080/api/add_study';
    let file = new FormData();
    file.append('study_file', files[0], files[0].name);

    axios
      .post(url, file)
      .then(response => console.log('SUCCESSFULLY UPLOADED FILE', response))
      .catch(err => console.log('ERROR UPLOADING FILE', err));

    var user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      var token = user.token;
      console.log('token: ' + token);
    } else {
      console.warn('failed to get token !~~');
    }

    axios
      .get('http://0.0.0.0:8080/api/study?token=' + token)
      .then(resp => console.log('[LOAD CSV SUCCESS]', resp))
      .catch(err => console.log('ERR', err));
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
        var study = this.props.studies[i];
        tableBody.push(
          <TableRow key={study.id}>
            <TableRowColumn style={{width: '50px', textAlign: 'center'}}>{study.id}</TableRowColumn>
            <TableRowColumn style={styles.tableRows}>{study.created_at}</TableRowColumn>
            <TableRowColumn style={styles.tableRows}>{study.Status}</TableRowColumn>
            <TableRowColumn style={styles.tableRows}>{study.GCS_Acc}</TableRowColumn>
            <TableRowColumn style={styles.tableRows}>{study.GCS_Conf}</TableRowColumn>
          </TableRow>,
        );
      }
    }

    return (
      <MuiThemeProvider>
        <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '4%'}}>
          <ReactFileReader handleFiles={this.handleFiles} fileTypes={'.csv'}>
            <RaisedButton className='btn' label="UPLOAD CSV" backgroundColor={'#15A9E1'} labelColor={'#fff'}/>
          </ReactFileReader>
        </div>
        <div className='container'>
          <Table onRowSelection={this.handleRowSelection} className='table' fixedHeader={true} height={'100%'}>
            <TableHeader>
              <TableRow style={{backgroundColor: 'rgb(236, 236, 236)'}}>
                <TableHeaderColumn style={{width: '50px'}}>Paragraph id</TableHeaderColumn>
                <TableHeaderColumn style={styles.tableRows}>Date Uploaded</TableHeaderColumn>
                <TableHeaderColumn style={styles.tableRows}>Status</TableHeaderColumn>
                <TableHeaderColumn style={styles.tableRows}>GCS%</TableHeaderColumn>
                <TableHeaderColumn style={styles.tableRows}>GCS conf</TableHeaderColumn>
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
