var scene, renderer, camera, animatedObjects = [];
var doCameraAnimation = true;
var walls = [];

var Ball = function () {
    'use strict';

    this.roll = true;

    this.ball = new THREE.SphereGeometry(50, 64, 32);
    this.texture = THREE.ImageUtils.loadTexture( "./Befehlsblume.jpg" );
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.RepeatWrapping; this.texture.repeat.set( 1, 1 );
    //this.material = new THREE.MeshPhongMaterial({ color : 0xffff00, wireframe : true });
    this.material = new THREE.MeshPhongMaterial( { map: this.texture, color: 0xffffff, wireframe: false } );
    this.mesh = new THREE.Mesh(this.ball, this.material);
    this.mesh.position.y = -400;
    this.mesh.position.x = 0;

    this.doAnimation = function () {
        this.mesh.position.y += 1;
        if (this.mesh.position.y > 500) {
            this.mesh.position.y = 500;
        }
        if (camera.position.y < 400) {
            this.mesh.rotation.x -= 0.1;
            camera.position.y += 1;
        }
    };
};

var Ground = function () {
    'use strict';

    this.ground = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    this.material = new THREE.MeshPhongMaterial({ color : 0x00ff00, wireframe : true });
    this.mesh = new THREE.Mesh(this.ground, this.material);
    this.mesh.position.z = -50;
//    this.mesh.rotation.x = 90;
};

var Wall = function (x, y, w) {
    'use strict';

    //this.ground = new THREE.PlaneGeometry(w, 100, 10, 10);
    this.ground = new THREE.CubeGeometry(w, 100, 10, w, 10, 10);
    this.material = new THREE.MeshPhongMaterial({ map: THREE.ImageUtils.loadTexture( "./stonewall.jpg" ) });
    this.mesh = new THREE.Mesh(this.ground, this.material);
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = 0;
    this.mesh.rotation.x = Math.PI / 2;
};

function addWall(x, y , w) {
    var wall =  new Wall(x, y, w);
    walls.push(wall);
    scene.add(wall.mesh);
}

function cameraAnimation() {
    'use strict';

    if (doCameraAnimation) {
        camera.rotation.x += Math.PI / 360;
        camera.position.y = -800 * Math.sin(camera.rotation.x);
        camera.position.z = 650 * Math.cos(camera.rotation.x);
        if (camera.rotation.x > (Math.PI / 2)) {
            doCameraAnimation = false;
        }
    }
}

var KamikazeBall3D = {
    init : function () {
        'use strict';
        var hemisphereLight,
            ball = new Ball(),
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

        hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        scene.add(hemisphereLight);

        scene.add(ground.mesh);
        animatedObjects.push(ball);
        scene.add(ball.mesh);

        addWall(300, 300, 300);
        addWall(-300, 400, 100);
        addWall(-200, -200, 200);
        addWall(-100, 100, 200);
        addWall(300, -100, 400);

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
    },

    animate : function () {
        'use strict';
        var i, o;

        requestAnimationFrame(KamikazeBall3D.animate);

        cameraAnimation();
        for (i = 0; i < animatedObjects.length; i = i + 1) {
            o = animatedObjects[i];
            if (o.hasOwnProperty('doAnimation')) {
                o.doAnimation();
            }
        }
        renderer.render(scene, camera);
    }
};

function ready() {
    'use strict';

    KamikazeBall3D.init();
    KamikazeBall3D.animate();
}

$(document).ready(ready());