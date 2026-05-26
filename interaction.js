function mouseWheel(event) {
  if (mouseX < UI.tbW) {
    toolboxScrollY -= event.deltaY;
    
    let totalContentHeight = 0;
    const headerHeight = 40 * UI.sf;
    const spacing = 10 * UI.sf;

    for (let cat of toolboxCategories) {
      totalContentHeight += headerHeight;
      
      if (cat.isOpen) {
        let catBlocks = toolbox.filter(b => b.category === cat.label);
        for (let b of catBlocks) {
          totalContentHeight += (b.h + spacing);
        }
      }
      totalContentHeight += 5 * UI.sf; 
    }
    
    // 2. Clamp the scroll value
    let minScroll = Math.min(0, height - totalContentHeight - 100 * UI.sf); 
    
    toolboxScrollY = constrain(toolboxScrollY, minScroll, 0);
    
    repositionLayout();
    return false;
  }
}

function mousePressed() {
  // ==========================================
  // NEW: GRAPHIC INPUT POPUP MOUSE INTERCEPTION
  // ==========================================
  if (customInputPopup) {
    let popupX = width / 2 - customInputPopup.w / 2;
    let popupY = height / 2 - customInputPopup.h / 2;

    let btnY = popupY + customInputPopup.h - 45 * UI.sf;
    let btnH = 30 * UI.sf;
    let btnW = 80 * UI.sf;

    let okX = popupX + 40 * UI.sf;
    let cancelX = popupX + customInputPopup.w - 120 * UI.sf;

    // Check click targets inside the popup
    if (mouseY > btnY && mouseY < btnY + btnH) {
      if (mouseX > okX && mouseX < okX + btnW) {
        customInputPopup.onConfirm(customInputPopup.text);
        customInputPopup = null;
        triggerGlobalLayoutRefresh();
      } else if (mouseX > cancelX && mouseX < cancelX + btnW) {
        customInputPopup = null;
      }
    }
    return; // Block all other clicks on the workspace while popup is open
  }

  // --- Existing logic continues below ---
  if (editingSlot) {
    let currentVal = editingSlot.block.args[editingSlot.index];
    if (currentVal !== "" && !isNaN(currentVal)) {
      editingSlot.block.args[editingSlot.index] = Number(currentVal);
    }
    editingSlot = null;
  }

  triggerGlobalLayoutRefresh();

  if (activeMenu) {
    let itemH = 30 * UI.sf;
    let menuH = activeMenu.options.length * itemH;
    if (mouseX > activeMenu.x && mouseX < activeMenu.x + activeMenu.w &&
        mouseY > activeMenu.y && mouseY < activeMenu.y + menuH) {
      let clickedIdx = Math.floor((mouseY - activeMenu.y) / itemH);
      let selectedOption = activeMenu.options[clickedIdx];
      activeMenu.block.args[activeMenu.index] = selectedOption;
    }
    activeMenu = null;
    return;
  }

  let tabW = 20 * UI.sf;
  let tabH = 60 * UI.sf;
  let tabX = isToolboxHidden ? 0 : UI.tbW;
  let tabY = height / 2 - tabH / 2;

  if (mouseX >= tabX && mouseX <= tabX + tabW && mouseY >= tabY && mouseY <= tabY + tabH) {
    isToolboxHidden = !isToolboxHidden;
    let defaultTbW = windowWidth * 0.20;
    let shift = isToolboxHidden ? -defaultTbW : defaultTbW;
    UI.tbW += shift;
    UI.wsX += shift;
    UI.wsW -= shift;
    if (mousePressedBlock) mousePressedBlock.x += shift;
    if (keyPressedBlock) keyPressedBlock.x += shift;
    for (let b of workspaceBlocks) b.x += shift;
    return;
  }

  if (appState === 'START') {
    let basicX = width / 2 - 125 * UI.sf;
    let proX   = width / 2 + 125 * UI.sf;
    let btnY   = height * 0.65;
    let halfW  = 100 * UI.sf;
    let halfH  = 25 * UI.sf;

    if (mouseX >= basicX - halfW && mouseX <= basicX + halfW &&
        mouseY >= btnY - halfH   && mouseY <= btnY + halfH) {
      window.top.location.href = 'https://openprocessing.org/@u276376/2944891';
    }
    else if (mouseX >= proX - halfW && mouseX <= proX + halfW &&
             mouseY >= btnY - halfH && mouseY <= btnY + halfH) {
      appState = 'SIMULATION';
    }
    else if (dist(mouseX, mouseY, width - sproutBtnSize - 20, sproutBtnSize + 20) < sproutBtnSize * 1.6 * UI.sf) {
      window.top.location.href = 'https://openprocessing.org/@u276376/2944126';
    }
    return;
  }

  if (appState !== 'START') {
    textSize(18 * UI.sf);
    let recBtnX = UI.wsX + 600 * UI.sf;
    let recBtnY = 720 * UI.sf;
    if (dist(mouseX, mouseY, recBtnX, recBtnY) < sproutBtnSize) {
      wsOffsetX = (UI.wsW / 2) - (setupBlock.w / 2) - 20 * UI.sf;
      wsOffsetY = (height / 2) - (setupBlock.h / 2) - 60 * UI.sf;
      return;
    }
  }

  if (mouseY > 25 * UI.sf && mouseY < 55 * UI.sf) {
    if (mouseX > UI.simX + 20 * UI.sf && mouseX < UI.simX + 100 * UI.sf) {
      isRunning = true;
      runFrameCount = 0;
      for (let v of userVariables) { variableValues[v] = 0; }
      for (let child of setupBlock.children) {
        let setupInterpreter = runInterpreter(child);
        let state = setupInterpreter.next();
        while (!state.done) state = setupInterpreter.next();
      }
      interpreter = runInterpreter(foreverBlock);
      return;
    }

    if (mouseX > UI.simX + 110 * UI.sf && mouseX < UI.simX + 190 * UI.sf) {
      isRunning = false;
      interpreter = null;
      artCanvas.resetMatrix();
      artCanvas.background(255);
      artCanvas.strokeWeight(1);
      if (typeof variableValues !== 'undefined') {
        for (let key in variableValues) {
          if (Array.isArray(variableValues[key])) { variableValues[key] = []; }
        }
      }
      runFrameCount = 0;
      return;
    }

    if (mouseX > UI.simX + 200 * UI.sf && mouseX < UI.simX + 280 * UI.sf) {
      exportToP5();
      return;
    }

    if (mouseX > UI.simX + 290 * UI.sf && mouseX < UI.simX + 370 * UI.sf) {
      let data = workspaceToJSON();
      saveJSON(data, 'my_workspace.json');
      return;
    }

    if (mouseX > UI.simX + 380 * UI.sf && mouseX < UI.simX + 460 * UI.sf) {
      fileInput.elt.click();
      return;
    }

    let labelW = textWidth("SIMULATOR");
    let toggleBtnW = 40 * UI.sf + labelW * 1.5;
    let toggleBtnX = width - 20 * UI.sf - toggleBtnW;
    if (mouseX > toggleBtnX && mouseX < toggleBtnX + toggleBtnW) {
      showImage = !showImage;
      return;
    }
  }

  // --- UPDATED TOOLBOX BLOCK INTERACTION SECTIONS ---
  if (mouseX < UI.tbW && mouseY > 50 * UI.sf) {
    for (let cat of toolboxCategories) {
      if (mouseY > cat.headerY && mouseY < cat.headerY + cat.headerH) {
        cat.isOpen = !cat.isOpen;
        repositionLayout();
        return;
      }

      // CHANGED: Variables Button now triggers custom graphic input popup
      if (cat.isOpen && cat.label === "Variables") {
        let btnY = cat.headerY + cat.headerH + 5 * UI.sf;
        let btnH = 30 * UI.sf;
        if (mouseY > btnY && mouseY < btnY + btnH) {
          customInputPopup = {
            type: 'Variable',
            text: 'myVar',
            w: 320 * UI.sf,
            h: 160 * UI.sf,
            onConfirm: (name) => {
              if (name.trim() !== "") createNewVariable(name.trim());
            }
          };
          return;
        }
      }

      // CHANGED: Arrays Button triggers custom graphic input popup
      if (cat.isOpen && cat.label === "Arrays") {
        let btnY = cat.headerY + cat.headerH + 5 * UI.sf;
        let btnH = 30 * UI.sf;
        if (mouseY > btnY && mouseY < btnY + btnH) {
          customInputPopup = {
            type: 'Array',
            text: 'myArray',
            w: 320 * UI.sf,
            h: 160 * UI.sf,
            onConfirm: (name) => {
              if (name.trim() !== "") createNewArray(name.trim());
            }
          };
          return;
        }
      }

      // CHANGED: Functions Button triggers custom graphic input popup
      if (cat.isOpen && cat.label === "Functions") {
        let btnY = cat.headerY + cat.headerH + 5 * UI.sf;
        let btnH = 30 * UI.sf;
        if (mouseY > btnY && mouseY < btnY + btnH) {
          customInputPopup = {
            type: 'Function',
            text: 'myFunction',
            w: 320 * UI.sf,
            h: 160 * UI.sf,
            onConfirm: (name) => {
              if (name.trim() !== "") createNewFunction(name.trim());
            }
          };
          return;
        }
      }
    }
  }

  // Rest of mousePressed remains identical
  if (isRunning && mousePressedBlock) {
    let simLeft = UI.simX + 20 * UI.sf;
    let simTop = 80 * UI.sf;
    if (mouseX > simLeft && mouseX < simLeft + artCanvas.width &&
        mouseY > simTop && mouseY < simTop + artCanvas.height) {
      let clickHandler = runInterpreter(mousePressedBlock);
      let state = clickHandler.next();
      while (!state.done) state = clickHandler.next();
      return;
    }
  }

  if (mouseButton === LEFT || (touches && touches.length > 0)) {
    let topLevelNodes = [];
    for (let i = workspaceBlocks.length - 1; i >= 0; i--) { topLevelNodes.push(workspaceBlocks[i]); }
    if (keyPressedBlock) topLevelNodes.push(keyPressedBlock);
    if (mousePressedBlock) topLevelNodes.push(mousePressedBlock);
    topLevelNodes.push(foreverBlock);
    topLevelNodes.push(setupBlock);
    topLevelNodes.push(...userFunctions);

    for (let node of topLevelNodes) {
      if (node.checkClick && node.checkClick(mouseX, mouseY)) { return; }
      let hit = getHitTarget(node, mouseX, mouseY);
      if (hit) {
        if (hit.type === 'slot') {
          let slot = hit;
          isRunning = false;
          interpreter = null;
          artCanvas.background(255);
          runFrameCount = 0;
          if (slot.block.hasMenu) {
            const options = BLOCK_MENUS[slot.block.type];
            let pos = slot.block.argPos[slot.index];
            activeMenu = { x: pos.x, y: pos.y + pos.h, w: 120 * UI.sf, options: options, block: slot.block, index: slot.index };
            return;
          } else {
            editingSlot = { block: slot.block, index: slot.index, originalValue: slot.block.args[slot.index], isHighlighted: true };
            return;
          }
        }
        else if (hit.type === 'block') {
          let hitBlock = hit.block;
          const isFunctionHeader = [setupBlock, foreverBlock, mousePressedBlock, keyPressedBlock].includes(hitBlock) || userFunctions.includes(hitBlock);
          if (!isFunctionHeader) {
            draggedBlock = hitBlock;
            let wsIdx = workspaceBlocks.indexOf(hitBlock);
            if (wsIdx > -1) { workspaceBlocks.splice(wsIdx, 1); } else { detachBlock(hitBlock); }
            dragOffsetX = mouseX - hitBlock.x;
            dragOffsetY = mouseY - hitBlock.y;
          }
        }
        return;
      }
    }
  }

  if (mouseX < UI.tbW && mouseY > 50 * UI.sf) {
    for (let cat of toolboxCategories) {
      if (cat.isOpen) {
        let catBlocks = toolbox.filter(b => b.category === cat.label);
        for (let tb of catBlocks) {
          if (mouseX > tb.x && mouseX < tb.x + tb.w && mouseY > tb.y && mouseY < tb.y + tb.h) {
            let newBlock = new Block(tb.type, mouseX, mouseY);
            if (newBlock.type === 'function mousePressed') mousePressedBlock = newBlock;
            if (newBlock.type === 'function keyPressed') keyPressedBlock = newBlock;
            draggedBlock = newBlock;
            dragOffsetX = mouseX - tb.x;
            dragOffsetY = mouseY - tb.y;
            return;
          }
        }
      }
    }
  }

  if (mouseX > UI.wsX && mouseX < UI.simX) { isDraggingWorkspace = true; }
}

