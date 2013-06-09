var planets = {
    sun     : {
        orbitalPeriod : 0,
        distance      : 0,
        radius        : 1392700 / 2 / 10,
        angle : 0,
        mesh : null,
        color         : 0xffff00
    },
    mercury : {
        orbitalPeriod : 87.969, // days
        distance      : 57909100, // km
        radius        : 2439.7,  // km
        angle : 0,
        mesh : null,
        color         : 0x222222
    },
    venus   : {
        orbitalPeriod : 224.698, // days
        distance      : 108208000, // km
        radius        : 6051.8, // km
        angle : 0,
        mesh : null,
        color         : 0xff8800
    },
    earth   : {
        orbitalPeriod : 365.256, // days
        distance      : 149598261, // km
        radius        : 6371, // km
        angle : 0,
        mesh : null,
        color         : 0x0000ff
    },
    mars   : {
        orbitalPeriod : 686.971, // days
        distance      : 227939100, // km
        radius        : 3396.2, // km
        angle : 0,
        mesh : null,
        color         : 0xff0000
    },
    jupiter : {
        orbitalPeriod : 4332.59, // days
        distance      : 778547200, // km
        radius        : 69911, // km
        angle : 0,
        mesh : null,
        color         : 0xaaaa00
    },
    saturn : {
        orbitalPeriod : 10759.22, // days
        distance      : 1353572956, // km
        radius        : 60268, // km
        angle : 0,
        mesh : null,
        color         : 0x444444
    }
};

function ready() {
    'use strict';

    var scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
        renderer = new THREE.WebGLRenderer(),
        controls = new THREE.TrackballControls(camera),
        stats,
        planetSpeedFactor = 5,
        planet,
        planetName,
        render = function () {
            var planet,
                planetName;
            for (planetName in planets) {
                if (planets.hasOwnProperty(planetName)) {
                    if ('sun' !== planetName) {
                        planet = planets[planetName];
                        planet.angle += 1 / planet.orbitalPeriod * planetSpeedFactor;
                        planet.mesh.position.x = planet.distance / planets.earth.distance * 10 * 2 * Math.cos(planet.angle);
                        planet.mesh.position.z = planet.distance / planets.earth.distance * 10 * 2 * Math.sin(planet.angle);
                    }
                }
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

    for (planetName in planets) {
        if (planets.hasOwnProperty(planetName)) {
            planet = planets[planetName];
            planet.mesh = new THREE.Mesh(new THREE.SphereGeometry(planet.radius * 2 / planets.sun.radius, 10, 10), new THREE.MeshBasicMaterial({color : planet.color, wireframe : true }));
            scene.add(planet.mesh);
        }
    }

    camera.position.x = 0;
    camera.position.y = 16;
    camera.position.z = 25;
    camera.rotation.x = -Math.PI / 6;

    render();
}

$(document).ready(ready());