function drawControls() {
  // 1. Sizing and Spacing Configuration
  let btnW = 85 * UI.sf;       // Slightly wider for better text fit
  let btnH = 30 * UI.sf;
  let btnY = 25 * UI.sf;
  let spacing = 10 * UI.sf;    // Gap between buttons
  let startX = UI.simX + 20 * UI.sf;
  
  // Helper to calculate X position based on button index
  const getBtnX = (index) => startX + (btnW + spacing) * index;

  textAlign(CENTER, CENTER);
  textSize(UI.ts);

  // 2. Left-Aligned Buttons (RUN, CLEAR, EXPORT, SAVE, LOAD)
  
  // RUN
  let runX = getBtnX(0);
  fill(isRunning ? '#999' : '#4CAF50'); 
  rect(runX, btnY, btnW, btnH, 5);
  fill(255); text("RUN", runX + btnW/2, btnY + btnH/2);

  // CLEAR
  let clearX = getBtnX(1);
  fill('#F44336'); 
  rect(clearX, btnY, btnW, btnH, 5);
  fill(255); text("CLEAR", clearX + btnW/2, btnY + btnH/2);

  // SAVE
  let saveX = getBtnX(3); // Note: Index 2 skipped (reserved for EXPORT)
  fill('#FF9800'); 
  rect(saveX, btnY, btnW, btnH, 5);
  fill(255); text("SAVE", saveX + btnW/2, btnY + btnH/2);

  // LOAD
  let loadX = getBtnX(4);
  fill('#009688'); 
  rect(loadX, btnY, btnW, btnH, 5);
  fill(255); text("LOAD", loadX + btnW/2, btnY + btnH/2);

  // 3. Right-Aligned Toggle Button (SIMULATOR / PROMPT)
  let labelW = textWidth("SIMULATOR");
  let toggleBtnW = 40 * UI.sf + labelW;
  // Ensure it doesn't overlap the LOAD button by using width - margin
  let toggleBtnX = width - 20 * UI.sf - toggleBtnW;

  // Safety check: if screen is too narrow, push it further right or prevent overlap
  let minX = loadX + btnW + spacing;
  if (toggleBtnX < minX) toggleBtnX = minX;

  fill('#9C27B0'); 
  rect(toggleBtnX, btnY, toggleBtnW, btnH, 5);
  fill(255);
  textSize(14 * UI.sf); // Slightly smaller to ensure it fits the toggle
  text(showImage ? "SIMULATOR" : "PROMPT", toggleBtnX + toggleBtnW / 2, btnY + btnH / 2);
}

