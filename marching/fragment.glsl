varying vec2 vUv;
varying vec4 pos;
uniform vec4 resolution;
uniform float progress;
uniform vec3 positions;
uniform mat4 matrix;
uniform sampler2D uMatcap;

float sdSphere( vec3 p, float s )
{
    return length(p)-s;
}

vec2 getMatCap(vec3 vPos, vec3 normal){
    vec3 r = reflect(normalize(vec3(vPos)), normal);
    float m = 2.82842712474619 * sqrt(r.z+1.01);
    return r.xy / m + .5;
}

float sdBoundingBox( vec3 p, vec3 b, float e )
{
    p = (matrix*vec4(p.xyz,1.)).xyz;
       p = abs(p  )-b;
  vec3 q = abs(p+e)-e;
  return min(min(
      length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
      length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
      length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
}

float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h); 
}

float sdf(vec3 p){
    float retval = 5.0;
    //retval = opSmoothUnion(sdSphere(p - positions[i], .1), retval, .5);
    retval = opSmoothUnion(sdSphere(p-positions, .5), sdBoundingBox(p,vec3(.5,.5,.5),.04), .3);
    return retval;
}

vec3 GetSurfaceNormal(vec3 p)
{
    float d0 = sdf(p);
    const vec2 epsilon = vec2(.0001,0);
    vec3 d1 = vec3(
        sdf(p-epsilon.xyy),
        sdf(p-epsilon.yxy),
        sdf(p-epsilon.yyx));
    return normalize(d0 - d1);
}

void main() {
    vec2 newUV = (vUv - vec2(.5))*resolution.zw;
    vec3 cam = vec3(0.,0.,2.);
    vec3 ray = normalize(vec3(newUV, -1.));

    vec3 raypos = cam;
    float t = 0.;
    float tmax = 5.;
    for(int i=0; i<256; i++){
        vec3 pos = cam + t*ray;
        float h = sdf(pos);
        if(h < .0001 || h > tmax) break;
        t+=h;
    }

    vec3 color = vec3(.066);
    if(t<tmax){
        vec3 pos = cam + t*ray;
        color = vec3(1.);
        vec3 normal = GetSurfaceNormal(pos);
        //  normal = cross(normal,vec3(vUv,1.));
        // normal = vec3(sin(vUv.x*100.), 0, 0);
        vec2 matcapUV = getMatCap(pos,normal);
        //color = vec3(matcapUV,0.);
         color = texture2D(uMatcap,matcapUV).rgb;
    }

    gl_FragColor = vec4(color, 1.);
}