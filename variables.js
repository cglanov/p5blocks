
let pointIcon, textIcon, lineIcon, rectangleIcon, triangleIcon, ellipseIcon, circleIcon, arcIcon;
let promptImages = [
/*
	'0.png',
	'1.png',
	'2.png',
	'3.png',
	'4.png',
	
*/
'lineSquare.png', // intro
'circleCenter.png',
'cornerLine.png',
'ovalMouse.png',
'randomCircles.png',
/*
	'stripe.png',
'psych.png',
	'falling.png', 
	'wandering.png', 
	'spinning.png', 
	'spreading.png', 
	'growing.png', 
	'blinking.png',
	'bouncing.png', 
	'webbing.png', 
	'waving.png', 
	'oscillating.png', 
	// 'reading.png',
	'grid.png', 
	'grid2.png',
	// 'cones.png',
	'blur.png',
	'posterize.png',
	'threshold.png'
 */
];

// --- Global State ---
let UI = {};
let toolbox = [];
let toolboxCategories = [
  {
    label: "Shapes",
    col: '#4CAF50',
    blocks: ['point', 'circle', 'ellipse', 'arc', 'rect', 'line', 'triangle', 'text'],
    isOpen: true
  },
  {
    label: "Brush",
    col: '#FF5722',
    blocks: ['background', 'fill', 'stroke', 'strokeWeight', 'textSize'],
    isOpen: false
  },
  {
    label: "Control",
    col: '#FF8F00',
    blocks: ['repeat', 'if', 'if/else'],
    isOpen: false
  },
  {
    label: "Events",
    col: '#C0C000', // Matching Control color but in a separate drawer
    blocks: ['function mousePressed', 'function keyPressed'],
    isOpen: false
  },
  {
    label: "Variables",
    col: '#8E24AA',
    blocks: ['mouseX', 'mouseY', 'width', 'height', 'frameCount'],
    isOpen: false
  },
  {
    label: "Math",
    col: '#03A9F4',
    blocks: ['add', 'sub', 'mul', 'div', 'pickRandom', 'map', 'dist'],
    isOpen: false
  },
  {
    label: "Logic",
    col: '#4472C4',
    blocks: ['>', '<', '=', 'and', 'or', 'not'],
    isOpen: false
  }
];

const BLOCK_MENUS = {
  'filter': ['BLUR', 'INVERT', 'GRAY', 'THRESHOLD', 'POSTERIZE', 'ERODE', 'DILATE'],
	'rectMode': ['CENTER', 'CORNER'],
	'colorMode': ['RGB', 'HSB'],
};

let hoverStartTime = 0;
let lastHoveredSlot = null;
let currentTooltip = "";
const HOVER_THRESHOLD = 500;
let toolboxScrollY = 0;
let isToolboxHidden = false;
let userVariables = [];
let variableValues = {};
let userArrays = [];
let userFunctions = [];
let arrayValues = {};
let foreverBlock;
let setupBlock;
let mousePressedBlock = null;
let keyPressedBlock = null;
let draggedBlock = null;
let workspaceBlocks = []; 
let dragOffsetX = 0, dragOffsetY = 0;

let wsOffsetX = 0, wsOffsetY = 0;
let isDraggingWorkspace = false;

let isRunning = false;
let runFrameCount = 0;
let interpreter = null;
let artCanvas;
let appState = 'SIMULATION';




let prompts = []
let chosenPrompt;
let showImage = false;

// --- TOUCH SUPPORT VARIABLES ---
let lastTouchY = 0;
let touchTimer = null;
let isLongPress = false;

const LONG_PRESS_DURATION = 500; // Milliseconds to trigger a right-click clone

let activeMenu = null; // Stores { x, y, w, options, block, index }
let editingSlot = null; // Stores { block, index, originalValue }
let savedImgs = []

