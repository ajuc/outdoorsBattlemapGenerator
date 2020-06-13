var PolyDefault = gpcas.geometry.PolyDefault;
var ArrayList = gpcas.util.ArrayList;
var PolySimple = gpcas.geometry.PolySimple;
var Clip = gpcas.geometry.Clip;
var OperationType = gpcas.geometry.OperationType;
var LmtTable = gpcas.geometry.LmtTable;
var ScanBeamTreeEntries = gpcas.geometry.ScanBeamTreeEntries;
var EdgeTable = gpcas.geometry.EdgeTable;
var EdgeNode = gpcas.geometry.EdgeNode;
var ScanBeamTree = gpcas.geometry.ScanBeamTree;
var Rectangle = gpcas.geometry.Rectangle;
var BundleState = gpcas.geometry.BundleState;
var LmtNode = gpcas.geometry.LmtNode;
var TopPolygonNode = gpcas.geometry.TopPolygonNode;
var AetTree = gpcas.geometry.AetTree;
var HState = gpcas.geometry.HState;
var VertexType = gpcas.geometry.VertexType;
var VertexNode = gpcas.geometry.VertexNode;
var PolygonNode = gpcas.geometry.PolygonNode;
var ItNodeTable = gpcas.geometry.ItNodeTable;
var StNode = gpcas.geometry.StNode;
var ItNode = gpcas.geometry.ItNode;
	
var listOfCirclesForRiver = [];
var listOfCirclesForClearings = [];
var listOfCirclesForTrees = [];

var backgroundBuffer;
var riverBuffer;
var stonesBuffer;
var twigsBuffer;
var backgroundCoverBuffer;
var treesBuffer;

function removeIfExists(offscreenCanvas) {
	if (offscreenCanvas) {
		document.removeChild(backgroundBuffer);
		delete offscreenCanvas;
	}
	return null;
}

function recreateBuffersFrom(canvas) {
	backgroundBuffer = removeIfExists(backgroundBuffer);
	backgroundBuffer = createOffscreenBuffer(canvas);
	
	riverBuffer = removeIfExists(riverBuffer);
	riverBuffer = createOffscreenBuffer(canvas);
	
	stonesBuffer = removeIfExists(stonesBuffer);
	stonesBuffer = createOffscreenBuffer(canvas);
	
	twigsBuffer = removeIfExists(twigsBuffer);
	twigsBuffer = createOffscreenBuffer(canvas);
	
	backgroundCoverBuffer = removeIfExists(backgroundCoverBuffer);
	backgroundCoverBuffer = createOffscreenBuffer(canvas);
	
	treesBuffer = removeIfExists(treesBuffer);
	treesBuffer = createOffscreenBuffer(canvas);
}

function init()
{
	document.image = new Image();
	document.image.src = "";
	//document.image.crossOrigin = "Anonymous";
	
    var canvas = document.getElementById("canvas");

	loadParametersFromLocalStorage();
	
	canvas.width = document.getElementById("width").value;
	canvas.height = document.getElementById("height").value;	
	recreateBuffersFrom(canvas);

	addListeners();
	
	document.getElementById("seed").value = Math.round(Math.random()*655536);
 	document.scale = 1;
	
	var context = canvas.getContext("2d");
	
	saveParametersToLocalStorage();
	
    if( canvas.getContext )
    {
        if (typeof (canvas.getContext) !== undefined) {
			document.forceRedraw = true;
			run(0);
		}
    }
}

function addListener(name) {
	var neededRedraws = getNeededRedrawsFor(name);
	document.getElementById(name).addEventListener('change', (event) => {
		save(name);
		setRedrawNeeded(true, neededRedraws);
	});
	document.getElementById(name).addEventListener('input', (event) => {
		setRedrawNeeded(true, neededRedraws);
	});
}

function save(name) {
	window.localStorage.setItem(name, document.getElementById(name).value);
}
function load(name) {
	document.getElementById(name).value = window.localStorage.getItem(name);
}

function getParameterNames() {
	return [
		"gridType",
		"gridSize",
		"gridOpacity",
		"width",
		"height",
		"seed",
		"treeDensity",
		"stoneDensity",
		"twigsDensity",
		"riverSize",
		"centerRandomness",
		"leavedTreeProportion",
		"treeSize",
		"treeColor",
		"treeSeparation",
		"serrationAmplitude",
		"serrationFrequency",
		"serrationRandomness",
		"colorRandomness",
		"clearings",
		"clearingSize",
		"treeSteps",
		"backgroundNo",
		"showColliders",
		"grassLength",
		"grassDensity",
		"grassSpread",
		"autoredraw"
	];
}

function getParameterDefaultValue(name) {
	const defaults = {
		"gridType": 1,
		"gridSize": 32,
		"gridOpacity": 30,
		"width": 1024,
		"height": 1024,
		"seed": 1,
		"treeDensity": 40,
		"stoneDensity": 40,
		"twigsDensity": 40,
		"riverSize": 2,
		"centerRandomness": 30,
		"leavedTreeProportion": 95,
		"treeSize": 70,
		"treeColor": 120,
		"treeSeparation": 40,
		"serrationAmplitude": 130,
		"serrationFrequency": 30,
		"serrationRandomness": 250,
		"colorRandomness": 30,
		"clearings": 9,
		"clearingSize": 30,
		"treeSteps": 3,
		"backgroundNo": 1,
		"showColliders": 0,
		"grassLength": 45,
		"grassDensity": 50,
		"grassSpread": 50,
		"autoredraw": true
	};
	return defaults[name];
}

