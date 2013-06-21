var Astro = {
    Const : {
        AE : 149597870700 // m, distance between sun and earth
    }
};

var astroParams = {
    timeFactor : 1,

    slowDown : function () {
        'use strict';
        this.timeFactor /= 1.01;
        if (this.timeFactor < 0.01) {
            this.timeFactor = 0.01;
        }
    },

    speedUp : function () {
        'use strict';
        this.timeFactor *= 1.01;
        if (this.timeFactor > 100) {
            this.timeFactor = 100;
        }
    }
};

var AstroControl = function () {
    'use strict';
    this.isRunning = true;
    this.speedUpPressed = false;
    this.slowDownPressed = false;

    this.toggle = function () {
        this.isRunning = !this.isRunning;
    };

    this.initKeyboard = function () {
        var me = this;

        document.addEventListener('keydown', function (evt) {
            switch (evt.keyCode) {
            case 188: /* , */
                me.speedUpPressed = true;
                break;
            case 190: /* . */
                me.slowDownPressed = true;
                break;
            }
        }, false);

        document.addEventListener('keyup', function (evt) {
            switch (evt.keyCode) {
            case 188: /* , */
                me.speedUpPressed = false;
                break;
            case 190: /* . */
                me.slowDownPressed = false;
                break;
            case 32: /*Space*/
                me.toggle();
                break;
            }
        }, false);
    };
};

var AstronomicalObject = function (radius, rotationSpeed, mesh, color, satellites) {
    'use strict';
    this.radius = radius; // km
    this.rotationSpeed = rotationSpeed; // d
    this.mesh = mesh;
    this.color = color;
    this.satellites = satellites;

    this.initMesh = function (scale) {
        var i, satellite;
        if (mesh === null) {
            this.mesh = new THREE.Mesh(
                new THREE.SphereGeometry(this.radius / scale, 32, 32),
                new THREE.MeshBasicMaterial({color : this.color, wireframe : true })
            );
        }
        for (i = 0; i < this.satellites.length; i += 1) {
            satellite = this.satellites[i];
            satellite.astronomicalObject.initMesh(scale);
        }
    };

    this.addToScene = function (scene) {
        var i, satellite;
        scene.add(this.mesh);
        for (i = 0; i < this.satellites.length; i += 1) {
            satellite = this.satellites[i];
            satellite.astronomicalObject.addToScene(scene);
        }
    };

    this.move = function () {
        var i, satellite, astronomicalObject;

        this.mesh.rotation.y +=  this.rotationSpeed / 100 * astroParams.timeFactor;
        for (i = 0; i < this.satellites.length; i += 1) {
            satellite = this.satellites[i];
            satellite.angle += 1 / satellite.orbitalPeriod * astroParams.timeFactor;

            astronomicalObject = satellite.astronomicalObject;
            astronomicalObject.mesh.position.x = this.mesh.position.x + satellite.distance * Math.cos(satellite.angle);
            astronomicalObject.mesh.position.z = this.mesh.position.z + satellite.distance * Math.sin(satellite.angle);

            astronomicalObject.move();
        }
    };
};

var SatelliteObject = function (astronomicalObject, orbitalPeriod, distance, angle) {
    'use strict';
    this.astronomicalObject = astronomicalObject;
    this.orbitalPeriod = orbitalPeriod; // days
    this.distance = distance; // km
    this.angle = angle;
};

var AstroMesh = function (radius, image) {
    'use strict';
    return new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 32),
        new THREE.MeshPhongMaterial(
            {
                map   : THREE.ImageUtils.loadTexture(image),
                shading: THREE.SmoothShading,
                wireframe : false
            }
        )
    );
};

var apollo13 = new AstronomicalObject(0.2, 10, null, 'pink', []);
var moon = new AstronomicalObject(2, -1, new AstroMesh(2, "images/ear1ccc2.jpg"), 'black', [new SatelliteObject(apollo13, 10, 384400 / Astro.Const.AE * 2000000, 0)]);
var earth = new AstronomicalObject(5, 1, new AstroMesh(5, "images/earth_atmos_2048.jpg"), 'blue', [new SatelliteObject(moon, 28, 384400 / Astro.Const.AE * 6000000, 0)]);
earth.mesh.rotation.x =  23 / 180 * Math.PI;
var venus = new AstronomicalObject(5, -1, new AstroMesh(5, "images/ven0mss2.jpg"), 'red', []);
var phobos = new AstronomicalObject(0.5, 1 / 0.5, null, 'green', []);
var deimos = new AstronomicalObject(0.5, 1 / 0.5, null, 'gray', []);
var mars = new AstronomicalObject(3, 1, new AstroMesh(3, "images/mar0kuu2.jpg"), 'red', [
    new SatelliteObject(phobos, 0.3189 * 10, 9378 / Astro.Const.AE * 60000000, 0),
    new SatelliteObject(deimos, 1.262 * 10, 23459 / Astro.Const.AE * 60000000, 0)
]);
var sun = new AstronomicalObject(
    10,
    1,
    null,
    'yellow',
    [
        new SatelliteObject(venus, 224.701, 0.723 * 60, 0),
        new SatelliteObject(earth, 365.256, 60, 0),
        new SatelliteObject(mars, 686.980, 1.524 * 60, 0)
    ]
);

function ready() {
    'use strict';

    var scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
        renderer = new THREE.WebGLRenderer(),
        controls = new THREE.TrackballControls(camera),
        astroControl = new AstroControl(),
        ambient = new THREE.AmbientLight(0xffffff),
        stats,
        render = function () {

            if (astroControl.isRunning) {
                sun.move();
            }

            if (astroControl.slowDownPressed) {
                astroParams.slowDown();
            }
            if (astroControl.speedUpPressed) {
                astroParams.speedUp();
            }

            requestAnimationFrame(render);
            controls.update();

            renderer.render(scene, camera);
            stats.update();
        };


    renderer.setSize(window.innerWidth - 50, window.innerHeight - 50);
    document.body.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    scene.add(ambient);

    sun.initMesh(1);
    sun.addToScene(scene);

    camera.position.x = 0;
    camera.position.y = 64;
    camera.position.z = 100;
    camera.rotation.x = -Math.PI / 6;

    astroControl.initKeyboard();
    render();
}

$(document).ready(ready());