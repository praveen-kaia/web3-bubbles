var canvas = document['getElementById']('canvas');
var ctx = canvas['getContext']('2d');
let dpi = window['devicePixelRatio'] || 1;
let currentSlideIndex = 0;
var startMouseX,
  startMouseY,
  snp_500 = [
    'BTC',
    'ETH',
    'USDT',
    'SOL',
    'BNB',
    'XRP',
    'USDC',
    'DOGE',
    'ADA',
    'AVAX',
    'TON',
    'SHIB',
    'BCH',
    'DOT',
    'LINK',
    'TRX',
    'MATIC',
    'LTC',
    'UNI',
    'NEAR',
    'APT',
  ],
  nasdaq_100 = [],
  dow_jones = [],
  communication_services = [],
  consumer_staples = [],
  energy = [],
  financials = [],
  health_care = [],
  industrials = [],
  information_technology = [],
  materials = [],
  real_estate = [],
  utilities = [],
  fiveMinNet = 1,
  fifteenMinNet = 1,
  thirtyMinNet = 1,
  hourNet = 1,
  dayNet = 1,
  weekNet = 1,
  monthNet = 1,
  yearNet = 1,
  colorSchemes = {
    'green-red': {
      positive: 'rgba(0, 186, 20, 0.8)',
      brightPositive: '#00FF27',
      negative: '#960009',
      brightNegative: 'red',
    },
    'blue-yellow': {
      positive: '#203ADF',
      brightPositive: '#0019FF',
      negative: '#DFC520',
      brightNegative: '#FFE600',
    },
    neutral: {
      positive: '#FF9000',
      brightPositive: '#FF9000',
      negative: '#FF9000',
      brightNegative: '#FF9000',
    },
  };

let timeRangeButtons = document['getElementsByClassName']('timeRangeButton');

console.log(ctx, 'ctx');

function loadSavedView() {
  let savedView = JSON['parse'](localStorage['getItem']('savedView')) || {
    size: 'performance',
    content: 'performance',
    color: 'green-red',
  };
  let queryParams = getQueryParams();
  if (
    Object['keys'](queryParams)['includes']('content') &&
    Object['keys'](queryParams)['includes']('size') &&
    Object['keys'](queryParams)['includes']('color')
  ) {
    savedView = queryParams;
    selectedBubbleContent = savedView['content'];
    selectedBubbleSize = savedView['size'];
    selectedBubbleColorScheme = savedView['color'];
  }
  var bubbleContentButtons = document['getElementById']('bubbleContentButtons')[
    'getElementsByTagName'
  ]('button');
  for (let i = 0; i < bubbleContentButtons['length']; i++) {
    if (
      bubbleContentButtons[i]['innerText']['toLowerCase']() ===
      selectedBubbleContent
    ) {
      bubbleContentButtons[i]['classList']['add']('bg-blue-600');
      bubbleContentButtons[i]['classList']['remove']('bg-gray-800');
      break;
    }
  }

  var bubbleSizeButtons =
    document['getElementById']('bubbleSizeButtons')['getElementsByTagName'](
      'button'
    );
  for (i = 0; i < bubbleSizeButtons['length']; i++) {
    if (
      bubbleSizeButtons[i]['innerText']['toLowerCase']() === selectedBubbleSize
    ) {
      bubbleSizeButtons[i]['classList']['add']('bg-blue-600');
      bubbleSizeButtons[i]['classList']['remove']('bg-gray-800');
      break;
    }
  }

  var bubbleColorSchemeButtons = document['getElementById'](
    'bubbleColorSchemeButtons'
  )['getElementsByTagName']('button');
  for (let i = 0; i < bubbleColorSchemeButtons['length']; i++) {
    if (
      bubbleColorSchemeButtons[i]['innerText']['toLowerCase']() ===
      selectedBubbleColorScheme
    ) {
      bubbleColorSchemeButtons[i]['classList']['add']('bg-blue-600');
      bubbleColorSchemeButtons[i]['classList']['remove']('bg-gray-800');
      break;
    }
  }
}