function allRedraws() {
	return {"background": true, "river": true, "clearings":true, "stones": true, "twigs": true, "backgroundCover": true, "grid":true, "trees": true};
}
function noneRedraws() {
	return {"background": false, "river": false, "clearings":false, "stones": false, "twigs": false, "backgroundCover": false, "grid":false, "trees": false};
}
function onlyOneRedraw(name) {
	var r = noneRedraws();
	r[name]=true;
	return r;
}
function onlyTheseRedraws(names) {
	var r = noneRedraws();
	for (var n of names) {
		r[n]=true;
	}
	return r;
}
function onlyRedrawsAfter(name) {
	var alreadyPassed = false;
	var result = {};
	for (var n of ["background", "river", "clearings", "stones", "twigs", "backgroundCover", "grid", "trees"]) {
		if (n === name) {
			alreadyPasssed = true;
		}
		result[n] = alreadyPassed;
	}
	return result;
}

function getNeededRedrawsFor(name) {
	const functions = {
		"gridType": onlyOneRedraw("grid"),
		"gridSize": onlyOneRedraw("grid"),
		"gridOpacity": onlyOneRedraw("grid"),
		"width": allRedraws,
		"height": allRedraws,
		"seed": allRedraws,
		"treeDensity": onlyOneRedraw("trees"),
		"stoneDensity": onlyOneRedraw("stones"),
		"twigsDensity": onlyOneRedraw("twigs"),
		"riverSize": onlyRedrawsAfter("river"),
		"centerRandomness": onlyOneRedraw("trees"),
		"leavedTreeProportion": onlyOneRedraw("trees"),
		"treeSize": onlyOneRedraw("trees"),
		"treeColor": onlyOneRedraw("trees"),
		"treeSeparation": onlyOneRedraw("trees"),
		"serrationAmplitude": onlyOneRedraw("trees"),
		"serrationFrequency": onlyOneRedraw("trees"),
		"serrationRandomness": onlyOneRedraw("trees"),
		"colorRandomness": onlyOneRedraw("trees"),
		"clearings": onlyRedrawsAfter("clearings"),
		"clearingSize": onlyRedrawsAfter("clearings"),
		"treeSteps": onlyOneRedraw("trees"),
		"backgroundNo": onlyTheseRedraws(["background", "backgroundCover"]),
		"showColliders": onlyOneRedraw("colliders"),
		"grassLength": onlyTheseRedraws(["background", "backgroundCover"]),
		"grassDensity": onlyTheseRedraws(["background", "backgroundCover"]),
		"grassSpread": onlyTheseRedraws(["background", "backgroundCover"]),
		"autoredraw": noneRedraws()
	};
	return functions[name];
}

function getParameterRandomizeFunction(name) {
	const functions = {
		"gridType": null,
		"gridSize": null,
		"gridOpacity": null,
		"width": null,
		"height": null,
		"seed": function () { return Math.round(Math.random() * 65536); },
		"treeDensity": function () { return Math.round(Math.random() * 100); },
		"stoneDensity": function () { return Math.round(Math.random() * 20 * Math.random() * 5); },
		"twigsDensity": function () { return Math.round(Math.random() * 20 * Math.random() * 5); },
		"riverSize": function () { return Math.random() > 0.5 ? Math.round(Math.random() * 10) : 0; },
		"centerRandomness": function () { return Math.round(30); },
		"leavedTreeProportion": function () { return Math.round(Math.random() * 100); },
		"treeSize": function () { return Math.round(30) + Math.round(Math.random() * 40); },
		"treeColor": function () { return Math.round(Math.random() * 65536); },
		"treeSeparation": function () { return Math.round(80 + Math.random() * 20); },
		"serrationAmplitude": function () { return Math.round(80 + Math.random() * 40); },
		"serrationFrequency": function () { return Math.round(80 + Math.random() * 40); },
		"serrationRandomness": function () { return Math.round(100); },
		"colorRandomness": function () { return Math.round(20); },
		"clearings": function () { return Math.round(3 + Math.random() * 10); },
		"clearingSize": function () { return Math.round(30 + Math.random() * 20); },
		"treeSteps": function () { return Math.round(3 + Math.random() * 2); },
		"backgroundNo": null,
		"showColliders": null,
		"grassLength": function () { return Math.round(25 + Math.random() * 50); },
		"grassDensity": function () { return Math.round(25 + Math.random() * 50); },
		"grassSpread": function () { return Math.round(25 + Math.random() * 50); },
		"autoredraw": null
	};
	return functions[name];
}

function saveParametersToLocalStorage() {
	var parameterNames = getParameterNames();
	for(var parameterName of parameterNames) {
		save(parameterName);
	}
	var defaultsWereSaved = window.localStorage.getItem("initialized");
	if (!defaultsWereSaved)
		window.localStorage.setItem("initialized", true);
}

function loadParametersFromLocalStorage() {
	var defaultsWereSaved = window.localStorage.getItem("initialized");
	if (!defaultsWereSaved) {
		resetParameters();
		return;
	}
	var parameterNames = getParameterNames();
	for(var parameterName of parameterNames) {
		load(parameterName);
	}
	backgroundChanged(document.getElementById("backgroundNo").value);
}

function backgroundChanged(backgroundNo) {
	console.warn("loading", backgroundNo);
	save("backgroundNo");
	if (backgroundNo > 1) {
		document.image.src = "gfx/pattern_"+backgroundNo+".png";
	}
	//document.image.crossOrigin = "Anonymous";
}

function createOffscreenBuffer(canvas) {
	var offscreenCanvas = document.createElement('canvas');
	offscreenCanvas.width = canvas.width;
	offscreenCanvas.height = canvas.height;
}

function createPolygonFromCircle(x, y, radius) {
	const sides = 8;
	var ox = x;
	var oy = y;
    var res  = new PolyDefault();
	var angle = 0.0;
	var angleStep = 2.0 * Math.PI / sides;
    for(var i=0 ; i < sides ; i++) {    
        res.addPoint(
			new PointF(
				ox + radius * Math.cos(angle),
				oy + radius * Math.sin(angle)
			)
		);
		angle += angleStep;
    }
    return res;
}

