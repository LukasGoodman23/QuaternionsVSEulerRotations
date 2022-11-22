'use strict'

let timer= null;
let rx = 0;
let ry = 0;
let rz = 0;
let Objects = [];
let rotAxis = [0.0,1.0,0.0];
let rotAngle= 0.0;

//angles always use degrees to cater to glsl
let baseAxis = [0,1,0];
let baseAngle= 90;
let auxAxis= [0,0,0];
let auxAngle= 0;

let gimbelSet= 0.0;

function MakeItems() {
    let cx = eulerCanvas.width/2;
    let cy = eulerCanvas.height/2;

    let obj = new Widget(eulerCanvas.GL(), eulerCanvas.Program(), "vPosition","firstT", "objectOrigin", Bunny_Triangles, eulerCanvas, -1.0);
    obj.Viewport(0,0, 2*cx,2*cy);
    Objects.push(obj);

    obj = new Widget(quatCanvas.GL(), quatCanvas.Program(), "vPosition","firstT", "objectOrigin", Bunny_Triangles, quatCanvas, 1.0);
    obj.Viewport(0,0, 2*cx,2*cy);
    Objects.push(obj);
}

// probably wrong but everyone needs to rotate by the same amount.
function SetUPMidTrans(canvas) {
    let loc = canvas.GL().getUniformLocation(canvas.Program(), "midT");

    let trans = mat4(1);
    trans = mult(trans, rotate(rx, [1,0,0]));
    trans = mult(trans, rotate(ry, [0,1,0]));
    trans = mult(trans, rotate(rz, [0,0,1]));
    canvas.GL().uniformMatrix4fv(loc, false, flatten(trans));

    //-----------------------------------------------------------------------------------------


    let axis= canvas.GL().getUniformLocation(canvas.Program(), "rotationAxis");
    canvas.GL().uniform3fv(axis, rotAxis);

    let angle= canvas.GL().getUniformLocation(canvas.Program(), "rotAngle");
    canvas.GL().uniform1f(angle, rotAngle);
    
}

function SetUP() {
    MakeItems();

    eulerCanvas.AddKeypress(Keypress);
    quatCanvas.AddKeypress(Keypress);
    Reset();
}

function Reset() {
    rx = 0;
    ry = 0;
    rz = 0;
    rotAngle= 0.0;
    gimbelSet= 0.0;
    rotAxis = [0.0,1.0,0.0];
    auxAxis= [0,0,0];
    auxAngle= 0;
    StopTick();

    SetUPMidTrans(eulerCanvas);
    SetUPMidTrans(quatCanvas);
}

function Keypress(evnt) 
{
    switch(evnt.key) 
    {
        //do nothing but center the bunny in the viewport
        case '1':
            Reset();
            SetUPMidTrans(eulerCanvas);
            SetUPMidTrans(quatCanvas);
            Display();
            break;
        //center the bunny and rotate it by 90 deg about
        //the y-axis
        case '2': 
            Reset();
            rotAngle= 90.0; 
            ry= 90.0; 
            SetUPMidTrans(eulerCanvas);
            SetUPMidTrans(quatCanvas);
            Display(); 
            break;
        //center the bunny, rotate it by 90 deg about
        //the y-axis, and slowly rotate it about the
        //x-axis
        case '3':
            Reset();
            ry= 90.0;
            StartXIncrement();
            break;
        
        //center the bunny, rotate it by 90 deg about
        //the y-axis, and slowly rotate it about the
        //z-axis
        case '4':
            Reset();
            ry= 90.0;
            StartZIncrement();
            break;

        default: break;
    }
    
    
}

function StartXIncrement()
{
    if(timer == null)
    {
        auxAxis= [1,0,0];
        timer= setInterval(XIncrement, 42);
    }
}

function StartZIncrement()
{
    if(timer == null)
    {
        auxAxis= [0,0,1];
        timer= setInterval(ZIncrement, 42);
    }
}

function XIncrement() 
{
    rx++;
    auxAngle++;
    CombineAxes();
    SetUPMidTrans(eulerCanvas);
    SetUPMidTrans(quatCanvas);
    Display();

}

function ZIncrement()
{
    rz++;
    auxAngle++;
    CombineAxes();
    SetUPMidTrans(eulerCanvas);
    SetUPMidTrans(quatCanvas);
    Display();
}

function StopTick()
{
    if (timer != null)
    {
        clearInterval(timer);
        timer= null;
    }
}

function ToggleItemVis(id) {
    if (id < Objects.length) {
         if (Objects[id].Visible() ) {
	     Objects[id].Hide();
	 } else {
	     Objects[id].Show();
	 }
    }
}

function DisplayItem(item) {
    item.Display(item.canvas.GL());
}

function Display() {
    eulerCanvas.Clear();
    quatCanvas.Clear();
    Objects.forEach(DisplayItem);
}

