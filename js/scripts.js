function init()
{
    var canvas = document.getElementById("canvas");
    //canvas.width = document.body.clientWidth; //document.width is obsolete
    //canvas.height = document.body.clientHeight; //document.height is obsolete
	
	document.getElementById("width").addEventListener('change', (event) => {
		canvas.width = event.target.value;
	});
	document.getElementById("height").addEventListener('change', (event) => {
		canvas.height = event.target.value;
	});
	canvas.width = document.getElementById("width").value;
	canvas.height = document.getElementById("height").value;
	document.getElementById("seed").value = Math.round(Math.random()*655536);
 	document.scale = 1;
	
	var context = canvas.getContext("2d");
	
	//drawPerlin(canvas, context);
	
	document.image = new Image();
	document.image.src = "gfx/pattern.png";
	
    if( canvas.getContext )
    {
        //setup();
        if (typeof (canvas.getContext) !== undefined) {
			run();
		}
    }
}

function getPerlin(x,y) {
	return Math.min(1.0,
				  0.2 * noise.simplex2(x / 400, y / 400)
				+ 0.2 * noise.simplex2(x / 1500, y / 1500)
				+ 0.3 * noise.simplex2(x / 1800, y / 1800)
				+ 0.3 * noise.simplex2(x / 2800, y / 2800)
	);		
}

function drawPerlin(canvas, context) {
	noise.seed(Math.random());
	var rng = createRNG(Math.random());
	var id = context.createImageData(1,1); // only do this once per page
	var d  = id.data;                        // only do this once per page
	for (var x = 0; x < canvas.width; x++) {
		for (var y = 0; y < canvas.height; y++) {
			// All noise functions return values in the range of -1 to 1.

			// noise.simplex2 and noise.perlin2 for 2d noise
			var value = getPerlin(x,y) + rng() * 0.3; //(0.5 + 0.5*(getPerlin(x+dx, y+dy) - getPerlin(x, y)));
			// ... or noise.simplex3 and noise.perlin3:
			//var value = noise.simplex3(x / 100, y / 100, time);
			d[0] = Math.round(Math.abs(value * 256)) / 32;
			d[1] = 48+Math.round(Math.abs(value * 256)) / 4;
			d[2] = Math.round(Math.abs(value * 256)) / 24;
			d[3] = 255;
			context.putImageData( id, x, y );   
		}
	}
}

function rgba(r, g, b, a){
  r = Math.floor(r);
  g = Math.floor(g);
  b = Math.floor(b);
  return ["rgba(",r,",",g,",",b,",",a,")"].join("");
}

function rgb(r, g, b){
  r = Math.floor(r);
  g = Math.floor(g);
  b = Math.floor(b);
  return ["rgb(",r,",",g,",",b,")"].join("");
}

function saw(x) {
	if (x < 0) x = -x;
	x = x % (2 * Math.PI);
	if (x < Math.PI) {
		return 2.0 * (x / Math.PI) - 1.0;
	} else {
		return 1.0 - 2.0 * (x - Math.PI) / Math.PI;
	}
}

function roundedSaw(x) {
	return 2.0 * Math.abs(Math.sin(x)) - 0.5;
}

function drawTree(context, centerX, centerY, size, centerRandomness,
				  steps, angleSteps,
				  serrationAmplitudeMin, serrationAmplitudeMax, serrationFrequencyMin, serrationFrequencyMax,
				  seed) {
	var rng = createRNG(seed);
	var stepNo = 0.0;
	var angle = 0.0;
	var angleStep = 360.0 / angleSteps;
	
	var x, y, lastX, lastY, color, localSize, radianAngle, serrationAmplitude, serrationFrequency;
	var r = 0;
	var g = 120;
	var b = 0;
	var rEnd = 40;
	var gEnd = 200;
	var bEnd = 110;
	var sizeForStep = 0;
	
	for (stepNo = 0; stepNo < steps; stepNo += 1) {
		centerX = centerX + centerRandomness * (stepNo/steps) * (saw((seed + stepNo * 131.0) * 131.0));
		centerY = centerY + centerRandomness * (stepNo/steps) * (saw((seed + stepNo * 131.0) * 151.0));
		
		context.fillStyle = rgb(
			r + (rEnd-r) * (stepNo/steps),
			g + (gEnd-g) * (stepNo/steps),
			b + (bEnd-b) * (stepNo/steps)
		);
		context.lineWidth = 1; //Math.max(1, 3*stepNo/steps);
		serrationAmplitude = (serrationAmplitudeMin + (serrationAmplitudeMax - serrationAmplitudeMin) * (stepNo/steps));
		serrationFrequency = (serrationFrequencyMin + (serrationFrequencyMax - serrationFrequencyMin) * (stepNo/steps));
		sizeForStep = (size * (1 + steps-stepNo + 0.3 * rng())/steps);
		context.beginPath();
		for (angle = 0; angle < 360.0; angle += angleStep) {
			radianAngle = (seed + angle) * Math.PI / 180.0;
			localSize = sizeForStep + serrationAmplitude * saw(serrationFrequency * (radianAngle + saw(radianAngle * 1001 + rng())*0.16) + rng() * 3);
			lastX = x;
			lastY = y;
			x = centerX + localSize * Math.cos(radianAngle);
			y = centerY + localSize * Math.sin(radianAngle);
			if(angle > 0) {
				context.lineTo(x, y);
			} else {
				context.moveTo(x, y);
			}
		}
		context.closePath();
		context.fill();
		context.stroke();
	}
}

