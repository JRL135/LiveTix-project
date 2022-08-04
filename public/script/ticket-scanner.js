// This method will trigger user permissions
Html5Qrcode.getCameras().then((devices) => {
  /**
     * devices would be an array of objects of type:
     * { id: "id", label: "label" }
     */
  if (devices && devices.length) {
    const cameraId = devices[0].id;
    // .. use this to start scanning.
  }
}).catch((err) => {
  // handle err
  console.log(err);
});

const html5QrCode = new Html5Qrcode(/* element id */ 'reader');
html5QrCode.start(
    cameraId,
    {
      fps: 10, // Optional, frame per seconds for qr code scanning
      qrbox: {width: 250, height: 250}, // Optional, if you want bounded box UI
    },
    (decodedText, decodedResult) => {
    // do something when code is read
      // confirm(window.location = decodedText);
      window.location.replace = decodedText;
    },
    (errorMessage) => {
    // parse error, ignore it.
    })
    .catch((err) => {
      // Start failed, handle it.
      console.log(err);
    });

html5QrCode.stop().then((ignore) => {
  // QR Code scanning is stopped.
}).catch((err) => {
  // Stop failed, handle it.
  console.log(err);
});
