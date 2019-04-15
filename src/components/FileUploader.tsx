import React, { useState, useContext, useEffect } from 'react'
import { Buffer } from 'ipfs'
import FileDrop from 'react-file-drop'
import './VideoPlayer.css'
import { IPFSContext } from './IPFSProvider'
import { RouterContext } from './Router'

const FileLoader = ({ saveFile }) => {
  const handleDropEvent = (files, event) => {
    event.preventDefault()
    saveFile(files[0])
  }
  const handleFilePicker = (event) => {
    event.preventDefault()
    saveFile(event.target.files[0])
  }
  return (<FileDrop onDrop={handleDropEvent}>
    <label htmlFor='upload'>
      Drag and Drop or Click to Upload
    </label>
    <input type='file' id="upload" className="input" onInput={handleFilePicker} accept=".mp4" />
  </FileDrop>)
}

const SavingStatus = ({ name, size }) => {
  const spinners = [
    '[-]','[\\]','[|]','[/]','[+]'
  ]
  const [spinner, updateSpinner] = useState(spinners[0])
  useEffect(() => {
    let step = 0
    const clock = setInterval(() => {
      updateSpinner(spinners[step++])
      if (step >= spinners.length) {
        step = 0
      }
    }, 200)
    return () => {
      clearInterval(clock)
    }
  }, [])
  return (<div>{`Uploading ${name} ${size}: ${spinner}`}</div>)
}

export function FileUploader () {
  const { ipfs: { ipfs } } = useContext(IPFSContext)
  const [file, saveFile] = useState<null | File>(null)
  const { setRoute } = useContext(RouterContext)

  useEffect(() => {
    if (!file) {
      return
    }
    const { name, size } = file
    ;(window as any).file = file
    const reader = new FileReader()

    let finished = false

    reader.onload = (loadEvent) => {
      if (!loadEvent.target) {
        return
      }
      const ipfsFile = {
        path: name,
        content: Buffer.from((loadEvent.target as any).result)
      }
      console.log('loaded file from fileReader')
      ipfs.add(ipfsFile).then(added => {
        finished = true
        setRoute(added[0].hash)
      }, error => {
        console.error(error)
      })
    }
    reader.readAsArrayBuffer(file)
    return () => {
      if (!finished) {
        console.error('No way to cancel an upload', { name, size, finished })
      }
    }
  }, [file])
  return (
    file ? <SavingStatus {...file} /> : <FileLoader saveFile={saveFile} />
  )
}