function drawTreeRounded(
					context, centerX, centerY, size, centerRandomness,
					steps, angleSteps,
					serrationAmplitudeMin, serrationAmplitudeMax,
					serrationFrequencyMin, serrationFrequencyMax,
					serrationRngFactorX, serrationRngFactorY,
					colorRandomness,
					seed) {
	var rng = createRNG(seed);
	var stepNo = 0.0;
	var angle = 0.0;
	var angleStep = 360.0 / angleSteps;
	
	var x, y, lastX, lastY, color, localSize, radianAngle, serrationAmplitude, serrationFrequency;
	var r = 0;
	var g = 90;
	var b = 0;
	var rEnd = 40;
	var gEnd = 220;
	var bEnd = 80;
	var sizeForStep = 0;
	
	var phase, phaseShift, phaseMultiplier;
	for (stepNo = 0; stepNo < steps; stepNo += 1) {
		centerX = centerX + centerRandomness * (stepNo/steps) * (saw((seed + stepNo * 131.0) * 131.0));
		centerY = centerY + centerRandomness * (stepNo/steps) * (saw((seed + stepNo * 131.0) * 151.0));
		
		context.strokeStyle = rgba(0, 0, 0, 1);
		context.lineWidth = 1;
		serrationAmplitude = (serrationAmplitudeMin + (serrationAmplitudeMax - serrationAmplitudeMin) * (stepNo/steps));
		serrationFrequency = (serrationFrequencyMin + (serrationFrequencyMax - serrationFrequencyMin) * (stepNo/steps));
		sizeForStep = (size * (1 + steps-stepNo + 0.2 * rng())/steps);

		var rr = (rng() * 256.0 - 64.0)*colorRandomness;
		var gg = (rng() * 256.0 - 32.0)*colorRandomness;
		var bb = (rng() * 256.0 - 224.0)*colorRandomness;
		
		var grd = context.createRadialGradient(centerX - sizeForStep/3, centerY - sizeForStep/3, sizeForStep/8, centerX - sizeForStep/3, centerY - sizeForStep/3, sizeForStep*1.5);
		grd.addColorStop(0, rgba(
			r + (rEnd-r) * ((stepNo+1)/(steps+1)) + rr,
			g + (gEnd-g) * ((stepNo+1)/(steps+1)) + gg,
			b + (bEnd-b) * ((stepNo+1)/(steps+1)) + bb,
			1.0
		));
		grd.addColorStop(1, rgba(
			r + (rEnd-r) * (stepNo/(steps+1)) + rr,
			g + (gEnd-g) * (stepNo/(steps+1)) + gg,
			b + (bEnd-b) * (stepNo/(steps+1)) + bb,
			0.9
		));
		// Fill with gradient
		context.fillStyle = grd;
		context.strokeStyle = rgba(0, 0, 0, 1);

		context.beginPath();
		phaseShift = rng();
		phaseMultiplier = 4.0 + 3*rng();
		for (angle = 0; angle < 360.0; angle += angleStep) {
			radianAngle = (seed + angle) * Math.PI / 180.0;
			phase = 0.2 * (
				Math.sin(phaseMultiplier * (radianAngle + phaseShift*2*Math.PI))
				+ 0.5 * Math.sin(phaseMultiplier * (radianAngle*2.1 + phaseShift*3.2*Math.PI))
			);
			localSize = sizeForStep + serrationAmplitude * roundedSaw(serrationFrequency * (radianAngle + phase*serrationRngFactorX) + rng() * serrationRngFactorY);
			lastX = x;
			lastY = y;
			x = centerX + localSize * Math.cos(radianAngle);
			y = centerY + localSize * Math.sin(radianAngle);
			if(angle > 0) {
				context.lineTo(x, y);
			} else {
				context.moveTo(x, y);
			}
		}
		context.closePath();
		context.fill();
		context.stroke();
	}
}