function mouseDragged() {
  if (isDraggingWorkspace) {
    wsOffsetX += (mouseX - pmouseX);
    wsOffsetY += (mouseY - pmouseY);
  }
}

function mouseReleased() {
  function isDescendant(root, target) {
    if (root === target) return true;
    
    // Check standard children
    for (let child of root.children) {
      if (isDescendant(child, target)) return true;
    }
    
    // Check argument slots
    for (let arg of root.args) {
      if (arg instanceof Block) {
        if (isDescendant(arg, target)) return true;
      }
    }
    return false;
  }
  isDraggingWorkspace = false;
  
  if (draggedBlock) {
    // 1. DELETE LOGIC: If dropped back over the Toolbox
    if (mouseX < UI.tbW) {
      if (draggedBlock === mousePressedBlock) mousePressedBlock = null;
      if (draggedBlock === keyPressedBlock) keyPressedBlock = null;
      draggedBlock = null;
      return;
    }
let dropped = false;

// 2. WORKSPACE PLACEMENT
if (mouseX > UI.wsX && mouseX < UI.simX) {

  draggedBlock.x = mouseX - dragOffsetX;
  draggedBlock.y = mouseY - dragOffsetY;

  let dropX = draggedBlock.x;
  let dropY = draggedBlock.y;

  let bestTarget = null;
  let closestDistance = Infinity;

  // 3. HANDLE REPORTER / LOGIC BLOCKS (Dropping into circular/hex slots)
  if (draggedBlock.isReporter || draggedBlock.isLogic) {
    let blocksToCheck = [setupBlock, foreverBlock, mousePressedBlock, keyPressedBlock, ...workspaceBlocks, ...userFunctions].filter(Boolean);
    
    // Gather all plausible candidates based on left-edge OR mouse position
    let allCandidateSlots = [];
    for (let b of blocksToCheck) {
      getDropSlotsInRange(b, dropX, dropY, mouseX, mouseY, allCandidateSlots);
    }

    // Tie-breaker loop: pick the candidate closest to the actual mouse cursor
    for (let slot of allCandidateSlots) {
      if (!isDescendant(draggedBlock, slot.block)) {
        const slotReqLogic = ((slot.block.type === 'if' || slot.block.type === 'if/else') && slot.index === 0) || 
                             ['and', 'or', 'not'].includes(slot.block.type);

        if ((draggedBlock.isLogic && slotReqLogic) || (draggedBlock.isReporter && !slotReqLogic)) {
          
          // Calculate distance to the actual cursor position
          let dx = mouseX - slot.x;
          let dy = mouseY - slot.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < closestDistance) {
            closestDistance = dist;
            bestTarget = slot;
          }
        }
      }
    }

    if (bestTarget) {
      bestTarget.block.args[bestTarget.index] = draggedBlock;
      draggedBlock.parent = bestTarget.block;
      dropped = true;
    }
  } 
  
  // 4. HANDLE COMMAND BLOCKS (Dropping into C-shaped containers)
  else {
    let blocksToCheck = [setupBlock, foreverBlock, mousePressedBlock, keyPressedBlock, ...workspaceBlocks, ...userFunctions].filter(Boolean);

    for (let b of blocksToCheck) {
      let container = getDropContainer(b, dropX, dropY);
      
      if (container && !draggedBlock.isFunction) {
        let containerX = container.x || b.x;
        let containerY = container.y || b.y;

        let dx = mouseX - containerX;
        let dy = mouseY - containerY;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < closestDistance) {
          closestDistance = dist;
          bestTarget = container;
        }
      }
    }

    if (bestTarget) {
      insertBlock(bestTarget, draggedBlock, dropY);
      dropped = true;
    }
  }
	triggerGlobalLayoutRefresh();
}

