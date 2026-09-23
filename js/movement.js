const canvas =
    document.getElementById(
        'gameCanvas'
    );

const ctx =
    canvas.getContext('2d');


// ======================================================
// CANVAS
// ======================================================

function resize() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;


    joystick.baseX =
        window.innerWidth / 2;

    joystick.baseY =
        window.innerHeight - 150;


    if (!joystick.active) {

        joystick.x =
            joystick.baseX;

        joystick.y =
            joystick.baseY;

    }

}

window.addEventListener(
    'resize',
    resize
);


// ======================================================
// IMAGES
// ======================================================

const walkImg =
    new Image();

walkImg.src =
    'images/walk.png';


const bgImg =
    new Image();

bgImg.src =
    'images/bg_floor.png';


let bgPattern = null;


bgImg.onload =
    function () {

        bgPattern =
            ctx.createPattern(
                bgImg,
                'repeat'
            );

    };


// ======================================================
// PLAYER
// ======================================================

const player = {

    x: 0,
    y: 0,

    displaySize: 120,

    maxSpeed: 320,

    velocityX: 0,
    velocityY: 0,

    acceleration: 9,

    friction: 7,

    totalFrames: 16,

    framesPerDir: 4,

    // 0 = ซ้าย
    // 1 = ขวา
    // 2 = ลง
    // 3 = ขึ้น

    currentDirection: 2,

    currentFrame: 0,

    frameTimer: 0,

    frameInterval: 0.11,

    walkTime: 0,

    isMoving: false

};


// ======================================================
// CAMERA
// ======================================================

const camera = {

    x: 0,

    y: 0

};


// ======================================================
// LEVEL SYSTEM
// ======================================================

const levelSystem = {

    level: 1,

    exp: 0,

    maxExp: 100,


    getTheme() {

        if (
            this.level === 1
        ) {

            return {

                enemyColor:
                    '#666666',

                enemyCore:
                    '#999999',

                dust:
                    'rgba(150,150,150,0.14)',

                spellColor:
                    '#ff3158',

                spellGlow:
                    '#ff1744',

                gemColor:
                    '#55d9ff',

                gemGlow:
                    '#00bfff'

            };

        }


        if (
            this.level === 2
        ) {

            return {

                enemyColor:
                    '#735c91',

                enemyCore:
                    '#a982c7',

                dust:
                    'rgba(170,150,190,0.16)',

                spellColor:
                    '#ff4f81',

                spellGlow:
                    '#ff1f62',

                gemColor:
                    '#70e6ff',

                gemGlow:
                    '#21cfff'

            };

        }


        if (
            this.level === 3
        ) {

            return {

                enemyColor:
                    '#426f75',

                enemyCore:
                    '#6ca9ae',

                dust:
                    'rgba(130,190,200,0.17)',

                spellColor:
                    '#ff668d',

                spellGlow:
                    '#ff2759',

                gemColor:
                    '#8dffdf',

                gemGlow:
                    '#32e6bd'

            };

        }


        return {

            enemyColor:
                '#8b6544',

            enemyCore:
                '#c28b5a',

            dust:
                'rgba(200,170,140,0.18)',

            spellColor:
                '#ff759b',

            spellGlow:
                '#ff326d',

            gemColor:
                '#ffe16b',

            gemGlow:
                '#ffc400'

        };

    }

};


// ======================================================
// EFFECT SYSTEM
// ======================================================

