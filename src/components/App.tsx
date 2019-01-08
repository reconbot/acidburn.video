import React, { Component } from 'react';
import { connect } from 'react-redux';
import { VideoPlayer } from './VideoPlayer'
import { Chat } from './Chat'
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <VideoPlayer />
        <Chat />
      </div>
    );
  }
}

const connectedApp = connect()(App)

export { connectedApp as App }