function updateView() {
  localStorage['setItem'](
    'savedView',
    JSON.stringify({
      content: selectedBubbleContent,
      size: selectedBubbleSize,
      color: selectedBubbleColorScheme,
    })
  );
  setQueryParams({
    color: selectedBubbleColorScheme,
    size: selectedBubbleSize,
    content: selectedBubbleContent,
  });
  getQueryParams();
}

function getQueryParams() {
  const href = new URL(window.location.href),
    params = {};
  href['searchParams']['forEach']((_value, _key) => {
    params[_key] = _value;
  });
  return params;
}

function setQueryParams(_params) {
  const _location = new URL(window['location']);
  Object.keys(_params).forEach((_key) =>
    _location.searchParams['set'](_key, _params[_key])
  );
  window.history.push({}, '', _location);
}

function adjustCanvasHighDPI(_canvas) {
  let _height = +getComputedStyle(_canvas)
    ['getPropertyValue']('height')
    .slice(0, -2);
  let _width = +getComputedStyle(_canvas)
    ['getPropertyValue']('width')
    .slice(0, -2);

  _canvas['setAttribute']('height', _height * dpi);
  _canvas['setAttribute']('width', _width * dpi);
  _canvas['getContext']('2d')['scale'](dpi, dpi);
}

canvas.style.height = window.innerHeight - 90 + 'px';
canvas.style.width = window.innerWidth + 'px';
adjustCanvasHighDPI(canvas);

var bubbles = [],
  allListData = [],
  allData = [],
  data = [];
const progressBar = document.getElementById('progressBar');
let progressUpdateTime = 50,
  currentChart = null,
  currentPlottedTicker = null,
  currentPlottedTickerData = null,
  currentPlottedTickerInterval = null,
  selectedBubbleContent = 'performance',
  selectedBubbleSize = 'performance',
  selectedBubbleColorScheme = 'green-red';

function drawBubble(_bubbleData) {
  // Retrieve bubble properties
  let radius = _bubbleData['radius'];

  // Increase radius if current radius is greater than target radius
  if (_bubbleData['radius'] > _bubbleData['currentRadius']) {
    radius = _bubbleData['currentRadius'] + _bubbleData['rateOfChange'];
    _bubbleData['currentRadius'] = radius;
  }

  // Draw bubble
  ctx.beginPath(),
    ctx.arc(
      _bubbleData['x'],
      _bubbleData['y'],
      radius,
      0,
      2 * Math['PI'],
      false
    );

  // Create gradient for bubble fill
  var gradient = ctx?.createRadialGradient(
    _bubbleData['x'],
    _bubbleData['y'],
    0.45 * radius,
    _bubbleData['x'],
    _bubbleData['y'],
    radius
  );
  gradient.addColorStop(0, 'rgba(13, 18, 28, 0.3)');
  gradient.addColorStop(1, _bubbleData['color']);

  // Apply gradient to bubble
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = _bubbleData['isHovered']
    ? 'white'
    : 'rgba(255, 255, 255, 0)';
  ctx.stroke();
  ctx.fillStyle = 'white';

  let fontSize = 0.4 * radius;
  ctx.font = fontSize + 'px Arial';
  let name = _bubbleData['text'];
  let value = _bubbleData['value'];
  let nameWidth = ctx.measureText(name)['width'];
  let valueWidth = ctx.measureText(value)['width'];
  ctx.fillText(
    name,
    _bubbleData['x'] - nameWidth / 2,
    _bubbleData['y'] - fontSize / 2
  );
  ctx.fillText(
    value,
    _bubbleData['x'] - valueWidth / 2,
    _bubbleData['y'] + fontSize / 1.2
  );
}

function getSelectedStockList() {
  return snp_500;
}

function getSelectedBubbleSize() {
  let result;
  if ('performance' === selectedBubbleSize) {
    result = 'performance';
  } else if ('volume' == selectedBubbleSize) {
    result = 'volume';
  } else if ('market\x20cap' === selectedBubbleSize) {
    result = 'market_cap';
  } else {
    result = undefined;
  }
  return result;
}

