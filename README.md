# OfflineMediaContext
Fetch media resource and create independent media fragments of a given range of bytes or time slices capable of being played individually as fast as possible.

Modeled on `OfflineAudioContext`.

Usage
---

    const video = document.querySelector("video");
    
    video.oncanplaythrough = () => {
      console.log(video.duration)
    }

    const url = "/path/to/media";

    let mediaContext = new OfflineMediaContext({
      url: url
    });
    
    let mediaResponse = mediaContext.getMedia();
    
    let mediaChunks = mediaResponse.then(() => mediaContext.startRendering());
    
    mediaChunks.then(chunks => {
        // `chunks` : `Array` of `Blob`s comprising `from`-`to` of seconds of media
        // each `Blob` capable of independent playback
        console.log(chunks);
        
        let select = document.createElement("select");
        document.body.appendChild(select);
        let option = new Option("select a segment");
        select.appendChild(option);
        for (let chunk of chunks) {
          let index = chunks.indexOf(chunk);
          let option = new Option(`Play ${index}-${index + mediaContext.timeSlice} seconds of media`, index);
          select.appendChild(option)
        }
        select.onchange = () => {
          video.src = URL.createObjectURL( chunks[select.value] )
        }
        

      })