const fx = {

    shakeIntensity: 0,

    flashAlpha: 0,

    levelUpParticles: [],

    damageParticles: [],


    triggerShake(amount) {

        this.shakeIntensity =
            Math.max(
                this.shakeIntensity,
                amount
            );

    },


    triggerFlash(
        amount = 0.5
    ) {

        this.flashAlpha =
            Math.max(
                this.flashAlpha,
                amount
            );

    },


    levelUp() {

        this.triggerShake(14);

        this.triggerFlash(0.7);


        for (
            let i = 0;
            i < 40;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            const speed =
                80 +
                Math.random() *
                220;


            this.levelUpParticles.push({

                x:
                    player.x,

                y:
                    player.y,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed,

                life: 1,

                size:
                    3 +
                    Math.random() *
                    5

            });

        }

    },


    damage(x, y) {

        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            const speed =
                60 +
                Math.random() *
                120;


            this.damageParticles.push({

                x: x,

                y: y,

                vx:
                    Math.cos(angle) *
                    speed,

                vy:
                    Math.sin(angle) *
                    speed,

                life: 0.45,

                size:
                    2 +
                    Math.random() *
                    3

            });

        }

    },


    update(dt) {

        // ------------------------------------------
        // Screen Shake
        // ------------------------------------------

        if (
            this.shakeIntensity > 0
        ) {

            this.shakeIntensity *=
                Math.pow(
                    0.001,
                    dt
                );


            if (
                this.shakeIntensity < 0.2
            ) {

                this.shakeIntensity = 0;

            }

        }


        // ------------------------------------------
        // Flash
        // ------------------------------------------

        if (
            this.flashAlpha > 0
        ) {

            this.flashAlpha -=
                1.8 *
                dt;


            if (
                this.flashAlpha < 0
            ) {

                this.flashAlpha = 0;

            }

        }


        // ------------------------------------------
        // Level Up Particles
        // ------------------------------------------

        for (
            let i =
                this.levelUpParticles.length - 1;

            i >= 0;

            i--
        ) {

            const p =
                this.levelUpParticles[i];


            p.x +=
                p.vx *
                dt;

            p.y +=
                p.vy *
                dt;


            p.vx *=
                Math.pow(
                    0.08,
                    dt
                );

            p.vy *=
                Math.pow(
                    0.08,
                    dt
                );


            p.life -=
                dt *
                1.4;


            if (
                p.life <= 0
            ) {

                this.levelUpParticles.splice(
                    i,
                    1
                );

            }

        }


        // ------------------------------------------
        // Damage Particles
        // ------------------------------------------

        for (
            let i =
                this.damageParticles.length - 1;

            i >= 0;

            i--
        ) {

            const p =
                this.damageParticles[i];


            p.x +=
                p.vx *
                dt;

            p.y +=
                p.vy *
                dt;


            p.vx *=
                Math.pow(
                    0.1,
                    dt
                );

            p.vy *=
                Math.pow(
                    0.1,
                    dt
                );


            p.life -=
                dt;


            if (
                p.life <= 0
            ) {

                this.damageParticles.splice(
                    i,
                    1
                );

            }

        }

    },


    applyShake() {

        if (
            this.shakeIntensity > 0
        ) {

            ctx.translate(

                (
                    Math.random() -
                    0.5
                ) *
                this.shakeIntensity,

                (
                    Math.random() -
                    0.5
                ) *
                this.shakeIntensity

            );

        }

    }

};


// ======================================================
// JOYSTICK
// ======================================================

const joystick = {

    active: false,

    baseX:
        window.innerWidth / 2,

    baseY:
        window.innerHeight - 150,

    x:
        window.innerWidth / 2,

    y:
        window.innerHeight - 150,

    radius: 65,

    handleRadius: 28,

    touchId: null

};


// ======================================================
// MOVEMENT VECTOR
// ======================================================

const moveVector = {

    x: 0,

    y: 0

};


// ======================================================
// GAME OBJECTS
// ======================================================

let bloodSpells = [];

let enemies = [];

let bloodGems = [];

let ambientDust = [];

let score = 0;


// ======================================================
// TIMERS
// ======================================================

let autoShootTimer = 0;

let enemySpawnTimer = 0;


// ======================================================
// POINTER DOWN
// ======================================================

window.addEventListener(
    'pointerdown',
    function (e) {

        // ------------------------------------------
        // เกมยังไม่เริ่ม
        // ------------------------------------------

        if (
            !gameStarted
        ) {

            return;

        }


        // ------------------------------------------
        // เกม Pause
        // ------------------------------------------

        if (
            gamePaused
        ) {

            return;

        }


        // ------------------------------------------
        // Game Over
        // ------------------------------------------

        if (
            gameOverState
        ) {

            return;

        }


        if (
            joystick.active
        ) {

            return;

        }


        // ------------------------------------------
        // Joystick เฉพาะครึ่งล่าง
        // ------------------------------------------

        if (
            e.clientY >
            window.innerHeight / 2
        ) {

            joystick.active =
                true;

            joystick.touchId =
                e.pointerId;

            joystick.baseX =
                e.clientX;

            joystick.baseY =
                e.clientY;

            joystick.x =
                e.clientX;

            joystick.y =
                e.clientY;


            try {

                canvas.setPointerCapture(
                    e.pointerId
                );

            } catch (error) {}

        }

    }
);


// ======================================================
// POINTER MOVE
// ======================================================