function draw() {
  if (appState === 'START') {
    drawStartScreen();
    return;
  }

  background('#F0F0F0');

  // 1. CALCULATE ANCHOR FOR FIXED FUNCTIONS
  let setupX = UI.wsX + 20 * UI.sf + wsOffsetX;
  let setupY = 60 * UI.sf + wsOffsetY;

  // 2. LAYOUT & DRAW FIXED BLOCKS
  setupBlock.layout(setupX, setupY);
  setupBlock.draw();

  let foreverY = setupY + setupBlock.h + 10 * UI.sf; 
  foreverBlock.layout(setupX, foreverY);
  foreverBlock.draw();

  // 3. LAYOUT & DRAW FLOATING EVENT FUNCTIONS
  if (mousePressedBlock && draggedBlock !== mousePressedBlock) {
    mousePressedBlock.layout(mousePressedBlock.x, mousePressedBlock.y);
    mousePressedBlock.draw();
  }
  if (keyPressedBlock && draggedBlock !== keyPressedBlock) {
    keyPressedBlock.layout(keyPressedBlock.x, keyPressedBlock.y);
    keyPressedBlock.draw();
  }

  // 4. DRAW LOOSE BLOCKS
  for (let b of workspaceBlocks) {
    if (draggedBlock !== b) b.layout(b.x, b.y);
    b.draw(); 
  }

  // 5. DRAW UI OVERLAYS (Toolbox and Sidebar)
  if (!isToolboxHidden) {
    fill('#DCDCDC'); 
    noStroke(); 
    rect(0, 0, UI.tbW, height);  

    push();
    for (let cat of toolboxCategories) {
      fill(cat.col); stroke(0, 50); rect(0, cat.headerY, UI.tbW, cat.headerH); 
      fill(255); noStroke(); textAlign(LEFT, CENTER); textSize(14 * UI.sf);
      let indicator = cat.isOpen ? "▼ " : "► ";
      text(indicator + cat.label, 10 * UI.sf, cat.headerY + cat.headerH / 2);
      
      if (cat.isOpen) {       
        for (let tb of toolbox) { 
          if (tb.category === cat.label) { 
            if (tb.y + tb.h > 50 * UI.sf) tb.draw();
          } 
        } 
      } 
    }
    pop(); 
    
    fill('#DCDCDC'); noStroke(); rect(0, 0, UI.tbW, 50 * UI.sf); fill(0); textAlign(LEFT, TOP); textSize(18 * UI.sf);
    text("Toolbox", 20 * UI.sf, 20 * UI.sf); 
  }

  // Draw Workspace Title
  fill(0); textAlign(LEFT, TOP); textSize(18 * UI.sf); 
  text("Workspace", UI.wsX + 20 * UI.sf, 20 * UI.sf); 

  // Simulator Area
  fill('#EAEAEA');
  rect(UI.simX, 0, UI.simW, height); 
  
  // --- DRAW THE TOGGLE TAB ---
  let tabW = 20 * UI.sf;
  let tabH = 60 * UI.sf;
  let tabX = isToolboxHidden ? 0 : UI.tbW; 
  let tabY = height / 2 - tabH / 2;

  fill('#A0A0A0');
  noStroke();
  rect(tabX, tabY, tabW, tabH, 0, 8, 8, 0);
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(14 * UI.sf);
  text(isToolboxHidden ? "▶" : "◀", tabX + tabW / 2, tabY + tabH / 2);

  // 6. DRAW THE DRAGGED BLOCK
  if (draggedBlock) {
    draggedBlock.layout(mouseX - dragOffsetX, mouseY - dragOffsetY);
    draggedBlock.draw();
  }

  // 7. DRAW SIMULATION CANVAS AND CONTROLS
  fill(0);
  textAlign(LEFT, BOTTOM);
  textSize(14 * UI.sf);

  let currentX = UI.simX + 20 * UI.sf;
  let currentY = 75 * UI.sf;
  let padding = 25 * UI.sf;

  // 1. Calculate Local Simulator Mouse Coordinates
  let simLeft = UI.simX + 20 * UI.sf;
  let simTop = 80 * UI.sf;
  let simW = artCanvas.width;
  let simH = artCanvas.height;

  let localMouseX = 0;
  let localMouseY = 0;

  if (mouseX >= simLeft && mouseX <= simLeft + simW && 
      mouseY >= simTop && mouseY <= simTop + simH) {
    localMouseX = floor(mouseX - simLeft);
    localMouseY = floor(mouseY - simTop);
  }

  // 2. Display Mouse Coordinates
  let mouseTxt = `mouseX: ${localMouseX}  mouseY: ${localMouseY}`;
  text(mouseTxt, currentX, currentY);
  currentX += textWidth(mouseTxt) + padding;

  // 3. Display frameCount
  let frameText = "frameCount: " + runFrameCount;
  text(frameText, currentX, currentY);
  currentX += textWidth(frameText) + padding;

  if (showImage && prompts.length > 0) {
    image(prompts[chosenPrompt], UI.simX + 20 * UI.sf, 80 * UI.sf, artCanvas.width, artCanvas.height);
  } else {
    image(artCanvas, UI.simX + 20 * UI.sf, 80 * UI.sf);
  }
  drawControls();

  // 8. INTERPRETER EXECUTION
  if (isRunning && interpreter) {
    let steps = 0;
    while (steps < 5000) { 
      let state = interpreter.next();
      if (state.done) {
        interpreter = runInterpreter(foreverBlock);
        break;
      }
      if (state.value === 'FRAME_END') {
        runFrameCount++;
        break; 
      }
      steps++;
    }
  }
  drawEditingSlotIndicator();
}