function createPolygonFromPoints(points) {
    var res  = new PolyDefault();
    for(var i=0 ; i < points.length ; i++) {    
        res.addPoint(new PointF(points[i][0],points[i][1]));
    }
    return res;
}
function getPolygonVertices(poly) {
	var vertices=[];
	var numPoints = poly.getNumPoints();
	var i;
	
	for(i=0;i<numPoints;i++) {
		vertices.push([poly.getX(i) , poly.getY(i)]);
	}
	return vertices;
}

function addCircleToListOfColliders(listOfColliders, x, y, r) {
	var polygon = createPolygonFromCircle(x, y, r);
	addPolygonToListOfColliders(listOfColliders, polygon);
}

function addPolygonToListOfColliders(listOfColliders, polygon) {
	var i;
	var intersection;
	var nonintersectingPolygons = [];
	var intersectingPolygon = polygon;
	for (i=0; i<listOfColliders.length; i++) {
		intersection = intersectingPolygon.intersection(listOfColliders[i]);
		if (intersection.getArea() <= 0.01) {
			nonintersectingPolygons.push(listOfColliders[i]);
		} else {
			intersectingPolygon = intersectingPolygon.union(listOfColliders[i]);
		}
	}
	
	listOfColliders.length = 0;
	for (var el of nonintersectingPolygons) {
		listOfColliders.push(el);
	}
	listOfColliders.push(intersectingPolygon);
}

function createExportTemplate(mapOriginInTiles, mapSizeInTiles, pixelsPerTile) {
	return {
		"format": "0.0.2",
		"resolution": {
			"map_origin": {
				"x": mapOriginInTiles[0],
				"y": mapOriginInTiles[1]
			},
			"map_size": {
				"x": mapSizeInTiles[0],
				"y": mapSizeInTiles[1]
			},
			"pixels_per_grid": pixelsPerTile
		},
		"line_of_sight": [],
		"portals": [],
		"environment": {
			"baked_lighting": false,
			"ambient_light": "ffffffff"
		},
		"lights": [],
		"image": ""
	};
}

function exportDd2vtt() {
	var pixelsPerTile = 2*Math.round(document.getElementById("gridSize").value);
	var width = document.getElementById("width").value;
	var height = document.getElementById("height").value;
	
	var exportObject = createExportTemplate([0,0], [Math.ceil(width/pixelsPerTile), Math.ceil(height/pixelsPerTile)], pixelsPerTile);
	var canvas = document.getElementById("canvas");
	var img = canvas.toDataURL("image/png");
	
	exportObject.image = img.slice(22); //data:image/png;base64,i
	for (var collider of listOfCirclesForTrees) {
		var colliderRepresentation = [];
		var colliderPoints = getPolygonVertices(collider);
		for (var point of colliderPoints) {
			colliderRepresentation.push({"x": point[0]/pixelsPerTile, "y": point[1]/pixelsPerTile});
		}
		colliderRepresentation.push({"x": colliderPoints[0][0]/pixelsPerTile, "y": colliderPoints[0][1]/pixelsPerTile});
		exportObject.line_of_sight.push(colliderRepresentation);
	}
	var result = JSON.stringify(exportObject);
	var blob = new Blob([result], {
    type: "text/plain;charset=utf-8;",
	});
	saveAs(blob, "exported.dd2vtt");
}

function addListeners() {
	document.getElementById("resetParameters").addEventListener('click', (event) => {
		resetParameters();
	});
	document.getElementById("randomizeParameters").addEventListener('click', (event) => {
		randomizeParameters();
	});
	document.getElementById("generate").addEventListener('click', (event) => {
		location.reload();
	});
	document.getElementById("exportDd2vtt").addEventListener('click', (event) => {
		exportDd2vtt();
	});
	document.getElementById("redraw").addEventListener('click', (event) => {
		document.forceRedraw = true;
		setRedrawNeeded(true, allRedraws());
	});
	// document.getElementById("download").addEventListener('click', (event) => {
		// var canvas = document.getElementById("canvas");
		// var dataURL = canvas.toDataURL('image/png');
		// document.getElementById("download").href = dataURL;
		// document.getElementById("download").click();
	// });
	
	// document.getElementById("clearStorage").addEventListener('click', (event) => {
		// clearStorage();
	// });
	document.image.addEventListener('load', (event) => {
		console.warn("loaded");
		setRedrawNeeded(true, allRedraws());
	});
	document.getElementById("width").addEventListener('change', (event) => {
		var pixelsPerTile = 2*Math.round(document.getElementById("gridSize").value);
		var roundedWidth = pixelsPerTile * Math.ceil(event.target.value/pixelsPerTile);
		document.getElementById("width").value = roundedWidth;
		canvas.width = roundedWidth;
		recreateBuffersFrom(canvas);
		save("width");
		setRedrawNeeded(true, allRedraws());
	});
	document.getElementById("height").addEventListener('change', (event) => {
		var pixelsPerTile = 2*Math.round(document.getElementById("gridSize").value);
		var roundedHeight = pixelsPerTile * Math.ceil(event.target.value/pixelsPerTile);
		document.getElementById("height").value = roundedHeight;
		canvas.height = roundedHeight;
		recreateBuffersFrom(canvas);
		save("height");
		setRedrawNeeded(true, allRedraws());
	});
	var parameterNames = getParameterNames();
	for(var parameterName of parameterNames) {
		if (parameterName != "width" && parameterName != "height") {
			addListener(parameterName);
		}
	}
	document.getElementById("backgroundNo").addEventListener('change', (event) => {
		var backgroundNo = event.target.value;
		backgroundChanged(backgroundNo);
	});
}

