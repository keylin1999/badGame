let cvsWrapper = null;
let BG_image , GROUND_image, BG_index, GAMEOVE_image, STARTUP_image
let WING_sound, DIE_sound, HIT_sound, POINT_sound
let backgroundX = 0
let asset
let vy = 0
let x, y
let MAXANGLE, angle = 0
let birdIndex, birdFlap
let died = false
let DIE_soundPlayed = false
let start = true
let pipes = []
let timeFrame = 0
let point = 0
let digit

function preload() {
}

function setup() {
    // Game basic setup.
    // Mounting canvas onto div for convenient styling.
    asset = ["blue","red","yellow"].map(color=>["downflap","midflap","upflap"].map(flap=>loadImage(`assets/sprites/${color}bird-${flap}.png`)))
    BG_image = [loadImage("assets/sprites/background-day.png"),loadImage("assets/sprites/background-night.png")]
    GROUND_image = loadImage("assets/sprites/base.png")
    GAMEOVE_image = loadImage("assets/sprites/gameover.png")
    WING_sound = loadSound("assets/audio/wing.ogg")
    DIE_sound = loadSound("assets/audio/die.ogg")
    STARTUP_image = loadImage("assets/sprites/message.png")
    PIPE_LOWER_image = loadImage("assets/sprites/pipe-green-lower.png")
    PIPE_UPPER_image = loadImage("assets/sprites/pipe-green-upper.png")
    POINT_sound = loadSound("assets/audio/point.ogg")
    HIT_sound = loadSound("assets/audio/hit.ogg")
    cvsWrapper = document.getElementById("canvasWrapper")
    digit = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map(number=>loadImage(`assets/sprites/${number}.png`)) //////////////////////////////??????
    const myCanvas = createCanvas(
        cvsWrapper.offsetWidth,
        cvsWrapper.offsetHeight
    )
    x =  width / 2 - asset[0][1].width / 2
    y = height / 2 - asset[0][1].height / 2
    myCanvas.parent("canvasWrapper");
    MAXANGLE = PI / 4
    birdIndex = Math.floor(random(3))
    BG_index = Math.floor(random(2))
    birdFlap = 1;
    theBird = new bird()
    // setup code below
}
function draw() {
    updateBackground()
    if(!start){
        timeFrame++
        if(timeFrame > 120){
            let upperPipe = Math.floor(random(250))+100
            let lowerPipe = 500 - upperPipe
            let a = pipes.length
            pipes[a] = new PIPE(width,0,1,upperPipe)
            pipes[a+1] = new PIPE(width, height - GROUND_image.height - lowerPipe,0,lowerPipe)
            timeFrame = 0
        }
        for(let pipe in pipes){
            image(pipes[pipe].img,pipes[pipe].x,pipes[pipe].y,PIPE_UPPER_image.width,pipes[pipe].long)
            pipes[pipe].x -= 3
        }
        for(let pipe in pipes){
            if(pipes[pipe].x < -PIPE_UPPER_image.width){
                pipes.splice(pipe,1)
            }
            if(x > pipes[pipe].x + pipes[pipe].img.width && pipes[pipe].counted == false && !died){
                POINT_sound.play()
                point++
                pipes[pipe].counted = true
            }
        }
        theBird.update()
    }
    else{
        image(STARTUP_image,0,height/2 - STARTUP_image.height / 2, width, STARTUP_image.height)
    }
    updatePoint()
}

function keyPressed() {
    if(keyCode == 32){
        if(start)
            start = false
        else{
            if(!died)
                theBird.fly()
            else{
                x =  width / 2 - asset[0][1].width / 2
                y = height / 2 - asset[0][1].height / 2
                vy = 0
                died = false
                angle = 0
                DIE_soundPlayed = false
                pipes = []
            }
        }
    }
}
function updateBackground(){
    image(BG_image[BG_index],backgroundX,0,width,height)
    image(BG_image[BG_index],backgroundX + width,0, width, height)
    image(GROUND_image,0,height - GROUND_image.height,width,GROUND_image.height)
    backgroundX--;
    if(backgroundX < -width)
        backgroundX += width
}
function PIPE(x,y,upDown,long){
    this.counted = false
    this.x = x
    this.y = y
    this.long = long
    this.upDown = upDown
    if(upDown == 1)
        this.img = PIPE_UPPER_image
    else
        this.img = PIPE_LOWER_image
}
function bird(){
    this.timeFrame = 0;
    this.flying = false;
    this.fly = ()=>{
        this.flying = true
        vy = -5
        angle = -PI / 4
        birdFlap = 0
        WING_sound.play()
    }
    this.update = ()=>{
        if(!died){
            if(angle < MAXANGLE)
                angle += 0.1
            if(y < height - GROUND_image.height - asset[birdIndex][birdFlap].height){
                y = y + vy
                vy += 0.4
            }
            else{
                HIT_sound.play()
                died = true
                point = 0
            }
            if(y < 0){
                y = 0   
            }
            if(this.flying){
                this.timeFrame++
                if(this.timeFrame > 5 && birdFlap < 2){
                    birdFlap++
                    this.timeFrame = 0
                }
                else if(this.timeFrame > 5 && birdFlap === 2){
                    birdFlap = 1
                    this.flying = false
                }
            }
            for(let pipe of pipes){
                if(x < (pipe.x + PIPE_UPPER_image.width) && (x + asset[birdIndex][birdFlap].width) > pipe.x){
                    if(pipe.upDown == 0){//lower
                        if(y + asset[birdIndex][birdFlap].height > pipe.y){
                            died = true
                            point = 0
                            HIT_sound.play()
                            break
                        }
                    }
                    else{
                        if(y < pipe.long){
                            point = 0
                            HIT_sound.play()
                            died = true
                            break
                        }
                    }
                }
            }
        }
        push()
        translate(x + asset[birdIndex][birdFlap].width / 2, y)
        rotate(angle)
        if(!died){
            image(asset[birdIndex][birdFlap], -asset[birdIndex][birdFlap].width / 2, 0)
        }
        pop()
        if(died){
            if(!DIE_soundPlayed){
                DIE_sound.play()
                DIE_soundPlayed = true
            }
            image(GAMEOVE_image,0,height/2 - GAMEOVE_image.height/2, width, GAMEOVE_image.height)
        }
    }
}
function updatePoint(){
    snumber = (point/2).toString()
    output = []
    for(let i = 0,len = snumber.length; i < len; i++){
        output.push(+snumber.charAt(i))
    }
    for(let i = 0; i < snumber.length; i++){
        image(digit[snumber[i]],digit[0].width*i + 50,50)
    }
}

