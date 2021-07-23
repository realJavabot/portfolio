
import * as THREE from 'https://unpkg.com/three/build/three.module.js';

export class raycast{
    constructor(can, scene, waterob, physObs, camera, virtualmouse){
        this.intersects = [];
        this.physObs = physObs;
        this.scene = scene;
        this.waterob = waterob;
        this.can = can;
        this.mouse = new THREE.Vector2();
        this.camera = camera;
        var raycaster = new THREE.Raycaster();
        this.selected = 0;
        this.virtualmouse = virtualmouse;
        raycaster.params.Points.threshold = 0.25;
        raycaster.layers.set(1);  
        this.caster = raycaster; 
    }

    mousedown(event){
        if(this.intersects.length > 0){
            for(var i=0; i<this.intersects.length; i++){
                for(var j=0; j<this.physObs.length; j++){
                    if(this.intersects[i].object === this.physObs[j].mesh){
                        this.selected = this.physObs[j].select();
                        break;
                    }
                }
                if(this.selected){
                    break;
                }
                if(i == this.intersects.length-1){
                    const pos = this.intersects[0].point;
                    const waterwidth =128;
                    this.waterob.poke((pos.x+.5) * waterwidth, (pos.z+.5) * waterwidth, 0, .1);
                }
            }
        }
    }

    mouseup(event){
        if(this.selected){
            this.selected.drop();
            this.selected = 0;
        }
    }

    mousemove(event){
        this.setRaycaster(event);
        if(this.selected){
            this.intersects = this.caster.intersectObject(this.waterob.mesh);
        }else{
            this.intersects = this.caster.intersectObjects(this.scene.children);
        }
        if(this.intersects.length > 0){
            const pos = this.virtualmouse.pos = this.intersects[0].point;
            const waterwidth = 128;
            this.waterob.poke((pos.x+.5) * waterwidth, (pos.z+.5) * waterwidth, 0, .05);
        }
    }

    setRaycaster(event){
        this.getMouse(event);
        this.caster.setFromCamera(this.mouse, this.camera);
    }

    getMouse(event){
        this.mouse.x = ((event.clientX-this.can.offsetLeft) / this.can.width) * 2 - 1;
        this.mouse.y = -((event.clientY-this.can.offsetTop) / this.can.height) * 2 + 1;
    }
}