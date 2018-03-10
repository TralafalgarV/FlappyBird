var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        // 初始化game
        initGame();
    }
}, 10)

// background location
var bgLoc = {
    x: 0,
    y: 0,
    width: 32,
    height: 32
};

// ground location
var groundLoc = {
    x: 0,
    y: 31,
    width: 35,
    height: 1
};

// instruction location
var instructionsLoc = {
    x: 6,
    y: 49,
    width: 17,
    height: 21
};

// game over location
var gameOverLoc = {
    x: 6,
    y: 32,
    width: 21,
    height: 17
};

// bird location
var birdLocs = [{
    x: 32,
    y: 0,
    width: 5,
    height: 3
}, {
    x: 32,
    y: 3,
    width: 5,
    height: 3
}, {
    x: 32,
    y: 6,
    width: 5,
    height: 3
}];

// tube location
var tubeLoc = {
    x: 0,
    y: 32,
    width: 6,
    height: 44
};

// hiscore location
var hiscoreLoc = {
    x: 6,
    y: 70,
    width: 30,
    height: 10
};

// score location
var scoreLocs = [32, 9, 27, 32, 32, 32, 27, 41, 32, 41, 27, 50, 32, 50, 27, 59, 32, 59, 32, 18];

// 图片精灵（了解一下）
var flappyBirdSource = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAABQCAYAAACecbxxAAACY0lEQVRoge2XPW4CMRCF5yooLeegpIw4SZp0dBF34DBIKSMOkKQJUgpyBuQUyYIZv/mx1wsGraXR4vXu+Jv3Zheg59e3cM3YbqbH+Dl8BiIiujYUEVEHtZvPwm4+C01AERF9LB+On5uAas6+uKdG+27Oviafvu1mGlq0L40WoOLRFFR8HKFGqLuFau7pa/I91SRUk/aJjb4/vB+D3xivea/xrkMotOElA9r38r0K14y4wVuC6sYI5YY6RkNQpzFC3TTU02Ya1vtF+AqrcMnP6/0iWUvAuoXH5QQ/EXZY16N16R4din8FoHmcULqO50Pnzs5bUNKmfBMNNlaFQ8HzfaG0Y7Q5ylkOhRTwHNnmIlSxfaVHL1SsWBEUUo5bADdKbZKvrWEfggIWovNZ9qH3x6VChvKoxNclJapCeY5oc+2zBO2ybwgobb0alKTCVaHQRpaCWjHZUJYtsGKhmVX1HpeTwKH+wUwr+LoEZdhHyXUaVIVIlIJWpfDqKAXJyYfW9CTIIm1eqUg7Ceopo4/cRRYUdkpUE4qYMuDcnUD16amL2uesEqqTqfZ5IiOycvWFou6GHraJeXrkqlZdTdX/Et4tlMs+5QvZhCrpKV6UWOCA/2ZUxYqg0BPHq+XrTvVs1a1fnkhyVGFGn/VTqkkodPMQUFXti5PB5AKUES6oM+UcCuW8JvBwvBI81dWByYBCm+ZA5heU+w85Xtd6SpubfdgHKq5SmqOeM/uwApQ6d0KdjwGUKoHyK8X955ta6/yI7onniWJsmEoZVoj3I8USpQaAUmEGhbKsQHMElWWfEtZ6n6BfqpBLl8a8BXQAAAAASUVORK5CYII=";
var spriteSheetImage = new Image();
spriteSheetImage.src = flappyBirdSource;

// 初始化 canvas
var spriteSheetCanvas = document.createElement("canvas");
spriteSheetCanvas.width = spriteSheetImage.width;
spriteSheetCanvas.height = spriteSheetImage.height;
var spriteSheetContext = spriteSheetCanvas.getContext("2d");
spriteSheetContext.drawImage(spriteSheetImage, 0, 0);

// 渲染区域
var renderCanvas = document.createElement("canvas");
renderCanvas.width = renderCanvas.height = 32;
var renderContext = renderCanvas.getContext("2d");
// 后面绘制的图形会覆盖前面绘制的图形
renderContext.globalCompositeOperation = "destination-over";

// 碰撞区域
var collisionCanvas = document.createElement("canvas");