// 5. FINAL PLACEMENT
if (draggedBlock.isFunction) {
  dropped = true; 
}

if (!dropped) {
  workspaceBlocks.push(draggedBlock);
}

draggedBlock = null;
  }
}

function handleRightClick() {
  // 1. Boundary Check
  if (mouseX < UI.wsX) return;
  if (mouseX > UI.simX && appState != 'START') {
    let simLeft = UI.simX + 20 * UI.sf;
    let simTop = 80 * UI.sf;
    let simW = artCanvas.width;
    let simH = artCanvas.height;
    let img = get(simLeft, simTop, simW, simH)
    img.save('myCodeArt', 'png')
  }

  let hit = null;
  
  // 2. Build the search list (Front to Back)
  // We include setup/forever blocks so we can duplicate blocks inside them
  let roots = [...workspaceBlocks].reverse();
  if (keyPressedBlock) roots.push(keyPressedBlock);
  if (mousePressedBlock) roots.push(mousePressedBlock);
  roots.push(foreverBlock, setupBlock);

  for (let root of roots) {
    let target = getHitTarget(root, mouseX, mouseY);
    if (target && target.type === 'block') {
      hit = target.block;
      break;
    }
  }

  // 3. Duplication Logic
  if (hit && !hit.isFunction) {
    let cloned = hit.duplicate();
    
    // Ensure the clone is an independent top-level block
    cloned.parent = null; 
    workspaceBlocks.push(cloned);
    
    // Stop the workspace from panning if the right-click was on the background
    isDraggingWorkspace = false; 
    
    // 4. Set the clone as the active drag target
    draggedBlock = cloned;
    
    // Offset the clone slightly from the mouse so the user sees it's a new block
    dragOffsetX = 10 * UI.sf; 
    dragOffsetY = 10 * UI.sf;
  }
}

