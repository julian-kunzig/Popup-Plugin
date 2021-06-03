// Variables
var options = {
  modal: {
    width: 200,
    height: 280,
    backgroundColor: '#c1d9e0',
  },
  textbox: {
    width: 200,
    height: 100,
    content: 'popup popup popup popup popup',
  },
  star: { strokeStyle: '#033594', fillStyle: '#033594' },
  arrow: { width: 20, height: 20, left: 110 },
  backgroundPadding: { top: 10, bottom: 10, left: 10, right: 10 },
  size: 17,
  color: { r: 0, g: 0, b: 0 },
  font: 'Arial',
  lineHeight: 1.2,
};

const canvas = document.getElementById('canvas');

// Draw the Popup
const drawPopup = (width, height, backgroundColor) => {
  var canvasModal = document.getElementById('canvasModal');
  canvasModal.style.width = `${width}px`;
  canvasModal.style.height = `${height}px`;
  modal.style.backgroundColor = backgroundColor;
  canvas.width = width;
  canvas.height = height;
};

// Draw the textbox
const drawTextbox = (ctx, width, height, arrow) => {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, height - arrow.height);
  ctx.lineTo(arrow.left + arrow.width, height - arrow.height);
  ctx.lineTo(arrow.left + arrow.width, height);
  ctx.lineTo(arrow.left, height - arrow.height);
  ctx.lineTo(0, height - arrow.height);
  ctx.closePath();
  ctx.fill();
};

const getFontDims = (size, font, text) => {
  const workingCanvas = document.createElement('canvas');
  const fontStyle = `${size}pt ${font}`;

  // TODO: Try to guess at least
  // Make sure big text would be working
  workingCanvas.width = canvas.width;
  workingCanvas.height = canvas.height;

  const uniqueChars = String.prototype.concat(
    ...new Set(text.replace(/[\n \t]*/, ''))
  );

  const context = workingCanvas.getContext('2d');
  context.fillStyle = 'black';
  context.fillRect(0, 0, workingCanvas.width, workingCanvas.height);
  context.textBaseline = 'middle';
  context.fillStyle = 'white';
  context.font = fontStyle;
  context.fillText(uniqueChars, 0, workingCanvas.height / 2);

  const pixels = context.getImageData(
    0,
    0,
    workingCanvas.width,
    workingCanvas.height
  ).data;
  let start = -1;
  let end = -1;
  for (let row = 0; row < workingCanvas.height; row++) {
    for (let column = 0; column < workingCanvas.width; column++) {
      const indexRedChannelPixel = (row * workingCanvas.width + column) * 4;
      const isWhitePixel = pixels[indexRedChannelPixel] === 0;

      if (!isWhitePixel) {
        if (start === -1) {
          // First non transparent pixel
          start = row;
        }
        // There is at least one non-transparent pixel, so end will at least be row
        end = row + 1;
        // No need to continue on that row, let's break the column loop
        break;
      }
    }
  }

  return {
    height: end - start,
    top: workingCanvas.height / 2 - start,
    bottom: end - workingCanvas.height / 2,
  };
};

// Draw the text
const drawText = (context, width, lines, linesDims, options) => {
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.font = `${options.size}pt ${options.font}`;
  const color = options.color;
  context.fillStyle = `rgb(${color.r * 255},${color.g * 255},${color.b * 255})`;

  let offsetY = options.backgroundPadding.top;
  for (let k = 0; k < lines.length; k++) {
    const dim = linesDims[k];

    const demiLineHeightOffset = ((options.lineHeight - 1) * dim.height) / 2;

    offsetY += dim.top + demiLineHeightOffset;

    context.fillText(lines[k], width / 2, offsetY);

    offsetY += dim.bottom + demiLineHeightOffset;
  }
};

const getTextWidth = (text, size, font, canvas) => {
  const context = canvas.getContext('2d');
  context.font = `${size}pt ${font}`;

  return context.measureText(text).width;
};

// Draw the start mark
const drawStar = (cx, cy, spikes, outerRadius, innerRadius) => {
  var ctx = canvas.getContext('2d');
  var rot = (Math.PI / 2) * 3;
  var x = cx;
  var y = cy;
  var step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.lineWidth = 5;
  ctx.strokeStyle = options.star.strokeStyle;
  ctx.stroke();
  ctx.fillStyle = options.star.fillStyle;
  ctx.fill();
};