function drawSpriteSheetImage(context, locRect, x, y) {
    // 绘制某个图片的locRect，到canvas的指定位置（x、y、height、width）
    context.drawImage(spriteSheetImage, locRect.x, locRect.y, locRect.width, locRect.height, x, y, locRect.width, locRect.height);
}

var canvas, context, gameState, score, groundX = 0,
    birdY, birdYSpeed, birdX = 5,
    birdFrame = 0,
    activeTube, tubes = [],
    collisionContext, scale, scoreLoc = {
        width: 5,
        height: 9
    },
    hiScore = 0;

// 状态
var HOME = 0,
    GAME = 1,
    GAME_OVER = 2,
    HI_SCORE = 3;

function initGame() {
    canvas = document.getElementById("gameCanvas");
    context = canvas.getContext("2d");
    // 根据宽高调整大小    
    scale = Math.floor(Math.min(window.innerHeight, window.innerWidth) / 32);
    canvas.width = scale * 32;
    canvas.height = scale * 32;
    // canvas 居中
    canvas.style.left = window.innerWidth / 2 - (scale * 32) / 2 + "px";
    canvas.style.top = window.innerHeight / 2 - (scale * 32) / 2 + "px";
    // 绑定鼠标、键盘事件
    window.addEventListener( "keydown", handleUserInteraction, false );
    canvas.addEventListener('touchstart', handleUserInteraction, false);
    canvas.addEventListener('mousedown', handleUserInteraction, false);

    collisionCanvas.width = birdX + 8;
    collisionCanvas.height = 32;
    collisionContext = collisionCanvas.getContext("2d");
    // collisionContext.fillStyle = "blue"
    // 在上面绘制的图像，重叠部分会变成空白（碰撞检测的关键）
    collisionContext.globalCompositeOperation = "xor";
    startGame();
    setInterval(loop, 50);
}

function startGame() {
    // 状态机初始化
    gameState = HOME;
    birdYSpeed = score = 0;
    birdY = 14;
    // 设置两个管子的x、y值
    for (var i = 0; i < 2; i++) {
        tubes[i] = {
            x: Math.round(48 + i * 19)
        };
        setTubeY(tubes[i]);
    }
}

function setTubeY(tube) {
    tube.y = Math.floor(Math.random() * (bgLoc.height - tubeLoc.height));
}

// 状态机循环
function loop() {
    switch (gameState) {
        case HOME:
            renderHome();
            break;
        case GAME:
            renderGame();
            break;
        case GAME_OVER:
            renderGameOver();
            break;
        case HI_SCORE:
            renderHiScore();
            break;
    }
}

function handleUserInteraction(event) {
    switch (gameState) {
        case HOME:
            gameState = GAME;
            break;
        case GAME:
            birdYSpeed = -1.4;
            break;
        case HI_SCORE:
            startGame();
            break;
    }
    if (event) {
        event.preventDefault(); //stop propagation chain
    }
}

// 首页渲染
function renderHome() {
    renderContext.clearRect(0, 0, 32, 32);
    // 绘制 instructions 的位置
    drawSpriteSheetImage(renderContext, instructionsLoc, 32 - instructionsLoc.width - 1, 1);
    updateBirdHome();
    renderGround(true);
    // 绘制 background 的位置
    drawSpriteSheetImage(renderContext, bgLoc, 0, 0);
    renderToScale();
}

// 游戏渲染
function renderGame() {
    renderContext.clearRect(0, 0, 32, 32);
    collisionContext.clearRect(0, 0, collisionCanvas.width, collisionCanvas.height);
    renderScore(score, renderScoreXGame, 1);
    renderGround(true);
    renderTubes();
    updateBirdGame();
    checkCollision();
    drawSpriteSheetImage(renderContext, bgLoc, 0, 0);
    renderToScale();
}

// 游戏结束渲染
function renderGameOver() {
    renderContext.clearRect(0, 0, 32, 32);
    // 渲染结束画面
    drawSpriteSheetImage(renderContext, gameOverLoc, 5, 7 - birdFrame);
    renderGround();
    drawSpriteSheetImage(renderContext, bgLoc, 0, 0);
    renderToScale();
    if (++score % 8 == 0) {
        birdFrame++; //this is a quick hack to move the game over logo
        birdFrame %= 2;
    }
}