window.addEventListener(
    'pointermove',
    function (e) {

        if (
            !gameStarted ||
            gamePaused ||
            gameOverState
        ) {

            return;

        }


        if (
            !joystick.active
        ) {

            return;

        }


        if (
            e.pointerId !==
            joystick.touchId
        ) {

            return;

        }


        let dx =
            e.clientX -
            joystick.baseX;

        let dy =
            e.clientY -
            joystick.baseY;


        let distance =
            Math.hypot(
                dx,
                dy
            );


        if (
            distance >
            joystick.radius
        ) {

            dx =
                (
                    dx /
                    distance
                ) *
                joystick.radius;

            dy =
                (
                    dy /
                    distance
                ) *
                joystick.radius;

            distance =
                joystick.radius;

        }


        joystick.x =
            joystick.baseX +
            dx;

        joystick.y =
            joystick.baseY +
            dy;


        // ------------------------------------------
        // Dead Zone
        // ------------------------------------------

        if (
            distance > 7
        ) {

            moveVector.x =
                dx /
                joystick.radius;

            moveVector.y =
                dy /
                joystick.radius;


            const length =
                Math.hypot(
                    moveVector.x,
                    moveVector.y
                );


            if (
                length > 1
            ) {

                moveVector.x /=
                    length;

                moveVector.y /=
                    length;

            }

        } else {

            moveVector.x = 0;

            moveVector.y = 0;

        }

    }
);


// ======================================================
// STOP JOYSTICK
// ======================================================

function stopJoystick(e) {

    if (
        joystick.active &&
        e.pointerId ===
        joystick.touchId
    ) {

        joystick.active =
            false;

        joystick.touchId =
            null;


        joystick.x =
            joystick.baseX;

        joystick.y =
            joystick.baseY;


        moveVector.x = 0;

        moveVector.y = 0;

    }

}


window.addEventListener(
    'pointerup',
    stopJoystick
);


window.addEventListener(
    'pointercancel',
    stopJoystick
);


// ======================================================
// GAME PAUSE HANDLER
// ======================================================

window.addEventListener(
    'gamePause',
    function () {

        // หยุด joystick ทันที

        joystick.active =
            false;

        joystick.touchId =
            null;


        joystick.x =
            joystick.baseX;

        joystick.y =
            joystick.baseY;


        moveVector.x = 0;

        moveVector.y = 0;


        // หยุดความเร็วผู้เล่น

        player.velocityX = 0;

        player.velocityY = 0;

        player.isMoving = false;

    }
);


// ======================================================
// GAME RESUME HANDLER
// ======================================================

window.addEventListener(
    'gameResume',
    function () {

        moveVector.x = 0;

        moveVector.y = 0;

        joystick.active =
            false;

        joystick.touchId =
            null;

    }
);


// ======================================================
// AMBIENT DUST
// ======================================================

for (
    let i = 0;
    i < 100;
    i++
) {

    ambientDust.push({

        x:
            (
                Math.random() -
                0.5
            ) *
            1800,

        y:
            (
                Math.random() -
                0.5
            ) *
            1800,

        radius:
            Math.random() *
            1.5 +
            0.5,

        alpha:
            Math.random() *
            0.3 +
            0.05,

        speed:
            Math.random() *
            20 +
            5

    });

}


// ======================================================
// SPAWN ENEMY
// ======================================================

function spawnEnemy() {

    if (
        !gameStarted ||
        gamePaused ||
        gameOverState
    ) {

        return;

    }


    const angle =
        Math.random() *
        Math.PI *
        2;


    const dist =
        Math.max(
            canvas.width,
            canvas.height
        ) *
        0.65 +
        Math.random() *
        180;


    const x =
        player.x +
        Math.cos(angle) *
        dist;


    const y =
        player.y +
        Math.sin(angle) *
        dist;


    const theme =
        levelSystem.getTheme();


    const enemySpeed =
        95 +
        levelSystem.level *
        12;


    enemies.push({

        x: x,

        y: y,

        radius:
            15 +
            Math.min(
                levelSystem.level *
                0.5,
                8
            ),

        color:
            theme.enemyColor,

        coreColor:
            theme.enemyCore,

        speed:
            enemySpeed

    });

}


// ======================================================
// SHOOT
// ======================================================

function shoot() {

    if (
        !gameStarted ||
        gamePaused ||
        gameOverState
    ) {

        return;

    }


    if (
        enemies.length === 0
    ) {

        return;

    }


    let closestEnemy =
        null;

    let minDist =
        Infinity;


    enemies.forEach(
        enemy => {

            const dist =
                Math.hypot(

                    player.x -
                    enemy.x,

                    player.y -
                    enemy.y

                );


            if (
                dist < minDist
            ) {

                minDist =
                    dist;

                closestEnemy =
                    enemy;

            }

        }
    );


    if (
        !closestEnemy
    ) {

        return;

    }


    const angle =
        Math.atan2(

            closestEnemy.y -
            player.y,

            closestEnemy.x -
            player.x

        );


    const speed =
        570;


    bloodSpells.push({

        x:
            player.x,

        y:
            player.y,

        vx:
            Math.cos(angle) *
            speed,

        vy:
            Math.sin(angle) *
            speed,

        radius:
            11,

        life:
            1.5,

        rotation:
            0

    });


    fx.triggerShake(1.5);

}