function getHitTarget(node, mx, my) {
  // 1. Check elseChildren (they draw on top of the parent)
  if (node.elseChildren) {
    for (let i = node.elseChildren.length - 1; i >= 0; i--) {
      let hit = getHitTarget(node.elseChildren[i], mx, my);
      if (hit) return hit;
    }
  }
  
  // 2. Check standard children
  for (let i = node.children.length - 1; i >= 0; i--) {
    let hit = getHitTarget(node.children[i], mx, my);
    if (hit) return hit;
  }
  
  // 3. Check arguments (blocks inside slots, or the empty slots themselves)
  for (let i = 0; i < node.args.length; i++) {
    let arg = node.args[i];
    let pos = node.argPos[i];

    if (arg instanceof Block) {
      let hit = getHitTarget(arg, mx, my);
      if (hit) return hit;
    } 
    else if (pos) {
      // Small 2px buffer for easier clicking
      if (mx >= pos.x - 2 && mx <= pos.x + pos.w + 2 && 
          my >= pos.y - 2 && my <= pos.y + pos.h + 2) {
        return { type: 'slot', block: node, index: i };
      }
    }
  }
  
  // 4. Finally, check the block header/body itself
  let topH = node.topBarH || node.h;
  if (mx >= node.x && mx <= node.x + node.w && my >= node.y && my <= node.y + topH) {
    return { type: 'block', block: node };
  }
  
  return null;
}

