# Web-Based-Deadlock-Detection

Live: https://iiuc-syndicate.github.io/Web-Based-Deadlock-Detection/

Single Instance Example:<br>
Processes : p1,p2<br>
Resources : r1,r2<br>

Req : p1 - r2<br>
req : p2 - r2<br>
Assign : r1 - p1<br>
Assign : r2 - p2<br>

Multi-Instance Example:<br>
Processes : 5<br>
Resources : 3<br>

Available : 0 0 0<br>

Allocated : <br>
0 1 0<br>
2 0 0<br>
3 0 3<br>
2 1 1<br>
0 0 2<br>

Request :<br>
0 0 0<br>
2 0 2<br>
0 0 0/1<br>
1 0 0<br>
0 0 2<br>