// ======================================================
// LEVEL UP
// ======================================================

function addExp(amount) {

    if (
        !gameStarted ||
        gamePaused ||
        gameOverState
    ) {

        return;

    }


    levelSystem.exp +=
        amount;


    while (
        levelSystem.exp >=
        levelSystem.maxExp
    ) {

        levelSystem.exp -=
            levelSystem.maxExp;


        levelSystem.level++;


        levelSystem.maxExp +=
            50;


        fx.levelUp();

    }

}


// ======================================================
// UPDATE PLAYER
// ======================================================

function updatePlayer(dt) {

    if (
        !gameStarted ||
        gamePaused ||
        gameOverState
    ) {

        return;

    }


    const targetVelocityX =
        moveVector.x *
        player.maxSpeed;


    const targetVelocityY =
        moveVector.y *
        player.maxSpeed;


    // ------------------------------------------
    // Smooth Acceleration
    // ------------------------------------------

    const accelerationFactor =
        1 -
        Math.exp(

            -player.acceleration *
            dt

        );


    player.velocityX +=
        (
            targetVelocityX -
            player.velocityX
        ) *
        accelerationFactor;


    player.velocityY +=
        (
            targetVelocityY -
            player.velocityY
        ) *
        accelerationFactor;


    // ------------------------------------------
    // Friction
    // ------------------------------------------

    if (
        moveVector.x === 0 &&
        moveVector.y === 0
    ) {

        const frictionFactor =
            Math.exp(

                -player.friction *
                dt

            );


        player.velocityX *=
            frictionFactor;

        player.velocityY *=
            frictionFactor;

    }


    if (
        Math.abs(
            player.velocityX
        ) < 0.5
    ) {

        player.velocityX =
            0;

    }


    if (
        Math.abs(
            player.velocityY
        ) < 0.5
    ) {

        player.velocityY =
            0;

    }


    // ------------------------------------------
    // Move
    // ------------------------------------------

    player.x +=
        player.velocityX *
        dt;

    player.y +=
        player.velocityY *
        dt;


    // ------------------------------------------
    // Movement State
    // ------------------------------------------

    const currentSpeed =
        Math.hypot(

            player.velocityX,
            player.velocityY

        );


    player.isMoving =
        currentSpeed > 8;


    // ------------------------------------------
    // Direction
    // ------------------------------------------

    if (
        player.isMoving
    ) {

        if (
            Math.abs(
                player.velocityX
            ) >
            Math.abs(
                player.velocityY
            )
        ) {

            player.currentDirection =
                player.velocityX > 0
                    ? 1
                    : 0;

        } else {

            player.currentDirection =
                player.velocityY > 0
                    ? 2
                    : 3;

        }


        // ------------------------------------------
        // Animation
        // ------------------------------------------

        player.walkTime +=
            dt;

        player.frameTimer +=
            dt;


        if (
            player.frameTimer >=
            player.frameInterval
        ) {

            player.currentFrame =
                (
                    player.currentFrame +
                    1
                ) %
                player.framesPerDir;


            player.frameTimer -=
                player.frameInterval;

        }

    } else {

        player.currentFrame =
            0;

        player.frameTimer =
            0;

    }

}


// ======================================================
// UPDATE CAMERA
// ======================================================

function updateCamera() {

    camera.x =
        player.x -
        canvas.width / 2;

    camera.y =
        player.y -
        canvas.height / 2;

}


// ======================================================
// UPDATE DUST
// ======================================================

function updateDust(dt) {

    if (
        !gameStarted ||
        gamePaused ||
        gameOverState
    ) {

        return;

    }


    ambientDust.forEach(
        dust => {

            dust.y -=
                dust.speed *
                dt;


            if (
                dust.y < -900
            ) {

                dust.y =
                    900;

            }

        }
    );

}


// ======================================================
// UPDATE SPELLS
// ======================================================