function getDropContainer(node, mx, my) {
  const padding = 25; // Forgiving drop zone padding

  // 1. Check else branches first (layered on top/below in the UI)
  if (node.elseChildren) {
    for (let i = node.elseChildren.length - 1; i >= 0; i--) {
      let hit = getDropContainer(node.elseChildren[i], mx, my);
      if (hit) {
        // If we hit a nested container, check if the user is aiming for its exit/bottom edge
        if (hit.isContainer) {
          const bottomBarH = hit.bottomBarH || 16; // Fallback to 16px if not explicitly defined
          const exitZoneTop = hit.y + hit.h - bottomBarH;
          const exitZoneBottom = hit.y + hit.h + padding;

          if (my >= exitZoneTop && my <= exitZoneBottom) {
            continue; // Bypass this child, let the current parent node claim it
          }
        }
        return hit;
      }
    }
  }

  // 2. Check standard children
  for (let i = node.children.length - 1; i >= 0; i--) {
    let hit = getDropContainer(node.children[i], mx, my);
    if (hit) {
      // If we hit a nested container, check if the user is aiming for its exit/bottom edge
      if (hit.isContainer) {
        const bottomBarH = hit.bottomBarH || 16; // Match this to your UI's bottom flap visual thickness
        const exitZoneTop = hit.y + hit.h - bottomBarH;
        const exitZoneBottom = hit.y + hit.h + padding;

        if (my >= exitZoneTop && my <= exitZoneBottom) {
          continue; // Bypass this child, let the current parent node claim it
        }
      }
      return hit;
    }
  }

  // 3. Check the block itself with a forgiving padding radius
  if (
    node.isContainer && 
    mx >= node.x - padding && 
    mx <= node.x + node.w + padding && 
    my >= node.y - padding && 
    my <= node.y + node.h + padding
  ) {
    return node;
  }
  return null;
}

