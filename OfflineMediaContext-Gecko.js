// OfflineMediaContext-Gecko.js 2017-07-09 guest271314 <guest271314@gmail.com>

// Fetch media resource and create independent media fragments of a given range of bytes 
// or time slices capable of being played individually as fast as possible.

// Modelled on OfflineAudioContext.

    class OfflineMediaContext {
      constructor({
        url = "", timeSlice = 1, from = 0, to = 10
      }) {
        this.duration = 0;
        this.blobURL = void 0;
        this.blob = void 0;
        this.url = url;
        this.timeSlice = timeSlice;
        this.from = from;
        this.to = to;
      }
      async getMedia() {
        this.request = new Request(url);
        this.mediaRequest = await fetch(this.request);
        this.blob = await this.mediaRequest.blob();
        this.blobURL = URL.createObjectURL(this.blob);
        this.media = document.createElement("video");
        return new Promise(resolve => {
          this.media.onloadedmetadata = () => {
            this.duration = Math.ceil(this.media.duration);
            console.log(this.media.duration);
            resolve(this)
          }
          this.media.src = this.blobURL;
        })
      }
      processMedia(blob, index) {

        console.log(blob, index);

        return new Promise(resolve => {

          var recorder, stopped;

          let data, chunks = [];

          const media = document.createElement("video");

          const canvas = document.createElement("canvas");

          const ctx = canvas.getContext("2d");


          media.onpause = e => {
            //media.onpause = null;
            console.log(e);
            stopped = true;
            recorder.stop();
          }

          media.oncanplay = () => {
            media.oncanplay = null;
            canvas.width = media.videoWidth;
            canvas.height = media.videoHeight;
            // https://stackoverflow.com/a/39302994 use `canvas.captureStream() and `AudioContext` at Firefox
            let renderStream = () => {
              if (!stopped) {
                let raf = requestAnimationFrame(draw);
              }
              render()
            }

            let render = () => {
              ctx.drawImage(media, 0, 0);
            }

            // (index):76 Uncaught DOMException: Failed to construct 'AudioContext': The number of hardware contexts provided (6) is greater than or equal to the maximum bound (6).
            const ac = new AudioContext();
            // create a stream from our AudioContext
            const msd = ac.createMediaStreamDestination();
            // connect our video element's output to the stream
            const mes = ac.createMediaElementSource(media);
            mes.connect(msd);
            mes.connect(ac.destination);
            media.play();
            renderStream();
            let stream = canvas.captureStream();

            let ms = new MediaStream([stream.getVideoTracks()[0], msd.stream.getAudioTracks()[0]]);

            recorder = new MediaRecorder(ms);

            recorder.ondataavailable = e => {
              console.log("data event", recorder.state);
              resolve(e.data);
            }

            recorder.onstop = e => {
              console.log(e);
            }

            media.play();
            recorder.start();
          }

          if (index + 1 < this.duration)
            media.src = `${blob}#t=${index},${index + 1}`;
          else
            media.src = `${blob}#t=${index}`;
        })

      }
      startRendering() {
        return Promise.all(
          Array.from({
              length: this.to
            }, () =>
            this.processMedia(this.blobURL, this.from++)
          )
        )
      }
    }

