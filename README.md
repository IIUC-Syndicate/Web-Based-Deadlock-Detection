# Web-Based-Deadlock-Detection

Live: https://iiuc-syndicate.github.io/Web-Based-Deadlock-Detection/

Single Instance Example:
Processes : p1,p2
Resources : r1,r2

Req : p1 - r2
req : p2 - r2
Assign : r1 - p1
Assign : r2 - p2

Multi-Instance Example:
Processes : 5
Resources : 3

Available : 0 0 0

Allocated : 
0 1 0
2 0 0
3 0 3
2 1 1
0 0 2

Request :
0 0 0
2 0 2
0 0 0/1
1 0 0
0 0 2