function updateSpells(dt) {

    if (
        !gameStarted ||
        gamePaused ||
        gameOverState
    ) {

        return;

    }


    for (
        let sIndex =
            bloodSpells.length - 1;

        sIndex >= 0;

        sIndex--
    ) {

        const spell =
            bloodSpells[sIndex];


        spell.x +=
            spell.vx *
            dt;


        spell.y +=
            spell.vy *
            dt;


        spell.life -=
            dt;


        spell.rotation +=
            8 *
            dt;


        let hit =
            false;


        for (
            let enemyIndex =
                enemies.length - 1;

            enemyIndex >= 0;

            enemyIndex--
        ) {

            const enemy =
                enemies[enemyIndex];


            const distance =
                Math.hypot(

                    spell.x -
                    enemy.x,

                    spell.y -
                    enemy.y

                );


            if (
                distance <
                spell.radius +
                enemy.radius
            ) {

                bloodGems.push({

                    x:
                        enemy.x,

                    y:
                        enemy.y,

                    vx:
                        0,

                    vy:
                        0,

                    pulse:
                        Math.random() *
                        Math.PI *
                        2

                });


                fx.damage(

                    enemy.x,

                    enemy.y

                );


                enemies.splice(
                    enemyIndex,
                    1
                );


                score +=
                    50;


                fx.triggerShake(
                    4
                );


                hit =
                    true;


                break;

            }

        }


        if (
            hit ||
            spell.life <= 0
        ) {

            bloodSpells.splice(
                sIndex,
                1
            );

        }

    }

}


// ======================================================
// UPDATE GEMS
// ======================================================

function updateGems(dt) {

    if (
        !gameStarted ||
        gamePaused ||
        gameOverState
    ) {

        return;

    }


    for (
        let index =
            bloodGems.length - 1;

        index >= 0;

        index--
    ) {

        const gem =
            bloodGems[index];


        gem.pulse +=
            dt *
            5;


        const dx =
            player.x -
            gem.x;


        const dy =
            player.y -
            gem.y;


        const dist =
            Math.hypot(
                dx,
                dy
            );


        // ------------------------------------------
        // EXP Magnet
        // ------------------------------------------

        if (
            dist < 150
        ) {

            const angle =
                Math.atan2(
                    dy,
                    dx
                );


            const attraction =
                Math.min(

                    650,

                    220 +
                    (
                        150 -
                        dist
                    ) *
                    4

                );


            gem.vx =
                Math.cos(angle) *
                attraction;


            gem.vy =
                Math.sin(angle) *
                attraction;


            gem.x +=
                gem.vx *
                dt;


            gem.y +=
                gem.vy *
                dt;

        }


        // ------------------------------------------
        // Collect
        // ------------------------------------------

        if (
            dist < 28
        ) {

            bloodGems.splice(
                index,
                1
            );


            addExp(25);

        }

    }

}


// ======================================================
// UPDATE ENEMIES
// ======================================================

function updateEnemies(dt) {

    if (
        !gameStarted ||
        gamePaused ||
        gameOverState
    ) {

        return;

    }


    for (
        let i =
            enemies.length - 1;

        i >= 0;

        i--
    ) {

        const enemy =
            enemies[i];


        const dx =
            player.x -
            enemy.x;


        const dy =
            player.y -
            enemy.y;


        const distance =
            Math.hypot(
                dx,
                dy
            );


        if (
            distance > 0
        ) {

            enemy.x +=

                (
                    dx /
                    distance
                ) *
                enemy.speed *
                dt;


            enemy.y +=

                (
                    dy /
                    distance
                ) *
                enemy.speed *
                dt;

        }


        // ------------------------------------------
        // Player Collision
        // ------------------------------------------

        if (

            Math.hypot(

                player.x -
                enemy.x,

                player.y -
                enemy.y

            )

            <

            (
                player.displaySize /
                3.5
            ) +
            enemy.radius

        ) {

            // --------------------------------------
            // แจ้ง HTML ว่าตาย
            // --------------------------------------

            if (
                typeof window.gamePlayerDied ===
                'function'
            ) {

                window.gamePlayerDied();

            }


            // --------------------------------------
            // หยุดทันที
            // --------------------------------------

            player.velocityX =
                0;

            player.velocityY =
                0;

            moveVector.x =
                0;

            moveVector.y =
                0;


            joystick.active =
                false;

            joystick.touchId =
                null;


            return;

        }

    }

}


// ======================================================
// UPDATE UI
// ======================================================

function updateUI() {

    const scoreText =
        document.getElementById(
            'score-text'
        );


    const levelText =
        document.getElementById(
            'level-text'
        );


    const expBar =
        document.getElementById(
            'exp-bar'
        );


    const expPercentText =
        document.getElementById(
            'exp-percent-text'
        );


    if (
        scoreText
    ) {

        scoreText.innerText =
            Math.floor(
                score / 10
            );

    }


    if (
        levelText
    ) {

        levelText.innerText =
            `LV. ${levelSystem.level}`;

    }


    const expPercent =
        (
            levelSystem.exp /
            levelSystem.maxExp
        ) *
        100;


    if (
        expBar
    ) {

        expBar.style.width =
            `${expPercent}%`;

    }


    if (
        expPercentText
    ) {

        expPercentText.innerText =
            `EXP: ${expPercent.toFixed(1)}%`;

    }

}