function* runInterpreter(node) {
  angleMode(DEGREES);
  artCanvas.angleMode(DEGREES);
  if (!node) return;

  const resolve = (val) => {
    if (val instanceof Block) {
      // 1. Core Reporters
      if (val.type === 'pickRandom') return random(resolve(val.args[0]), resolve(val.args[1]));

      if (val.type === 'mouseX')  return mouseX - (UI.simX + 20 * UI.sf);
      if (val.type === 'mouseY')  return mouseY - (80 * UI.sf);
      if (val.type === 'pmouseX') return pmouseX - (UI.simX + 20 * UI.sf);
      if (val.type === 'pmouseY') return pmouseY - (80 * UI.sf); // Fixed typo here
      
      if (val.type === 'width')      return artCanvas.width;
      if (val.type === 'height')     return artCanvas.height;
      if (val.type === 'frameCount') return runFrameCount;
      if (val.type === 'map')        return map(resolve(val.args[0]), resolve(val.args[1]), resolve(val.args[2]), resolve(val.args[3]), resolve(val.args[4]));

      // 2. Math & Logic Operators
      if (val.type === 'dist')  return dist(resolve(val.args[0]), resolve(val.args[1]), resolve(val.args[2]), resolve(val.args[3]));
      if (val.type === 'add')   return resolve(val.args[0]) + resolve(val.args[1]);
      if (val.type === 'sub')   return resolve(val.args[0]) - resolve(val.args[1]);
      if (val.type === 'mul')   return resolve(val.args[0]) * resolve(val.args[1]);
      if (val.type === 'div')   return resolve(val.args[0]) / resolve(val.args[1]);
      if (val.type === '>')     return resolve(val.args[0]) > resolve(val.args[1]);
      if (val.type === '<')     return resolve(val.args[0]) < resolve(val.args[1]);
      if (val.type === '=')     return resolve(val.args[0]) === resolve(val.args[1]);
      if (val.type === 'and')   return resolve(val.args[0]) && resolve(val.args[1]);
      if (val.type === 'or')    return resolve(val.args[0]) || resolve(val.args[1]);
      if (val.type === 'not')   return !resolve(val.args[0]);
    }
    return val;
  };

  // Execution Logic
  switch (node.type) {
    case 'function setup':
    case 'function draw':
    case 'function mousePressed':
    case 'function keyPressed':
      for (let child of node.children) yield* runInterpreter(child);
      if (node.type === 'function draw') yield 'FRAME_END';
      break;

    case 'repeat':
      let count = resolve(node.args[0]);
      for (let i = 0; i < count; i++) {
        for (let child of node.children) yield* runInterpreter(child);
      }
      break;

    case 'if':
      if (resolve(node.args[0])) {
        for (let child of node.children) yield* runInterpreter(child);
      }
      break;

    case 'if/else':
      if (resolve(node.args[0])) {
        for (let child of node.children) yield* runInterpreter(child);
      } else {
        for (let child of (node.elseChildren || [])) yield* runInterpreter(child);
      }
      break;

    case 'point':    artCanvas.point(resolve(node.args[0]), resolve(node.args[1])); break;  
    case 'circle':   artCanvas.circle(resolve(node.args[0]), resolve(node.args[1]), resolve(node.args[2])); break;
    case 'ellipse':  artCanvas.ellipse(resolve(node.args[0]), resolve(node.args[1]), resolve(node.args[2]), resolve(node.args[3])); break;
    case 'rect':     artCanvas.rect(resolve(node.args[0]), resolve(node.args[1]), resolve(node.args[2]), resolve(node.args[3])); break;
    case 'line':     artCanvas.line(resolve(node.args[0]), resolve(node.args[1]), resolve(node.args[2]), resolve(node.args[3])); break;
    case 'arc':      artCanvas.arc(resolve(node.args[0]), resolve(node.args[1]), resolve(node.args[2]), resolve(node.args[3]), resolve(node.args[4]), resolve(node.args[5]), OPEN); break;
    case 'triangle': artCanvas.triangle(resolve(node.args[0]), resolve(node.args[1]), resolve(node.args[2]), resolve(node.args[3]), resolve(node.args[4]), resolve(node.args[5])); break;
    case 'text':     artCanvas.text(resolve(node.args[0]), resolve(node.args[1]), resolve(node.args[2])); break;

    // --- Style ---
    case 'background': 
      artCanvas.background(
        resolve(node.args[0]), 
        resolve(node.args[1]), 
        resolve(node.args[2]), 
        node.args[3] !== undefined ? resolve(node.args[3]) : 255
      ); 
      break;

    case 'fill': 
      artCanvas.fill(
        resolve(node.args[0]), 
        resolve(node.args[1]), 
        resolve(node.args[2]), 
        node.args[3] !== undefined ? resolve(node.args[3]) : 255
      ); 
      break;

    case 'stroke': 
      artCanvas.stroke(
        resolve(node.args[0]), 
        resolve(node.args[1]), 
        resolve(node.args[2]), 
        node.args[3] !== undefined ? resolve(node.args[3]) : 255
      ); 
      break;
    case 'strokeWeight': artCanvas.strokeWeight(resolve(node.args[0])); break;
    case 'textSize':     artCanvas.textSize(resolve(node.args[0])); break;

    default: {
      // Find the target block within your global workspace array
      // Note: If findFunctionDefinition requires a string name, consider passing node.type or node.name
      let targetBlock = findFunctionDefinition(typeof workspaceBlocks !== 'undefined' ? workspaceBlocks : []);
      
      // 4. Run the interpreter through each child block of the custom function routine
      if (targetBlock && targetBlock.children) {
        for (let child of targetBlock.children) {
          yield* runInterpreter(child);
        }
      }
      break;
    }
  }
  yield; 
}

