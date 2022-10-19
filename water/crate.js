
import * as THREE from '/portfolio/js/three.module.js';

export class crate{
    constructor(x, z, d = 0.2, physObs, scene, virtualmouse, waterob){
        this.pos = new THREE.Vector3(x, 0, z);
        this.w = d;
        this.h = d;
        this.d = d;
        this.physObs = physObs;
        this.scene = scene;
        this.vol= d*d*d;
        this.vel = new THREE.Vector3();
        this.geo = new THREE.BoxBufferGeometry(d, d, d);
        this.abovewater = true;
        this.internaltime = 0;
        this.selected;
        this.hitwater = false;
        const loader = new THREE.TextureLoader();
        this.mat = new THREE.MeshPhongMaterial({
            map:loader.load('./water/crate.jpg'),
            normalMap: loader.load('./water/crate-normal.jpg')
        });
        this.mesh = new THREE.Mesh(this.geo, this.mat);
        this.virtualmouse = virtualmouse;
        this.mesh.castShadow = true;
        this.mesh.position.copy(this.pos);
        this.mesh.layers.enable(1);
        this.mesh.rotation.y = Math.random()*Math.PI*2;
        this.physObs.push(this);
        this.scene.add(this.mesh);

        this.waterob = waterob;
    }

    update(){
        if(this.selected){
            this.pos.copy(this.virtualmouse.pos);
            this.pos.y += .1;
            this.hitwater = false;
        }else{
            var waterInfo = this.waterob.infoAtPos(this.pos.x, this.pos.z);
            var normal = new THREE.Vector3(waterInfo.normal.y, waterInfo.normal.z, waterInfo.normal.x);
            this.vel.y -= 9.81 / 15000;
            var diff = (this.pos.y-this.h/2) - waterInfo.pos;
            if(diff < 0){
                this.vel.y /= 1.1;
                this.vel.y -= diff /20;
                if(!this.hitwater){
                    this.hitwater = true;
                    
                }
            }
            else{
                this.hitwater = false;
            }
            this.pos.add(this.vel);
            normal.normalize().multiplyScalar(Math.PI*2);
            var tempvec = new THREE.Vector3().setFromEuler(this.mesh.rotation).add(normal);
            this.mesh.rotation.setFromVector3(tempvec.lerp(new THREE.Vector3(0,tempvec.y,0),0.1));
        }
        this.mesh.position.copy(this.pos);  
    }

    drop(){
        this.selected = false;
    }

    select(){
        this.selected = true;
        this.abovewater = true;
        return this;
    }
}