function setRedrawNeeded(needed, details) {
	if (needed) {
		document.getElementById("redrawIndicator").style.display="fixed";
		document.getElementById("redraw").style="background-color: red";
	} else {
		document.getElementById("redrawIndicator").style.display="none";
		document.getElementById("redraw").style="background-color: light-gray";
	}
	document.redrawNeeded = needed;
	document.redrawNeededDetails = details;
}

function clearStorage() {
	window.localStorage.clear();
}

function resetParameters() {
	var parameterNames = getParameterNames();
	for(var parameterName of parameterNames) {
		document.getElementById(parameterName).value = getParameterDefaultValue(parameterName);
	}
	backgroundChanged(document.getElementById("backgroundNo").value);
	saveParametersToLocalStorage();
	setRedrawNeeded(true, allRedraws());
}

function randomizeParameters() {
	var parameterNames = getParameterNames();
	for(var parameterName of parameterNames) {
		var randomizeFunction = getParameterRandomizeFunction(parameterName);
		if (randomizeFunction) {
			document.getElementById(parameterName).value = randomizeFunction();
		}
	}
	saveParametersToLocalStorage();
	setRedrawNeeded(true, allRedraws());
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

function drawTreeRounded(
					context, centerX, centerY, size, centerRandomness,
					steps, angleSteps,
					serrationAmplitudeMin, serrationAmplitudeMax,
					serrationFrequencyMin, serrationFrequencyMax,
					serrationRngFactorX, serrationRngFactorY,
					colorRandomness, treeColor,
					rng,
					fillInnerStepsWithColor) {
	var seed = rng();
	var stepNo = 0.0;
	var angle = 0.0;
	var angleStep = 360.0 / angleSteps;
	
	var x, y, lastX, lastY, color, localSize, radianAngle, serrationAmplitude, serrationFrequency;
	var r = 0;
	var g = 90;
	var b = 0;
	var rEnd = 130;
	var gEnd = 230;
	var bEnd = 120;
	var sizeForStep = 0;
	var stepInited, lastDrawn;
	
	var phase, phaseShift, phaseMultiplier;
	for (stepNo = 0; stepNo < steps; stepNo ++) {
		centerX = centerX + centerRandomness * (stepNo/steps) * (saw((seed + stepNo * 131.0) * 131.0));
		centerY = centerY + centerRandomness * (stepNo/steps) * (saw((seed + stepNo * 131.0) * 151.0));
		
		context.strokeStyle = rgba(0, 0, 0, 1);
		context.lineWidth = 1;
		serrationAmplitude = (serrationAmplitudeMin + (serrationAmplitudeMax - serrationAmplitudeMin) * (stepNo/steps)) * size/100;
		serrationFrequency = (serrationFrequencyMin + (serrationFrequencyMax - serrationFrequencyMin) * (stepNo/steps));
		sizeForStep = size * (steps-stepNo + 0.25 * rng())/steps;

		var rr = (rng() * 256.0 - 64.0)*colorRandomness;
		var gg = (rng() * 256.0)*colorRandomness;
		var bb = (rng() * 256.0 - 164.0)*colorRandomness;
		
		var grd = context.createRadialGradient(centerX - sizeForStep/3, centerY - sizeForStep/3, sizeForStep/8, centerX - sizeForStep/3, centerY - sizeForStep/3, sizeForStep*1.4);
		grd.addColorStop(0, rgba(
			r + (rEnd-r) * (((fillInnerStepsWithColor ? stepNo+1 : steps+1))/(steps+1)) + rr,
			g + (gEnd-g) * (((fillInnerStepsWithColor ? stepNo+1 : steps+1))/(steps+1)) + gg,
			b + (bEnd-b) * (((fillInnerStepsWithColor ? stepNo+1 : steps+1))/(steps+1)) + bb,
			treeColor
		));
		grd.addColorStop(1, rgba(
			r + (rEnd-r) * ((fillInnerStepsWithColor ? stepNo : 0)/(steps+1)) + rr,
			g + (gEnd-g) * ((fillInnerStepsWithColor ? stepNo : 0)/(steps+1)) + gg,
			b + (bEnd-b) * ((fillInnerStepsWithColor ? stepNo : 0)/(steps+1)) + bb,
			treeColor * 0.9
		));
		// Fill with gradient
		context.fillStyle = grd;
		context.strokeStyle = rgba(0, 0, 0, 1);

		context.beginPath();
		phaseShift = rng();
		phaseMultiplier = 4.0 + 3*rng();
		innerPhaseDivider = 90+90*rng();
		innerPhaseModuler = 1.0+innerPhaseDivider/3*rng();
		innerPhaseShift = 359*rng();
		stepInited = false;
		lastDrawn = false;
		var localFrequencyModifier = rng()*0.5-1.0;
		for (angle = 0; angle < 360.0; angle += angleStep) {
			radianAngle = ((seed + angle) % 360) * Math.PI / 180.0;
			phase = 0.2 * (
				Math.sin(phaseMultiplier * (radianAngle + phaseShift*2*Math.PI))
				+ 0.5 * Math.sin(phaseMultiplier * (radianAngle*2.1 + phaseShift*3.2*Math.PI))
			);
			localSize = sizeForStep + serrationAmplitude * roundedSaw((serrationFrequency + localFrequencyModifier) * (radianAngle + phase*serrationRngFactorX) + rng() * serrationRngFactorY);
			lastX = x;
			lastY = y;
			x = centerX + localSize * Math.cos(radianAngle);
			y = centerY + localSize * Math.sin(radianAngle);
			if(angle > 0) {
				if (stepNo == 0 || fillInnerStepsWithColor || (Math.abs(Math.round((angle + innerPhaseShift) % Math.round(innerPhaseDivider))) < 30 + innerPhaseModuler)) {
					if (!stepInited) {
						context.moveTo(x, y);
						lastDrawn = false;
					} else {
						if (lastDrawn) {
							context.lineTo(x, y);
						}
						lastDrawn = true;
					}
					stepInited = true;
				} else {
					lastDrawn = false;
					context.moveTo(x, y);
				}
			} 
			// else {
				// context.moveTo(x, y);
			// }
		}
		//context.closePath();
		if (stepNo == 0 || fillInnerStepsWithColor) {
			context.closePath()
			context.fill();
		}
		context.stroke();
	}
}

function drawRectGrid(canvas, context, radius, gridOpacity) {
	var x0, y0;
	
	context.beginPath();
	context.lineWidth = 1;
	context.strokeStyle = rgba(255, 255, 255, gridOpacity);
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

function drawHexGrid(canvas, context, radius, gridOpacity) {
	var x0, y0;
	context.beginPath();
	context.strokeStyle = rgba(255, 255, 255, gridOpacity);
	context.moveTo(0,0);
	var hexW = radius * Math.sqrt(3.0);
	var hexH = radius * 2.0;
	var dx = 0;
	var dy = 0;
	for (y0=-radius*32.0/64.0; y0<canvas.height+hexH; y0+=hexH + dy * 2) {
		if (dx <= 0) {
			dx = hexW/2;
			dy = - hexH/4;
		} else {
			dx = 0;
			dy = 0;
		}
		for (x0=-radius*15.0/64.0; x0<canvas.width+hexW; x0+=hexW) {
			context.moveTo(dx + x0 - hexW/2, dy + y0 - hexH/4);
			context.lineTo(dx + x0         , dy + y0 -  hexH/2);
			context.lineTo(dx + x0 + hexW/2, dy + y0 -  hexH/4);
			context.lineTo(dx + x0 + hexW/2, dy + y0 +  hexH/4);
			//context.lineTo(dx + x0         , dy + y0 + radius);
			//context.lineTo(dx + x0 - radius, dy + y0 + radius/2);
		}
	}
	context.closePath();
	context.stroke();
}

/* function createRNG(seed) {
	var state = seed;
    return function () {
		state = (1103515245.0 * state + 12345.0) % 0x80000000;
		return state - Math.floor(state);
	}
} */
function createRNG(seed) {
  var modulus = 2147483648;
  var a = 1103515245;
  var c = 12345;

  var state = seed || 3;
  return function() {
    state = (a * state + c) % modulus;
    return state/modulus;
  };
}

/*function collidesWithPrevious(lists, x, y, r) {
	var i, j;
	var list;
	var collides;
	for (j=0; j<lists.length; j++) {	
		list = lists[j];
		for (i=0; i<list.length; i++) {
			collides = (list[i].x - x)*(list[i].x - x) + (list[i].y - y)*(list[i].y - y) < (list[i].r + r)*(list[i].r + r);
			if (collides)
				return true;
		}
	}
	return false;
}*/

function collidesWithPrevious(lists, x, y, r) {
	var i, j;
	var list;
	var intersection;
	var collides;
	var polygon = createPolygonFromCircle(x, y, r*0.9);
	for (j=0; j<lists.length; j++) {	
		list = lists[j];
		for (i=0; i<list.length; i++) {
			intersection = polygon.intersection(list[i]);
			if (intersection.getArea() > 0.01) {
				return true;
			}
		}
	}
	return false;
}

function drawStone(canvas, context, x, y, r, rng, colorRandomness, fillOpacity) {
	var cr = (rng() * 256.0 - 128.0)*colorRandomness;
	var grd = context.createRadialGradient(x-r/3, y-r/3, r/8, x-r/3, y-r/3, r * 2);
	grd.addColorStop(0, rgba(240+cr, 240+cr, 240+cr, fillOpacity));
	grd.addColorStop(1, rgba(50+cr,50+cr,50+cr, fillOpacity));
	
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

/*
function drawBackground(canvas, context, rng) {
	if (!document.image)
		return;
    //context.fillStyle = context.createPattern(document.image, "repeat");
    context.fillStyle=rgba(0.0, 128, 0.0, 128.0);
	context.fillRect(0, 0, canvas.width, canvas.height);
}
*/

function drawGrass(canvas, context, rng, fill, patchSize, r, probability, avoidCollidersList) {
	var grassLength = document.getElementById("grassLength").value/100.0;
	var grassDensity = document.getElementById("grassDensity").value/200.0;
	
	var patchSizeX = patchSize/grassDensity;
	var patchSizeY = patchSize/grassDensity;
	var minR = r*0.2*grassLength;
	var maxR = (r*0.5+rng()*r*0.5)*grassLength;
	var x0, y0, lastAngle;

	
	for (var x=0; x<canvas.width; x+=patchSizeX) {
		for (var y=0; y<canvas.height; y+=patchSizeY) {
			context.beginPath();
			x0 = x+patchSizeX/2 + rng()*patchSizeX;
			y0 = y+patchSizeY/2 + rng()*patchSizeY;
			
			if (avoidCollidersList.length == 0 || !collidesWithPrevious([avoidCollidersList], x0, y0, 1)) {					
				context.strokeStyle=rgba(10+rng()*25, 110+rng()*110, 20+rng()*25, 250);
				context.lineWidth = 1;
				
				for (var angle=Math.PI*0; angle<Math.PI*2; angle+=(10.0+rng()*60.0)*Math.PI*2.0/360) {
					if (rng() < probability) {
						context.moveTo(x0, y0);
						context.lineTo(x0 + maxR*Math.cos(angle), y0 - maxR*Math.sin(angle));
					}
				}
				
			}
			context.closePath();
			context.stroke();
		}
	}
}

function drawBackground(canvas, context, rng, fill, patchSize, r, probabillity, avoidCollidersList) {
	if (!document.image)
		return;
    //
	var backgroundNo = document.getElementById("backgroundNo").value;
	
	
    if (fill && backgroundNo <= 1) {
		context.fillStyle=rgba(45.0, 35, 20.0, 255.0);
		context.fillRect(0, 0, canvas.width, canvas.height);
	}
	
	if (backgroundNo == 0) {
	} else if (backgroundNo == 1) {
		drawGrass(canvas, context, rng, fill, patchSize, r, probabillity, avoidCollidersList);
	} else if (fill) {
		context.fillStyle = context.createPattern(document.image, "repeat");
		context.fillRect(0, 0, canvas.width, canvas.height);
	}		
}

function drawPolygon(canvas, context, polygon) {
	var points = getPolygonVertices(polygon);
	context.beginPath();
	context.moveTo(points[points.length-1][0], points[points.length-1][1]);
	context.lineWidth = 2;
	context.strokeStyle = rgba(1, 0, 0, 1.0);
	for (var point of points) {
		context.lineTo(point[0], point[1]);
	}
	context.closePath();
	context.stroke();
	context.lineWidth = 1;
}

function drawRiver(canvas, context, angles, midpoints, widths, serrationAmplitude, serrationFrequency, serrationRandomness, rng, outListOfColliders, fillOpacity, r, g, b) {
	// console.assert(angles.length >= 2 && angles.length <= 3);
	// console.assert(midpoints.length <= 3);
	// console.assert(widths.length = angles.length);

	var angleIndex = 0;
	var angleSeparation = 2.0 * Math.PI / angles.length;
	var midpointIndex = 0;
	var widthIndex = 0;
	
	var outerRingRadius = Math.sqrt((canvas.width/2)*(canvas.width/2) + (canvas.height/2)*(canvas.height/2))+200;
	var innerRingRadius = Math.sqrt((canvas.width/10)*(canvas.width/10) + (canvas.height/10)*(canvas.height/10));
	var pointsOnOuterRing = [];
	var pointsOnOuterRingIndex = 0;
	var pointsOnInnerRing = [];
	var pointsOnInnerRingIndex = 0;
	var points = [];
	var pointsIndex = 0;
	var rightPointsForColliders = [];
	var leftPointsForCollidersReverseOrder = [];
	
	
	for (angleIndex = 0; angleIndex < angles.length; angleIndex++) {
		pointsOnOuterRing.push({
			x:canvas.width/2 + Math.cos(angles[angleIndex])*outerRingRadius,
			y:canvas.height/2 + Math.sin(angles[angleIndex])*outerRingRadius,
		});
		pointsOnInnerRing.push({
			x:canvas.width/2 + Math.cos(angles[angleIndex])*innerRingRadius,
			y:canvas.height/2 + Math.sin(angles[angleIndex])*innerRingRadius,
		});
	}

	points.push(pointsOnOuterRing[0]);
	points.push(pointsOnInnerRing[0]);
	for (midpointIndex = 0; midpointIndex < midpoints.length; midpointIndex++) {
		points.push(midpoints[midpointIndex]);
	}
	points.push(pointsOnInnerRing[1]);
	points.push(pointsOnOuterRing[1]);
	

	for (widthIndex = 0; widthIndex < widths.length; widthIndex++) {
	}

	
	let graph = new Graph("graph");


	var pointsForBezier = [];

	for (pointsIndex=0; pointsIndex<points.length; pointsIndex++) {
		pointsForBezier.push(new Point(points[pointsIndex].x, points[pointsIndex].y));
	}
	let bezierCurve = new BezierCurve(pointsForBezier, 4);
	context.lineWidth = 1;
	context.strokeStyle = rgba(0, 0, 0, 1.0);
	var rr = r + rng()*16;
	var gg = g + rng()*64;
	var bb = b + 56*rng();
	var fillColor = rgba(rr, gg, bb, fillOpacity);
	var fillColorInside = rgba(rr*0.8, gg*0.8, bb*0.7, fillOpacity);
	
	context.fillStyle = fillColor;
	//graph.drawCurveFromPoints(canvas, context, bezierCurve.drawingPoints);
	var t=0.0;
	var i=0;
	var p,lp, leftX,leftY, rightX, rightY, pLeftX, pLeftY, pRightX, pRightY;
	for (t=0.0; t<1.0; t+= widths[0]/4096.0) { //
		lp = p;
		pLeftX = leftX;
		pLeftY = leftY;
		pRightX = rightX;
		pRightY = rightY;
		
		p = bezierCurve.calculateNewPoint(t);
		
		//outListOfColliders.push({x:p.x, y:p.y, r:5 * widths[0]});
		//addCircleToListOfColliders(outListOfColliders, p.x, p.y, 5 * widths[0]);
				
		if (t === 0.0) {
			context.moveTo(p.x, p.y);
		} else {
			var dx = p.x - lp.x;
			var dy = p.y - lp.y;
			var d = Math.sqrt(dx*dx+dy*dy);
			dx/=d;
			dy/=d;
			var randomD = rng()*0.3;
			var leftX = p.x - dy*(5+randomD)* widths[0];
			var leftY = p.y + dx*(5+randomD)* widths[0];
			var rightX = p.x + dy*(5+randomD)* widths[0];
			var rightY = p.y - dx*(5+randomD)* widths[0];
			
			if (i % 5 == 0) {
				rightPointsForColliders.push([pLeftX, pLeftY]);
				rightPointsForColliders.push([leftX, leftY]);
				leftPointsForCollidersReverseOrder.unshift([pRightX, pRightY]);
				leftPointsForCollidersReverseOrder.unshift([rightX, rightY]);
			}
			
			
			var grd = context.createLinearGradient(leftX, leftY, rightX, rightY);
			grd.addColorStop(0, fillColor);
			grd.addColorStop(0.3, fillColorInside);
			grd.addColorStop(0.7, fillColorInside);
			grd.addColorStop(1, fillColor);

			context.fillStyle = grd;

			context.beginPath();
			context.strokeStyle = grd;
			context.lineWidth = 1;
			context.moveTo(pLeftX, pLeftY);
			context.lineTo(leftX, leftY);
			context.lineTo(rightX, rightY);
			context.lineTo(pRightX, pRightY);
			context.lineTo(pLeftX, pLeftY);
			context.closePath();
			context.fill();
			context.stroke();
			
			context.beginPath();
			context.strokeStyle = rgba(0, 0, 0, 1.0);
			context.lineWidth = 1;
			context.moveTo(pLeftX, pLeftY);
			context.lineTo(leftX, leftY);
			context.moveTo(rightX, rightY);
			context.lineTo(pRightX, pRightY);
			context.closePath();
			context.stroke();
		}
		i++;
	}
	context.lineWidth = 1;
	
	addPolygonToListOfColliders(
		outListOfColliders,
		createPolygonFromPoints(
			rightPointsForColliders.concat(leftPointsForCollidersReverseOrder)
		)
	);
			
	context.fillStyle = rgba(255, 255, 255, 1.0);
	context.strokeStyle = rgba(0, 0, 0, 1.0);
}

function drawTwigs(canvas, context, x0, y0, len, width, angle, fillOpacity, rng) {
	var x1 = x0 + Math.cos(angle) * len;
	var y1 = y0 + Math.sin(angle) * len;
	var x2 = x0 - Math.cos(angle) * len;
	var y2 = y0 - Math.sin(angle) * len;
	var leftDx  = (y2-y1);
	var leftDy  = -(x2-x1);
	var rightDx = -(y2-y1);
	var rightDy = (x2-x1);
	var D = Math.sqrt(leftDx*leftDx + leftDy*leftDy);
	
	leftDx *= width/D;
	leftDy *= width/D;
	rightDx *= width/D;
	rightDy *= width/D;
	
	var rr = 128+rng()*32;
	var gg = 2+rng()*16;
	var bb = 2+rng()*16;
	var fillColorInside = rgba(rr, gg, bb, fillOpacity);
	var fillColor = rgba(rr*0.4, gg*0.4, bb*0.4, fillOpacity);
	
	var grd = context.createLinearGradient(x0 + leftDx, y0 + leftDy, x0 + rightDx, y0 +rightDy);
	grd.addColorStop(0, fillColor);
	grd.addColorStop(0.3, fillColorInside);
	grd.addColorStop(0.7, fillColorInside);
	grd.addColorStop(1, fillColor);

	context.fillStyle = grd;			
	context.strokeStyle = rgba(120, 0, 0, 1);
	
	context.beginPath();
	
	context.moveTo(x1 + leftDx, y1 + leftDy);
	context.lineTo(x2 + leftDx, y2 + leftDy);
	context.lineTo(x2 + rightDx, y2 + rightDy);
	context.lineTo(x1 + rightDx, y1 + rightDy);
	context.lineTo(x1 + leftDx, y1 + leftDy);
	
	context.closePath();
	context.stroke();
	context.fill();
}

function callRngNTimesToBalancePaths(n) {
	for (var i=0; i<n; i++) {
		rng();
	}
}

function run(dt) {
	window.requestAnimationFrame(run);
	
	if (!document.redrawNeeded && !document.forceRedraw)
		return;
	
	var autoredraw = document.getElementById("autoredraw").checked;
	if (!autoredraw && !document.forceRedraw)
		return;
	
	if (document.forceRedraw)
		document.forceRedraw = false;
	
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	
	context.save();
	context.scale(document.scale, document.scale);
	
	
	var seed = document.getElementById("seed").value;
	rng = createRNG(seed);
	
	var grassSpread = document.getElementById("grassSpread").value/100.0;
	drawBackground(canvas, context, rng, true, 10, 30, 1-grassSpread, []);
	
	var gridType = Math.round(document.getElementById("gridType").value);
	var gridSize = Math.round(document.getElementById("gridSize").value);
	var gridOpacity = document.getElementById("gridOpacity").value * 0.01;
	

	var howMuchTrees = (canvas.width/130 * canvas.height/130) * document.getElementById("treeDensity").value * 0.05;
	var howMuchStones = (canvas.width/130 * canvas.height/130) * document.getElementById("stoneDensity").value * 0.1;
	var howMuchTwigs = (canvas.width/130 * canvas.height/130) * document.getElementById("twigsDensity").value * 0.1;
	var riverSize = Math.round(document.getElementById("riverSize").value);

	var centerRandomness = 15.0 * document.getElementById("centerRandomness").value * 0.01;
	var leavedTreeProportion = document.getElementById("leavedTreeProportion").value * 0.01; //how high percent of the trees are simple
	var treeSize = 40 * document.getElementById("treeSize").value * 0.01;
	var treeColor = document.getElementById("treeColor").value * 0.01;
	var treeSeparation = document.getElementById("treeSeparation").value * 0.01;
	var serrationAmplitude = document.getElementById("serrationAmplitude").value * 0.01;
	var serrationFrequency = document.getElementById("serrationFrequency").value * 0.01;
	var serrationRandomness = document.getElementById("serrationRandomness").value * 0.01;
	var colorRandomness = document.getElementById("colorRandomness").value * 0.01;
	// var roadSize = document.getElementById("roadSize").value;
	var clearings = document.getElementById("clearings").value;
	var clearingSize = document.getElementById("clearingSize").value * 0.01;
	var treeSteps = document.getElementById("treeSteps").value;
	var showColliders = document.getElementById("showColliders").value;
	
	
	var stepsNo,angleSteps;
	//rng();
	var i=0;
	
	listOfCirclesForRiver = [];
	listOfCirclesForClearings = [];
	listOfCirclesForTrees = [];
	
	var x0, y0, r0;
	
	if (riverSize > 0) {
		rng = createRNG(seed);
		
		var alpha = rng()*2*Math.PI;
		var beta = alpha + Math.PI*0.5 + rng()*Math.PI;
		var angles = [alpha, beta];
		var midpoints = [{x:rng() * canvas.width, y:rng() * canvas.height}];
		var widths = [Math.round(3*riverSize*(1+rng())), Math.round(3*riverSize*(1+rng()))];

		drawRiver(canvas, context, angles, midpoints, widths, serrationAmplitude, serrationFrequency, serrationRandomness, rng, listOfCirclesForRiver, treeColor, 0, 0, 200);
	}
	
	rng = createRNG(seed);
	for (i=0; i<howMuchStones * 1; i++) {
		var xs = rng() * canvas.width;
		var ys = rng() * canvas.height;
		var rs = 5 + rng() * 9;
		if (!collidesWithPrevious([listOfCirclesForRiver], xs, ys, 1)) {
			drawStone(canvas, context, xs, ys, rs, rng, colorRandomness, treeColor);
		} else {
			callRngNTimesToBalancePaths(4);
		}
	}
	
	
	rng = createRNG(seed);
	for (i=0; i<clearings; i++) {
		x0 = rng() * canvas.width;
		y0 = rng() * canvas.height;
		r0 = canvas.height * 0.4 * 0.5*(1 + rng()) * clearingSize;
		//listOfCirclesForClearings.push({x:x0, y:y0, r:r0});
		addCircleToListOfColliders(listOfCirclesForClearings, x0, y0, r0);
	}
	
	rng = createRNG(seed);
	for (i=0; i<howMuchTwigs * 0.125; i++) {
		let ignore = rng();
		let yt = rng() * canvas.height;
		let len = 10 + rng() * 16;
		let width = 1 + rng() * 3;
		
		let xt = rng() * canvas.width;
		if (!collidesWithPrevious([listOfCirclesForRiver, listOfCirclesForClearings], xt, yt, 5)) {
			drawTwigs(canvas, context, xt, yt, len, width, rng()*Math.PI*2, treeColor, rng);
		} else {
			callRngNTimesToBalancePaths(4);
		}
	}
	
	rng = createRNG(seed);
	drawBackground(canvas, context, rng, false, 10, 30, grassSpread, listOfCirclesForRiver);

	if (gridType > 0)
		drawRectGrid(canvas, context, gridSize, gridOpacity);
	else if (gridType < 0)
		drawHexGrid(canvas, context, gridSize, gridOpacity);
	
	rng = createRNG(seed);
	var treePositions = [];
	for (i=0; i<howMuchTrees; i++) {
		treePositions.push([
			rng() * canvas.width,
			rng() * canvas.height,
			treeSize * (1 + rng()),
			Math.round(treeSteps*(0.75+rng())),
			Math.round(360+120*rng())
		]);
	}
	for (i=0; i<howMuchTrees; i++) {
		rng = createRNG(1.0*seed + x0*11 + y0*17);
		x0 = treePositions[i][0];
		y0 = treePositions[i][1];
		r0 = treePositions[i][2];
		stepsNo = treePositions[i][3];
		angleSteps = treePositions[i][4];
		if (!collidesWithPrevious([listOfCirclesForRiver, listOfCirclesForClearings, listOfCirclesForTrees], x0, y0, r0)) {
			if (rng() > leavedTreeProportion) {				
				drawTreeRounded(
					context, x0, y0, r0*2, centerRandomness, stepsNo, angleSteps,
					5*serrationAmplitude, 2*serrationAmplitude,
					7*serrationFrequency, 4*serrationFrequency,
					0.5*serrationRandomness, 0.14*serrationRandomness,
					colorRandomness, treeColor,
					rng,
					true
				);
				//listOfCirclesForTrees.push({x:x0, y:y0, r:r0*4*treeSeparation});
				addCircleToListOfColliders(listOfCirclesForTrees, x0, y0, r0*4*treeSeparation);
			} else {
				drawTreeRounded(
					context, x0, y0, r0*2, centerRandomness, stepsNo, angleSteps,
					5*serrationAmplitude, 2*serrationAmplitude,
					9*serrationFrequency, 4*serrationFrequency,
					0.6*serrationRandomness, 0.24*serrationRandomness,
					colorRandomness, treeColor,
					rng,
					false
				);
				//listOfCirclesForTrees.push({x:x0, y:y0, r:r0*4*treeSeparation});
				addCircleToListOfColliders(listOfCirclesForTrees, x0, y0, r0*4*treeSeparation);
			}
		} else {
			callRngNTimesToBalancePaths(6);
			var j,k;
			for (j=0; j<stepsNo; j++) {
				callRngNTimesToBalancePaths(9);
				for (k=0; k<360; k += (360.0/120.0)) {
					callRngNTimesToBalancePaths(1);
				}
			}
		}
	}
	
	if (showColliders>0) {
		for (i=0; i<listOfCirclesForTrees.length; i++) {
			drawPolygon(canvas, context, listOfCirclesForTrees[i]);
		}
	}
	if (showColliders>1) {
		for (i=0; i<listOfCirclesForRiver.length; i++) {
			drawPolygon(canvas, context, listOfCirclesForRiver[i]);
		}
	}
	if (showColliders>2) {
		for (i=0; i<listOfCirclesForClearings.length; i++) {
			drawPolygon(canvas, context, listOfCirclesForClearings[i]);
		}
	}
	
	context.restore();
	
	setRedrawNeeded(false, noneRedraws());
}