// ======================================================
// UPDATE
// ======================================================

function update(dt) {

    // ==================================================
    // PAUSE / START / GAME OVER
    // ==================================================

    if (
        !gameStarted ||
        gamePaused ||
        gameOverState
    ) {

        return;

    }


    // ==================================================
    // AUTO SHOOT
    // ==================================================

    autoShootTimer +=
        dt;


    if (
        autoShootTimer >=
        0.355
    ) {

        autoShootTimer =
            0;

        shoot();

    }


    // ==================================================
    // ENEMY SPAWN
    // ==================================================

    enemySpawnTimer +=
        dt;


    if (
        enemySpawnTimer >=
        0.75
    ) {

        enemySpawnTimer =
            0;

        spawnEnemy();

    }


    // ==================================================
    // SYSTEMS
    // ==================================================

    updatePlayer(dt);

    updateCamera();

    updateDust(dt);

    updateSpells(dt);

    updateGems(dt);

    updateEnemies(dt);

    fx.update(dt);


    // ==================================================
    // SCORE
    // ==================================================

    score +=
        dt *
        90;


    updateUI();

}


// ======================================================
// DRAW BACKGROUND
// ======================================================

function drawBackground() {

    if (
        bgPattern
    ) {

        ctx.fillStyle =
            bgPattern;


        ctx.save();


        ctx.translate(

            -camera.x,

            -camera.y

        );


        ctx.fillRect(

            camera.x,

            camera.y,

            canvas.width,

            canvas.height

        );


        ctx.restore();

    } else {

        ctx.fillStyle =
            '#151515';


        ctx.fillRect(

            0,

            0,

            canvas.width,

            canvas.height

        );

    }

}


// ======================================================
// DRAW DUST
// ======================================================

