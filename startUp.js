function preload() {
  let names = ['pointIcon', 'textIcon', 'lineIcon', 'rectangleIcon', 'triangleIcon', 'ellipseIcon', 'circleIcon', 'arcIcon'];

	  for (let name of names) {
    window[name] = loadImage(name + '.png');
  }
promptImages = blockPrompts // random([hardPrompts, blockPrompts, 
	
  for (let i = 0; i < promptImages.length; i++) {
    prompts.push(loadImage(promptImages[i]))
  }
	chosenPrompt = round(random(0, prompts.length - 1))

	sproutIcon = loadImage('sprout.png')
	recenterIcon = loadImage('recenterIcon.png')
}

function setup() {
  let cnv = createCanvas(windowWidth * 0.99, windowHeight * 0.99);
	
  angleMode(DEGREES);
  
  cnv.elt.addEventListener('contextmenu', (e) => {
    e.preventDefault(); 
    handleRightClick(); 
  });

  updateUI();
  
  toolbox = []; 
  for (let cat of toolboxCategories) {
    for (let type of cat.blocks) {
      let b = new Block(type, 0, 0);
      b.category = cat.label; 
      
      if (userVariables.includes(type)) {
          b.isReporter = true;
      }
      
      toolbox.push(b);
    }
  }
sproutIcon.resize(sproutBtnSize, 0)
	recenterIcon.resize(sproutBtnSize * 3, 0)
	startRoutine = random(['dots', 'grid', 'burst', 'flow'])

  setupBlock = new Block('function setup', 0, 0);
  foreverBlock = new Block('function draw', 0, 0);

  repositionLayout();
	fileInput = createFileInput(handleFile);
  fileInput.position(-100, -100); // Hide it off-screen
}

function updateUI() {
  UI.sf = Math.min(windowWidth / 1200, windowHeight / 800);
  UI.tbW = windowWidth * 0.23;
  UI.wsX = UI.tbW;
  UI.wsW = windowWidth * 0.40;
  UI.simX = UI.wsX + UI.wsW;
  UI.simW = windowWidth - UI.simX;

  UI.bh = 30 * UI.sf;
  UI.bw = 100 * UI.sf;
  UI.ind = 15 * UI.sf;
  UI.ts = 15 * UI.sf;
  UI.rad = 5 * UI.sf;

  if (artCanvas) artCanvas.remove();
  artCanvas = createGraphics(UI.simW - 40 * UI.sf, windowHeight - 120 * UI.sf);
  artCanvas.background(255);
}

function repositionLayout() {
  let ty = 60 * UI.sf + toolboxScrollY; 
  const headerHeight = 40 * UI.sf;     
  const spacing = 10 * UI.sf;          
  const varBtnHeight = 40 * UI.sf;      

  for (let cat of toolboxCategories) {
    cat.headerY = ty;
    cat.headerH = headerHeight;
    
    ty += headerHeight;

    if (cat.isOpen) {
      
      if (cat.label === "Variables" || cat.label === "Arrays" || cat.label === "Functions") {
        ty += varBtnHeight;
      }

      let catBlocks = toolbox.filter(b => b.category === cat.label);
      
      for (let b of catBlocks) {
        b.layout(20 * UI.sf, ty);
        
        ty += (b.h + spacing);
      }
    }
    
    ty += 5 * UI.sf;
  }
}

function refreshToolbox() {
    toolbox = []; 
    for (let cat of toolboxCategories) {
        for (let type of cat.blocks) {
            let b = new Block(type, 0, 0);
            b.category = cat.label;
            
      if (userVariables.includes(type) || type.startsWith('array_get_') || type.startsWith('array_length_')) {
        b.isReporter = true;
      }
            
            toolbox.push(b);
        }
    }
    repositionLayout();
}

let flargens = [];
let flargenCol = [];
let centerX = 0;
let centerY = 0;

function drawStartScreen() { 
  if (startRoutine === 'burst') {
    burst();
  } 
  else if (startRoutine === 'grid') {
    grid()
  } 
  else if (startRoutine === 'dots') {
	dots();
  }
	else if (startRoutine === 'flow') {
		flow()
	}

  // UI ELEMENTS
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(50 * UI.sf);
  stroke(0);
  strokeWeight(5);
  text("Generative Art Blocks", width / 2, height * 0.4);
  
  textSize(20 * UI.sf);
  text("Drag blocks to create visual algorithms", width / 2, height * 0.5);
  push();
  colorMode(RGB);
  fill(200, 128, 25);
  stroke(255);
  strokeWeight(3);
  circle(width - sproutBtnSize - 20, sproutBtnSize + 20, sproutBtnSize * 1.5);
  imageMode(CENTER);
  image(sproutIcon, width - sproutBtnSize - 20, sproutBtnSize + 20);
  pop();
  noStroke();
  fill('#2ECC71');

	push()
	rectMode(CENTER)
  rect(width / 2 - 125 * UI.sf, height * 0.65, 200 * UI.sf, 50 * UI.sf, 10);
  fill(255);
	textAlign(CENTER, CENTER)
  text("BASIC", width / 2 - 125 * UI.sf, height * 0.65);

	fill('#CC2E71');
  rect(width / 2 + 125 * UI.sf, height * 0.65, 200 * UI.sf, 50 * UI.sf, 10);
	fill(255)
	text("PRO", width / 2 + 125 * UI.sf, height * 0.65);
	pop()
}
let startStarted = false;
let burstNum;
function burst() {
	if (!startStarted) {
	burstNum = round(random(45, 360))
	}
	startStarted = true;
	colorMode(HSB, 255);
    for (let i = 0; i < burstNum; i++) {
		if (i === 0) {
		}
      push(); // 1. Save the clean canvas state
      
      translate(width / 2, height / 2); // 2. Move to center
      rotate(i + map(sin(i + (frameCount)), -1, 1, 0, map(cos(frameCount), -1, 1, 120, burstNum)));
      fill(i, 255, 255, 64 - map(i, 0, burstNum, 0, 48)); 
      stroke(0, 48);
      ellipse(0, 0, height, map(i, 0, burstNum, height / 2, 10)); // 4. Draw
      
      pop(); // 5. Reset the canvas back to the top-left for the next loop!
    }
}

