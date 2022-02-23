class Renderer {

    constructor(elementId) {
        const element = document.getElementById(elementId);
        const rect = element.getBoundingClientRect();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000);

        this.camera.position.set(5, 5, 5);

        this.camera.lookAt(new THREE.Vector3(0, 0, 0)); // Set look at coordinate like this

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(rect.width, rect.height);
        element.appendChild(this.renderer.domElement);

        console.log(this.renderer.domElement);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        this.animFuncs = [];
        this.animate();
    }

    previousTime = +new Date();
    deltaTime = 0;
    time = 0;

    animate() {
        let currentTime = +new Date();
        this.deltaTime = (currentTime - this.previousTime) / 1000;
        this.time += this.deltaTime;
        this.previousTime = currentTime;
        requestAnimationFrame(() => this.animate(this.time, this.deltaTime));
        this.animFuncs.forEach(f => f());
        this.renderer.render(this.scene, this.camera);
    }

    addCylinder(p, r, h) {
        const geometry = new THREE.CylinderGeometry(r, r, h, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xff0055, opacity: 0.5, transparent: true, side: THREE.DoubleSide });
        const cylinder = new THREE.Mesh(geometry, material);
        this.scene.add(cylinder);
        cylinder.position.add(p);
        return cylinder;
    }

    addLine(a, b, color) {
        const material = new THREE.LineBasicMaterial({ color: color });
        const points = [];
        points.push(a);
        points.push(b);

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
    }

    addPlane() {
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const plane = new THREE.Mesh(geometry, material);
        this.scene.add(plane);
        return plane;
    }

    addArrow(origin, direction, color) {
        const arrow = new THREE.ArrowHelper(direction, origin, 1, color);
        this.scene.add(arrow);
    }
}

const renderer = new Renderer("three");


const I = new THREE.Vector3(1, 0, 0);
const J = new THREE.Vector3(0, 1, 0);
const K = new THREE.Vector3(0, 0, 1);

renderer.animFuncs.push((t, dt) => {

    // Setup
    renderer.scene.clear();

    const axesHelper = new THREE.AxesHelper(5);
    renderer.scene.add(axesHelper);

    var grid = new THREE.GridHelper(15, 15);
    renderer.scene.add(grid);

    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    renderer.scene.add(light);

    const point = createSphere();
    renderer.scene.add(point);
    point.scale.set(0.1, 0.1, 0.1);
    point.position.set(2.5, 0, 2.5);

    const cylinder1 = createCylinder();
    const cylinder2 = createCylinder();

    renderer.scene.add(cylinder1);
    renderer.scene.add(cylinder2);

    cylinder1.position.set(0, 0.5, 0.5);
    cylinder2.position.copy(cylinder1.position);
    cylinder2.rotation.x = Math.PI / 2;
    cylinder2.position.add(new THREE.Vector3(0, 1, 1));

    const group = new THREE.Group();


    group.add(cylinder1);
    group.add(cylinder2);

    renderer.scene.add(group);

    const bbox = new THREE.Box3().setFromObject(group);
    const helper = new THREE.Box3Helper(bbox, 0xffff00);
    helper.position.set(0, 0, 0);
    renderer.scene.add(helper);
    const axes = new THREE.AxesHelper(1);
    renderer.scene.add(axes);
    group.add(helper);
    group.add(axes);

    group.position.set(2.5, 0, 3.5);

    rotateAroundPointOnAxisX(group, point.position, t);
    rotateAroundPointOnAxisY(group, point.position, t);
    rotateAroundPointOnAxisZ(group, point.position, t);
});

function rotateAroundPointOnAxisX(object, point, angle) {
    if (object.type === "Group") {
        object.position.sub(point);
        const matrix = new THREE.Matrix4();
        matrix.makeRotationX(angle);
        object.applyMatrix4(matrix);
        object.position.add(point);
    }
}

function rotateAroundPointOnAxisY(object, point, angle) {
    if (object.type === "Group") {
        object.position.sub(point);
        const matrix = new THREE.Matrix4();
        matrix.makeRotationY(angle);
        object.applyMatrix4(matrix);
        object.position.add(point);
    }
}

function rotateAroundPointOnAxisZ(object, point, angle) {
    if (object.type === "Group") {
        object.position.sub(point);
        const matrix = new THREE.Matrix4();
        matrix.makeRotationZ(angle);
        object.applyMatrix4(matrix);
        object.position.add(point);
    }
}

function createCylinder() {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    return new THREE.Mesh(geometry, material);
}

function createSphere() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    return new THREE.Mesh(geometry, material);
}

function rotateAroundWorldAxis(obj, axis, radians) {
    let rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(obj.matrix);
    obj.matrix = rotWorldMatrix;
    obj.setRotationFromMatrix(obj.matrix);
}