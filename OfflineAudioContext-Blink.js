// OfflineMediaContext-Blink.js 2017-07-09 guest271314 <guest271314@gmail.com>

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

          let recorder;

          const media = document.createElement("video");

          media.onpause = e => {
            console.log(e);
            recorder.stop();
          }

          media.oncanplay = () => {
            media.oncanplay = null;
            media.play();

            let stream = media.captureStream();

            recorder = new MediaRecorder(stream);

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
