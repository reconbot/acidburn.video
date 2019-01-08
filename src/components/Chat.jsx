import React, { Component } from 'react';
import { connect } from 'react-redux'
import './Chat.css';
import { sendMessage } from '../actions';

class MessageList extends Component {
  render() {
    const { messages } = this.props
    console.log({ messages })
    return (<div>
      {messages.map(message => <div key={message.id}>{message.from.slice(-4)} - {message.text}</div>)}
    </div>)
  }

}
const mapStateChat = ({ chat: { messages } }) => ({ messages })
const MessageListConnected = connect(mapStateChat)(MessageList)

class Chat extends Component {
  state = { message: '' }
  onChange = event => {
    this.setState({ message: event.target.value })
  }
  onKeyDown = event => {
    const { sendMessage } = this.props
    if (event.keyCode === 13) {
      sendMessage(event.target.value)
      this.setState({ message: '' })
    }
  }
  render() {
    return (<>
      <h1>CHAT</h1>
      <MessageListConnected />
      <input type="text" onChange={this.onChange} value={this.state.message} onKeyDown={this.onKeyDown} />
    </>);
  }
}

const mapDispatchToProps = dispatch => ({
  sendMessage: message => dispatch(sendMessage(message)),
})

const ConnectedChat = connect(null, mapDispatchToProps)(Chat)

export { ConnectedChat as Chat }