// Update Canvas
const updateCanvas = () => {
  const text = options.textbox.content;
  var words = text.split(' ');
  var lines = [];
  var t = '';
  words = words.map((w) => w + ' ');
  words.forEach((w, n) => {
    for (var i = 0; i < w.length; i++) {
      if (n === 0 && i === 0) {
        t = t + w[i];
      } else if (
        t.length % Math.round((options.textbox.width / options.size) * 1.4)
      ) {
        if (
          w.length > Math.round((options.textbox.width / options.size) * 1.4)
        ) {
          if (
            t.length ===
            Math.round((options.textbox.width / options.size) * 1.4)
          ) {
            lines.push(t);
            t = w[i];
          } else {
            t = t + w[i];
          }
        } else {
          if (
            t.length + w.length - i >
            Math.round((options.textbox.width / options.size) * 1.4)
          ) {
            lines.push(t);
            t = w[i];
          } else {
            t = t + w[i];
          }
        }
      } else if (
        !(t.length % Math.round((options.textbox.width / options.size) * 1.4))
      ) {
        lines.push(t);
        t = w[i];
      }
    }
  });
  if (t !== '') lines.push(t);

  let textWidth = 0;
  lines.forEach((line) => {
    textWidth = Math.max(
      textWidth,
      getTextWidth(line, options.size, options.font, canvas)
    );
  });

  const context = canvas.getContext('2d');

  let linesDims = [];
  lines.forEach((line) => {
    const dim = getFontDims(options.size, options.font, line);
    linesDims.push(dim);
  });

  drawPopup(
    options.modal.width,
    options.modal.height,
    options.modal.backgroundColor
  );
  drawTextbox(
    context,
    options.textbox.width,
    options.textbox.height,
    options.arrow
  );
  drawText(context, options.textbox.width, lines, linesDims, options);
  drawStar(options.modal.width / 2, options.modal.height - 50, 5, 50, 20);
};

var modal = document.getElementById('canvasModal');

var closeCanvasModal = document.getElementById('closeCanvasModal');
closeCanvasModal.addEventListener('click', (e) => {
  modal.style.display = 'none';
});

updateCanvas();

var popupBtn = document.getElementById('popupBtn');
var settingModal = document.getElementById('settingModal');
var openSettingModal = document.getElementById('openSettingModal');
var popupWidth = document.getElementById('popupWidth');
var popupHeight = document.getElementById('popupHeight');
var popupColor = document.getElementById('popupColor');
var textboxWidth = document.getElementById('textboxWidth');
var textboxHeight = document.getElementById('textboxHeight');
var textboxContent = document.getElementById('textboxContent');
var closeSettingModal = document.getElementById('closeSettingModal');
var settingSetBtn = document.getElementById('settingSetBtn');

popupBtn.addEventListener('click', (e) => {
  var wW =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  var wH =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

  var pX = e.x + options.modal.width + 40;
  var pY = e.y + options.modal.height + 56;

  modal.style.display = 'block';
  if (pX >= wW && pY >= wH) {
    modal.style.left = e.x - options.modal.width - 40 + 'px';
    modal.style.top = e.y - options.modal.height - 56 + 'px';
  } else if (pX >= wW) {
    modal.style.left = e.x - options.modal.width - 40 + 'px';
    modal.style.top = e.y + 'px';
  } else if (pY >= wH) {
    modal.style.left = e.x + 'px';
    modal.style.top = e.y - options.modal.height - 56 + 'px';
  } else {
    modal.style.left = e.x + 'px';
    modal.style.top = e.y + 'px';
  }
});

openSettingModal.addEventListener('click', (e) => {
  settingModal.style.display = 'flex';
});

closeSettingModal.addEventListener('click', (e) => {
  settingModal.style.display = 'none';
  popupWidth.value = '';
  popupHeight.value = '';
  textboxWidth.value = '';
  textboxHeight.value = '';
  textboxContent.value = '';
});

settingSetBtn.addEventListener('click', (e) => {
  var popupWidthValue = popupWidth.value;
  var popupHeightValue = popupHeight.value;
  var popupColorValue = popupColor.value;
  var textboxWidthValue = textboxWidth.value;
  var textboxHeightValue = textboxHeight.value;
  var textboxContentValue = textboxContent.value;
  if (
    typeof popupWidthValue !== 'undefined' &&
    popupWidthValue !== null &&
    popupWidthValue !== 0 &&
    popupWidthValue !== ''
  ) {
    options.modal.width = parseInt(popupWidthValue, 10);
  }

  if (
    typeof popupHeightValue !== 'undefined' &&
    popupHeightValue !== null &&
    popupHeightValue !== 0 &&
    popupHeightValue !== ''
  ) {
    options.modal.height = parseInt(popupHeightValue, 10);
  }

  if (
    typeof popupColorValue !== 'undefined' &&
    popupColorValue !== null &&
    popupColorValue !== ''
  ) {
    options.modal.backgroundColor = popupColorValue;
  }

  if (
    typeof textboxWidthValue !== 'undefined' &&
    textboxWidthValue !== null &&
    textboxWidthValue !== 0 &&
    textboxWidthValue !== ''
  ) {
    options.textbox.width = parseInt(textboxWidthValue, 10);
  }

  if (
    typeof textboxHeightValue !== 'undefined' &&
    textboxHeightValue !== null &&
    textboxHeightValue !== 0 &&
    textboxHeightValue !== ''
  ) {
    options.textbox.height = parseInt(textboxHeightValue, 10);
  }

  if (
    typeof textboxContentValue !== 'undefined' &&
    textboxContentValue !== null &&
    textboxContentValue !== ''
  ) {
    options.textbox.content = textboxContentValue;
  }
  updateCanvas();
});
