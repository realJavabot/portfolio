
import * as THREE from 'portfolio/js/three.module.js';

class particle {
    constructor(pos) {
        this.locked = false;
        this.lockable = true;
        this.pos = pos;
    }
    lock(t) {
        if (this.lockable) {
            this.locked = t;
        }
    }
}

export class fluid {
    constructor(n, m, d, t, c, mu, mesh) {
        this.width = n;
        this.height = m;
        this.d = d;
        var count = m * n;

        this.buffer = [[], []];
        this.renderBuffer = 0;

        this.normal = [];
        this.tangent = [];

        const f1 = c * c * t * t / (d * d);
        const f2 = 1.0 / (mu * t + 2);
        this.k1 = (4.0 - 8.0 * f1) * f2;
        this.k2 = (mu * t - 2) * f2;
        this.k3 = 2.0 * f1 * f2;

        for (var j = 0; j < m; j++) {
            var y = d * j;
            this.buffer[0][j] = [];
            this.buffer[1][j] = [];
            this.normal[j] = [];
            this.tangent[j] = [];
            for (var i = 0; i < n; i++) {
                this.buffer[0][j][i] = new particle(new THREE.Vector3(d * i, y, 0.0));
                this.buffer[1][j][i] = new particle(new THREE.Vector3(d * i, y, 0.0));
                this.normal[j][i] = new THREE.Vector3(0, 0, 2 * d);
                this.tangent[j][i] = new particle(new THREE.Vector3(2 * d, 0, 0));
            }
        }

        this.mesh = mesh;
    }

    evaluate() {
        for (var j = 1; j < this.height - 1; j++) {
            var crnt = this.buffer[this.renderBuffer][j];
            var prev = this.buffer[1 - this.renderBuffer][j];
            for (var i = 1; i < this.width - 1; i++) {
                if (crnt[i].locked) {
                    continue;
                }
                prev[i].pos.z = this.k1 * crnt[i].pos.z + this.k2 * prev[i].pos.z +
                    this.k3 * (crnt[i + 1].pos.z + crnt[i - 1].pos.z +
                        this.buffer[this.renderBuffer][j + 1][i].pos.z + this.buffer[this.renderBuffer][j - 1][i].pos.z);
                this.normal[j][i].x = (-(this.buffer[this.renderBuffer][j][i+1].pos.z - crnt[i].pos.z)-(this.buffer[this.renderBuffer][j][i-1].pos.z - crnt[i].pos.z))/2;
                this.normal[j][i].y = (-(this.buffer[this.renderBuffer][j+1][i].pos.z - crnt[i].pos.z)-(this.buffer[this.renderBuffer][j-1][i].pos.z - crnt[i].pos.z))/2;
                this.normal[j][i].z = this.d;
            }
        }

        this.renderBuffer = 1 - this.renderBuffer;
    }

    infoAtPos(x,y){
        x = Math.floor((x+.5)*this.width);
        y = Math.floor((y+.5)*this.height);
        return {pos: this.buffer[this.renderBuffer][y][x].pos.z, normal:this.normal[y][x]};
    }

    updateMesh() {
        var vertArr = this.mesh.geometry.attributes.position.array;
        var normalArr = this.mesh.geometry.attributes.normal.array;
        if (vertArr.length / 3 != ((this.width) * (this.height))) {
            console.log("wrong number vertices, expected " + (this.width * this.height) + " got " + vertArr.length / 3);
            return;
        }
        for (var i = 0; i < ((this.width) * (this.height)); i++) {
            var x = i % (this.width);
            var y = Math.floor(i / (this.height));
            vertArr[(i * 3) + 2] = this.buffer[this.renderBuffer][y][x].pos.z;
            normalArr[(i * 3)] = this.normal[y][x].x;
            normalArr[(i * 3)+1] = this.normal[y][x].y;
            normalArr[(i * 3)+2] = this.normal[y][x].z;
        }
        this.mesh.geometry.attributes.position.needsUpdate = true;
        this.mesh.geometry.attributes.normal.needsUpdate = true;
    }

    poke(x, y, d, s) {
        this.areaSquare(x, y, 10, d).forEach(([j, i]) => {
            // this.buffer[0][j][i].pos.z = this.buffer[1][j][i].pos.z = -.04;
            this.buffer[0][j][i].pos.z = this.buffer[1][j][i].pos.z = (i * j != 0 && (i < this.width - 1 && j < this.height - 1)) ? -s : 0;
        });
    }

    lock(x, y, size, value, deg) {
        this.areaSquare(x, y, size, deg).forEach(([j, i]) => {
            this.buffer[0][j][i].lock(true);
            this.buffer[1][j][i].lock(true);
            this.buffer[0][j][i].pos.z = this.buffer[1][j][i].pos.z = (i * j != 0 && (i < this.width - 1 && j < this.height - 1)) ? value : 0;
        });
    }

    unlock() {
        for (var j = 0; j < this.height; j++) {
            for (var i = 0; i < this.width; i++) {
                this.buffer[0][j][i].lock(false);
                this.buffer[1][j][i].lock(false);
            }
        }
    }

    areaCircle(x, y, r) {
        var points = [];
        for (var j = 0; j < this.height; j++) {
            for (var i = 0; i < this.width; i++) {
                if (Math.sqrt((j - y) * (j - y) + (i - x) * (i - x)) < r) {
                    points.push([j, i]);
                }
            }
        }
        return points;
    }

    areaSquare(x, y, w, deg) {
        var points = [];
        for (var j = 0; j < this.height; j++) {
            for (var i = 0; i < this.width; i++) {
                var newx = (i - x);
                var newy = (j - y);
                var length = Math.abs(Math.hypot(newx, newy));
                if (Math.max(
                    Math.abs(Math.cos(Math.atan(newy / newx) - deg)),
                    Math.abs(Math.sin(Math.atan(newy / newx) - deg))
                ) * length > w / 2) {
                    continue;
                } else {
                    points.push([j, i]);
                }
            }
        }
        return points;
    }
}