function drawDust() {

    const theme =
        levelSystem.getTheme();


    ambientDust.forEach(
        dust => {

            ctx.beginPath();


            ctx.arc(

                dust.x,

                dust.y,

                dust.radius,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                theme.dust;


            ctx.shadowBlur =
                0;


            ctx.fill();


            ctx.closePath();

        }
    );

}


// ======================================================
// DRAW GEMS
// ======================================================

function drawGems() {

    const theme =
        levelSystem.getTheme();


    bloodGems.forEach(
        gem => {

            const pulse =
                Math.sin(
                    gem.pulse
                ) *
                2;


            // --------------------------------------
            // Glow
            // --------------------------------------

            ctx.beginPath();


            ctx.arc(

                gem.x,

                gem.y,

                10 +
                pulse,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                theme.gemColor;


            ctx.globalAlpha =
                0.18;


            ctx.shadowBlur =
                0;


            ctx.fill();


            ctx.globalAlpha =
                1;


            ctx.closePath();


            // --------------------------------------
            // Core
            // --------------------------------------

            ctx.beginPath();


            ctx.arc(

                gem.x,

                gem.y,

                6,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                theme.gemColor;


            ctx.shadowBlur =
                15;


            ctx.shadowColor =
                theme.gemGlow;


            ctx.fill();


            ctx.closePath();


            ctx.shadowBlur =
                0;

        }
    );

}


// ======================================================
// DRAW SPELLS
// ======================================================

function drawSpells() {

    const theme =
        levelSystem.getTheme();


    bloodSpells.forEach(
        spell => {

            // --------------------------------------
            // Outer Glow
            // --------------------------------------

            ctx.beginPath();


            ctx.arc(

                spell.x,

                spell.y,

                spell.radius + 8,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                theme.spellColor;


            ctx.globalAlpha =
                0.15;


            ctx.shadowBlur =
                0;


            ctx.fill();


            ctx.globalAlpha =
                1;


            ctx.closePath();


            // --------------------------------------
            // Main Attack
            // --------------------------------------

            ctx.beginPath();


            ctx.arc(

                spell.x,

                spell.y,

                spell.radius,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                theme.spellColor;


            ctx.shadowBlur =
                18;


            ctx.shadowColor =
                theme.spellGlow;


            ctx.fill();


            ctx.closePath();


            // --------------------------------------
            // White Core
            // --------------------------------------

            ctx.beginPath();


            ctx.arc(

                spell.x,

                spell.y,

                spell.radius *
                0.42,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                '#ffffff';


            ctx.shadowBlur =
                0;


            ctx.fill();


            ctx.closePath();

        }
    );

}


// ======================================================
// DRAW PLAYER
// ======================================================

function drawPlayer() {

    if (
        !walkImg.complete ||
        walkImg.naturalWidth <= 0
    ) {

        return;

    }


    const frameWidth =
        walkImg.naturalWidth /
        player.totalFrames;


    const frameHeight =
        walkImg.naturalHeight;


    const ratio =
        frameHeight /
        frameWidth;


    const drawWidth =
        player.displaySize;


    const drawHeight =
        drawWidth *
        ratio;


    // ------------------------------------------
    // Smooth Bounce
    // ------------------------------------------

    let bounceY =
        0;


    if (
        player.isMoving
    ) {

        const speed =
            Math.hypot(

                player.velocityX,

                player.velocityY

            );


        const intensity =
            Math.min(

                1,

                speed /
                player.maxSpeed

            );


        bounceY =
            Math.abs(

                Math.sin(

                    player.walkTime *
                    10

                )

            ) *
            2.2 *
            intensity;

    }


    ctx.save();


    ctx.translate(

        player.x,

        player.y +
        bounceY -
        2

    );


    ctx.imageSmoothingEnabled =
        false;


    // ------------------------------------------
    ctx.closePath();


    // ------------------------------------------
    // Sprite
    // ------------------------------------------

    const sourceX =

        (

            player.currentDirection *
            player.framesPerDir +
            player.currentFrame

        ) *
        frameWidth;


    ctx.shadowBlur =
        8;


    ctx.shadowColor =
        'rgba(0,0,0,0.5)';


    ctx.drawImage(

        walkImg,

        sourceX,

        0,

        frameWidth,

        frameHeight,

        -drawWidth / 2,

        -drawHeight / 2,

        drawWidth,

        drawHeight

    );


    ctx.restore();

}


// ======================================================
// DRAW ENEMIES
// ======================================================

function drawEnemies() {

    enemies.forEach(
        enemy => {

            // --------------------------------------
            // Outer Glow
            // --------------------------------------

            ctx.beginPath();


            ctx.arc(

                enemy.x,

                enemy.y,

                enemy.radius + 5,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                enemy.color;


            ctx.globalAlpha =
                0.16;


            ctx.shadowBlur =
                0;


            ctx.fill();


            ctx.globalAlpha =
                1;


            ctx.closePath();


            // --------------------------------------
            // Enemy Body
            // --------------------------------------

            ctx.beginPath();


            ctx.arc(

                enemy.x,

                enemy.y,

                enemy.radius,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                enemy.color;


            ctx.shadowBlur =
                10;


            ctx.shadowColor =
                'rgba(0,0,0,0.7)';


            ctx.fill();


            // --------------------------------------
            // Enemy Core
            // --------------------------------------

            ctx.beginPath();


            ctx.arc(

                enemy.x,

                enemy.y,

                enemy.radius *
                0.38,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                enemy.coreColor;


            ctx.shadowBlur =
                0;


            ctx.fill();


            // --------------------------------------
            // Outline
            // --------------------------------------

            ctx.strokeStyle =
                'rgba(255,255,255,0.45)';


            ctx.lineWidth =
                1.5;


            ctx.stroke();


            ctx.closePath();

        }
    );

}


// ======================================================
// DRAW FX
// ======================================================

function drawFX() {

    // ------------------------------------------
    // Level Up
    // ------------------------------------------

    fx.levelUpParticles.forEach(
        p => {

            ctx.beginPath();


            ctx.arc(

                p.x,

                p.y,

                p.size,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                '#ffd84d';


            ctx.globalAlpha =
                Math.max(
                    0,
                    p.life
                );


            ctx.shadowBlur =
                15;


            ctx.shadowColor =
                '#ffd84d';


            ctx.fill();


            ctx.closePath();

        }
    );


    // ------------------------------------------
    // Damage
    // ------------------------------------------

    fx.damageParticles.forEach(
        p => {

            ctx.beginPath();


            ctx.arc(

                p.x,

                p.y,

                p.size,

                0,

                Math.PI * 2

            );


            ctx.fillStyle =
                '#ff416c';


            ctx.globalAlpha =
                Math.max(

                    0,

                    p.life *
                    2

                );


            ctx.shadowBlur =
                8;


            ctx.shadowColor =
                '#ff1744';


            ctx.fill();


            ctx.closePath();

        }
    );


    ctx.globalAlpha =
        1;


    ctx.shadowBlur =
        0;

}


// ======================================================
// DRAW JOYSTICK
// ======================================================

function drawJoystick() {

    if (
        !joystick.active ||
        !gameStarted ||
        gamePaused ||
        gameOverState
    ) {

        return;

    }


    // ------------------------------------------
    // Outer Ring
    // ------------------------------------------

    ctx.beginPath();


    ctx.arc(

        joystick.baseX,

        joystick.baseY,

        joystick.radius,

        0,

        Math.PI * 2

    );


    ctx.fillStyle =
        'rgba(255,255,255,0.06)';


    ctx.fill();


    ctx.strokeStyle =
        'rgba(255,255,255,0.25)';


    ctx.lineWidth =
        2;


    ctx.stroke();


    ctx.closePath();


    // ------------------------------------------
    // Middle Ring
    // ------------------------------------------

    ctx.beginPath();


    ctx.arc(

        joystick.baseX,

        joystick.baseY,

        joystick.radius *
        0.55,

        0,

        Math.PI * 2

    );


    ctx.strokeStyle =
        'rgba(255,255,255,0.08)';


    ctx.lineWidth =
        1;


    ctx.stroke();


    ctx.closePath();


    // ------------------------------------------
    // Handle
    // ------------------------------------------

    ctx.beginPath();


    ctx.arc(

        joystick.x,

        joystick.y,

        joystick.handleRadius,

        0,

        Math.PI * 2

    );


    ctx.fillStyle =
        'rgba(230,230,230,0.75)';


    ctx.shadowBlur =
        8;


    ctx.shadowColor =
        'rgba(0,0,0,0.4)';


    ctx.fill();


    ctx.strokeStyle =
        'rgba(255,255,255,0.45)';


    ctx.lineWidth =
        2;


    ctx.stroke();


    ctx.closePath();


    ctx.shadowBlur =
        0;

}


// ======================================================
// VIGNETTE
// ======================================================

function drawVignette() {

    const gradient =
        ctx.createRadialGradient(

            canvas.width / 2,

            canvas.height / 2,

            canvas.width / 4,

            canvas.width / 2,

            canvas.height / 2,

            canvas.width / 1.1

        );


    gradient.addColorStop(

        0,

        'rgba(10,10,10,0)'

    );


    gradient.addColorStop(

        1,

        'rgba(5,5,5,0.78)'

    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

}


// ======================================================
// FLASH
// ======================================================

function drawFlash() {

    if (
        fx.flashAlpha <= 0
    ) {

        return;

    }


    ctx.fillStyle =
        `rgba(255,255,255,${fx.flashAlpha * 0.25})`;


    ctx.fillRect(

        0,

        0,

        canvas.width,

        canvas.height

    );

}


// ======================================================
// DRAW
// ======================================================

function draw() {

    ctx.clearRect(

        0,

        0,

        canvas.width,

        canvas.height

    );


    ctx.save();


    // ------------------------------------------
    // Screen Shake
    // ------------------------------------------

    fx.applyShake();


    // ------------------------------------------
    // Background
    // ------------------------------------------

    drawBackground();


    // ------------------------------------------
    // World
    // ------------------------------------------

    ctx.save();


    ctx.translate(

        -camera.x,

        -camera.y

    );


    drawDust();

    drawGems();

    drawSpells();

    drawEnemies();

    drawFX();

    drawPlayer();


    ctx.restore();


    // ------------------------------------------
    // UI
    // ------------------------------------------

    drawJoystick();

    drawVignette();

    drawFlash();


    ctx.restore();

}


// ======================================================
// GAME LOOP
// ======================================================

let lastTime =
    performance.now();


let fpsTimer =
    0;


let fpsFrames =
    0;


let currentFPS =
    0;


function loop(currentTime) {

    let deltaTime =

        (
            currentTime -
            lastTime
        ) /
        1000;


    lastTime =
        currentTime;


    // ------------------------------------------
    // ป้องกันเกมกระโดด
    // ------------------------------------------

    deltaTime =
        Math.min(

            deltaTime,

            0.033

        );


    // ------------------------------------------
    // UPDATE
    // ------------------------------------------

    update(
        deltaTime
    );


    // ------------------------------------------
    // DRAW
    // ------------------------------------------

    draw();


    // ------------------------------------------
    // FPS
    // ------------------------------------------

    fpsTimer +=
        deltaTime;


    fpsFrames++;


    if (
        fpsTimer >= 1
    ) {

        currentFPS =
            fpsFrames;


        fpsFrames =
            0;


        fpsTimer =
            0;


        const fpsElement =
            document.getElementById(
                'fps-text'
            );


        if (
            fpsElement
        ) {

            fpsElement.innerText =
                `FPS: ${currentFPS}`;

        }

    }


    requestAnimationFrame(
        loop
    );

}


// ======================================================
// START
// ======================================================

resize();


player.x =
    canvas.width / 2;


player.y =
    canvas.height / 2;


updateCamera();

updateUI();


requestAnimationFrame(
    loop
);
