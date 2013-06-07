var scene, renderer, camera, animatedObjects = [];
var doCameraStartAnimation = true;
var walls = [];
var ballObj = null;
var controls = {
    moveForeward : false,
    moveBackward : false,
    moveLeft: false,
    moveRight: false
};
var angleSpeedX = 0.1;
var delta = 1;
var cameraDelta = 1;
var cameraControls = {
    moveUp    : false,
    moveDown  : false,
    MAX_SPEED : 5
};
var gameStats = {
    rounds : 1,
    wins   : 0,
    score : 0,
    el     : null,
    render : function () {
        'use strict';
        if (this.el !== null) {
            this.el.innerHTML = 'Wins: ' + this.wins + ' Round: ' + this.rounds + ' Score: ' + this.score;
        }
    },
    reset : function () {
        'use strict';
        this.rounds = 1;
        this.wins = 0;
        this.score = 0;
    },
    incScore : function (i) {
        'use strict';
        this.score += i;
    },
    clearScore : function () {
        'use strict';
        this.score = 0;
    },
    incRound : function () {
        'use strict';
        this.round += 1;
    },
    incWins : function () {
        'use strict';
        this.wins += 1;
    }
};

/**
 *
 */
function moveCamera() {
    'use strict';
    if (cameraDelta) {
        camera.rotation.x += cameraDelta * Math.PI / 360;
        if (!doCameraStartAnimation) {
            cameraDelta = 0;
        }
    }
    if (camera.rotation.x < 0) {
        camera.rotation.x = camera.rotation.x + 2 * Math.PI;
    } else if (camera.rotation.x > 2 * Math.PI) {
        camera.rotation.x = camera.rotation.x - 2 * Math.PI;
    }
    camera.position.y = -800 * Math.sin(camera.rotation.x);
    camera.position.z = 650 * Math.cos(camera.rotation.x);
}

function doCameraControls() {
    'use strict';

    if (cameraControls.moveUp) {
        if (cameraDelta > -cameraControls.MAX_SPEED) {
            if (camera.position.y < 0) {
                cameraDelta = cameraDelta - 1;
            }
            console.log(camera.position.y, camera.position.z);
        }
    } else if (cameraControls.moveDown) {
        if (cameraDelta < cameraControls.MAX_SPEED) {
            if (camera.position.y > -780) {
                cameraDelta = cameraDelta + 1;
            }
        }
    }
}


var WallConfig =
    [
        [300, 300, 300],
        [-300, 400, 100],
        [-200, -200, 200],
        [-100, 100, 200],
        [300, -100, 400],
        [0, 0, 10],
        [0, 500, 1000]
    ];
var Ball = function () {
    'use strict';

    this.ball = new THREE.SphereGeometry(50, 64, 32);
    this.texture = THREE.ImageUtils.loadTexture("images/Befehlsblume.jpg");
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping;
    this.texture.repeat.set(1, 1);
    //this.material = new THREE.MeshPhongMaterial({ color : 0xffff00, wireframe : true });
    this.material = new THREE.MeshPhongMaterial({ map : this.texture, color : 0xffffff, wireframe : false });
    this.mesh = new THREE.Mesh(this.ball, this.material);
    this.mesh.position.y = -400;
    this.mesh.position.x = 0;
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.doAnimation = function () {
        this.mesh.position.y += delta;
        if (this.mesh.position.y > 450) {
            this.mesh.position.y = 450;
            this.halt();
        }
        if (this.mesh.position.y < -450) {
            this.mesh.position.y = -450;
            this.halt();
        }
        if (angleSpeedX !== 0) {
            this.mesh.rotation.x -= angleSpeedX;
            camera.position.y += delta;
        }
    };

    this.halt = function () {
        angleSpeedX = 0;
        delta = 0;
    };

    this.reset = function () {
        gameStats.incRound();
        if (gameStats.score >= 50) {
            gameStats.incScore(-50);
        } else {
            gameStats.clearScore();
        }
        angleSpeedX = 0.1 * (gameStats.wins + 1);
        delta = 1;
        gameStats.render();
        this.mesh.position.x = 0;
        this.mesh.position.y = -400;
    };
};

var Ground = function () {
    'use strict';

    this.ground = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    this.material = new THREE.MeshPhongMaterial({
        map : THREE.ImageUtils.loadTexture("images/stone_ground.jpg"),
        shading: THREE.SmoothShading
    });
    this.mesh = new THREE.Mesh(this.ground, this.material);
    this.mesh.position.z = -50;
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = false;
//    this.mesh.rotation.x = 90;
};

var Wall = function (x, y, w) {
    'use strict';

    //this.ground = new THREE.PlaneGeometry(w, 100, 10, 10);
    this.ground = new THREE.CubeGeometry(w, 100, 10, w, 10, 10);
    this.material = new THREE.MeshPhongMaterial({ map : THREE.ImageUtils.loadTexture("images/stonewall.jpg") });
    this.mesh = new THREE.Mesh(this.ground, this.material);
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = 0;
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
};

function addWall(x, y, w) {
    'use strict';

    var wall =  new Wall(x, y, w);
    walls.push(wall);
    scene.add(wall.mesh);
}

function cameraStartAnimation() {
    'use strict';

    if (doCameraStartAnimation) {
        moveCamera();
        if (camera.rotation.x > (Math.PI / 4)) {
            doCameraStartAnimation = false;
            cameraDelta = 0;
        }
    }
}

