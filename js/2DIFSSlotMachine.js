
function rot_matrix2D(theta) {
    return nj.array([
        [Math.cos(theta), -Math.sin(theta)],
        [Math.sin(theta), Math.cos(theta)]
    ]);
}

//This function gives a random number with a normal distribution
function BoxMuller(mu, sigma) {
    let u1 = Math.random();
    let u2 = Math.random();
    return (Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * sigma + mu) % 1; // Mod 1 to keep it in the unit interval
}

// This gives a random 2D contraction matrix
function randomContractionMatrix2D(mu,sigma) {
    let theta = Math.random() * 2 * Math.PI;
    temp = nj.array([
        [BoxMuller(mu,sigma) * (2 * (Math.random() > 0.5) - 1), 0],
        [0, BoxMuller(mu,sigma) * (2 * (Math.random() > 0.5) - 1)]
        ]); // Normally distributed eigenvalues with random signs
        return nj.dot(rot_matrix2D(theta), temp) 
}

function rgbToHex(rgb) {
    // Convert each value to hexadecimal
    return '#' + rgb.map(value => {
        // Scale from 0-1 to 0-255 and round to nearest integer
        let hex = Math.round(value * 255).toString(16);

        // Pad with a leading zero if necessary
        if (hex.length < 2) {
            hex = '0' + hex;
        }

        return hex;
    }).join('');
}

function weightedRandomChoice(items, weights) {
    let totalWeight = 0;
    for (let i = 0; i < weights.length; i++) {
        totalWeight += weights[i];
    }

    let randomNum = Math.random() * totalWeight;
    let weightSum = 0;

    for (let i = 0; i < items.length; i++) {
        weightSum += weights[i];
        if (randomNum <= weightSum) {
            return items[i];
        }
    }
}

function generateIFSPoints(Npts,Nmaps,mu,sigma,Wsigma) {
    var map
    var maps = [];
    var weights = [];
    for (var i = 0; i < Nmaps; i++) {
        maps.push({
            matrix: randomContractionMatrix2D(mu,sigma),
            vector: [Math.random(), Math.random()]
        });
        weights.push(BoxMuller(0.5,Wsigma));
    }
    var pts = []; 
    pts.push({
        x: [Math.random(), Math.random()] // This is the initial point
    }); 
    for (var i = 0; i < Npts; i++) {
        map = weightedRandomChoice(maps, weights);
        pts.push({
            x: nj.dot(map.matrix, pts[i].x).add(map.vector).tolist()
        });    

    }
    // Normalize the points
    let maxVal = Number.NEGATIVE_INFINITY;
    let minVal = Number.POSITIVE_INFINITY;
    for (let i = 0; i < pts.length; i++) {
        for (let j = 0; j < pts[i].x.length; j++) {
            if (pts[i].x[j] > maxVal) {
                maxVal = pts[i].x[j];
            }
            if (pts[i].x[j] < minVal) {
                minVal = pts[i].x[j];
            }
        }
    }
    console.log(maxVal, minVal)
    
    for (let i = 0; i < pts.length; i++) {
        for (let j = 0; j < pts[i].x.length; j++) {
            pts[i].x[j] -= minVal;
            pts[i].x[j] /= maxVal-minVal;
        }
    }
    var points = [] // This array will be converted to the RRGGBB hex format
    for (var i = 0; i < Npts; i++) {
        points.push({
            x: pts[i].x[0] * width,
            y: pts[i].x[1] * height,
            color: "#000000"
        });
    }
    console.log("Generated points");
    return points;
}

console.log("IFSSlotMachine.js loaded")