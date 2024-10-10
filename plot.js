

function plot(x,y,labelX = "",labelY = "", canvasElement)
{
    let canvas = canvasElement || document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    canvas.style.cursor = "crosshair";
    let ctx = canvas.getContext("2d",{ willReadFrequently: true});

    let minX = Math.min(...x);
    let maxX = Math.max(...x);
    let minY = Math.min(...y);
    let maxY = Math.max(...y);



    let mouseX = 0;
    let mouseY = 0;
    let mouseInside = false;

    scale(0.8);
    draw();

    
    


    canvas.addEventListener("wheel", e =>
    {
        scale(1 + 0.0001 * e.deltaY);
        requestAnimationFrame(draw);

    })

    canvas.addEventListener("mousemove", e=>
    {
        let rect = canvas.getBoundingClientRect();
        mouseX = e.x - rect.x;
        mouseY = e.y - rect.y;
        requestAnimationFrame(draw);

    })

    canvas.addEventListener("mouseenter", e=>
    {
        mouseInside = true;
        requestAnimationFrame(draw);
    });

    canvas.addEventListener("mouseleave", e=>
    {
        mouseInside = false;
        requestAnimationFrame(draw);
    });


    function scale(k)
    {
        let width = maxX - minX;
        let centerX = (maxX + minX)/2;
        minX = centerX - width/2/k;
        maxX = centerX + width/2/k;

        let height = maxY - minY;
        let centerY = (maxY + minY)/2;
        minY = centerY - height/2/k;
        maxY = centerY + height/2/k;


    }


    function rotateImageData90CCW(imageData) {
        let width = imageData.width;
        let height = imageData.height;
        let newImageData = new ImageData(height, width);
        let oldData = imageData.data;
        let newData = newImageData.data;
    
        for (let oldY = 0; oldY < height; oldY++) 
        {
            for (let oldX = 0; oldX < width; oldX++) 
            {
                let oldIndex = (oldY * width + oldX) * 4;
                let newX = oldY;
                let newY = (width - 1) - oldX;
                let newIndex = (newY * height + newX) * 4;
    
                newData[newIndex] = oldData[oldIndex];     // Red
                newData[newIndex + 1] = oldData[oldIndex + 1]; // Green
                newData[newIndex + 2] = oldData[oldIndex + 2]; // Blue
                newData[newIndex + 3] = oldData[oldIndex + 3]; // Alpha
            }
        }
    
        return newImageData;
    }

    function getPoint(x,y)
    {
        return {
            x: 50 + ((x - minX) / (maxX - minX)) * (canvas.width - 100),
            y: 50 + (1 - (y - minY) / (maxY - minY)) * (canvas.height - 100)
        }
    }

    function draw()
    {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.beginPath();
        ctx.rect(50,50,canvas.width - 100,canvas.height - 100);
        ctx.stroke();
        ctx.font = "12pt Arial";
        ctx.fillStyle = "black";
        ctx.fillText(minX.toFixed(1), 50, canvas.height - 25);
        ctx.fillText(maxX.toFixed(1),canvas.width - 50,canvas.height - 25);
        ctx.fillText(minY.toFixed(1),0,canvas.height - 50);
        ctx.fillText(maxY.toFixed(1),0,50);
        ctx.textAlign = "center";
        ctx.fillText(labelY,canvas.width/2,canvas.height - 25);
        let imageData = ctx.getImageData(150, canvas.height - 40, canvas.width - 300, 40);
        ctx.clearRect(150, canvas.height - 40, canvas.width - 300, 40);
        ctx.fillText(labelX,canvas.width/2,canvas.height - 25);
        ctx.putImageData(rotateImageData90CCW(imageData),0,100);
        ctx.textAlign = "left";
        
        

        for(let i = 0; i < x.length; i++)
        {
            let point = getPoint(x[i],y[i])
            
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.ellipse(point.x, point.y, 5, 5,0,0,2*Math.PI,false);
            ctx.fill();

            ctx.fillStyle = "black";
            ctx.font = "10pt Arial";
            ctx.fillText(i+1,point.x+10,point.y-10);

        }

        if(mouseInside)
        {

            let x = minX + (maxX - minX)*(mouseX-50)/(canvas.width - 100);
            let y = maxY - (maxY - minY)*(mouseY-50)/(canvas.height - 100);
            ctx.font = "10pt Arial";
            ctx.fillStyle = "grey";
            ctx.fillText(`{${x.toFixed(1)};${y.toFixed(1)}}`,mouseX+25,mouseY+25)
        }


        
        let {a,b} = getLinearRegression(x,y);
        let regression = x => a*x + b;
        let inverseFunction = y => (y - b)/a;

        let line = 
        {
            start: getPoint(minX, regression(minX)),
            end: getPoint(maxX, regression(maxX))
        }

        if(line.start.y < 50)
        {
            line.start = getPoint(inverseFunction(maxY), maxY);
        }

        if(line.end.y < 50)
        {
            line.end = getPoint(inverseFunction(maxY), maxY);
        }

        if(line.start.y > canvas.height - 50)
        {
            line.start = getPoint(inverseFunction(minY), minY);
        }

        if(line.end.y > canvas.height - 50)
        {
            line.end = getPoint(inverseFunction(minY), minY);
        }

        

        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.stroke();
      
    }



    function getLinearRegression(x,y)
    {
        var n = x.length;
        var xy = x.map((o,i)=>o*y[i]);
        var x_square = x.map(o=>o*o);

        var denominator = n*sum(x_square) - sum(x)*sum(x)

        var a = (n*sum(xy) - sum(x)*sum(y))/denominator;

        var b = (sum(y)*sum(x_square) - sum(x)*sum(xy))/denominator;

        return {a,b};


        function sum(arr)
        {
            return arr.reduce((a,b)=>a+b,0)
        }
    }

    return canvas;

}