function getDropSlotsInRange(node, dropX, dropY, mouseX, mouseY, list = []) {
  // 1. Check else branches so nested blocks inside 'else' can receive reporter inputs
  if (node.elseChildren) {
    for (let i = node.elseChildren.length - 1; i >= 0; i--) {
      getDropSlotsInRange(node.elseChildren[i], dropX, dropY, mouseX, mouseY, list);
    }
  }

  // 2. Check standard children
  for (let i = node.children.length - 1; i >= 0; i--) {
    getDropSlotsInRange(node.children[i], dropX, dropY, mouseX, mouseY, list);
  }

  // 3. Check argument slots
  const padding = 25; 
  for (let i = 0; i < node.args.length; i++) {
    if (node.args[i] instanceof Block) {
      getDropSlotsInRange(node.args[i], dropX, dropY, mouseX, mouseY, list);
    } else {
      let pos = node.argPos[i];
      if (pos) {
        // Condition A: Is the slot near the left edge of the dragged block?
        let nearLeftEdge = (dropX >= pos.x - padding && dropX <= pos.x + pos.w + padding &&
                            dropY >= pos.y - padding && dropY <= pos.y + pos.h + padding);
                            
        // Condition B: Is the slot directly near the actual mouse cursor?
        let nearCursor = (mouseX >= pos.x - padding && mouseX <= pos.x + pos.w + padding &&
                          mouseY >= pos.y - padding && mouseY <= pos.y + pos.h + padding);

        // If either is true, it's a plausible target the user might be aiming for
        if (nearLeftEdge || nearCursor) {
          list.push({ 
            block: node, 
            index: i, 
            x: pos.x + pos.w / 2, // center X
            y: pos.y + pos.h / 2  // center Y
          });
        }
      }
    }
  }
  return list;
}

function insertBlock(container, block, my) {
  if (block.isFunction) {
    workspaceBlocks.push(block);
    return;
  }

  block.parent = container;

  if (container.type === 'if/else' && my > container.midBarY) {
    let currentY = container.midBarY + UI.bh;
    for (let i = 0; i < container.elseChildren.length; i++) {
      if (my < currentY + container.elseChildren[i].h / 2) {
        container.elseChildren.splice(i, 0, block);
        return;
      }
      currentY += container.elseChildren[i].h;
    }
    container.elseChildren.push(block);
  } 
  else {
    let currentY = container.y + container.topBarH;
    for (let i = 0; i < container.children.length; i++) {
      if (my < currentY + container.children[i].h / 2) {
        container.children.splice(i, 0, block);
        return;
      }
      currentY += container.children[i].h;
    }
    container.children.push(block);
  }
}

function detachBlock(block) {
  if (!block.parent) return;
  let p = block.parent;
  
  let cIdx = p.children.indexOf(block);
  if (cIdx > -1) {
    p.children.splice(cIdx, 1);
  } 
  else if (p.elseChildren) {
    let eIdx = p.elseChildren.indexOf(block);
    if (eIdx > -1) p.elseChildren.splice(eIdx, 1);
  }
  
  let aIdx = p.args.indexOf(block);
  if (aIdx > -1) p.args[aIdx] = 0;
  
  block.parent = null;
}