function getValueToUseForRadius(dataType, bubbleSize) {
  return 'performance' === bubbleSize
    ? dataType
    : 'market_cap' === bubbleSize
    ? 'marketcap'
    : 'volume' === bubbleSize
    ? 'volume'
    : undefined;
}

function createBubbles() {
  let timeRangeDropdown = document.getElementById('timeframeSelect');
  let timeRangeValue =
    timeRangeDropdown.options[
      timeRangeDropdown.selectedIndex
    ].value.toLowerCase();
  console.log(data, '_item');
  let selectedBubbleSize = getSelectedBubbleSize();
  let bubbleRadii = calculateCircleRadii(
    data.map((_item) =>
      'performance' === selectedBubbleSize
        ? _item[timeRangeValue] >= 0
          ? _item[timeRangeValue]
          : -1 * _item[timeRangeValue]
        : 'market_cap' === selectedBubbleSize
        ? _item['marketcap'] >= 0
          ? _item['marketcap']
          : -1 * _item['marketcap']
        : 'volume' === selectedBubbleSize
        ? _item['volume'] >= 0
          ? _item['volume']
          : -1 * _item['volume']
        : undefined
    )
  );
  let positiveValues = data
    .filter((_item) => parseFloat(_item[timeRangeValue]) > 0)
    .map((_item) => parseFloat(_item[timeRangeValue]))
    .sort(function (a, b) {
      return +a - +b;
    })
    .reverse()
    .slice(0, 3);

  let negativeValues = data
    .filter((_item) => _item[timeRangeValue] < 0)
    .map((_item) => _item[timeRangeValue])
    .sort(function (a, b) {
      return +a - +b;
    })
    .slice(0, 3);

  let valueToUseForRadius = getValueToUseForRadius(
    timeRangeValue,
    selectedBubbleSize
  );

  data.forEach((_item) => {
    let bubbleRadius =
      bubbleRadii[
        _item[valueToUseForRadius] >= 0
          ? _item[valueToUseForRadius]
          : -1 * _item[valueToUseForRadius]
      ];
    var bubbleColor =
      _item[timeRangeValue] >= 0
        ? colorSchemes[selectedBubbleColorScheme]['positive']
        : colorSchemes[selectedBubbleColorScheme]['negative'];

    positiveValues.includes(_item[timeRangeValue])
      ? (bubbleColor =
          colorSchemes[selectedBubbleColorScheme]['brightPositive'])
      : negativeValues['includes'](_item[timeRangeValue]) &&
        (bubbleColor =
          colorSchemes[selectedBubbleColorScheme]['brightNegative']);

    let bubbleContentValue = getBubbleContentValue(
      _item[timeRangeValue],
      _item['volume'],
      _item['marketcap'],
      _item['price']
    );

    let bubble = {
      x: (Math.random() * canvas.width) / dpi,
      y: (Math.random() * canvas.height) / dpi,
      currentRadius: 10,
      rateOfChange: 2,
      radius: bubbleRadius,
      color: bubbleColor,
      text: _item.symbol,
      value: bubbleContentValue,
      vx: 2 * (Math.random() - 0.5),
      vy: 2 * (Math.random() - 0.5),
      isDragging: false,
      isHovered: false,
      hasMoved: false,
    };

    bubbles.push(bubble);
  });
}

function getRandomDecimalBetween(minValue, maxValue) {
  return Math.random() * (maxValue - minValue) + minValue;
}

function getBubbleContentValue(value, volume, marketCap, price) {
  if ('performance' === selectedBubbleContent) {
    return value === 0;
  } else if (selectedBubbleContent === 'volume') {
    return '$' + formatCurrency(volume);
  } else if (selectedBubbleContent === 'market cap') {
    return '$' + formatCurrency(marketCap);
  } else if (selectedBubbleContent === 'price') {
    return '$' + Math.floor(100 * (price + Number.EPSILON)) / 100;
  } else {
    return undefined;
  }
}