let rowNum;
let colNum;

function grid() {
	if (!startStarted) {
		rowNum = round(random(4, 30))
		colNum = round(random(6, 40))
	}
	startStarted = true;
	push();
    colorMode(HSB, 360);
    if (flargens.length === 0) {
      for (let j = 0; j < height; j += height / rowNum) {
        for (let i = 0; i < width; i += width / colNum) {
          flargens.push(createVector(i, j));
        }
      }
    }
    for (let i = 0; i < flargens.length; i++) { 
      fill(map(sin(i * (frameCount / 100)), -1, 1, 0, 360), 255, 255);
      stroke(0);
      rect(flargens[i].x, flargens[i].y, width / colNum, height / rowNum);
      stroke(360, 0, 360, 128);
      strokeWeight(3);
      line(flargens[i].x + 4, flargens[i].y + 4, flargens[i].x + 4, flargens[i].y + 4 + height / (rowNum));
      line(flargens[i].x + 4, flargens[i].y + 4, flargens[i].x + 4 + width / (colNum * 2), flargens[i].y + 4);
      
      stroke(0, 0, 0, 128); 
      strokeWeight(3);
      let shadowX = flargens[i].x + width / colNum - 4;
      let shadowY = flargens[i].y + height / rowNum - 4;
      line(shadowX, shadowY, shadowX, shadowY - height / (rowNum * 2));
      line(shadowX, shadowY, shadowX - width / (colNum * 2), shadowY);
    }
    pop();
}

// Global variables to hold the generated setup
let flargenSize = 15; 
let highlightSize = 5;

function dots() {
    push();
    colorMode(HSB, 360);
    
    // 1. Initialization logic
    if (flargens.length === 0) {
        // Pick a random spot on the sliding scale (0.0 = Many/Small, 1.0 = Few/Large)
        let scale = random(0, 1);
        
        // Map the scale to your desired ranges
        let dotCount = int(lerp(2000, 150, scale)); // Goes from 2000 down to 150
        flargenSize = lerp(5, 40, scale);           // Goes from 5px up to 40px
        highlightSize = flargenSize * 0.33;         // Scale highlight proportionally
        
        for (let i = 0; i < dotCount; i++) {
            flargens.push(createVector(random(450, width - 450), random(300, height - 400)));
            flargenCol.push(random(360));
        }
    }
    
    // 2. Rendering and Animation loop
    for (let i = 0; i < flargens.length; i++) {
        fill(flargenCol[i], 360, 360, 360);
        strokeWeight(1);
        stroke(flargenCol[i], 360, 128);
        
        // Draw the dot using the lerped size
        circle(flargens[i].x, flargens[i].y, flargenSize);
        
        noStroke();
        fill(360, 0, 360);
        
        // Offset the highlight smoothly based on the current dot size
        let offset = flargenSize * 0.2; 
        circle(flargens[i].x - offset, flargens[i].y - offset, highlightSize);
        
        // Movement logic
        let dirX = 1;
        let dirY = 1;
        if (i % 3 === 0) {
            dirX = -1;
        } else if (i % 4) {
            dirY = -1;
        }
        flargens[i].x += map(noise(i * 0.1, frameCount * 0.01), 0, 1, -3, 3) * dirX;
        flargens[i].y += map(noise(i * 0.1 + 1000, frameCount * 0.01), 0, 1, -3, 3) * dirY;
    }
    pop();
}

// Global settings tweaked for massive scale structure
 // Lower = bigger, sweeping curves
let pFlargens = []
let flargCol = []
let count = 0;

function flow() {
	push()
	colorMode(HSB, 255)
	
  if (flargens.length === 0) {
	  
	  for (let i = -width / 2; i < width * 1.5; i += 3) {
		  let start = random(-1000, 100)
		  flargens.push(createVector(i, start, random(10, 20)))
		  pFlargens.push(createVector(i, start))
		  flargCol.push(random(128, 255))
	  }
  }

	for (let i = 0; i < flargens.length; i++) {
			if (flargens[i].z > 1) {
			flargens[i].z -= 0.01
		}
		strokeWeight(flargens[i].z)
		stroke(map(flargens[i].x, 0, width, 0, 255), 255, flargCol[i], 50)
		line(flargens[i].x, flargens[i].y, pFlargens[i].x, pFlargens[i].y)
		pFlargens[i].x = flargens[i].x
		pFlargens[i].y = flargens[i].y
		
	   let n = noise(flargens[i].x * thisNoiseScale, flargens[i].y * thisNoiseScale, frameCount/thisNoiseScale)
		let a = TAU * n
		
		
		if (flargens[i].y < random(0, 200)) {
			flargens[i].y += 1
			flargens[i].x += 0;
		} else {
		flargens[i].y += cos(a / 100) * noise(flargens[i].x * frameCount)
		flargens[i].x += sin(a * 1000)
		}
			

		if (flargens[i].y > height) {
			flargens[i].x = random(width)
			pFlargens[i].x = flargens[i].x;
			flargens[i].y = count * random(3, 8);
			pFlargens[i].y = flargens[i].y
			flargens[i].z = 10
			count += 0.009
		}
	}
	pop()
}
