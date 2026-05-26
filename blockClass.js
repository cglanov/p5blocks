class Block {
  constructor(type, x = 0, y = 0) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.w = 0;
    this.h = 0;
    this.children = [];
    this.elseChildren = [];
    this.args = [];
    this.argPos = [];
    this.parent = null;
    this.topBarH = 0;
    this.midBarY = 0;
    this.icon = null;

    this.initValues(type);
    this.setupVisuals(type);
    this.initHints(type);
  }

  setPosition(x, y) {
    this.layout(x, y);
  }

  get isReporter() {
    const standardReporters = [
      'pickRandom', 'mouseX', 'mouseY', 'pmouseX', 'pmouseY', 'width', 'height',
      'sin', 'cos', 'noise', 'frameCount', 'add', 'sub', 'mul', 'div', 'map', 'dist', 'round', 'remainder'
    ];
    return standardReporters.includes(this.type) || userVariables.includes(this.type) || this.type.startsWith('array_get_') || this.type.startsWith('array_length');
  }

  get hasMenu() {
    return BLOCK_MENUS.hasOwnProperty(this.type);
  }

  get isLogic() {
    return ['>', '<', '=', 'and', 'or', 'not'].includes(this.type);
  }

  get isContainer() {
    const standardContainers = ['function draw', 'function setup', 'function mousePressed', 'function keyPressed', 'repeat', 'if', 'if/else', 'beginShape', 'push/pop'];
    return standardContainers.includes(this.type) || this.type.startsWith('function ');
  }

  get isFunction() {
    const standardFunctions = ['function draw', 'function setup', 'function mousePressed', 'function keyPressed'];
    return standardFunctions.includes(this.type) || this.type.startsWith('function ');
  }

  get isInfix() {
    return ['add', 'sub', 'mul', 'div', '>', '<', '=', 'and', 'or', 'round'].includes(this.type);
  }

  initValues(type) {
    if (type === 'repeat') this.args = [10];
    else if (type === 'dist') this.args = [0, 0, 100, 100];
    else if (type === 'if' || type === 'if/else') this.args = [1];
    else if (type === 'point') this.args = [100, 100];
    else if (type === 'circle') this.args = [100, 100, 50];
    else if (type === 'ellipse') this.args = [50, 50, 100, 80];
    else if (type === 'arc') this.args = [100, 100, 50, 50, 0, 180];
    else if (type === 'line') this.args = [0, 0, 200, 200];
    else if (type === 'rect') this.args = [50, 50, 100, 80];
    else if (type === 'triangle') this.args = [100, 20, 20, 180, 180, 180];
    else if (type === 'text') this.args = ['blank', 20, 20];
    else if (['fill', 'stroke', 'background'].includes(type)) this.args = [255, 255, 255];
    else if (['textSize', 'strokeWeight', 'not', 'round'].includes(type)) this.args = [20];
    else if (type === 'pickRandom') this.args = [0, 255];
    else if (type === 'map') this.args = [50, -1, 1, 0, 255];
    else if (this.isInfix) this.args = [1, 1];
  }

  setupVisuals(type) {
    const drawCol = '#4CAF50', styleCol = '#FF5722', repoCol = '#8E24AA',
    loopCol = '#FF8F00', funcCol = '#C0C000', mathCol = '#03A9F4', logicCol = '#4472C4', arrayCol = '#FFAAAA';

    const labels = {
      'function draw': 'function draw', 'function setup': 'function setup',
      'repeat': 'repeat', 'if': 'if', 'if/else': 'if', 'push/pop' : 'push', 'point' : 'point',
      'circle': 'circle', 'ellipse' : 'ellipse', 'arc': 'arc', 'line': 'line', 'rect': 'rect', 'triangle': 'triangle', 'text': 'text',  'beginShape' : 'beginShape', 'vertex' : 'vertex', 'rectMode' : 'rectMode',
      'background': 'background', 'fill': 'fill', 'stroke': 'stroke', 'strokeWeight': 'strokeWeight', 'textSize': 'textSize', 'filter' : 'filter', 'colorMode' : 'colorMode', 'noStroke' : 'noStroke', 'noFill' : 'noFill',
      'pickRandom': 'random', 'mouseX': 'mouseX', 'mouseY': 'mouseY', 'pmouseX': 'pMouseX', 'pmouseY': 'pMouseY',
      'width': 'width', 'height': 'height', 'frameCount': 'frameCount', 'sin': 'sin', 'cos': 'cos', 'noise': 'noise',
      'add': '+', 'sub': '-', 'mul': '×', 'div': '÷', 'map': 'map', 'dist' : 'dist', 'round' : 'round', 'remainder' : 'remainder',
      '>': '>', '<': '<', '=': '=', 'and': 'and', 'or': 'or', 'not': 'not',
      'function mousePressed': 'function mousePressed', 'function keyPressed': 'function keyPressed'
    };

    const icons = {
      'point': window.pointIcon,
      'text': window.textIcon,
      'line': window.lineIcon,
      'rect': window.rectangleIcon,
      'triangle': window.triangleIcon,
      'ellipse': window.ellipseIcon,
      'circle': window.circleIcon,
      'arc': window.arcIcon
    };

    this.label = labels[type] || type;
    this.icon = icons[type] || null;

    if (this.isFunction) {
      this.col = funcCol;
    } else if (type === 'if' || type === 'if/else' || type === 'repeat' || this.type === 'push/pop') {
      this.col = loopCol;
    } else if (this.isLogic) {
      this.col = logicCol;
    } else if (['fill', 'stroke', 'background', 'strokeWeight', 'textSize', 'filter', 'colorMode', 'noFill', 'noStroke'].includes(type)) {
      this.col = styleCol;
    } else if (['point', 'circle', 'ellipse', 'rect', 'line', 'arc', 'triangle', 'text'].includes(type)) {
      this.col = drawCol;
    } else if (['add', 'sub', 'mul', 'div', 'map', 'dist', 'pickRandom', 'remainder'].includes(type)) {
      this.col = mathCol;
    } else {
      this.col = repoCol;
    }
  }

  layout(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.plusIconRect = null;
    this.minusIconRect = null;

    textSize(UI.ts);
    textStyle(BOLD);

    const padding = (this.isLogic ? 15 : (this.isReporter ? 16 : 10)) * UI.sf;
    const isCustomFunction = this.type.startsWith('function ') && !['function draw', 'function setup', 'function mousePressed', 'function keyPressed'].includes(this.type);

    if (isCustomFunction) {
      Block.customFunctions = Block.customFunctions || {};
      Block.customFunctions[this.type] = this;
    }

    const labelW = textWidth(this.label + '  ');
    const iconW = this.icon ? 28 * UI.sf : 0;

    const headerWidth = Math.max(labelW, iconW);
    let currentX = startX + padding + headerWidth;
    let maxArgH = 20 * UI.sf;

    const getSlotW = (val, minW) => {
      let txtW = textWidth(String(val));
      return Math.max(minW, txtW + 16 * UI.sf);
    };

    // --- PASS 1: Calculate Child Dimensions ---
    for (let arg of this.args) {
      if (arg instanceof Block) {
        arg.layout(0, 0);
        maxArgH = Math.max(maxArgH, arg.h);
      }
    }

    let hintPadding = this.argHints.length > 0 ? 5 * UI.sf : 0;
    let stackedContentH = this.icon ? (UI.ts + 32 * UI.sf) : UI.bh;
    this.topBarH = Math.max(stackedContentH, maxArgH + 12 * UI.sf) + hintPadding;

    this.argPos = [];
    const getArgY = (h) => startY + (this.topBarH - hintPadding - h) / 2;

    // --- PASS 2: Assign Positions ---
    if ((this.type === 'map' || this.type === 'dist') && this.args.length > 0) {
      this.labelPositions = [];
      for (let i = 0; i < this.args.length; i++) {
        let arg = this.args[i];
        let argW = (arg instanceof Block) ? arg.w : getSlotW(arg, 38 * UI.sf);
        let argY = (arg instanceof Block) ? getArgY(arg.h) : getArgY(20 * UI.sf);

        if (arg instanceof Block) arg.setPosition(currentX, argY);

        this.argPos.push({
          x: currentX, y: argY, w: argW,
          h: (arg instanceof Block ? arg.h : 20 * UI.sf),
          block: arg instanceof Block ? arg : null
        });

        currentX += argW + 6 * UI.sf;
        if (this.type === 'dist' && i === 1) {
          this.labelPositions.push({
            txt: ",", x: currentX, y: startY + (this.topBarH - hintPadding) / 2
          });
          currentX += textWidth(",") + 8 * UI.sf;
        }
      }
    }
    else if (this.isInfix && this.args.length === 2) {
      const isMath = ['add', 'sub', 'mul', 'div'].includes(this.type);
      const isComparison = ['>', '<', '='].includes(this.type);

      let sideGap = isMath ? 6 * UI.sf : (isComparison ? 12 * UI.sf : padding);
      let internalGap = (isMath || isComparison) ? 4 * UI.sf : 10 * UI.sf;

      let p0_x = startX + sideGap;
      let arg0 = this.args[0];
      let arg0W = (arg0 instanceof Block) ? arg0.w : getSlotW(arg0, 40 * UI.sf);
      let arg0Y = (arg0 instanceof Block) ? getArgY(arg0.h) : getArgY(20 * UI.sf);

      this.argPos.push({
        x: p0_x, y: arg0Y, w: arg0W,
        h: (arg0 instanceof Block ? arg0.h : 20 * UI.sf),
        block: arg0 instanceof Block ? arg0 : null
      });

      if (arg0 instanceof Block) arg0.setPosition(p0_x, arg0Y);

      let opX = p0_x + arg0W + internalGap;
      let arg1X = opX + textWidth(this.label) + internalGap;

      let arg1 = this.args[1];
      let arg1W = (arg1 instanceof Block) ? arg1.w : getSlotW(arg1, 40 * UI.sf);
      let arg1Y = (arg1 instanceof Block) ? getArgY(arg1.h) : getArgY(20 * UI.sf);

      this.argPos.push({
        x: arg1X, y: arg1Y, w: arg1W,
        h: (arg1 instanceof Block ? arg1.h : 20 * UI.sf),
        block: arg1 instanceof Block ? arg1 : null
      });

      if (arg1 instanceof Block) arg1.setPosition(arg1X, arg1Y);

      currentX = arg1X + arg1W + sideGap;
    }
    else {
      // Standard parameters step
      for (let i = 0; i < this.args.length; i++) {
        let arg = this.args[i];
        let argW = (arg instanceof Block) ? arg.w : getSlotW(arg, 38 * UI.sf);
        let argY = (arg instanceof Block) ? getArgY(arg.h) : getArgY(20 * UI.sf);

        if (arg instanceof Block) arg.setPosition(currentX, argY);

        this.argPos.push({
          x: currentX, y: argY, w: argW,
          h: (arg instanceof Block ? arg.h : 20 * UI.sf),
          block: arg instanceof Block ? arg : null
        });

        currentX += argW + (i === this.args.length - 1 ? 0 : 5 * UI.sf);
      }

      if (isCustomFunction) {
        currentX += 6 * UI.sf;

        if (this.args.length >= 1) {
          let minusW = textWidth('-') + 14 * UI.sf;
          this.minusIconRect = {
            x: currentX, y: startY, w: minusW, h: this.topBarH
          };
          currentX += minusW + 4 * UI.sf;
        }

        let plusW = textWidth('+') + 14 * UI.sf;
        this.plusIconRect = {
          x: currentX, y: startY, w: plusW, h: this.topBarH
        };
        currentX += plusW;
      }

      currentX += padding;
    }

    if (this.type.startsWith('array_get_') || this.type.startsWith('array_push_')) {
      let closingTxt = this.type.startsWith('array_get_') ? ']' : ')';
      this.labelPositions = [{
        txt: closingTxt, x: currentX - padding + 2 * UI.sf, y: startY + (this.topBarH - hintPadding) / 2
      }];
      currentX += textWidth(closingTxt) + 2 * UI.sf;
    }

    let calculatedWidth = currentX - startX;
    this.w = (this.isReporter || this.isLogic) ? calculatedWidth : Math.max(UI.bw, calculatedWidth);

    if (this.isContainer) {
      let cy = startY + this.topBarH;
      for (let c of this.children) {
        c.layout(startX + UI.ind, cy);
        cy += c.h;
      }
      if (this.children.length === 0) cy += 10 * UI.sf;

      if (this.type === 'if/else') {
        this.midBarY = cy;
        cy += UI.bh;
        for (let c of this.elseChildren) {
          c.layout(startX + UI.ind, cy);
          cy += c.h;
        }
        if (this.elseChildren.length === 0) cy += 10 * UI.sf;
      }

      let footerH = (this.type === 'beginShape' || this.type === 'push/pop') ? UI.bh : 8 * UI.sf;
      this.h = (cy - startY) + footerH;
    } else {
      this.h = this.topBarH;
    }
  }

  draw() {
    if (['fill', 'stroke', 'background'].includes(this.type)) {
      this.updateColorHints();
    }
    push();
    fill(this.col);
    stroke(0);
    strokeWeight(1 * UI.sf);

    let topH = this.topBarH;
    let bottomCapH = (this.type === 'beginShape' || this.type === 'push/pop') ? this.topBarH : 8 * UI.sf;
    let hintPadding = this.argHints.length > 0 ? 15 * UI.sf : 0;

    if (this.isLogic) {
      this.drawLogicShape(this.x, this.y, this.w, this.h);
    } else if (this.isReporter) {
      rect(this.x, this.y, this.w, this.h, this.h / 2);
    } else if (this.isContainer) {
      rect(this.x, this.y, this.w, topH, UI.rad, UI.rad, 0, 0);          
      rect(this.x, this.y + topH, UI.ind, this.h - topH - bottomCapH);   

      if (this.type === 'if/else') {
        rect(this.x, this.midBarY, this.w, UI.bh);                                               
        fill(255); noStroke(); textStyle(BOLD); textAlign(LEFT, CENTER);
        text("else", this.x + 8 * UI.sf, this.midBarY + UI.bh / 2);
        fill(this.col); stroke(0);
      }
      fill(this.col); stroke(0);
      rect(this.x, this.y + this.h - bottomCapH, this.w, bottomCapH, 0, 0, UI.rad, UI.rad);
      

      noStroke(); fill(this.col);
      rect(this.x + 1, this.y + topH - 2, UI.ind - 2, 5);
      if (this.type === 'if/else') {
        rect(this.x + 1, this.midBarY - 2, UI.ind - 2, 5);
        rect(this.x + 1, this.midBarY + UI.bh - 3, UI.ind - 2, 6);
      }
      rect(this.x + 1, this.y + this.h - bottomCapH - 2, UI.ind - 2, 5);
      stroke(0);
    } else {
      rect(this.x, this.y, this.w, this.h, UI.rad);
    }

    // Main labels fill rule
    fill(255); noStroke(); textSize(UI.ts); textStyle(BOLD);

    let labelAreaX = this.x + (this.isLogic ? 15 : (this.isReporter ? 16 : 10)) * UI.sf;
    let labelAreaW = Math.max(textWidth(this.label), this.icon ? 28 * UI.sf : 0);
    let contentY = this.y + (topH - hintPadding) / 1.5;

    if (this.isInfix && this.argPos.length === 2) {
      let p0 = this.argPos[0], p1 = this.argPos[1];
      textAlign(CENTER, CENTER);
      if (['+', '-', '×', '÷'].includes(this.label)) {
        text(this.label, p0.x + p0.w + (p1.x - (p0.x + p0.w)) / 2, contentY - this.h / 8);
      } else {
        text(this.label, p0.x + p0.w + (p1.x - (p0.x + p0.w)) / 2, contentY);
      }
    } else {
      if (this.icon) {
        textAlign(CENTER, CENTER);
        let centerX = labelAreaX + labelAreaW / 2;
        text(this.label, centerX, contentY - 12 * UI.sf);
        imageMode(CENTER);
        image(this.icon, centerX, contentY + 10 * UI.sf, 28 * UI.sf, 28 * UI.sf);
      } else {
        textAlign(LEFT, CENTER);
        text(this.label, labelAreaX, contentY);
      }
    }

    if (this.labelPositions) {
      fill(255); noStroke();
      textAlign(LEFT, CENTER);
      for (let lp of this.labelPositions) text(lp.txt, lp.x, lp.y);
    }

    // --- 3. DRAW ARGUMENTS & NESTED CONTENT ---
    for (let i = 0; i < this.args.length; i++) {
      let arg = this.args[i], pos = this.argPos[i];
      if (!pos) continue;

      textSize(UI.ts);

      if (arg instanceof Block) {
        arg.draw();
      } else {
        fill(255); stroke(0); strokeWeight(1 * UI.sf);

        let isLogicInput = ['if', 'if/else', 'not', 'and', 'or'].includes(this.type);

        if (isLogicInput) {
          this.drawLogicShape(pos.x, pos.y, pos.w, pos.h);
        } else {
          rect(pos.x, pos.y, pos.w, pos.h, 10 * UI.sf);
        }

        // Render text inside arg slots as fill(0) with noStroke()
        fill(0); 
        noStroke(); 
        textStyle(BOLD); 
        textAlign(CENTER, CENTER);
        text(String(arg), pos.x + pos.w / 2, pos.y + pos.h / 2);
      }

      // Render hints underneath slots as fill(255) with noStroke()
      if (this.argHints[i]) {
        fill(255); 
        noStroke(); 
        textStyle(BOLD); 
        textAlign(CENTER, TOP); 
        textSize(UI.ts * 0.7);
        text(this.argHints[i], pos.x + pos.w / 2, pos.y + pos.h + UI.sf);
      }
    }

    pop();

    for (let c of this.children) c.draw();
    if (this.type === 'if/else') {
      for (let c of this.elseChildren) c.draw();
    }
  }

  checkClick(mx, my) {
    const isCustomFunction = this.type.startsWith('function ') && 
      !['function draw', 'function setup', 'function mousePressed', 'function keyPressed'].includes(this.type);
    
    if (isCustomFunction) {
        if (this.plusIconRect && mx >= this.plusIconRect.x && mx <= this.plusIconRect.x + this.plusIconRect.w &&
            my >= this.plusIconRect.y && my <= this.plusIconRect.y + this.plusIconRect.h) {
            
            let defaultParamName = 'arg' + (this.args.length + 1);
            this.args.push(defaultParamName);
            
            this.layout(this.x, this.y);
            return true; 
        }

        if (this.minusIconRect && this.args.length >= 1 &&
            mx >= this.minusIconRect.x && mx <= this.minusIconRect.x + this.minusIconRect.w &&
            my >= this.minusIconRect.y && my <= this.minusIconRect.y + this.minusIconRect.h) {
            
            this.args.pop(); 
            this.layout(this.x, this.y); 
            return true; 
        }
    }
    
    for (let arg of this.args) {
        if (arg instanceof Block && arg.checkClick && arg.checkClick(mx, my)) return true;
    }
    for (let child of this.children) {
        if (child.checkClick && child.checkClick(mx, my)) return true;
    }
    if (this.elseChildren) {
        for (let child of this.elseChildren) {
            if (child.checkClick && child.checkClick(mx, my)) return true;
        }
    }
    
    return false;
  }

  drawLogicShape(x, y, w, h) {
    let side = h / 2;
    beginShape();
    vertex(x + side, y); vertex(x + w - side, y); vertex(x + w, y + h / 2);
    vertex(x + w - side, y + h); vertex(x + side, y + h); vertex(x, y + h / 2);
    endShape(CLOSE);
  }

  serialize() {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      args: this.args.map(arg => {
        if (arg && typeof arg.serialize === 'function') {
          return arg.serialize();
        }
        return arg;
      }),
      children: this.children.map(c => {
        if (c && typeof c.serialize === 'function') return c.serialize();
        return null;
      }).filter(Boolean),
      elseChildren: this.elseChildren ? this.elseChildren.map(c => {
        if (c && typeof c.serialize === 'function') return c.serialize();
        return null;
      }).filter(Boolean) : []
    };
  }

  static fromData(data) {
    let b = new Block(data.type, data.x, data.y);
    
    b.args = data.args.map(arg => {
      if (arg && typeof arg === 'object' && arg.type) {
        let childReporter = Block.fromData(arg);
        childReporter.parent = b;
        return childReporter;
      }
      return arg;
    });

    if (data.children) {
      b.children = data.children.map(cData => {
        let child = Block.fromData(cData);
        child.parent = b;
        return child;
      });
    }

    if (data.elseChildren) {
      b.elseChildren = data.elseChildren.map(cData => {
        let child = Block.fromData(cData);
        child.parent = b;
        return child;
      });
    }

    return b;
  }

  duplicate() {
    let copy = new Block(this.type, this.x + 20 * UI.sf, this.y + 20 * UI.sf);
    copy.args = this.args.map(arg => {
      if (arg instanceof Block) { let aC = arg.duplicate(); aC.parent = copy; return aC; }
      return arg;
    });
    copy.children = this.children.map(child => {
      let cC = child.duplicate(); cC.parent = copy; return cC;
    });
    if (this.type === 'if/else') {
      copy.elseChildren = this.elseChildren.map(child => {
        let cC = child.duplicate(); cC.parent = copy; return cC;
      });
    }
    copy.layout(copy.x, copy.y);
    return copy;
  }

  initHints(type) {
    const hints = {
      'line': ['x1', 'y1', 'x2', 'y2'],
      'circle': ['x', 'y', 'd'],
      'triangle': ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'],
      'rect': ['x', 'y', 'w', 'h'],
      'ellipse': ['x', 'y', 'w', 'h'],
      'point': ['x', 'y'],
      'pickRandom': ['min', 'max'],
      'text': ['string', 'x', 'y'],
      'map': ['value', 'low', 'high', 'low', 'high'],
      'dist': ['x1', 'y1', 'x2', 'y2'],
      'arc': ['x', 'y', 'w', 'h', 'start', 'stop'],
      'textSize': ['pixels'],
      'strokeWeight': ['pixels'],
      'remainder': ['dividend', 'divisor']
    };

    if (['fill', 'stroke', 'background'].includes(type)) {
      this.updateColorHints();
    } else {
      this.argHints = hints[type] || [];
    }
  }

  updateColorHints() {
    if (!['fill', 'stroke', 'background'].includes(this.type)) return;

    const findModeBefore = (targetBlock) => {
      let p = targetBlock.parent;
      if (!p) return 'RGB';

      let list = (p.elseChildren && p.elseChildren.includes(targetBlock)) 
                 ? p.elseChildren 
                 : p.children;

      let myIndex = list.indexOf(targetBlock);
      let lastFoundInScope = null;

      for (let i = 0; i < myIndex; i++) {
        if (list[i].type === 'colorMode') {
          lastFoundInScope = list[i].args[0];
        }
      }

      if (lastFoundInScope) return lastFoundInScope;

      return findModeBefore(p);
    };

    const mode = findModeBefore(this);

    if (mode === 'HSB') {
      this.argHints = ['H', 'S', 'B'];
    } else {
      this.argHints = ['R', 'G', 'B'];
    }
  }
}