function clearCanvas() {
  // Get the canvas dimensions and clear it
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateCanvas() {
  // Clear the canvas
  clearCanvas();

  // Loop through each bubble
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      // Calculate distance between two bubbles
      let dx = bubbles[j].x - bubbles[i].x;
      let dy = bubbles[j].y - bubbles[i].y;
      let distance = Math.sqrt(dx * dx + dy * dy);

      // Check collision between bubbles
      let minDistance = bubbles[j].radius + bubbles[i].radius;
      if (distance < minDistance) {
        // Calculate collision angles and positions
        let angle = Math.atan2(dy, dx);
        let targetX = bubbles[i].x + Math.cos(angle) * minDistance;
        let targetY = bubbles[i].y + Math.sin(angle) * minDistance;
        let ax = 0.01 * (targetX - bubbles[j].x);
        let ay = 0.01 * (targetY - bubbles[j].y);

        // Apply collision effects
        if (!bubbles[i].isDragging) {
          bubbles[i].vx -= ax;
          bubbles[i].vy -= ay;
        }
        if (!bubbles[j].isDragging) {
          bubbles[j].vx += ax;
          bubbles[j].vy += ay;
        }
      }
    }
  }

  // Get device pixel ratio
  let dpi = window.devicePixelRatio || 1;

  // Update bubble positions and velocities
  bubbles.forEach((bubble) => {
    if (!bubble.isDragging) {
      bubble.x += bubble.vx;
      bubble.y += bubble.vy;
      bubble.vx *= 0.98;
      bubble.vy *= 0.98;

      // Add random velocity if almost stopped
      if (Math.abs(bubble.vx) < 0.01) {
        bubble.vx += 0.1 * (Math.random() - 0.5);
      }
      if (Math.abs(bubble.vy) < 0.01) {
        bubble.vy += 0.1 * (Math.random() - 0.5);
      }

      // Detect and handle boundary collisions
      let canvasWidth = canvas.width / dpi;
      let canvasHeight = canvas.height / dpi;
      if (bubble.x + bubble.radius > canvasWidth) {
        bubble.x = canvasWidth - bubble.radius;
        bubble.vx *= -1;
      } else if (bubble.x - bubble.radius < 0) {
        bubble.x = bubble.radius;
        bubble.vx *= -1;
      }
      if (bubble.y + bubble.radius > canvasHeight) {
        bubble.y = canvasHeight - bubble.radius;
        bubble.vy *= -1;
      } else if (bubble.y - bubble.radius < 0) {
        bubble.y = bubble.radius;
        bubble.vy *= -1;
      }
    }

    // Draw the updated bubble
    drawBubble(bubble);
  });

  // Request animation frame for continuous animation
  requestAnimationFrame(updateCanvas);
}

function updateTimeframe() {
  updateRange();
}

function updateStockList() {
  let stockList = getSelectedStockList();
  allData = allListData.filter((_item) => stockList.includes(_item.symbol));
  updateTimeframe(), calculateTimeRangeButtonColors();
}

function updateRange() {
  // Clear existing bubbles array
  bubbles = [];

  // Get selected dropdown elements
  var performanceDropdown = document.getElementById('rangeSelector');
  var timeRangeDropdown = document.getElementById('timeframeSelect');

  // Get selected values from dropdowns
  var performanceValue =
    performanceDropdown.options[performanceDropdown.selectedIndex].value;
  var timeRangeValue =
    timeRangeDropdown.options[
      timeRangeDropdown.selectedIndex
    ].value.toLowerCase();

  // Update data based on selected performance and time range
  if (performanceValue === 'topGainers') {
    // Filter data for positive performance values and sort them
    data = allData
      .filter((item) => item[timeRangeValue] > 0)
      .sort(
        (a, b) => parseFloat(a[timeRangeValue]) - parseFloat(b[timeRangeValue])
      );

    // Take first 30 items if data array has items, otherwise empty array
    data = data.length > 0 ? data.slice(0, 30) : [];
  } else if (performanceValue === 'topLosers') {
    // Filter data for negative performance values and sort them
    data = allData
      .filter((item) => item[timeRangeValue] < 0)
      .sort(
        (a, b) =>
          -(+parseFloat(a[timeRangeValue]) - +parseFloat(b[timeRangeValue]))
      )
      .reverse();

    // Take first 30 items if data array has items, otherwise empty array
    data = data.length > 0 ? data.slice(0, 30) : [];
  } else if (performanceValue === 'allCompanies') {
    // Show all data
    data = allData;
  } else {
    // Show data based on the selected time range
    var startIndex = parseInt(performanceValue);
    data = allData.slice(startIndex, startIndex + 100);
  }

  // Create bubbles based on updated data
  createBubbles();
  // populateTable();
  // Call function to calculate time range button colors
  calculateTimeRangeButtonColors();
}

