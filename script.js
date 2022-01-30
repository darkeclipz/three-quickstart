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

    animate() {
        requestAnimationFrame(() => this.animate());
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
let previousTime = +new Date();
let deltaTime = 0;
let time = 0;

renderer.animFuncs.push(() => {

    let currentTime = +new Date();
    deltaTime = (currentTime - previousTime) / 1000;
    time += deltaTime;
    previousTime = currentTime;

    // Setup
    renderer.scene.clear();

    const axesHelper = new THREE.AxesHelper(5);
    renderer.scene.add(axesHelper);

    var grid = new THREE.GridHelper(15, 15);
    renderer.scene.add(grid);

    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    renderer.scene.add(light);

    // First we define a cylinder, which is pointing upward by default (0, 1, 0).
    const C = new THREE.Vector3(1, 2, 1);
    const C_up = new THREE.Vector3(0, 1, 0);
    const cylinder = renderer.addCylinder(C, 0.2, 1);

    // The cylinder can have a rotation, this is defined by the up vector in the cylinder, and
    // we need to rotate the object so that it looks in this direction.
    const C_dir = new THREE.Vector3(Math.cos(time), Math.cos(time) + Math.sin(time), -Math.sin(time));
    C_dir.normalize();

    // Axis that we want to rotate around, is the cross product of UP x DIR.
    const C_axis = C_up.clone().cross(C_dir);

    // Axis must be normalized!
    C_axis.normalize();

    // Find the angle between the two vectors.
    const C_angle = C_up.angleTo(C_dir);

    // Rotate the cylinder correctly.
    cylinder.rotateOnAxis(C_axis, C_angle);

    // renderer.addArrow(C, C_up, 0xffff00);
    renderer.addArrow(C, C_dir, 0x00ff00);
    renderer.addArrow(C, C_axis, 0x0000ff);

    // Draw a line from A to B
    const A = new THREE.Vector3(0, 2.7, 0);
    const B = new THREE.Vector3(3, 1.2, 3);

    renderer.addLine(A, B, 0xffff00);

    const C_dir_normal = C_axis.clone();
    C_dir_normal.cross(C_dir);
    renderer.addArrow(C, C_dir_normal, 0xff0000);

    // Draw a plane
    const plane = renderer.addPlane();
    plane.scale.multiplyScalar(0.5);
    const P_up = new THREE.Vector3(0, 0, 1);
    //P_up.lookAt(C_dir);
    plane.lookAt(C_dir);
    //renderer.addArrow(plane.position, P_up, 0xffff00);
    //plane.rotation.copy(cylinder.rotation);


    plane.position.add(C);
    const offset = C_dir.clone();
    offset.multiplyScalar(0.501);
    plane.position.sub(offset);

    const plane2 = renderer.addPlane();
    plane2.scale.multiplyScalar(0.5);
    plane2.lookAt(C_dir);
    plane2.position.add(C);
    plane2.position.add(offset);

});
