import React, { Component } from 'react'
import { connect } from 'react-redux'
import FileDrop from 'react-file-drop'
import './VideoPlayer.css'
import { startUpload, watchHash, watchError } from '../actions'
import VideoStream from 'videostream'

const FileLoader = (props) => {
  const handleDropEvent = (files, event) => {
    event.preventDefault()
    props.saveFile(files[0])
  }
  const handleFilePicker = (event) => {
    event.preventDefault()
    props.saveFile(event.target.files[0])
  }
  return (<FileDrop onDrop={handleDropEvent}>
    <label htmlFor='upload'>
      Drag and Drop or Click to Upload
    </label>
    <input type='file' id="upload" className="input" onInput={handleFilePicker} accept=".mp4" />
  </FileDrop>)
}

const SavingStatus = (props) => {
  const { name, size, progress, uploaded } = props
  return (<div>{`Uploading ${name} ${uploaded}/${size} bytes: ${progress}%`}</div>)
}

class VideoElement extends Component {
  constructor(props) {
    super(props);
    this.videoElement = React.createRef();
  }

  streamVideo() {
    const { ipfs, hash, emitError } = this.props
    const file = {
      createReadStream: (opts) => {
        const start = opts.start

        // The videostream library does not always pass an end byte but when
        // it does, it wants bytes between start & end inclusive.
        // catReadableStream returns the bytes exclusive so increment the end
        // byte if it's been requested
        const end = opts.end ? start + opts.end + 1 : undefined

        console.log(`Stream: Asked for data starting at byte ${start} and ending at byte ${end}`)

        // If we've streamed before, clean up the existing stream
        if (this.stream && this.stream.destroy) {
          this.stream.destroy()
        }

        // This stream will contain the requested bytes
        this.stream = ipfs.files.readReadableStream(`/ipfs/${hash}`, {
          offset: start,
          length: end && end - start
        })

        // Log error messages
        this.stream.on('error', emitError)

        return this.stream
      }
    }
    new VideoStream(file, this.videoElement.current)
  }

  componentDidMount() {
    this.streamVideo()
  }
  componentDidUpdate() {
    this.streamVideo()
  }
  componentWillUnmount() {
    if (this.stream && this.stream.destroy) {
      this.stream.destroy()
    }
  }
  render() {
    return (<video ref={this.videoElement} controls autoPlay loop ></video>)
  }
}

class VideoPlayer extends Component {
  render() {
    const { saveFile, uploadingFile, watchHash, stopWatching, hash, ipfs, ready, emitError } = this.props
    if (!ready) {
      return (<h1>Connecting to IPFS</h1>)
    }
    return (<>
      <div className="video-player">
        {hash
          ? <VideoElement hash={hash} ipfs={ipfs} emitError={emitError} />
          : uploadingFile ? <SavingStatus {...uploadingFile} /> : <FileLoader saveFile={saveFile} />
        }
      </div>
      <button onClick={watchHash}>Watch Something</button>
      <button onClick={stopWatching}>Watch Nothing</button>
    </>);
  }
}

const mapStateToProps = ({ ipfs: { hash, ready, ipfs, uploadingFile } }) => ({ hash, ready, ipfs, uploadingFile })

const mapDispatchToProps = dispatch => ({
  saveFile: file => dispatch(startUpload(file)),
  watchHash: () => dispatch(watchHash('QmRBQ7Bzo3PcU5a6iTagDmH5vNzV1Tj3wey9FcccJZRukN')),
  emitError: (error) => dispatch(watchError(error)),
  stopWatching: () => dispatch(watchHash())
})


const connectedVideoPlayer = connect(mapStateToProps, mapDispatchToProps)(VideoPlayer)

export { connectedVideoPlayer as VideoPlayer }
