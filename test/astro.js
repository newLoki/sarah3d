var Astro = {
    Const : {
        AE           : 149597870.700, // km, distance between sun and earth
        YEAR         : 365.256, // d year on earth
        EARTH_RADIUS : 6378.15 // km
    }
};

var astroParams = {
    timeFactor : 1,
    distanceScale : 1,
    radiusScale : 1,

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
    },

    distanceScaleUp : function () {
        'use strict';
        this.distanceScale *= 1.01;
        if (this.distanceScale > 1000) {
            this.distanceScale = 1000;
        }
    },

    distanceScaleDown : function () {
        'use strict';
        this.distanceScale /= 1.01;
        if (this.distanceScale < 0.0001) {
            this.distanceScale = 0.0001;
        }
    },

    radiusScaleUp : function () {
        'use strict';
        this.radiusScale *= 1.01;
        if (this.radiusScale > 1000) {
            this.radiusScale = 1000;
        }
    },

    radiusScaleDown : function () {
        'use strict';
        this.radiusScale /= 1.01;
        if (this.radiusScale < 0.0001) {
            this.radiusScale = 0.0001;
        }
    }
};

var AstroControl = function () {
    'use strict';
    this.isRunning = true;
    this.speedUpPressed = false;
    this.slowDownPressed = false;
    this.distanceScaleDownPressed = false;
    this.distanceScaleUpPressed = false;
    this.radiusScaleDownPressed = false;
    this.radiusScaleUpPressed = false;

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
            case 75: /* k */
                me.distanceScaleDownPressed = true;
                break;
            case 76: /* l */
                me.distanceScaleUpPressed = true;
                break;
            case 73: /* i */
                me.radiusScaleDownPressed = true;
                break;
            case 79: /* o */
                me.radiusScaleUpPressed = true;
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
            case 75: /* k */
                me.distanceScaleDownPressed = false;
                break;
            case 76: /* l */
                me.distanceScaleUpPressed = false;
                break;
            case 73: /* i */
                me.radiusScaleDownPressed = false;
                break;
            case 79: /* o */
                me.radiusScaleUpPressed = false;
                break;
            }
        }, false);
    };
};

var AstroMesh = function (radius, image) {
    'use strict';
    return new THREE.Mesh(
        new THREE.SphereGeometry(radius * astroParams.radiusScale / Astro.Const.AE * 10000, 32, 32),
        new THREE.MeshPhongMaterial(
            {
                map   : THREE.ImageUtils.loadTexture(image),
                shading: THREE.SmoothShading,
                wireframe : false
            }
        )
    );
};

var AstronomicalObject = function (properties) {
    'use strict';
    this.radius = properties.radius; // km
    this.rotationPeriod = properties.rotationPeriod; // d
    this.mesh = properties.hasOwnProperty('mesh') ? properties.mesh : null;
    this.color = properties.color;
    this.texture = properties.hasOwnProperty('texture') ? properties.texture : null;
    this.satellites =  properties.hasOwnProperty('satellites') ? properties.satellites : [];
    this.axialTilt = properties.hasOwnProperty('axialTilt') ? properties.axialTilt : 0;
    this.angle = 0;

    this.initMesh = function (scale) {
        var satellite, name;
        if (this.mesh === null) {
            if (this.texture === null) {
                this.mesh = new THREE.Mesh(
                    new THREE.SphereGeometry(this.radius * astroParams.radiusScale / Astro.Const.AE * 10000, 32, 32),
                    new THREE.MeshBasicMaterial({color : this.color, wireframe : true })
                );
            } else {
                this.mesh = new AstroMesh(this.radius, this.texture);
            }
        }
        this.mesh.rotation.x =  this.axialTilt;

        for (name in this.satellites) {
            if (this.satellites.hasOwnProperty(name)) {
                satellite = this.satellites[name];
                satellite.astronomicalObject = new AstronomicalObject(satellite);
                satellite.astronomicalObject.initMesh(scale);
            }
        }
    };

    this.addToScene = function (scene) {
        var satellite, name;
        scene.add(this.mesh);
        for (name in this.satellites) {
            if (this.satellites.hasOwnProperty(name)) {
                satellite = this.satellites[name];
                satellite.astronomicalObject.addToScene(scene);
            }
        }
    };

    this.move = function () {
        var satellite, astronomicalObject, name;

        this.mesh.rotation.y +=  1 / this.rotationPeriod * astroParams.timeFactor / 96;
        this.mesh.scale.x = Math.log(astroParams.radiusScale * Math.E);
        this.mesh.scale.y = Math.log(astroParams.radiusScale * Math.E);
        this.mesh.scale.z = Math.log(astroParams.radiusScale * Math.E);

        for (name in this.satellites) {
            if (this.satellites.hasOwnProperty(name)) {
                satellite = this.satellites[name];
                astronomicalObject = satellite.astronomicalObject;

                astronomicalObject.angle += astroParams.timeFactor / satellite.orbitalPeriod / 96;
                astronomicalObject.mesh.position.x = this.mesh.position.x + satellite.distance / Astro.Const.AE * 300 * astroParams.distanceScale * Math.cos(astronomicalObject.angle);
                astronomicalObject.mesh.position.z = this.mesh.position.z + satellite.distance / Astro.Const.AE * 300 * astroParams.distanceScale * Math.sin(astronomicalObject.angle);

                astronomicalObject.move();
            }
        }
    };
};

