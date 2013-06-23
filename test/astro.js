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
        new THREE.SphereGeometry(radius * astroParams.radiusScale, 32, 32),
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
    this.satellites = properties.satellites;
    this.axialTilt = properties.hasOwnProperty('axialTilt') ? properties.axialTilt : 0;

    this.initMesh = function (scale) {
        var i, satellite;
        if (this.mesh === null) {
            if (this.texture === null) {
                this.mesh = new THREE.Mesh(
                    new THREE.SphereGeometry(this.radius * astroParams.radiusScale, 32, 32),
                    new THREE.MeshBasicMaterial({color : this.color, wireframe : true })
                );
            } else {
                this.mesh = new AstroMesh(this.radius, this.texture);
            }
        }
        this.mesh.rotation.x =  this.axialTilt;
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

        this.mesh.rotation.y +=  this.rotationPeriod / 100 * astroParams.timeFactor;
        this.mesh.scale.x = Math.log(astroParams.radiusScale * Math.E);
        this.mesh.scale.y = Math.log(astroParams.radiusScale * Math.E);
        this.mesh.scale.z = Math.log(astroParams.radiusScale * Math.E);

        for (i = 0; i < this.satellites.length; i += 1) {
            satellite = this.satellites[i];
            satellite.angle += 1 / satellite.orbitalPeriod * astroParams.timeFactor;

            astronomicalObject = satellite.astronomicalObject;
            astronomicalObject.mesh.position.x = this.mesh.position.x + satellite.distance * astroParams.distanceScale * Math.cos(satellite.angle);
            astronomicalObject.mesh.position.z = this.mesh.position.z + satellite.distance * astroParams.distanceScale * Math.sin(satellite.angle);

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

var venus = new AstronomicalObject(
    {
        radius        : 0.9488,
        rotationPeriod : 243.0187,
        axialTilt     : THREE.Math.degToRad(177.3),
        texture       : 'images/ven0mss2.jpg',
        color         : 'red',
        satellites    : []
    }
);
var apollo13 = new AstronomicalObject(
    {
        radius        : 0.2,
        rotationPeriod : 10,
        color         : 'pink',
        satellites    : []
    }
);
var moon = new AstronomicalObject(
    {
        radius        : 3474.2 / Astro.Const.EARTH_RADIUS,
        rotationPeriod : 27.321582,
        axialTilt     : THREE.Math.degToRad(6.68),
        texture       : 'images/ear1ccc2.jpg',
        color         : 'black',
        satellites    : [new SatelliteObject(apollo13, 10, 384400 / Astro.Const.AE, 0)]
    }
);
var earth = new AstronomicalObject(
    {
        radius        : 1,
        rotationPeriod : 1,
        axialTilt     : THREE.Math.degToRad(23.45),
        texture       : 'images/earth_atmos_2048.jpg',
        color         : 'blue',
        satellites    : [new SatelliteObject(moon, 28, 384400 / Astro.Const.AE, 0)]
    }
);

var phobos = new AstronomicalObject(
    {
        radius        : 0.1,
        rotationPeriod : 1 / 0.5,
        color         : 'green',
        satellites    : []
    }
);
var deimos = new AstronomicalObject(
    {
        radius        : 0.1,
        rotationPeriod : 1 / 0.5,
        color         : 'gray',
        satellites    : []
    }
);
var mars = new AstronomicalObject(
    {
        radius        : 0.5326,
        rotationPeriod : 1.02595675,
        axialTilt     : THREE.Math.degToRad(25.19),
        texture       : 'images/mar0kuu2.jpg',
        color         : 'red',
        satellites    : [
            new SatelliteObject(phobos, 0.3189 * 10, 9378 / Astro.Const.AE, 0),
            new SatelliteObject(deimos, 1.262 * 10, 23459 / Astro.Const.AE, 0)
        ]
    }
);
var sun = new AstronomicalObject(
    {
        radius        : 696350 / Astro.Const.EARTH_RADIUS,
        rotationPeriod : 1,
        color         : 'yellow',
        satellites    : [
            new SatelliteObject(venus, 224.701, 0.723, 0),
            new SatelliteObject(earth, 365.256, 1, 0),
            new SatelliteObject(mars, 686.980, 1.524, 0)
        ]
    }
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