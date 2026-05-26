function handleFile(file) {
  // Check the subtype or if the filename ends in .json
  if (file.subtype === 'json' || file.name.endsWith('.json')) {
    loadWorkspaceFromJSON(file.data);
  }
}

// --- EXPORT, LOAD, SAVE ---
function workspaceToJSON() {
  const project = {
    setupChildren: setupBlock.children.map(b => b.serialize()),
    foreverChildren: foreverBlock.children.map(b => b.serialize()),
    mousePressed: mousePressedBlock ? mousePressedBlock.serialize() : null,
    keyPressed: keyPressedBlock ? keyPressedBlock.serialize() : null,
    looseBlocks: workspaceBlocks.map(b => b.serialize())
  };
  return project;
}

function loadWorkspaceFromJSON(data) {
  // 1. Get the incoming variables from the JSON
  let incomingVariables = data.variables || [];
  let varCat = toolboxCategories.find(c => c.label === "Variables");

  incomingVariables.forEach(v => {
    // Only add to session variables if it doesn't already exist

    // Append blocks to the Variables category without duplicates,
    // preserving any pre-existing or default blocks.
    if (varCat) {
      if (!varCat.blocks.includes(v)) varCat.blocks.push(v);
    }
  });

  // 2. Rebuild the main fixed containers
  setupBlock.children = data.setupChildren.map(d => Block.fromData(d));
  setupBlock.children.forEach(c => c.parent = setupBlock);

  foreverBlock.children = data.foreverChildren.map(d => Block.fromData(d));
  foreverBlock.children.forEach(c => c.parent = foreverBlock);

  // 3. Rebuild event blocks
  mousePressedBlock = data.mousePressed ? Block.fromData(data.mousePressed) : null;
  keyPressedBlock = data.keyPressed ? Block.fromData(data.keyPressed) : null;

  // 4. Rebuild loose workspace blocks
  workspaceBlocks = data.looseBlocks.map(d => Block.fromData(d));

  // 5. Refresh the toolbox so it dynamically spawns instances for the updated block types
  refreshToolbox();
}

function rehydrateBlocks(parsedData, parentBlock = null) {
  let reconstructedBlocks = [];

  for (let data of parsedData) {
    // 1. Create a true instance of your Block class
    let newBlock = new Block(data.type, data.x, data.y);
    
    // 2. Restore standard properties
    newBlock.w = data.w;
    newBlock.h = data.h;
    newBlock.args = data.args || [];
    newBlock.argPos = data.argPos || [];
    newBlock.parent = parentBlock;

    // 3. Recursively restore children arrays
    if (data.children && data.children.length > 0) {
      newBlock.children = rehydrateBlocks(data.children, newBlock);
    }
    if (data.elseChildren && data.elseChildren.length > 0) {
      newBlock.elseChildren = rehydrateBlocks(data.elseChildren, newBlock);
    }

    reconstructedBlocks.push(newBlock);
  }

  return reconstructedBlocks;
}