function calculateCircleRadii(_data) {
  // Get canvas dimensions
  var canvasElement = document.getElementById('canvas').getBoundingClientRect();
  var canvasWidth = canvasElement.width;
  var canvasHeight = canvasElement.height;

  // Calculate the maximum area for circles based on canvas dimensions
  const maxArea = 0.65 * (canvasHeight * canvasWidth);

  // Calculate the total sum of data values
  const totalSum = _data.reduce((a, b) => a + b, 0);

  // Initialize sum of circle areas
  let areaSum = 0;

  // Calculate the circle radius for each data value
  const circleRadii = _data.reduce((acc, currentValue) => {
    // Calculate the area of the circle based on the percentage of the total sum
    const circleArea = (currentValue / totalSum) * maxArea;

    // Add the area to the sum
    areaSum += circleArea;

    // Store the circle area in the accumulator
    acc[currentValue] = circleArea;

    return acc;
  }, {});

  const scaledRadii = {};
  for (const [value, area] of Object.entries(circleRadii)) {
    // Calculate the maximum radius based on canvas dimensions and circle area
    const maxRadius = Math.max(
      Math.min(
        Math.max(7, Math.sqrt(area / Math.PI)),
        Math.min(canvasWidth, canvasHeight) / 2.2
      ),
      15
    );

    // Store the scaled radius
    scaledRadii[value] = maxRadius;
  }

  return scaledRadii;
}