function triggerGlobalLayoutRefresh() {
  // 1. UPDATE REGISTRY FIRST
  // Gather all top-level blocks and function definitions
  const allWorkspaceContainers = [
    setupBlock, foreverBlock, mousePressedBlock, keyPressedBlock, 
    ...workspaceBlocks, ...userFunctions
  ].filter(Boolean);

  // Initial layout pass to ensure customFunctions registry is populated 
  for (let b of allWorkspaceContainers) {
    b.layout(b.x, b.y); 
  }

  // 2. GATHER FUNCTION DEFINITIONS
  // Create a dictionary of how many arguments each custom function currently has
  const functionArgCounts = {};
  for (let b of allWorkspaceContainers) {
    if (b.isFunction) {
      // e.g., maps "function myShape" -> 2 (if it has 2 argument slots)
      functionArgCounts[b.type] = b.args.length; 
    }
  }

  // 3. SYNCHRONIZE CALL BLOCKS
  // Recursive helper function to find and update 'call_' blocks anywhere in the tree
  function syncCallBlocks(block) {
    if (block.type.startsWith('call_')) {
      // Get the name of the original function definition
      const targetFuncName = block.type.replace('call_', 'function ');
      const requiredArgs = functionArgCounts[targetFuncName];
      
      if (requiredArgs !== undefined) {
        // Add new slots if the call block has fewer arguments than the definition
        while (block.args.length < requiredArgs) {
          block.args.push(1); // Default value for new slots
        }
        // Remove excess slots if the call block has more arguments than the definition
        while (block.args.length > requiredArgs) {
          block.args.pop();
        }
      }
    }

    // Traverse standard children
    for (let child of block.children) {
      syncCallBlocks(child);
    }
    // Traverse else branches (for if/else blocks)
    if (block.elseChildren) {
      for (let child of block.elseChildren) {
        syncCallBlocks(child);
      }
    }
    // Traverse blocks nested inside arguments (reporter blocks)
    for (let arg of block.args) {
      if (arg instanceof Block) {
        syncCallBlocks(arg);
      }
    }
  }

  // 4. APPLY SYNCHRONIZATION AND RECALCULATE LAYOUT
  for (let b of allWorkspaceContainers) {
    syncCallBlocks(b);
    // Recalculate layout after args have been updated
    b.layout(b.x, b.y); 
  }

  // 5. UPDATE TOOLBOX BLOCKS
  // Ensure the call blocks sitting in the toolbox are updated too
  if (typeof toolbox !== 'undefined') {
    for (let b of toolbox) {
      syncCallBlocks(b);
    }
  }
  
  // 6. FINALIZE UI REFRESH
  if (typeof repositionLayout === 'function') {
    repositionLayout();
  }
}

function keyPressed() {
  // ==========================================
  // NEW: GRAPHIC INPUT POPUP KEY PRE-HANDLING
  // ==========================================
  if (customInputPopup) {
    if (keyCode === ENTER) {
      customInputPopup.onConfirm(customInputPopup.text);
      customInputPopup = null;
      triggerGlobalLayoutRefresh();
    } else if (keyCode === ESCAPE) {
      customInputPopup = null;
    } else if (keyCode === BACKSPACE) {
      customInputPopup.text = customInputPopup.text.slice(0, -1);
    }
    return;
  }

  // --- Existing slot handler logic ---
  if (!editingSlot) return;

  if (keyCode === ENTER) {
    let currentStr = String(editingSlot.block.args[editingSlot.index]);
    if (currentStr !== "" && !isNaN(currentStr)) {
      editingSlot.block.args[editingSlot.index] = Number(currentStr);
    }
    editingSlot = null;
    return;
  }

  if (keyCode === ESCAPE) {
    editingSlot.block.args[editingSlot.index] = editingSlot.originalValue;
    editingSlot = null;
    return;
  }

  if (editingSlot.isHighlighted) {
    if (keyCode === BACKSPACE || keyCode === DELETE) {
      editingSlot.block.args[editingSlot.index] = "";
      editingSlot.isHighlighted = false;
    }
    return;
  }

  if (keyCode === BACKSPACE) {
    let currentStr = String(editingSlot.block.args[editingSlot.index]);
    editingSlot.block.args[editingSlot.index] = currentStr.slice(0, -1);
  }
  triggerGlobalLayoutRefresh();
}

function keyTyped() {
  // ==========================================
  // NEW: GRAPHIC INPUT POPUP CHARACTER APPEND
  // ==========================================
  if (customInputPopup) {
    if (keyCode === ENTER || keyCode === ESCAPE || keyCode === BACKSPACE) return false;
    let inputKey = (key === ' ') ? ' ' : key;
    customInputPopup.text += inputKey;
    return false; // Intercept text events
  }

  // --- Existing logic ---
  if (!editingSlot) return;
  if (keyCode === ENTER || keyCode === ESCAPE || keyCode === BACKSPACE) return false;

  let currentStr = String(editingSlot.block.args[editingSlot.index]);
  let inputKey = (key === ' ') ? ' ' : key;

  if (editingSlot.isHighlighted) {
    editingSlot.block.args[editingSlot.index] = inputKey;
    editingSlot.isHighlighted = false;
  } else {
    editingSlot.block.args[editingSlot.index] = currentStr + inputKey;
  }

  return false; 
}