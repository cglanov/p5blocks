
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

  // EXPORT
  let exportX = getBtnX(2);
  fill('#2196F3'); 
  rect(exportX, btnY, btnW, btnH, 5);
  fill(255); text("EXPORT", exportX + btnW/2, btnY + btnH/2); 

  // SAVE
  let saveX = getBtnX(3);
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

function drawActiveMenu() {
  if (!activeMenu) return;

  push();
  let itemH = 30 * UI.sf;
  
  // Shadow/Overlay background
  fill(0, 50);
  noStroke();
  rect(activeMenu.x + 4, activeMenu.y + 4, activeMenu.w, activeMenu.options.length * itemH, 4);

  // Menu Container
  stroke(0);
  strokeWeight(1);
  fill(255);
  rect(activeMenu.x, activeMenu.y, activeMenu.w, activeMenu.options.length * itemH, 4);

  for (let i = 0; i < activeMenu.options.length; i++) {
    let itemY = activeMenu.y + i * itemH;
    
    // Highlight on hover
    if (mouseX > activeMenu.x && mouseX < activeMenu.x + activeMenu.w &&
        mouseY > itemY && mouseY < itemY + itemH) {
      fill(220, 230, 255);
      noStroke();
      rect(activeMenu.x + 1, itemY + 1, activeMenu.w - 2, itemH - 2);
    }

    // Text Label
    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(UI.ts * 0.9);
    text(activeMenu.options[i], activeMenu.x + 10 * UI.sf, itemY + itemH / 2);
    
    // Divider line
    if (i < activeMenu.options.length - 1) {
      stroke(200);
      line(activeMenu.x, itemY + itemH, activeMenu.x + activeMenu.w, itemY + itemH);
    }
  }
  pop();
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

  // Dynamically stack user functions below the forever block
  let nextFuncY = foreverY + foreverBlock.h + 10 * UI.sf; 
  
  if (userFunctions.length > 0) {
    for (let i = 0; i < userFunctions.length; i++) {
      userFunctions[i].y = nextFuncY;
      userFunctions[i].layout(setupX, userFunctions[i].y);
      userFunctions[i].draw();
      
      // Increment the Y position for the next function block based on this block's height
      nextFuncY += userFunctions[i].h + 10 * UI.sf; 
    }
  }

  // 3. STACK EVENT FUNCTIONS
  // Continue the stack using setupX for alignment and nextFuncY for vertical placement
  if (mousePressedBlock) {
    mousePressedBlock.y = nextFuncY;
    mousePressedBlock.layout(setupX, mousePressedBlock.y);
    
    if (draggedBlock !== mousePressedBlock) {
      mousePressedBlock.draw();
    }
    
    // Increment Y for anything that might come after it
    nextFuncY += mousePressedBlock.h + 10 * UI.sf;
  }

  if (keyPressedBlock) {
    keyPressedBlock.y = nextFuncY;
    keyPressedBlock.layout(setupX, keyPressedBlock.y);
    
    if (draggedBlock !== keyPressedBlock) {
      keyPressedBlock.draw();
    }
    
    // Increment Y again (useful if you add more stacked blocks later)
    nextFuncY += keyPressedBlock.h + 10 * UI.sf;
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
	  strokeWeight(1)
    for (let cat of toolboxCategories) {
      fill(cat.col); stroke(0, 50); rect(0, cat.headerY, UI.tbW, cat.headerH); 
      fill(255); noStroke(); textAlign(LEFT, CENTER); textSize(14 * UI.sf);
      let indicator = cat.isOpen ? "▼ " : "► ";
      text(indicator + cat.label, 10 * UI.sf, cat.headerY + cat.headerH / 2);
      
      if (cat.isOpen) { 
        if (cat.label === "Variables") { 
          let btnY = cat.headerY + cat.headerH + 5 * UI.sf;
          let btnH = 30 * UI.sf; fill(0, 30); rect(10 * UI.sf + 2, btnY + 2, UI.tbW - 20 * UI.sf, btnH, 5);
          fill(cat.col); stroke(255, 150); rect(10 * UI.sf, btnY, UI.tbW - 20 * UI.sf, btnH, 5); fill(255); noStroke(); textAlign(CENTER, CENTER);
          textSize(12 * UI.sf); text("+ Create Variable", UI.tbW / 2, btnY + btnH / 2);
        }  

// Render Arrays Button
        if (cat.label === "Arrays") { 
          let btnY = cat.headerY + cat.headerH + 5 * UI.sf;
          let btnH = 30 * UI.sf; 
          fill(0, 30); rect(10 * UI.sf + 2, btnY + 2, UI.tbW - 20 * UI.sf, btnH, 5); // Shadow
          fill(cat.col); stroke(255, 150); rect(10 * UI.sf, btnY, UI.tbW - 20 * UI.sf, btnH, 5); 
          fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(12 * UI.sf);
          text("+ Create Array", UI.tbW / 2, btnY + btnH / 2);
        }  

        // Render Functions Button
        if (cat.label === "Functions") { 
          let btnY = cat.headerY + cat.headerH + 5 * UI.sf;
          let btnH = 30 * UI.sf; 
          fill(0, 30); rect(10 * UI.sf + 2, btnY + 2, UI.tbW - 20 * UI.sf, btnH, 5); // Shadow
          fill(cat.col); stroke(255, 150); rect(10 * UI.sf, btnY, UI.tbW - 20 * UI.sf, btnH, 5); 
          fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(12 * UI.sf);
          text("+ Create Function", UI.tbW / 2, btnY + btnH / 2);
        }  
		  
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

  // Draw Workspace Title [cite: 77]
fill(0); textAlign(LEFT, TOP); textSize(18 * UI.sf); 
text("Workspace", UI.wsX + 20 * UI.sf, 20 * UI.sf); 

// --- Recenter Button UI ---
let recBtnX = UI.wsX + 600 * UI.sf;
let recBtnY = 720 * UI.sf;
	push()
tint(255, 128)
	imageMode(CENTER)
image(recenterIcon, recBtnX, recBtnY); 
pop()
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

// 4. Iterate through user variables with dynamic spacing and wrapping
userVariables.forEach((varName) => {
  let val = variableValues[varName];
  if (val === undefined || val === null) val = 0;

  // SAFE CHECK: Only attempt toFixed() if it's actually a decimal number
  let displayVal = (typeof val === 'number' && !Number.isInteger(val)) ? val.toFixed(1) : val;
  let fullStr = `${varName}: ${displayVal}`;

  // Wrap to new line if text exceeds sidebar width
  if (currentX + textWidth(fullStr) > UI.simX + UI.simW - 20 * UI.sf) {
    currentX = UI.simX + 20 * UI.sf;
    currentY += 20 * UI.sf;
  }

  text(fullStr, currentX, currentY);
  currentX += textWidth(fullStr) + padding;
});
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
	drawActiveMenu();
	drawEditingSlotIndicator();
	if (customInputPopup) {
  push();
  // 1. Draw a dim layout backdrop overlay
  fill(0, 0, 0, 100);
  noStroke();
  rect(0, 0, width, height);

  // 2. Calculate Centered Bounds
  let w = customInputPopup.w;
  let h = customInputPopup.h;
  let x = width / 2 - w / 2;
  let y = height / 2 - h / 2;

  // 3. Draw Modal Window Frame
  stroke(60);
  strokeWeight(2 * UI.sf);
  fill(245);
  rect(x, y, w, h, 8 * UI.sf);

  // Title Text
  noStroke();
  fill(40);
  textAlign(CENTER, TOP);
  textSize(16 * UI.sf);
  text("Create New " + customInputPopup.type, width / 2, y + 20 * UI.sf);

  // 4. Draw Input Box Text Field Area
  fill(255);
  stroke(180);
  rect(x + 30 * UI.sf, y + 55 * UI.sf, w - 60 * UI.sf, 32 * UI.sf, 4 * UI.sf);

  // Display Text Stream
  noStroke();
  fill(0);
  textAlign(LEFT, CENTER);
  textSize(14 * UI.sf);
  // Add a fake visual typing caret line
  let txt = customInputPopup.text + (frameCount % 30 < 15 ? "|" : "");
  text(txt, x + 40 * UI.sf, y + 71 * UI.sf);

  // 5. Action Controls (OK / Cancel Buttons)
  let btnY = y + h - 45 * UI.sf;
  let btnW = 80 * UI.sf;
  let btnH = 30 * UI.sf;

  // OK Button
  let okX = x + 40 * UI.sf;
  fill(50, 150, 50);
  rect(okX, btnY, btnW, btnH, 4 * UI.sf);
  fill(255);
  textAlign(CENTER, CENTER);
  text("OK", okX + btnW / 2, btnY + btnH / 2);

  // Cancel Button
  let cancelX = x + w - 120 * UI.sf;
  fill(180, 50, 50);
  rect(cancelX, btnY, btnW, btnH, 4 * UI.sf);
  fill(255);
  text("Cancel", cancelX + btnW / 2, btnY + btnH / 2);

  pop();
}
}

function createNewVariable(name) {
  if (name && name.trim() !== "" && !userVariables.includes(name) && !userArrays.includes(name)) {
    name = name.replace(/\s+/g, '_'); // [1]
    userVariables.push(name);
    variableValues[name] = 0;
    
    let varCat = toolboxCategories.find(c => c.label === "Variables");
    varCat.blocks.push(name);            
    varCat.blocks.push('set_' + name);    
    varCat.blocks.push('change_' + name); 
    refreshToolbox(); // [1]
  }
}

function createNewArray(name) {
    if (name && name.trim() !== "" && !userVariables.includes(name) && !userArrays.includes(name)) {
        name = name.replace(/\s+/g, '_'); 
        userArrays.push(name);
        arrayValues[name] = [];

        let arrCat = toolboxCategories.find(c => c.label === "Arrays");
        if (arrCat) {
            arrCat.blocks.push('array_get_' + name);
            arrCat.blocks.push('array_set_' + name);
            arrCat.blocks.push('array_change_' + name);  // <--- ADDED: Registers the change block
            arrCat.blocks.push('array_push_' + name);
            arrCat.blocks.push('array_length_' + name); 
        }
        refreshToolbox();
    }
}


function createNewFunction(name) {
  if (name && name.trim() !== "" && !userVariables.includes(name) && 
      !userArrays.includes(name) && !userFunctions.includes(name)) {
    name = name.replace(/\s+/g, '_'); // [3]
    userFunctions.push(new Block('function ' + name, 0, 0));
    variableValues[name] = []; 

    let funCat = toolboxCategories.find(c => c.label === "Functions");
    if (funCat) {
      funCat.blocks.push('call ' + name);
    }
    refreshToolbox(); // [4]
  }
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

function findFunctionDefinition(funcName) {
  const search = (blocks) => {
    for (let b of blocks) {
      if (b.type === 'function ' + funcName || b.type === 'function_' + funcName) {
        return b;
      }
      if (b.children) {
        let found = search(b.children);
        if (found) return found;
      }
      if (b.elseChildren) {
        let found = search(b.elseChildren);
        if (found) return found;
      }
    }
    return null;
  };

  // 1. Check userFunctions array where newly created definitions live
  let found = search(typeof userFunctions !== 'undefined' ? userFunctions : []);
  if (found) return found;

  // 2. Check general workspace blocks as a fallback
  return search(typeof workspaceBlocks !== 'undefined' ? workspaceBlocks : []);
}