function drawRectGrid(canvas, context, radius) {
	var x0, y0;
	
	context.beginPath();
	context.lineWidth = 1;
	context.strokeStyle = rgba(0, 0, 0, 0.1);
	context.moveTo(0,0);
	for (y0=0; y0<canvas.height+radius*2; y0+=(radius * 2)) {
		context.moveTo(0, y0);
		context.lineTo(canvas.width, y0);
	}
	for (x0=0; x0<canvas.width+radius*2; x0+=(radius * 2)) {
		context.moveTo(x0, 0);
		context.lineTo(x0, canvas.height);
	}
	context.closePath();
	context.stroke();
}

function drawHexGrid(canvas, context, radius) {
	var x0, y0;
	
	context.beginPath();
	context.strokeStyle = rgba(0, 0, 0, 0.1);
	context.moveTo(0,0);
	var dx = 0;
	var dy = 0;
	for (y0=0; y0<canvas.height+radius*2; y0+=(radius * 2) + dy * 2) {
		if (dx <= 0) {
			dx = radius;
			dy = - radius/2;
		} else {
			dx = 0;
			dy = 0;
		}
		for (x0=0; x0<canvas.width+radius*2; x0+=(radius * 2)) {
			context.moveTo(dx + x0 - radius, dy + y0 - radius/2);
			context.lineTo(dx + x0         , dy + y0 - radius);
			context.lineTo(dx + x0 + radius, dy + y0 - radius/2);
			context.lineTo(dx + x0 + radius, dy + y0 + radius/2);
			//context.lineTo(dx + x0         , dy + y0 + radius);
			//context.lineTo(dx + x0 - radius, dy + y0 + radius/2);
		}
	}
	context.closePath();
	context.stroke();
}

function createRNG(seed) {
	var rngSeed = seed;
    return function () {
		var x = Math.sin(rngSeed++) * 10000;
		return x - Math.floor(x);
	}
}

function collidesWithPreviousTrees(list, x, y, r) {
	var i;
	var collides;
	for (i=0; i<list.length; i++) {
		collides = (list[i].x - x)*(list[i].x - x) + (list[i].y - y)*(list[i].y - y) < (list[i].r + r)*(list[i].r + r);
		if (collides)
			return true;
	}
	return false;
}

function drawStone(canvas, context, x, y, r, rng, colorRandomness) {
	var cr = (rng() * 256.0 - 128.0)*colorRandomness;
	var grd = context.createRadialGradient(x-r/3, y-r/3, r/8, x-r/3, y-r/3, r * 2);
	grd.addColorStop(0, rgb(240+cr, 240+cr, 240+cr));
	grd.addColorStop(1, rgb(50+cr,50+cr,50+cr));
	
	// Fill with gradient
	context.lineWidth = 1;
	context.strokeStyle = rgba(0, 0, 0, 1);
	context.fillStyle = grd;
	
	context.beginPath();
	context.ellipse(x, y, 0.2 * r * (2 + 3*rng()), 0.2 * r * (2 + 3*rng()), rng() * Math.PI * 2, 0, Math.PI * 2);
	context.closePath();
	context.stroke();
	context.fill();
}

function drawBackground(canvas, context, rng) {
    context.fillStyle = context.createPattern(document.image, "repeat");
    context.fillRect(0, 0, canvas.width, canvas.height);
}

// function drawRiver(canvas, context, A, B, C, width, serrationAmplitude, serrationFrequency, serrationRandomness, rng) {
	// var x0, y0, x1, y1;
	
	// if (Math.abs(A) < 0.000001) {
		// x0 = 0;
		// y0 = -C/B;
		// x1 = canvas.width;
		// y1 = -C/B;
	// } else {
		// x0 = -C/A;
		// y0 = 0;
		// x1 = (-C-B*canvas.height)/A;
		// y1 = canvas.height;
	// }
	// context.lineWidth = width;
	// context.strokeStyle = rgba(0, 0, 255, 0.5);
	// context.moveTo(x0, y0);
	// context.lineTo(x1, y1);
	// context.stroke();
// }

