var el = x => document.getElementById(x);

var api_url = 'https://api.reedcornish.com/digits';

var canvas = document.querySelector("canvas");
var ctx = canvas.getContext('2d');
var clearBtn = el('clear');
var latest_request_time = 0;

var signaturePad = new SignaturePad(canvas, {
  minWidth: 2,
  maxWidth: 7,
});

function resizeCanvas() {
  var data = signaturePad.toData();
  var ratio =  Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d").scale(ratio, ratio);
  signaturePad.clear();
  signaturePad.fromData(data);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(',')[1]);
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {type: mimeString});
};

function invertCanvas() {
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;
  for(var i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  ctx.putImageData(imageData, 0, 0);
};

signaturePad.onEnd = function () {
  el("result").innerHTML = "...";
  var xhr = new XMLHttpRequest();
  xhr.open("POST", api_url, true);
  var this_request_time = (new Date()).getTime();
  latest_request_time = this_request_time;
  xhr.onload = function(e) {
    if (this.readyState === 4 && latest_request_time == this_request_time) {
      var response = JSON.parse(e.target.responseText);
      el("result").innerHTML = response["result"];
    }
  };

  invertCanvas();
  var blob = dataURItoBlob(canvas.toDataURL());
  invertCanvas();

  var fd = new FormData();
  fd.append("file", blob);
  xhr.send(fd);
};

clearBtn.onclick = function () {
  signaturePad.clear();
  el('result').innerHTML = '';
};

