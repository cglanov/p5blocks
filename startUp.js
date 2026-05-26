function preload() {
  let names = ['pointIcon', 'textIcon', 'lineIcon', 'rectangleIcon', 'triangleIcon', 'ellipseIcon', 'circleIcon', 'arcIcon'];

	  for (let name of names) {
    window[name] = loadImage(name + '.png');
  }
  for (let i = 0; i < promptImages.length; i++) {
    prompts.push(loadImage(promptImages[i]))
  }
	chosenPrompt = round(random(0, prompts.length - 1))
	recenterIcon = loadImage('recenterIcon.png')
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
	
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
      
      toolbox.push(b);
    }
  }

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
            
            toolbox.push(b);
        }
    }
    repositionLayout();
}