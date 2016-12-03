square-transform: display a square with a sequence of transformation, including scaling, rotation and translation. Notice the different results when applying these transformations in different orders!

square-transform-matrix-array: modify from square-transform, draw four instances of the square that show the different results when applying transformations in different orders. Use a matrix array to store the accumulated transformation for squares.

cube-arrays: displays a rotating cube with a single color for each face, using orthogonal projection to flip the z coordinates, draw as arrays. Multiply rotation matrices in sequence. Produce desirable rotations, e.g., … * rotx(10) * rotz(30) * roty(30) * rotx(30).

cube-elements: the same as cube-arrays but draw elements instead. Vertex colors interpolated across faces. 

cube-arrays-instancing: modified from cube-arrays, in additional to cube-arrays, we translate the cube and make the cube as a “satellite” which rotates around the center (0, 0, 0). So, the cube has two rotations, one along the center (0, 0, 0), and another one along its own axes. 

cube-trackball-rotation: creates a virtual trackball to control rotation of cube. Increments rotation matrix in application and send it to vertex shader.