async function fetchFromBubbleScreener() {
  try {
    const response = await fetch('http://localhost:3000/bubbles');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

async function startApp() {
  loadSavedView();
  allListData = await fetchFromBubbleScreener();
  let stockList = getSelectedStockList();
  allData = allListData.filter((_item) => {
    return stockList.includes(_item['symbol']);
  });
  data = allData['slice'](0, 100);

  // populateTable(),
  updateCanvas(), createBubbles(), calculateTimeRangeButtonColors();
}

function startProgressBar() {
  let startTime = Date.now();
  const intervalId = setInterval(() => {
    let elapsedTime = ((Date.now() - startTime) / 180000) * 100;
    progressBar.style.width = elapsedTime + '%';
    elapsedTime >= 100 &&
      (clearInterval(intervalId),
      (progressBar.style.width = '0%'),
      fetchNewStockData(),
      startProgressBar());
  }, progressUpdateTime);
}

async function fetchNewStockData() {
  allListData = await fetchFromBubbleScreener();
  var stockList = getSelectedStockList();

  allData = allListData.filter((_item) => stockList.includes(_item.ticker));
  updateRange();
  bubbles = [];
  createBubbles();
  // populateTable();
}

function convertToBrowserTimezone(timestamp) {
  return new Date(1000 * timestamp).toLocaleString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function convertToET(timestamp) {
  return new Date(1000 * timestamp).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function removeSelectedClassFromAllButtons() {
  document.querySelectorAll('.selectedButton').forEach((_button) => {
    _button.classList.remove('selectedButton');
  });
}

function addSelectedClass(buttonId) {
  removeSelectedClassFromAllButtons(),
    document.getElementById(buttonId).classList['add']('selectedButton');
}

canvas['onmousemove'] = function (_event) {
  let posX = _event.pageX - this['offsetLeft'];
  let posY = _event.pageY - this['offsetTop'];

  bubbles.forEach(function (_bubble) {
    let cursorPos = Math['sqrt'](
      Math.pow(_bubble['x'] - posX, 0x2) + Math.pow(_bubble['y'] - posY, 0x2)
    );
    _bubble['isHovered'] = cursorPos < _bubble['radius'];
    if (_bubble['isDragging']) {
      _bubble['x'] = posX;
      _bubble['y'] = posY;
    }
  });
};

window.addEventListener('resize', function () {
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight - 90 + 'px';
  adjustCanvasHighDPI(canvas);
});

document
  .getElementById('timeframeSelect')
  .addEventListener('change', updateTimeframe);

function formatCurrency(_value) {
  return _value >= 1e12
    ? (_value / 1e12).toFixed(1) + 'T'
    : _value >= 1e9
    ? (_value / 1e9).toFixed(1) + 'B'
    : _value >= 1e6
    ? (_value / 1e6).toFixed(1) + 'M'
    : _value >= 1e3
    ? (_value / 1e3).toFixed(1) + 'K'
    : _0x4c_valdd28;
}

for (let _timeRangeButton of timeRangeButtons) {
  _timeRangeButton.addEventListener('click', (_event) => {
    for (let _tRButton of timeRangeButtons) {
      if (_tRButton.classList.contains('bg-blue-600')) {
        _tRButton.classList.remove('bg-blue-600');
        _tRButton.classList.add('bg-gray-900');
      }
    }

    _event.target.classList.remove('bg-gray-900');
    _event.target.classList.add('bg-blue-600');
    document.getElementById('timeframeSelect').value = _event.target.value;
    updateTimeframe();
  });
}

function calculateTimeRangeButtonColors() {
  let fiveMinNet = 0;
  let fifteenMinNet = 0;
  let thirtyMinNet = 0;
  let hourNet = 0;
  let dayNet = 0;
  let weekNet = 0;
  let monthNet = 0;
  let yearNet = 0;

  for (let i = 0x0; i < data.length; i++) {
    fiveMinNet += data[i]['5min'] > 0 ? 1 : -1;
    fifteenMinNet += data[i]['15min'] > 0 ? 1 : -1;
    thirtyMinNet += data[i]['30min'] > 0 ? 1 : -1;
    hourNet += data[i]['hour'] > 0 ? 1 : -1;
    dayNet += data[i]['today'] > 0 ? 1 : -1;
    weekNet += data[i]['week'] > 0 ? 1 : -1;
    monthNet += data[i]['month'] > 0 ? 1 : -1;
    yearNet += data[i]['year'] > 0 ? 1 : -1;
  }

  for (let _timeRangeButton of timeRangeButtons) {
    let _color;
    if ('5min' === _timeRangeButton.value) {
      _color = fiveMinNet >= 0 ? 'green' : 'red';
    } else if ('15min' === _timeRangeButton.value) {
      _color = fifteenMinNet >= 0 ? 'green' : 'red';
    } else if ('30min' === _timeRangeButton.value) {
      _color = thirtyMinNet >= 0 ? 'green' : 'red';
    } else if ('Hour' === _timeRangeButton.value) {
      _color = hourNet >= 0 ? 'green' : 'red';
    } else if ('today' === _timeRangeButton.value) {
      _color = dayNet >= 0 ? 'green' : 'red';
    } else if ('Week' === _timeRangeButton.value) {
      _color = weekNet >= 0 ? 'green' : 'red';
    } else if ('Month' === _timeRangeButton.value) {
      _color = monthNet >= 0 ? 'green' : 'red';
    } else if ('Year' === _timeRangeButton.value) {
      _color = yearNet >= 0 ? 'green' : 'red';
    }
    setTimeRangeButtonBorderColor(_timeRangeButton, _color);
  }
}

function setTimeRangeButtonBorderColor(_timeRangeButton, _color) {
  if ('red' === _color) {
    _timeRangeButton.classList.remove('border-green-600');
    _timeRangeButton.classList.add('border-red-600');
  } else {
    _timeRangeButton.classList.remove('border-red-600');
    _timeRangeButton.classList.add('border-green-600');
  }
}

startApp();
startProgressBar();
