/* There will be a bunch of code here i use to made embeds *somewhat* work */


class InvMediaHelper {
  /**
   * @param {String} url
   */
  constructor(url) {
    this.url = url;
    this.type = "";
  }

  get mediaType() {
    return this.checkMediaType();
  }

  get useType() {
    return this.type;
  }

  isValidUrl() {
    return this.url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/)
  }

  /**
   * Returns Media Type from url
   * @returns 
   */
  checkMediaType() {
    if (!this.isValidUrl()) return undefined;

    if (this.url.match(/[=|\.](jpeg|jpg|gif|png|webp)/)) return InvImage;

    if (this.url.match(/[=|\.](mp3|ogg|wav)/)) return InvAudio;

    if (this.url.match(/[=|\.](mov|mp4|webm)/)) return InvVideo;

    return undefined;
  }

  constructMediaClass() {
    if (!this.isValidUrl()) throw new Error("Invalid URL, couldn't construct Media class");

    if (!this.checkMediaType()) throw new Error("Unsupported Media URL, couldnt construct Media class");

    const Media = this.checkMediaType();

    return new Media(this.url);
  }
  
}

class InvImage extends InvMediaHelper {
  constructor(url) {
    super(url);
    this.state = {
      width: 0,
      height: 0,
      thumbnail: ""
    };
    this.type = "image";
  }

  get thumbnail() {
    return this.url;
  }

  get width() {
    return this.state.width;
  }

  get height() {
    return this.state.height;
  }

  // Image Proxy, IP Grabbing aint fun
  get safeLink() {
    return `https://images.weserv.nl/?url=${this.url}`
  }

  async populateState() {
    const res = await this.getResolution();

    this.state.width = res.width;
    this.state.height = res.height;
  }

  async getResolution() {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      };
      img.onerror = () => {
        reject();
      };

      // Discord links with an image proxy result in a 403 Error
      img.src = this.url.match(/[media|cdn]\.discordapp\.[com|net]/i) ? this.url : this.safeLink;
    });
  }
}

class InvVideo extends InvMediaHelper {
  constructor(url) {
    super(url);
    this.state = {
      thumbnail: "",
      width: 0,
      height: 0,
    }
    this.type = "video";
  }

  get thumbnail() {
    return this.state.thumbnail;
  }

  get width() {
    return this.state.width;
  }

  get height() {
    return this.state.height;
  }

  async populateState() {
    const res = await this.getResolution();
    this.state.thumbnail = await this.parseThumbnail();
    console.log(this.parseThumbnail())
    this.state.width = res.width;
    this.state.height = res.height;
  }

  async getResolution() {
    return new Promise((resolve, reject) => {
      let Video = document.createElement('video');
      Video.autoplay=false;
    
      Video.oncanplay= () => {
        resolve({
          width: Video.offsetWidth,
          height: Video.offsetHeight,
        })
        //Video.src="about:blank";
        document.body.removeChild(Video);
      }
  
      Video.onerror = () => {
        reject();
      }
  
      document.body.appendChild(Video);
      Video.src=this.url;
    })
  }

  async parseThumbnail() {
    // TODO: Add actual support
    if (this.url.match(/[media|cdn]\.discordapp\.[com|net]/i)) {
      return `${this.url.replace('cdn.discordapp.com', 'media.discordapp.net')}?format=jpeg`
    }
  }
}

class InvAudio extends InvMediaHelper {
  constructor(url) {
    super(url);
  }
}

module.exports = InvMediaHelper;