function drawEditingSlotIndicator() {
  if (!editingSlot) return;
  
  // Safely grab structural boundary definitions from your block's layout coordinates
  let pos = editingSlot.block.argPos[editingSlot.index];
  if (!pos) return;

  push();
  // 1. Draw highlighting focus container boundary
  stroke('#FF9800'); // Clean focus orange accent matching common block platforms
  strokeWeight(2);
  noFill();
  rect(pos.x, pos.y, pos.w, pos.h, UI.rad);

  // 2. Render Highlight Box OR Blinking Cursor
  if (editingSlot.isHighlighted) {
    // Draw a selection highlight over the text area
    fill('rgba(0, 120, 215, 0.4)'); // Semi-transparent selection blue
    noStroke();
    rect(pos.x + 3, pos.y + 3, pos.w - 6, pos.h - 6, UI.rad);
  } else if (floor(frameCount / 25) % 2 === 0) {
    // Render blinking text input bar indicator line
    let txt = String(editingSlot.block.args[editingSlot.index]);
    textSize(UI.ts);
    let txtW = textWidth(txt);
    
    // Position cursor at the end of text content with a 5px baseline buffer
    let caretX = pos.x + 6 + txtW;
    
    // Don't bleed past slot width parameters
    if (caretX > pos.x + pos.w - 4) caretX = pos.x + pos.w - 4;

    stroke(0);
    strokeWeight(1.5);
    line(caretX, pos.y + 4, caretX, pos.y + pos.h - 4);
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateUI();
  repositionLayout();
}