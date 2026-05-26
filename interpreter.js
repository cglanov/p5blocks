function* runInterpreter(node) {
  angleMode(DEGREES);
  artCanvas.angleMode(DEGREES);
  if (!node) return;

  const resolve = (val) => {
    if (val instanceof Block) {
      // 1. Core Reporters
      if (val.type === 'pickRandom') return random(resolve(val.args[0]), resolve(val.args[1]));

      if (val.type === 'mouseX') {
        return mouseX - (UI.simX + 20 * UI.sf);
      }
      if (val.type === 'mouseY') {
        return mouseY - (80 * UI.sf);
      }
      if (val.type === 'pmouseX') {
        return pmouseX - (UI.simX + 20 * UI.sf);
      }
      if (val.type === 'pmouseY') {
        return pmouseY - (80 * UI.sf);
      }
      if (val.type === 'width') return artCanvas.width;
      if (val.type === 'height') return artCanvas.height;
      if (val.type === 'frameCount') return runFrameCount;
      if (val.type === 'sin') return sin(resolve(val.args[0]));
      if (val.type === 'cos') return cos(resolve(val.args[0]));
      if (val.type === 'noise') return noise(resolve(val.args[0]));
      if (val.type === 'map') return map(resolve(val.args[0]), resolve(val.args[1]), resolve(val.args[2]), resolve(val.args[3]), resolve(val.args[4]));

      // 2. Math & Logic Operators
      if (val.type === 'dist') return dist(resolve(val.args[0]), resolve(val.args[1]), resolve(val.args[2]), resolve(val.args[3]));
      if (val.type === 'add') return resolve(val.args[0]) + resolve(val.args[1]);
      if (val.type === 'round') return round(resolve(val.args[0]));
      if (val.type === 'sub') return resolve(val.args[0]) - resolve(val.args[1]);
      if (val.type === 'mul') return resolve(val.args[0]) * resolve(val.args[1]);
      if (val.type === 'div') return resolve(val.args[0]) / resolve(val.args[1]);
      if (val.type === 'remainder') return resolve(val.args[0]) % resolve(val.args[1]);
      if (val.type === '>')   return resolve(val.args[0]) > resolve(val.args[1]);
      if (val.type === '<')   return resolve(val.args[0]) < resolve(val.args[1]);
      if (val.type === '=')   return resolve(val.args[0]) === resolve(val.args[1]);
      if (val.type === 'and') return resolve(val.args[0]) && resolve(val.args[1]);
      if (val.type === 'or')  return resolve(val.args[0]) || resolve(val.args[1]);
      if (val.type === 'not') return !resolve(val.args[0]);

      // 3. Custom Variable Reporter
      if (userVariables.includes(val.type)) {
        return variableValues[val.type] || 0;
      }
      if (val.type.startsWith('array_get_')) {
        let arrayName = val.type.split('_')[2];
        let arr = variableValues[arrayName];
        let idx = Math.floor(resolve(val.args[0]));
        return (Array.isArray(arr) && arr[idx] !== undefined) ? arr[idx] : 0;
      } 
      // --- FIXED: RESOLVE ARRAY LENGTH ---
      else if (val.type.startsWith('array_length')) {
        // Safely strip the prefix whether an underscore exists or not
        let arrayName = val.type.replace('array_length_', '').replace('array_length', '');
        
        // If it's the generic, unassigned "array length" block, return 0
        if (!arrayName) return 0;
        
        let arr = variableValues[arrayName];
        return Array.isArray(arr) ? arr.length : 0;
      }
    }
  //  return val;

	  // 2. NEW: Handle raw strings acting as variable names
  if (typeof val === 'string') {
    let cleanString = val.trim();
    
    // Check if this string matches a parameter/variable we currently have saved
    if (variableValues[cleanString] !== undefined) {
      return variableValues[cleanString]; // Return the stored value (e.g., 100)
    }
  }

  // 3. If it's not a block, and not a known variable, just return the raw value
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
          
    case 'push/pop':
      artCanvas.push();
      for (let child of node.children) {
        yield* runInterpreter(child);
      }
      artCanvas.pop();
      break;

    // --- Shapes ---
    case 'beginShape':
      artCanvas.beginShape();
      for (let child of node.children) {
        yield* runInterpreter(child);
      }
      artCanvas.endShape();
      break;

    case 'point':    artCanvas.point(resolve(node.args[0]), resolve(node.args[1])); break;  
    case 'vertex':   artCanvas.vertex(resolve(node.args[0]), resolve(node.args[1])); break; 
    case 'circle':   artCanvas.circle(resolve(node.args[0]), resolve(node.args[1]), resolve(node.args[2])); break;
    case 'ellipse':  artCanvas.ellipse(resolve(node.args[0]), resolve(node.args[1]), resolve(node.args[2]), resolve(node.args[3])); break;
    case 'rect':     artCanvas.rect(resolve(node.args[0]), resolve(node.args[1]), resolve(node.args[2]), resolve(node.args[3])); break;
    case 'line':     artCanvas.line(resolve(node.args[0]), resolve(node.args[1]), resolve(node.args[2]), resolve(node.args[3])); break;
    case 'arc':      artCanvas.arc(resolve(node.args[0]), resolve(node.args[1]), resolve(node.args[2]), resolve(node.args[3]), resolve(node.args[4]), resolve(node.args[5]), OPEN); break;
    case 'triangle': artCanvas.triangle(resolve(node.args[0]), resolve(node.args[1]), resolve(node.args[2]), resolve(node.args[3]), resolve(node.args[4]), resolve(node.args[5])); break;
    case 'text':     artCanvas.text(resolve(node.args[0]), resolve(node.args[1]), resolve(node.args[2])); break;
	 case 'translate': artCanvas.translate(resolve(node.args[0]), resolve(node.args[1])); break;
    case 'rotate': artCanvas.rotate(resolve(node.args[0])); break;
    // --- Style ---
    case 'filter': 
      let filterType = resolve(node.args[0]);
      artCanvas.filter(window[filterType] || filterType); 
      break;
    case 'rectMode': 
      let rectModeType = resolve(node.args[0]);
      artCanvas.rectMode(window[rectModeType] || rectModeType); 
      break;

    case 'colorMode': 
      let modeStr = resolve(node.args[0]); // 'RGB' or 'HSB'
      let modeConst = window[modeStr] || modeStr;
      
      artCanvas.colorMode(modeConst, 255, 255, 255, 255); 
      break;
      
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
    case 'noStroke': artCanvas.noStroke(); break;
    case 'noFill': artCanvas.noFill(); break;
    case 'textSize':   artCanvas.textSize(resolve(node.args[0])); break;

    // --- Custom Block Actions ---
  default:
        if (node.type.startsWith('function ')) {
          // 1. Custom function definitions shouldn't execute their contents inline;
          //    they are only executed when explicitly invoked by a call block.
          break;
        }
        else if (node.type.startsWith('call')) {
          // 2. Extract the custom function's name (supporting both 'call name' and 'call_name')
          let funcName = node.type.startsWith('call ')
                         ? node.type.substring(5)
                         : node.type.replace('call_', '').replace('call', '');

          // 3. Look up the matching function definition using the global helper function.
          //    This ensures we check both userFunctions and workspaceBlocks.
          let targetBlock = typeof findFunctionDefinition === 'function' 
                            ? findFunctionDefinition(funcName) 
                            : null;

          // 4. Run the interpreter through each child block of the custom function routine
          if (targetBlock && targetBlock.children) {
            
            // 5. Map call block arguments to the definition's parameter names
            let previousScope = {}; 
            if (targetBlock.args && node.args) {
              for (let i = 0; i < targetBlock.args.length; i++) {
                let paramName = String(targetBlock.args[i]);
                
                // Save previous variable values in case of recursive calls or shadowing
                if (typeof variableValues !== 'undefined' && variableValues.hasOwnProperty(paramName)) {
                   previousScope[paramName] = variableValues[paramName];
                }
                
                // Make sure the interpreter knows this is a valid user variable
                if (typeof userVariables !== 'undefined' && !userVariables.includes(paramName)) {
                   userVariables.push(paramName);
                }
                
                // Resolve the argument value and assign it to the parameter variable
                let argValue = i < node.args.length ? resolve(node.args[i]) : 0;
                if (typeof variableValues !== 'undefined') {
                    variableValues[paramName] = argValue;
                }
              }
            }

            // Execute the contents of the custom function
            for (let child of targetBlock.children) {
              yield* runInterpreter(child);
            }
            
            // 6. Restore previous variable values so variables don't leak out of the function scope
            if (typeof variableValues !== 'undefined') {
              for (let paramName in previousScope) {
                  variableValues[paramName] = previousScope[paramName];
              }
            }
          }
        } else if (node.type.startsWith('set_')) {
          let varName = node.type.split('_')[1];
          variableValues[varName] = resolve(node.args[0]);
        } else if (node.type.startsWith('change_')) {
          let varName = node.type.split('_')[1];
          let currentVal = variableValues[varName] || 0;
          variableValues[varName] = currentVal + resolve(node.args[0]);
        } else if (node.type.startsWith('array_set_')) {
          let arrayName = node.type.split('_')[2];
          let rawVal = resolve(node.args[0]);
          if (typeof rawVal === 'string') {
            variableValues[arrayName] = rawVal.split(',').map(item => {
              let trimmed = item.trim();
              return isNaN(trimmed) ? trimmed : Number(trimmed);
            });
          } else {
            variableValues[arrayName] = [rawVal];
          }
        } else if (node.type.startsWith('array_push_')) {
          let arrayName = node.type.split('_')[2];
          let valToPush = resolve(node.args[0]);
          if (!Array.isArray(variableValues[arrayName])) {
            variableValues[arrayName] = [];
          }
          variableValues[arrayName].push(valToPush);
        } else if (node.type.startsWith('array_change_')) {
          let arrayName = node.type.split('_')[2];

          if (!Array.isArray(variableValues[arrayName])) {
            variableValues[arrayName] = [];
          }

          let arr = variableValues[arrayName];
          let idx = Math.floor(resolve(node.args[0]));
          let valToChange = resolve(node.args[1]);

          let currentVal = arr[idx] !== undefined ? arr[idx] : 0;
          arr[idx] = currentVal + valToChange;
        }
        break;
  }
  yield; 
}