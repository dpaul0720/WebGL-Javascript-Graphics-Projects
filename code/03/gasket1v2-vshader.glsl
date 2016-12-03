// attribute variable passes data that differs for each vertex,
// it is only available to the vertex shader
// format: storage-qualifier type variable-name

attribute vec4 vPosition;

void
main()
{
    gl_PointSize = 1.0;
    gl_Position = vPosition;
}
