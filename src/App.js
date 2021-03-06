import React, { Component } from 'react';
import './App.css';
import {Header} from "./components/Header"
import {Routes} from './routes'

import {connect} from 'react-redux';



class App extends Component {


   render() {
      return (
         <div>
            <Header />
            <Routes/>
          </div>

      );//return

   }//render

}//App

function mapStateToProps(state) {
  const {alert} = state;
  return {
    alert,
  };
}

const connectedApp = connect(mapStateToProps)(App);
export {connectedApp as App};
