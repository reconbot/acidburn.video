(function localFileVideoPlayerInit(win) {
  var URL = win.URL || win.webkitURL;
  function displayMessage(message, isError) {
    var node = document.querySelector('#message');
    node.innerHTML = message;
    node.className = isError ? 'error' : 'info';
  };
  var playSelectedFile = function playSelectedFileInit(event) {
    var file = this.files[0];
    var type = file.type;
    var videoNode = document.querySelector('video');
    var canPlay = videoNode.canPlayType(type);

    canPlay = (canPlay === '' ? 'no' : canPlay);

    var message = 'Can play type "' + type + '": ' + canPlay;
    var isError = canPlay === 'no';

    displayMessage(message, isError);

    if (isError) {
      return;
    }

    var fileURL = URL.createObjectURL(file);

    videoNode.src = fileURL;
    videoNode.play();
    //pause()
    //
  };

  var inputNode = document.querySelector('input');

  if (!URL) {
    return displayMessage('Your browser is not <a href="http://caniuse.com/bloburls">supported</a>!', true);
  }

  inputNode.addEventListener('change', playSelectedFile, false);
}(window));