// https://en.wikipedia.org/wiki/List_of_gravitationally_rounded_objects_of_the_Solar_System
var solarSystem = {
    sun : {
        radius         : 696000, // km
        rotationPeriod : 25.38, // d
        axialTilt      : THREE.Math.degToRad(7.25), // rad
        color          : 'yellow',
        texture        : 'images/700328main_20121014_003615_flat.jpg',
        satellites     : {
            mercury : {
                distance       : 57909175, // km
                radius         : 2439.64, // km
                rotationPeriod : 58.646225, // d
                orbitalPeriod  : 0.2408467 * 365, // d,
                inclination    : THREE.Math.degToRad(7),
                axialTilt      : 0,
                texture        : 'images/mer0muu2.jpg'
            },

            venus : {
                distance       : 108208930, // km
                radius         : 6051.59, // km
                rotationPeriod : 243.0187, // d
                orbitalPeriod  : 0.61519726 * 365, // d,
                inclination    : THREE.Math.degToRad(3.39),
                axialTilt      : THREE.Math.degToRad(177.3),
                texture        : 'images/ven0mss2.jpg'
            },

            earth : {
                distance       : 149597890, // km
                radius         : 6378.1, // km
                rotationPeriod : 0.99726968, // d
                orbitalPeriod  : 1.0000174 * 365, // d,
                inclination    : THREE.Math.degToRad(23.44),
                axialTilt      : 0,
                texture        : 'images/earth_atmos_2048.jpg',
                satellites     : {
                    moon : {
                        distance       : 384399, // km
                        radius         : 1737.1, // km
                        rotationPeriod : 27.321582, // d
                        orbitalPeriod  : 27.32158, // d,
                        inclination    : THREE.Math.degToRad(18.29),
                        axialTilt      : THREE.Math.degToRad(6.68),
                        texture        : 'images/ear1ccc2.jpg'
                    }
                }
            },

            mars : {
                distance       : 227936640, // km
                radius         : 3397.00, // km
                rotationPeriod : 1.02595675, // d
                orbitalPeriod  : 1.8808476, // d,
                inclination    : THREE.Math.degToRad(23.44),
                axialTilt      : 0,
                texture        : 'images/mar0kuu2.jpg',
                satellites     : {
                    phobos : {
                        distance       : 9377.2, // km
                        radius         : 11.1, // km
                        rotationPeriod : 0.31891023, // d
                        orbitalPeriod  : 0.31891023, // d,
                        inclination    : THREE.Math.degToRad(1.093), // 18.29–28.58
                        axialTilt      : 0,
                        color        : 'red'
                    },

                    deimos : {
                        distance       : 23460, // km
                        radius         : 6.2, // km
                        rotationPeriod : 1.26244, // d
                        orbitalPeriod  : 1.26244, // d,
                        inclination    : THREE.Math.degToRad(0.93), // 18.29–28.58
                        axialTilt      : 0,
                        color        : 'green'
                    }
                }
            },

            jupiter : {
                distance       : 778412010, // km
                radius         : 71492.68, // km
                rotationPeriod : 0.41354, // d
                orbitalPeriod  : 11.862615 * 365, // d,
                inclination    : THREE.Math.degToRad(1.31),
                axialTilt      : THREE.Math.degToRad(3.12),
                texture        : 'images/jup0vss1.jpg',
                satellites: {
                    io : {
                        distance       : 421600, // km
                        radius         : 1815, // km
                        rotationPeriod : 1.7691378, // d
                        orbitalPeriod  : 1.769138, // d,
                        inclination    : THREE.Math.degToRad(0.04),
                        axialTilt      : 0,
                        color          : 'gray'
                    },
                    europa : {
                        distance       : 670900, // km
                        radius         : 1569, // km
                        rotationPeriod : 3.551181, // d
                        orbitalPeriod  : 3.551181, // d,
                        inclination    : THREE.Math.degToRad(0.47),
                        axialTilt      : 0,
                        texture        : 'images/jup2vuu2.jpg'
                    },
                    ganymede : {
                        distance       : 1070400, // km
                        radius         : 2634.1, // km
                        rotationPeriod : 7.154553, // d
                        orbitalPeriod  : 7.154553, // d,
                        inclination    : THREE.Math.degToRad(1.85),
                        axialTilt      : 0,
                        texture        : 'images/jup3vuu2.jpg'
                    },
                    callisto : {
                        distance       : 1882700, // km
                        radius         : 2410.3, // km
                        rotationPeriod : 16.68902, // d
                        orbitalPeriod  : 16.68902, // d,
                        inclination    : THREE.Math.degToRad(0.2),
                        axialTilt      : 0,
                        texture        : 'images/jup4vuu2.jpg'
                    }
                }
            },

            saturn : {
                distance       : 1426725400, // km
                radius         : 60267.14, // km
                rotationPeriod : 0.44401, // d
                orbitalPeriod  : 29.447498 * 365, // d,
                inclination    : THREE.Math.degToRad(2.48),
                axialTilt      : THREE.Math.degToRad(26.73),
                texture        : 'images/sat0fds1.jpg'
            },

            uranus : {
                distance       : 2870972200, // km
                radius         : 25557.25, // km
                rotationPeriod : 0.71833, // d
                orbitalPeriod  : 84.016846 * 365, // d,
                inclination    : THREE.Math.degToRad(0.76),
                axialTilt      : THREE.Math.degToRad(97.86),
                texture        : 'images/ura0fss1.jpg'
            },

            neptune : {
                distance       : 4498252900, // km
                radius         : 24766.36, // km
                rotationPeriod : 0.67125, // d
                orbitalPeriod  : 164.79132 * 365, // d,
                inclination    : THREE.Math.degToRad(1.77),
                axialTilt      : THREE.Math.degToRad(29.58),
                texture        : 'images/nep0fds1.jpg'
            }
        }
    }
};