function drawRiver(canvas, context, angles, midpoints, widths, serrationAmplitude, serrationFrequency, serrationRandomness, rng) {
	// console.assert(angles.length >= 2 && angles.length <= 3);
	// console.assert(midpoints.length <= 3);
	// console.assert(widths.length = angles.length);

	var angleIndex = 0;
	var angleSeparation = 2.0 * Math.PI / angles.length;
	var midpointIndex = 0;
	var widthIndex = 0;
	
	var outerRingRadius = Math.sqrt((canvas.width/2)*(canvas.width/2) + (canvas.height/2)*(canvas.height/2));
	var pointsOnOuterRing = [];
	for (angleIndex = 0; angleIndex < angles.length; angleIndex++) {
		pointsOnOuterRing.push({
			x:canvas.width/2 + Math.cos(angles[angleIndex])*outerRingRadius,
			y:canvas.height/2 + Math.sin(angles[angleIndex])*outerRingRadius,
		});
	}

	for (midpointIndex = 0; midpointIndex < midpoints.length; midpointIndex++) {
		
	}

	for (widthIndex = 0; widthIndex < widths.length; widthIndex++) {
	}
	
	// context.lineWidth = 1;
	// context.strokeStyle = rgba(0, 0, 255, 0.5);
	// context.moveTo(x0, y0);
	// context.lineTo(x1, y1);
	// context.stroke();
}

function run() {
	window.requestAnimationFrame(run);
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	
	context.save();
	context.scale(document.scale, document.scale);
	
	var seed = document.getElementById("seed").value;
	rng = createRNG(seed);

	drawBackground(canvas, context, rng);
	
	var gridType = document.getElementById("gridType").value;
	if (gridType > 0)
		drawRectGrid(canvas, context, 20);
	else if (gridType < 0)
		drawHexGrid(canvas, context, 20);

	var howMuchTrees = (canvas.width/130 * canvas.height/130) * document.getElementById("treeDensity").value * 0.05;
	var howMuchStones = (canvas.width/130 * canvas.height/130) * document.getElementById("stoneDensity").value * 0.1;
	//0.125 * (1 + 7*rng());

	var centerRandomness = 15.0 * document.getElementById("centerRandomness").value * 0.01;
	var leavedTreeProportion = document.getElementById("leavedTreeProportion").value * 0.01; //how high percent of the trees are simple
	var treeSize = 40 * document.getElementById("treeSize").value * 0.01;
	var treeSeparation = document.getElementById("treeSeparation").value * 0.01;
	var serrationAmplitude = document.getElementById("serrationAmplitude").value * 0.01;
	var serrationFrequency = document.getElementById("serrationFrequency").value * 0.01;
	var serrationRandomness = document.getElementById("serrationRandomness").value * 0.01;
	var colorRandomness = document.getElementById("colorRandomness").value * 0.01;
	// var riverSize = document.getElementById("riverSize").value;
	// var roadSize = document.getElementById("roadSize").value;
	var clearings = document.getElementById("clearings").value;
	var clearingSize = document.getElementById("clearingSize").value * 0.01;
	var treeSteps = document.getElementById("treeSteps").value;
	//rng();
	var i=0;
	var listOfCircles = [];
	var x0, y0, r0;
	for (i=0; i<clearings; i++) {
		x0 = rng() * canvas.width;
		y0 = rng() * canvas.height;
		r0 = canvas.height * 0.4 * 0.5*(1 + rng()) * clearingSize;
		listOfCircles.push({x:x0, y:y0, r:r0});
	}

	rng = createRNG(seed);
	for (i=0; i<howMuchStones * 1; i++) {
		drawStone(canvas, context, rng() * canvas.width, rng() * canvas.height, 5 + rng() * 9, rng, colorRandomness);
	}
	
	// if (riverSize > 0) {
		// rng = createRNG(seed);
		// drawRiver(canvas, context, (rng()-0.5)*10, (rng()-0.5)*10, rng()*canvas.width, riverSize * 40, serrationAmplitude, serrationFrequency, serrationRandomness, rng);
	// }
	
	rng = createRNG(seed);
	for (i=0; i<howMuchTrees; i++) {
		x0 = rng() * canvas.width;
		y0 = rng() * canvas.height;
		r0 = treeSize * (1 + rng());
		if (!collidesWithPreviousTrees(listOfCircles, x0, y0, r0)) {
			if (rng() < leavedTreeProportion) {
				var ignored = rng();
				drawTreeRounded(
					context, x0, y0, r0, centerRandomness, 1, 180,
					5*serrationAmplitude, 2*serrationAmplitude,
					7*serrationFrequency, 4*serrationFrequency,
					0.5*serrationRandomness, 0.14*serrationRandomness,
					colorRandomness,
					rng()
				);
				listOfCircles.push({x:x0, y:y0, r:r0*2*treeSeparation});
			} else {
				drawTreeRounded(
					context, x0, y0, r0*2, centerRandomness, Math.round(treeSteps*(0.75+rng())), 180,
					5*serrationAmplitude, 2*serrationAmplitude,
					9*serrationFrequency, 4*serrationFrequency,
					0.6*serrationRandomness, 0.24*serrationRandomness,
					colorRandomness,
					rng()
				);
				listOfCircles.push({x:x0, y:y0, r:r0*4*treeSeparation});
			}
		}
	}
	context.restore();
	
}