precision mediump float;

attribute vec4 MCVertex;
attribute vec3 MCNormal;

varying vec3 Color;

uniform vec3 LightPosition;
uniform vec3 SkyColor;
uniform vec3 GroundColor;

uniform mat4 MVMatrix;
uniform mat4 MVPMatrix;
uniform mat3 NormalMatrix;

void main() {
    // Usual positions / vectors in eye coordinates
    vec3 ecPosition = vec3(MVMatrix * MCVertex);
    vec3 tnorm = normalize(NormalMatrix * MCNormal);
    vec3 lightVec = normalize(LightPosition - ecPosition);
    
    // Compute an approximation of the integral of illumination at that vertex:
    // color = a. SkyColor + (1 - a) . GroundColor with a = 0.5 + (0.5 . cos(theta))
    float costheta = dot(tnorm, lightVec);
    float a = costheta * 0.5 + 0.5;
    Color = mix(GroundColor, SkyColor, a);
    
    gl_Position = MVPMatrix * MCVertex;
}
