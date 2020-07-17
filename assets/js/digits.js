var el = x => document.getElementById(x);
var clearPressed = false;

var api_url = 'https://api.reedcornish.com/digits';

var wrongWrap = el('wrong-wrap');
var result = el('result');
var resultWrap = el('result-wrap');
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext('2d');
var clearBtn = el('clear-btn');
var wrongBtn = el('wrong-btn');
var correctionDiv = el('correction');
var latest_request_time = 0;
var empty_result = result.innerHTML

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

showWrongDiv = function () {
  wrongWrap.style.opacity = 1;
  wrongBtn.style.cursor = 'pointer';
  wrongBtn.onclick = showCorrectionDiv;
}

hideWrongDiv = function() {
  wrongWrap.style.opacity = 0;
  wrongBtn.style.cursor = 'default';
  wrongBtn.onclick = 'none';
}

showCorrectionDiv = function () {
  correctionDiv.style.display = 'block';
  resultWrap.style.display = 'none';
}

hideCorrectionDiv = function() {
  correctionDiv.style.display = 'none';
  resultWrap.style.display = 'block';
}

signaturePad.onEnd = function () {
  resetResult();
  hideWrongDiv();
  clearPressed = false;
  var xhr = new XMLHttpRequest();
  xhr.open("POST", api_url, true);
  var this_request_time = (new Date()).getTime();
  latest_request_time = this_request_time;
  xhr.onload = function(e) {
    if (this.readyState === 4 && latest_request_time == this_request_time) {
      var response = JSON.parse(e.target.responseText);
      result.innerHTML = response["result"];
      result.style.opacity = 1;
      setTimeout(function() {
        if (!clearPressed && latest_request_time == this_request_time) {
          showWrongDiv();
        }
      }, 2000);
    };
  };

  invertCanvas();
  var blob = dataURItoBlob(canvas.toDataURL());
  invertCanvas();

  var fd = new FormData();
  fd.append("file", blob);
  xhr.send(fd);
};

clear = function () {
  clearPressed = true;
  signaturePad.clear();
  result.innerHTML = empty_result;
  result.style.opacity = 0;
  hideCorrectionDiv();
  hideWrongDiv();
  clearSelectedDigit();
  clearBtn.blur();
};
clearBtn.onclick = clear;

var selectedDigit = null;
clearSelectedDigit = function() {
  if (selectedDigit) {
    selectedDigit.classList.remove('bigdigit');
    selectedDigit.style.backgroundColor = 'white';
    selectedDigit.style.color = 'black';
    selectedDigit = null;
  }
}

resetResult = function() {
  result.innerHTML = empty_result;
  result.style.opacity = 0;
  result.style.fontSize = '50px';
  result.style.fontWeight = 'bold';
}

submit = function() {
  clear();
  result.innerHTML = 'Thanks!'
  result.style.opacity = 1;
  result.style.fontSize = '25px';
  result.style.fontWeight = 'normal';
  deactivateSubmitBtn();
  clearBtn.blur();
}

deactivateSubmitBtn = function() {
  clearBtn.innerHTML = 'Clear';
  clearBtn.onclick = clear;
}

activateSubmitBtn = function() {
  if (clearBtn.innerHTML === 'Clear') {
    clearBtn.innerHTML = 'Submit';
    clearBtn.onclick = submit;
  }
}

digitClick = function (obj) {
  var sd = selectedDigit ? selectedDigit.innerHTML : -1;
  clearSelectedDigit();
  if (sd === obj.innerHTML) {
    deactivateSubmitBtn();
  } else {
    obj.style.backgroundColor = 'rgb(90, 150, 231)';
    obj.style.color = '#f2f2f2';
    obj.classList.add('bigdigit');
    selectedDigit = obj;
    activateSubmitBtn();
  }
}