function checkMovement(obj) {
    'use strict';

    if (controls.moveLeft) {
        if (obj.mesh.position.x > -435) {
            obj.mesh.position.x -= 5;
            obj.mesh.rotation.y -= 0.1;
        }
    } else if (controls.moveRight) {
        if (obj.mesh.position.x < 435) {
            obj.mesh.position.x += 5;
            obj.mesh.rotation.y += 0.1;
        }
    } else if (controls.moveForeward) {
        angleSpeedX += 0.1;
        delta += 1;
    } else if (controls.moveBackward) {
        angleSpeedX -= 0.1;
        delta -= 1;
    }
}

function dist(x1, y1, x2, y2) {
    'use strict';

    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

/**
 * check collision against Walls
 *
 * @returns {boolean}
 */
function checkWallCollision(obj) {
    'use strict';
    var i, j, x, y, w, d;
    for (i = 0; i < WallConfig.length; i = i + 1) {
        x = WallConfig[i][0];
        y = WallConfig[i][1];
        w = WallConfig[i][2];

        for (j = 0; j < w; j = j + 1) {
            d = dist(obj.mesh.position.x, obj.mesh.position.y, x + j - w / 2, y);
            // console.log('Wall[' + i + '] = (' + x + ', ' + y + ') Dist = ' +  d);
            if (d < 50) {
                return true;
            }
        }
    }
    return false;
}

function initKeyboard() {
    'use strict';
    document.addEventListener('keydown', function (evt) {
        switch (evt.keyCode) {
        case 38: /* up */
            controls.moveForeward = true;
            break;
        case 87: /*W*/
            controls.moveForeward = true;
            break;
        case 40: /* down */
            controls.moveBackward = true;
            break;
        case 83: /* S */
            controls.moveBackward = true;
            break;
        case 37: /*left*/
            controls.moveLeft = true;
            break;
        case 65: /*A*/
            controls.moveLeft = true;
            break;
        case 39: /*right*/
            controls.moveRight = true;
            break;
        case 68: /*D*/
            controls.moveRight = true;
            break;
        case 79: /* O */
            cameraControls.moveUp = true;
            break;
        case 76: /* O */
            cameraControls.moveDown = true;
            break;
        case 27: /*ESC*/
            gameStats.reset();
            break;
        }

    }, false);
    document.addEventListener('keyup', function (evt) {
        switch (evt.keyCode) {
        case 38: /* up */
            controls.moveForeward = false;
            break;
        case 87: /* W */
            controls.moveForeward = false;
            break;
        case 40: /* down */
            controls.moveBackward = false;
            break;
        case 83: /* S */
            controls.moveBackward = false;
            break;
        case 37: /*left*/
            controls.moveLeft = false;
            break;
        case 65: /*A*/
            controls.moveLeft = false;
            break;
        case 39: /*right*/
            controls.moveRight = false;
            break;
        case 68: /*D*/
            controls.moveRight = false;
            break;
        case 79: /* O */
            cameraControls.moveUp = false;
            break;
        case 76: /* O */
            cameraControls.moveDown = false;
            break;
        }
    }, false);
}

var KamikazeBall3D = {
    lastLoop: new Date,
    frameRate: 30,

    init : function () {
        'use strict';
        gameStats.el = document.getElementById('stats');

        var ball = new Ball(),
            spotLight,
            ambient,
            i,
            ground = new Ground();

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.x = -0;
        camera.position.y = -800;
        camera.position.z = 650;
        camera.rotation.x = 0;
//        camera.position.y = -600;
//        camera.position.z = 0;
//        camera.rotation.x = Math.PI / 2;

        //ambient light, else the full seen is very dark
        ambient = new THREE.AmbientLight(0x444444);
        scene.add(ambient);


        spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(camera.position.x, camera.position.y, camera.position.z);
        spotLight.castShadow = true;
        spotLight.shadowMapWidth = 1024;
        spotLight.shadowMapHeight = 1024;
        spotLight.shadowDarkness = 0.7;

        scene.add(spotLight);
        scene.add(ground.mesh);
        animatedObjects.push(ball);
        ballObj = ball;
        scene.add(ball.mesh);

        for (i = 0; i < WallConfig.length; i = i + 1) {
            addWall(WallConfig[i][0], WallConfig[i][1], WallConfig[i][2]);
        }

        initKeyboard();
        gameStats.render();

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        //enable shadow plugin
        renderer.shadowMapEnabled = true;
        //anti aliasing
        renderer.shadowMapSoft = true;
        document.body.appendChild(renderer.domElement);
    },

    animate : function () {
        'use strict';
        var i, o;


        var currentLoop         = new Date;
        var frameRate           = 1000 / (currentLoop - KamikazeBall3D.lastLoop);
        KamikazeBall3D.lastLoop = currentLoop;
        document.getElementById('fps').innerHTML = Math.floor(frameRate);

        setTimeout(function() {
            requestAnimationFrame(KamikazeBall3D.animate);

            checkMovement(ballObj);

            if (ballObj.mesh.position.y >= 400) {
                gameStats.incWins();
                gameStats.incScore(100);
                ballObj.reset();
            }

            if (checkWallCollision(ballObj)) {
                ballObj.reset();
            }
            cameraStartAnimation();
            doCameraControls();
            moveCamera();
            //enlarge the ground
            //this.offset.set(position.x / w * seaTex.repeat.x, position.y / h * seaTex.repeat.y);
            for (i = 0; i < animatedObjects.length; i = i + 1) {
                o = animatedObjects[i];
                if (o.hasOwnProperty('doAnimation')) {
                    o.doAnimation();
                }
            }
        }, 1000 / KamikazeBall3D.frameRate);


        renderer.render(scene, camera);
    }
};

function ready() {
    'use strict';

    KamikazeBall3D.init();
    KamikazeBall3D.animate();
}

$(document).ready(ready());