var sun = new AstronomicalObject(solarSystem.sun);

function ready() {
    'use strict';

    var scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
        renderer = new THREE.WebGLRenderer(),
        controls = new THREE.TrackballControls(camera),
        astroControl = new AstroControl(),
        ambient = new THREE.AmbientLight(0xffffff),
        stats,
        astroObject = sun,
        render = function () {

            if (astroControl.isRunning) {
                astroObject.move();
            }

            if (astroControl.slowDownPressed) {
                astroParams.slowDown();
            }
            if (astroControl.speedUpPressed) {
                astroParams.speedUp();
            }
            if (astroControl.distanceScaleDownPressed) {
                astroParams.distanceScaleDown();
            }
            if (astroControl.distanceScaleUpPressed) {
                astroParams.distanceScaleUp();
            }
            if (astroControl.radiusScaleDownPressed) {
                astroParams.radiusScaleDown();
            }
            if (astroControl.radiusScaleUpPressed) {
                astroParams.radiusScaleUp();
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

    astroObject.initMesh(1);
    astroObject.addToScene(scene);

    camera.position.x = 0;
    camera.position.y = 64;
    camera.position.z = 300;
    camera.rotation.x = -Math.PI / 6;

    astroControl.initKeyboard();
    render();
}

$(document).ready(ready());