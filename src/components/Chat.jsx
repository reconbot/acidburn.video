import React, { useState, useContext, useEffect } from 'react';
import './Chat.css';
import { RouterContext } from './Router';
import { IPFSContext } from './IPFSProvider';

function MessageList({ messages}) {
  return (<div>
    {messages.map(message => <div key={message.id}>{message.from.slice(-4)} - {message.text}</div>)}
  </div>)
}

function MessageInput({ sendMessage }) {
  const [message, updateMessage] = useState('')
  const onChange = e => updateMessage(e.target.value)
  const onKeyDown = event => {
    if (event.keyCode === 13) {
      sendMessage(message)
      updateMessage('')
    }
  }
  return (<input type="text" onChange={onChange} value={message} onKeyDown={onKeyDown} />)
}

export function Chat() {
  const { route } = useContext(RouterContext)
  const { ipfs: { ipfs, ready } } = useContext(IPFSContext)
  const channelName = route || 'global'
  const [channelReady, updateChannelReady] = useState(false)
  const [messages, updateMessages] = useState([])

  const MAX_MESSAGES = 10
  const clearMessages = () => updateMessages([])
  const addMessage = (message) => updateMessages(messages => {
    const newMessages = [...messages, message]
    while (newMessages.length > MAX_MESSAGES) {
      newMessages.shift()
    }
    return newMessages
  })

  const addSystemMessage = text => addMessage({id: Math.random(), text, from: 'sys'})

  useEffect(() => {
    clearMessages()
    addSystemMessage(`Joined #${channelName}`)
    return () => {
      clearMessages()
    }
  }, [channelReady, channelName])

  useEffect(() => {
    if (!ipfs) {
      return
    }

    const messageListener = event => {
      try {
        const text = JSON.parse(event.data.toString())
        addMessage({
          id: event.seqno.toString('HEX'),
          text,
          from: event.from
        })
      } catch (error) {
        console.error(event)
      }
    }

    ipfs.pubsub.subscribe(channelName, messageListener).then(() => {
      console.log(`joined channel ${channelName}`)
      updateChannelReady(true)
    }, (error) => {
      console.error(error)
    })

    return () => {
      console.log(`left channel ${channelName}`)
      ipfs.pubsub.unsubscribe(messageListener)
      updateChannelReady(false)
    }
  }, [channelName])

  const sendMessage = (message) => {
    if (!channelReady || !ipfs) {
      return
    }
    const data = Buffer.from(JSON.stringify(message))
    ipfs.pubsub.publish(channelName, data).then(console.log, console.error)
  }

  if (!ready) {
    return <h1>LOADING</h1>
  }

  return (<div className='chat'>
    <h1>CHAT</h1>
    { channelReady
      ? (<>
          <MessageList messages={messages} />
          <MessageInput sendMessage={sendMessage}/>
        </>)
      : <>Joining { channelName }</>
    }
  </div>)
}