// 高分渲染
function renderHiScore() {
    renderContext.clearRect(0, 0, 32, 32);
    drawSpriteSheetImage(renderContext, hiscoreLoc, 1, 5);
    renderScore(hiScore, renderScoreXHiScore, 16);
    renderGround();
    drawSpriteSheetImage(renderContext, bgLoc, 0, 0);
    renderToScale();
}

// 将图片从默认的32pixel，放大到窗体合适的大小
function renderToScale() {
    // 从renderContext获取每一个像素点的信息
    var i, data = renderContext.getImageData(0, 0, 32, 32).data;
    // 将renderContext每一个像素方法成scale的大小，并绘制到context上面
    for (i = 0; i < data.length; i += 4) {
        context.fillStyle = "rgb(" + data[i] + "," + data[i + 1] + "," + data[i + 2] + ")";
        context.fillRect(((i / 4) % 32) * scale, Math.floor(i / 128) * scale, scale, scale);
    }
}

// 碰撞检测
function checkCollision() {
    // 如果bird.x 等于 tube.x, 分数加一
    if (birdX == tubes[activeTube].x + 6) {
        score++;
    }

    // 获取bird的每个像素信息(4个数字代表一个像素的rgba)
    var collisionData = collisionContext.getImageData(birdX, birdY, 5, 3).data;
    console.log("111", collisionData)
    var data = renderContext.getImageData(birdX, birdY, 5, 3).data;
    console.log("222", data)
    // 碰撞检测区和渲染区的像素如果产生差异，证明bird碰撞到了tube
    for (var i = 0; i < collisionData.length; i += 4) {
        if (collisionData[i + 3] != data[i + 3]) {
            gameState = GAME_OVER;
            if (score > hiScore) {
                hiScore = score + 0;
            }
            // 显示分数
            setTimeout(function () {
                gameState = HI_SCORE
            }, 2500);
            break;
        }
    }
}

// 分数渲染
function renderScore(score, xFunction, y) {
    var parts = score.toString().split("");
    var i, index, length = parts.length;
    for (var i = 0; i < length; i++) {
        index = parseInt(parts.pop()) * 2;
        scoreLoc.x = scoreLocs[index];
        scoreLoc.y = scoreLocs[index + 1];
        //drawSpriteSheetImage(renderContext, scoreLoc, 25 - 5 * i, 1);
        drawSpriteSheetImage(renderContext, scoreLoc, xFunction(i, length), y);
    }
}

function renderScoreXGame(index, total) {
    return 25 - 5 * index;
}

function renderScoreXHiScore(index, total) {
    return 12 + Math.floor((total / 2) * 5) - 5 * index;
}

function renderGround(move) {
    if (move && --groundX < bgLoc.width - groundLoc.width) {
        groundX = 0;
    }
    drawSpriteSheetImage(renderContext, groundLoc, groundX, 31);
}

function updateBirdHome() {
    drawSpriteSheetImage(renderContext, birdLocs[birdFrame], birdX, birdY);
    birdFrame++;
    birdFrame %= 3;
}

function updateBirdGame() {
    birdY = Math.round(birdY + birdYSpeed);
    birdYSpeed += .25; //重力, 可调
    if (birdY < 0) {
        birdY = 0;
        birdYSpeed = 0;
    }
    if (birdY + 3 > bgLoc.height) {
        birdY = 28;
        birdYSpeed = 0;
    }
    renderContext.save();
    collisionContext.save();
    renderContext.translate(birdX, birdY);
    collisionContext.translate(birdX, birdY);
    drawSpriteSheetImage(renderContext, birdLocs[birdFrame], 0, 0);
    drawSpriteSheetImage(collisionContext, birdLocs[birdFrame], 0, 0);
    renderContext.restore();
    collisionContext.restore();
    birdFrame++;
    birdFrame %= 3;
}

// tube 渲染
function renderTubes() {
    var i, tube;
    activeTube = tubes[0].x < tubes[1].x ? 0 : 1;
    for (i = 0; i < 2; i++) {
        tube = tubes[i];
        // 前面的tube消失后，移到后面去
        if (--tube.x <= -6) {
            tube.x = 32;
            setTubeY(tube);
        }
        drawSpriteSheetImage(renderContext, tubeLoc, tube.x, tube.y);
        drawSpriteSheetImage(collisionContext, tubeLoc, tube.x, tube.y);
    }
}