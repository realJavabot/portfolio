import * as THREE from 'three.module.js';
var can, renderer, scene, camera, mouse;
var loader = new THREE.FileLoader();
var tloader = new THREE.TextureLoader();

var metaballShader = {
    uniforms: {
        time: { value: 0 },
        progress: { value: 0 },
        resolution: { value: new THREE.Vector4() },
        positions: { value: new THREE.Vector3() },
        matrix: {value: new THREE.Matrix4() },
        uMatcap: {value: tloader.load("marching/matcap.jpg") },
    },
    vertexShader:
        `varying vec2 vUv;
            varying vec4 pos;
            void main() {
                vUv = uv;
                pos = vec4( position, 1.0 );
                gl_Position = pos;
            }`,
    fragmentShader: ``
};
loader.load('marching/fragment.glsl', (data) => { metaballShader.fragmentShader = data; init(); });

var mousedown = false;
function mousemove(event) {
    var dx = event.clientX - mouse.x;
    var dy = event.clientY - mouse.y;
    if(Math.abs(dx)+Math.abs(dy) > 200){
        mouse.set(event.clientX, event.clientY);
        return;
    }
    var rotation = new THREE.Euler(dy/400, dx/400, 0);
    mouse.set(event.clientX, event.clientY);
    metaballShader.uniforms.matrix.value.multiply(new THREE.Matrix4().makeRotationFromEuler(rotation));
}

function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight*.5);
    metaballShader.uniforms.resolution.value.set(window.innerWidth, window.innerHeight, window.innerWidth*2 / window.innerHeight, 1);
    
    document.getElementById("marching").appendChild(renderer.domElement);
    scene = new THREE.Scene();
    can = renderer.domElement;

    can.addEventListener("mousemove", mousemove);

    can.addEventListener("mousedown", (event)=>{
        mouse.set(event.clientX, event.clientY)
        mousedown = true;
    });
    can.addEventListener("mouseup", ()=>{
        mousedown = false;
    });

    mouse = new THREE.Vector2();

    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 5;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(.5, .5, 2);
    camera.lookAt(0, 0, 0);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material2 = new THREE.ShaderMaterial(metaballShader);
    const plane = new THREE.Mesh(geometry, material2);
    scene.add(plane);

    var i=0;
    window.setInterval(()=>{
        i+=.01;
        if(i>=2){
            i=0;
        }
        metaballShader.uniforms.positions.value.set(Math.sin(i*Math.PI)*1.1,0,0);
    }, 10);

    generate();

    render();
};

function generate() {
    var width = 3;
    var rad = 1 / 30;
    var sphere = new THREE.SphereBufferGeometry(rad, 10, 10);
    var mat = new THREE.ShaderMaterial(metaballShader);
}

function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight/2 );
    metaballShader.uniforms.resolution.value.set(window.innerWidth, window.innerHeight, window.innerWidth*2 / window.innerHeight, 1);
}