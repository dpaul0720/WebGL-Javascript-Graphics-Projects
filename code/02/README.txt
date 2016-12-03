triangle: Display a single triangle. A single color is directly assigned in fragment shader. 

square: Display a square as a triangle fan consisting of two triangles.

triangle-uni-fcolor: Display a single triangle. A single color is passed from application to fragment shader as a uniform quantifier. 

triangle-var-vcolor: Display a single triangle. Two VBOs are created, one for vertex positions and another for vertex colors. The colors of three vertices are passed down from vertex shader to fragment shader as a varying quantifier. 

multi-triangle-uni-fcolor: Draw multiple triangles. The color for each triangle is passed from application to fragment shader as a uniform quantifier right before the drawing of the triangle. 

multi-triangle-var-vcolor-v1: Draw multiple triangles. Only one VBO is created, storing all vertex positions followed by all vertex colors. Pay attention to how the last two parameters are set for position and color attributes in gl.vertexAttribPointer(). 

multi-triangle-var-vcolor-v1-new: same as multi-triangle-var-vcolor-v1, the only difference is that we now use 2D vertex positions instead of 3D vertex positions. Check how we define “vertices_and_colors” and set up the last two parameters in gl.vertexAttribPointer() differently.

multi-triangle-var-vcolor-v2: Draw multiple triangles. Only one VBO is created, storing each vertex’s position and color one by one. Pay attention to how the last two parameters are set for position and color attributes in gl.vertexAttribPointer(). 

multi-triangle-var-vcolor-v2-new: same as multi-triangle-var-vcolor-v2, the only difference is that we now use 2D vertex positions instead of 3D vertex positions. Check how we define “vertices_and_colors” and set up the last two parameters in gl.vertexAttribPointer() differently.
