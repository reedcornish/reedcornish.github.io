var el = x => document.getElementById(x);

var canvas = document.querySelector("canvas");
var ctx = canvas.getContext('2d');
var clearBtn = el('clear');

var signaturePad = new SignaturePad(canvas, {
  minWidth: 2.5,
  maxWidth: 5,
});

function resizeCanvas() {
  var ratio =  Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext("2d").scale(ratio, ratio);
  signaturePad.clear();
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
  xhr.open("POST", 'https://digits.reedcornish.com/analyze', true);
  xhr.onerror = function() {
    alert(xhr.responseText);
  };
  xhr.onload = function(e) {
    if (this.readyState === 4) {
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