function CombineAxes()
{
    //let RA= cos(r1) + q1 * sin(r1) where r1 is the rotation around pure (unit?) quaternion q1
    //let RB= cos(r2) + q2 * sin(r2) where r2 is the rotation around pure (unit?) quaternion q2
    //Let RC= RB * RA and RC = cos(r3) + q3 * sin(r3)

    //Rotation Angle--------------------------------
    //this equation will provide r3

    //cos(r2/2)
    let a1= Math.cos((auxAngle * (Math.PI/180))/2);

    //cos(r1/2)
    let b1= Math.cos((baseAngle * (Math.PI/180))/2);

    //(q2 dot q1)
    let c1= (auxAxis[0]*baseAxis[0] + auxAxis[1]*baseAxis[1] + auxAxis[2]*baseAxis[2]);

    //sin(r2/2)
    let d1= Math.sin((auxAngle * (Math.PI/180))/2);

    //sin(r1/2)
    let e1= Math.sin((baseAngle * (Math.PI/180))/2);

    //cos(r2/2) * cos(r1/2)
    let f1= (a1 * b1);

    //(q2 dot q1) * sin(r2/2) * sin(r1/2)
    let g1= (c1 * d1 * e1);

    //(cos(r2/2) * cos(r1/2)) - ((q2 dot q1) * sin(r2/2) * sin(r1/2))
    let h1= (f1 - g1);

    //2 * acos(cos(r2/2) * cos(r1/2)) - ((q2 dot q1) * sin(r2/2) * sin(r1/2))
    rotAngle= (2 * Math.acos(h1)) * (180/Math.PI);


    //Rotation Axis Vector--------------------------

    //q2 * tan(r2/2)
    let a2=[0,0,0];
    a2[0]= Math.tan((auxAngle * (Math.PI/180))/2) * auxAxis[0]; 
    a2[1]= Math.tan((auxAngle * (Math.PI/180))/2) * auxAxis[1]; 
    a2[2]= Math.tan((auxAngle * (Math.PI/180))/2) * auxAxis[2];

    //q1 * tan(r1/2)
    let b2= [0,0,0];
    b2[0]= Math.tan((baseAngle * (Math.PI/180))/2) * baseAxis[0]; 
    b2[1]= Math.tan((baseAngle * (Math.PI/180))/2) * baseAxis[1]; 
    b2[2]= Math.tan((baseAngle * (Math.PI/180))/2) * baseAxis[2];

    //(q2 cross q1)
    let c2= [0,0,0];
    c2[0]= (auxAxis[1]*baseAxis[2]- auxAxis[2]*baseAxis[1]); c2[1]= (auxAxis[2]*baseAxis[0]- auxAxis[0]*baseAxis[2]); c2[2]= (auxAxis[0]*baseAxis[1]- auxAxis[1]*baseAxis[0]);

    //(q2 cross q1) * tan(r2/2) * tan(r1/2)
    let d2= [0,0,0];
    d2[0] = (Math.tan((auxAngle * (Math.PI/180))/2) * Math.tan((baseAngle * (Math.PI/180))/2) * c2[0]);
    d2[1] = (Math.tan((auxAngle * (Math.PI/180))/2) * Math.tan((baseAngle * (Math.PI/180))/2) * c2[1]);
    d2[2] = (Math.tan((auxAngle * (Math.PI/180))/2) * Math.tan((baseAngle * (Math.PI/180))/2) * c2[2]);

    //(q2 * tan(r2/2)) + (q1 * tan(r1/2)) + (q2 cross q1) * tan(r2/2) * tan(r1/2)
    let e2= [0,0,0];
    e2[0]= a2[0] + b2[0] + d2[0];
    e2[1]= a2[1] + b2[1] + d2[1];
    e2[2]= a2[2] + b2[2] + d2[2];

    //(q2 dot q1)
    let f2= (auxAxis[0] * baseAxis[0] + auxAxis[1] * baseAxis[1] + auxAxis[2] * baseAxis[2]);

    //(q2 dot q1) * tan(r2/2) * tan(r1/2)
    let g2= (f2 * Math.tan((auxAngle * (Math.PI/180))/2) * Math.tan((baseAngle * (Math.PI/180))/2));

    //1- ((q2 dot q1) * tan(r2/2) * tan(r1/2))
    let h2= (1 - g2);

    //tan(r3/2) * (1- ((q2 dot q1) * tan(r2/2) * tan(r1/2)))
    let i2= (Math.tan((rotAngle * (Math.PI/180)) / 2) * h2);

    // (q2 * tan(r2/2)) + (q1 * tan(r1/2)) + (q2 cross q1) * tan(r2/2) * tan(r1/2) / tan(r3/2) * (1- ((q2 dot q1) * tan(r2/2) * tan(r1/2)))
    rotAxis[0]= e2[0] / i2;
    rotAxis[1]= e2[1] / i2;
    rotAxis[2]= e2[2] / i2;
}

SetUP()
Display();
