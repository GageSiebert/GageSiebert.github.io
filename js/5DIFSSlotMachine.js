

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

// This gives a random 3D contraction matrix, but with no rotations
function RGBMatrix3D(mu,sigma) {
    let theta = Math.random() * 2 * Math.PI;
    temp = nj.array([
        [BoxMuller(mu,sigma) * (2 * (Math.random() > 0.5) - 1), 0, 0],
        [0, BoxMuller(mu,sigma) * (2 * (Math.random() > 0.5) - 1), 0],
        [0, 0, BoxMuller(mu,sigma) * (2 * (Math.random() > 0.5) - 1)]
        ]); // Normally distributed eigenvalues with random signs
        return temp
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

function generateIFSPoints(Npts,Nmaps,mu,sigma,Wsigma,RGBmu,RGBsigma,R0,G0,B0,RGB0sigma) {
    var map
    var maps = [];
    var weights = [];
    for (var i = 0; i < Nmaps; i++) {
        maps.push({
            matrix: randomContractionMatrix2D(mu,sigma),
            vector: [Math.random(), Math.random()],
            RGBmatrix: RGBMatrix3D(RGBmu,RGBsigma),
            RGBvector: [BoxMuller(R0,RGB0sigma), BoxMuller(G0,RGB0sigma), BoxMuller(B0,RGB0sigma)]
        });
        weights.push(BoxMuller(0.5,Wsigma));
    }
    let pts = []; 
    let RGBpts = [];
    pts.push({
        x: [Math.random(), Math.random()] // This is the initial point
    }); 
    RGBpts.push({
        x: [Math.random(), Math.random(), Math.random()] // This is the initial point
    });

    for (var i = 0; i < Npts; i++) {
        map = weightedRandomChoice(maps, weights);
        pts.push({
            x: nj.dot(map.matrix, pts[i].x).add(map.vector).tolist()
        });    
        RGBpts.push({
            x: nj.dot(map.RGBmatrix, RGBpts[i].x).add(map.RGBvector).tolist()
        });

    }
    // Normalize the points
    let maxVal = Number.NEGATIVE_INFINITY;
    let minVal = Number.POSITIVE_INFINITY;
    for (let i = 0; i < Npts; i++) {
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
    
    for (let i = 0; i < Npts; i++) {
        for (let j = 0; j < pts[i].x.length; j++) {
            pts[i].x[j] -= minVal;
            pts[i].x[j] /= maxVal-minVal;
        }
    }
    console.log(RGBpts[10].x)
    let RGBmaxVal = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
    let RGBminVal = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
    for (let i = 0; i < RGBpts.length; i++) {
        for (let j = 0; j < RGBpts[i].x.length; j++) {
            if (RGBpts[i].x[j] > RGBmaxVal[j]) {
                RGBmaxVal[j] = RGBpts[i].x[j];
            }
            if (RGBpts[i].x[j] < RGBminVal[j]) {
                RGBminVal[j] = RGBpts[i].x[j];
            }
        }
    }
    console.log(RGBpts[10].x)
    console.log(RGBmaxVal, RGBminVal)
    for (let i = 0; i < Npts; i++) {
        for (let j = 0; j < RGBpts[i].x.length; j++) {
            RGBpts[i].x[j] -= RGBminVal[j];
            RGBpts[i].x[j] /= RGBmaxVal[j]-RGBminVal[j];
        }
    }
    
    var points = [] // This array will be converted to the RRGGBB hex format
    for (var i = 0; i < Npts; i++) {
        points.push({
            x: pts[i].x[0] * width,
            y: pts[i].x[1] * height,
            color: rgbToHex([RGBpts[i].x[0],RGBpts[i].x[1],RGBpts[i].x[2]])
        });
    }
    console.log("Generated points");
    return points;
}

console.log("IFSSlotMachine.js loaded")