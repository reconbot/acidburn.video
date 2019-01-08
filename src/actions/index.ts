export const ipfsReady = () => ({ type: 'IPFS_READY' })

export const startUpload = (file) => ({
  type: 'FILE_SAVE', payload: file
})

export const uploadError = (error) => ({
  type: 'FILE_SAVING_ERROR', payload: { error }
})

export const watchError = (error) => ({
  type: 'WATCH_ERROR', payload: { error }
})

export const uploadProgress = ({ name, uploaded, size }: { name: string, uploaded: number, size: number }) => ({
  type: 'FILE_SAVING', payload: { name, size, uploaded, progress: Math.round((uploaded / size) * 100) }
})

export const watchHash = (hash: string | null = null) => ({
  type: 'WATCH_HASH', payload: { hash }
})

export const sendMessage = (message: string) => ({
  type: 'MESSAGE_SEND', payload: { message }
})

export const recieveMessage = (message: any) => ({
  type: 'MESSAGE_RECIEVED', payload: message
})

export const messageError = (error: Error) => ({
  type: 'MESSAGE_ERROR', payload: error
})
