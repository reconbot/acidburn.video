import React from 'react'
import { VideoPlayer } from './VideoPlayer'
import { Chat } from './Chat'
import { IPFSProvider } from './IPFSProvider'
import { RouterProvider } from './Router'
import './App.css'

export function App() {
  return (
    <div className="App">
      <IPFSProvider>
        <RouterProvider>
          <VideoPlayer />
          <Chat />
        </RouterProvider>
      </IPFSProvider>
    </div>
  );
}

(window as any).hackers = () => document.location.hash = '#QmZj2Zz2SsuVgWDqCsfCskUk5GeQdE8MtQEFd6twX1gmGB'
