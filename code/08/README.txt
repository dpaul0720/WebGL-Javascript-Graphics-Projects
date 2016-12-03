cube-arrays-no-projection: draw a cube using only the modeling transformation, no projection transformation is applied. In this case, we need to manually flip the z value in the vertex shader.

cube-arrays-with-projection: draw a cube using the modeling transformation and the standard projection transformation. In this case, z flipping is done by setting near and far values to -1 and 1 respectively, in the ortho() function.
