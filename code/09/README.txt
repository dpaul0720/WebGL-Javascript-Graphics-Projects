wireSphere: wire frame of recursively generated sphere

shadedCube: rotating cube with modified Phong shading

shadedSphere1: shaded sphere, lighting is computed *per vertex* using *per-vertex normal* in the vertex shader, and the shade is interpolated over fragment

shadedSphere2: shaded sphere, lighting is computed *per fragment* using *per-vertex normal* in the fragment shader

shadedSphere3: shaded sphere, lighting is computed *per vertex* using *per-face normal* in the vertex shader, and the shade is interpolated over fragment

shadedSphere4: shaded sphere, lighting is computed *per fragment* using *per-face normal* in the fragment shader

shadedSphereEyeSpace and shadedSphereObjectSpace: show how lighting computations can be carried out in these spaces
