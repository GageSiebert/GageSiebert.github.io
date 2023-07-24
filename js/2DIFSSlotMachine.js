

function rot_matrix2D(theta) {
    return nj.array([
        [Math.cos(theta), -Math.sin(theta)],
        [Math.sin(theta), Math.cos(theta)]
    ]);
}

function rot_matrix3D(theta, phi, psi) {
    const thetaMat = nj.array([
        [Math.cos(theta), -Math.sin(theta), 0],
        [Math.sin(theta), Math.cos(theta), 0],
        [0, 0, 1]
    ]);
    const phiMat = nj.array([
        [Math.cos(phi), 0, -Math.sin(phi)],
        [0, 1, 0],
        [Math.sin(phi), 0, Math.cos(phi)]
    ]);
    const psiMat = nj.array([
        [1, 0, 0],
        [0, Math.cos(psi), -Math.sin(psi)],
        [0, Math.sin(psi), Math.cos(psi)]
    ]);
    return nj.dot(nj.dot(thetaMat, phiMat), psiMat);
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
    
/*function randomContractionMatrix(n) {
    // Initialize matrix with random values between -1 and 1
    let matrix = Array.from({length: n}, () => 
        Array.from({length: n}, () => 2*Math.random() - 1)
    );

    // Calculate determinant using numeric.js library
    let det = numeric.det(matrix);
    //console.log(det)
    // Check if determinant is within the desired range
    while (det <= -1 || det >= 1) {
        // Adjust matrix values to bring determinant within range
        matrix = matrix.map(row => row.map(value => value / 2));
        det = numeric.det(matrix);
        //console.log(det)
    }
    //console.log(matrix);
    return matrix;
}*/

// This is leaky... Maps aren't contracting as much as I expect
function randomContractionMatrix(n) {
    // Initialize matrix with random values between -1 and 1
    let matrix = Array.from({length: n}, () => 
        Array.from({length: n}, () => 2*Math.random() - 1)
    );

    // Calculate eigenvalues using numeric.js library
    let eigenvalues = numeric.eig(matrix).lambda.x;

    // Find the largest eigenvalue in absolute value
    let maxEigenvalue = Math.max(...eigenvalues.map(x => Math.abs(x)));

    // If the largest eigenvalue is greater than 1, scale down the matrix
    if (maxEigenvalue > 1) {
        matrix = matrix.map(row => row.map(value => value / (maxEigenvalue + 0.1)));
    }

    return matrix;
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

function generateIFSPoints(Npts,Nmaps) {
    var map
    var maps = [];
    var weights = [];
    for (var i = 0; i < Nmaps; i++) {
        maps.push({
            matrix: randomContractionMatrix(2),
            vector: [Math.random(), Math.random()]
        });
        weights.push(Math.random());
        //console.log(maps[i].vector)
    }
    var pts = []; 
    pts.push({
        x: [Math.random(), Math.random()] // This is the initial point
    }); 
    //console.log(pts[0].x);
    for (var i = 0; i < Npts; i++) {
        map = weightedRandomChoice(maps, weights);
        pts.push({
            x: nj.dot(map.matrix, pts[i].x).add(map.vector).tolist()
        });    

    }
    //console.log(pts[0].x);
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
    //console.log(pts[0].x);
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