const tesis = {
	ols: {}
}

const approachs = {
	V: 'V',
	NP: 'NP',
	P1: 'P1',
	P2: 'P2',
	P3: 'P3',
}

function sind(alpha) {
	return Math.sin(alpha*Math.PI/180)
}

function cosd(alpha) {
	return Math.cos(alpha*Math.PI/180)
}

function getDeltaApproach(ap) {
	return ap === approachs.v? .1 : .15;
}

function getL0Approach(ap, n) {
	return ap === approachs.V && n === 1? 30 : 60;
}

function getL1Approach(ap, n) {
	if (ap === approachs.V && n === 1) {
		return 1600;
	} else if ((ap === approachs.V && n === 2) || (ap === approachs.NP && (n === 1 || n === 2))) {
		return 2500;
	}
    return 3000;
}

function getL2Approach(ap, n) {
	if (ap === approachs.P1 && (n === 1 || n === 2)) {
		return 1600;
	} else if ((ap === approachs.V) || (ap === approachs.NP && (n === 1 || n === 2))) {
		return 0; // Undefined??
	}
    return 3600;
}

function getL3Approach(ap, n) {
	if (((ap === approachs.NP || ap === approachs.P1) && (n === 3 || n === 4)) || (ap === approachs.P2 || ap === approachs.P3)) {
		return 8400;
	}
    return 0;
}

function getW0Approach(ap, n) {
	if (ap === approachs.V) {
		if (n === 1) {
			return 60;
		} else if (n === 2) {
			return 80;
		} else if (n === 3 || n === 4) {
			return 150;
		}
	} else if ((ap === approachs.NP || ap === approachs.P1) && (n === 1 || n === 2)) {
		return 150;
	}

	return 300;
}

function getGamma1Approach(ap, n) {
	const g1 = () => 1/30;
	const g2 = () => 0.025;

	if (ap === approachs.V) {
		if (n === 1) {
			return 0.05;
		} else if (n === 2) {
			return 0.04;
		} else if (n === 3) {
			return g1();
		} else if (n === 4) {
			return g2();
		}
	} else if (ap === approachs.NP && (n === 1 || n === 2)) {
		return g1();
	} else if (ap === approachs.P1 && (n === 1 || n === 2)) {
		return g2();
	}

	return 0.02;
}

function getGamma2Approach(ap, n) {
	if ((ap === approachs.P1) && (n === 1 || n === 2)) {
		return 0.03;
	} else if ((ap === approachs.V) || (ap === approachs.NP && (n === 1 || n === 2))) {
        return 0;
	}
    return 0.025;
}

function map(arr, fn) {
  return nj.array(arr.tolist().map(fn));
}

function projectX(vx, vy, alpha) {
	return map(vx, x => x*sind(alpha)).subtract(map(vy, y => y * cosd(alpha)));
}

function projectY(vx, vy, alpha) {
	return map(vx, x => x*cosd(alpha)).add(map(vy, y => y * sind(alpha)));
}

function translateX(vec, x0_utm) {
	return vec.add(map(nj.ones(vec.shape), x => x * x0_utm));	
}

function translateY(vec, y0_utm) {
	return vec.add(map(nj.ones(vec.shape), y => y * y0_utm));	
}

function approach(approach, n, x0, y0, z0) {
	console.log('approach', approach, n, x0, y0, z0)
	const delta = getDeltaApproach(approach);

	const l0 = getL0Approach(approach, n);
	const l1 = getL1Approach(approach, n);
	const l2 = getL2Approach(approach, n);
	const l3 = getL3Approach(approach, n);

	const d1 = delta*l1;
	const d2 = delta*l2;
	const d3 = delta*l3;

	const w0 = getW0Approach(approach, n);
	const w1 = 2*d1 + w0;
	const w2 = 2*d2 + w1;
	const w3 = 2*d3 + w2;

	// pa
	const xam = x0 - l0;
	const yam = y0;
	const zam = z0;

	//pb
	const xbm = x0 - (l0+l1);
	const ybm = y0;
	const zbm = z0 + l1*getGamma1Approach(approach, n);

	//pc
	const xcm = x0 - (l0+l1+l2);
	const ycm = y0;
	const zcm = zbm + l2*getGamma2Approach(approach, n);

	//pd
	const xdm = x0 - (l0+l1+l2+l3);
	const ydm = y0;
	const zdm = zcm;

	// p1
	const x1m = xam;
	const y1m = yam - (w0/2);
	const z1m = zam;
	 
	// p2
	const x2m = xbm;
	const y2m = ybm - (w1/2);
	const z2m = zbm;
	 
	// p3
	 
	const x3m = xcm;
	const y3m = ycm - (w2/2);
	const z3m = zcm;
	 
	// p4
	const x4m = xdm;
	const y4m = ydm - (w3/2);
	const z4m = zdm;
	 
	// p5
	const x5m = xam;
	const y5m = yam + (w0/2);
	const z5m = zam;
	 
	// p6
	const x6m = xbm;
	const y6m = ybm + (w1/2);
	const z6m = zbm;
	 
	// p7
	const x7m = xcm;
	const y7m = ycm + (w2/2);
	const z7m = zcm;
	 
	// p8
	const x8m = xdm;
	const y8m = ydm + (w3/2);
	const z8m = zcm;

	return {
		x: [x1m, x2m, x3m, x4m, x5m, x6m, x7m, x8m],
		y: [y1m, y2m, y3m, y4m, y5m, y6m, y7m, y8m],
		z: [z1m, z2m, z3m, z4m, z5m, z6m, z7m, z8m],
	}
}

function innerApproach(ap, n, x0, y0, z0) {
	const l0 = ap === approachs.V || ap === approachs.NP? 0 : 60;
	const l1 = ap === approachs.V || ap === approachs.NP? 0 : 900;
	
	let gamma = 0;
	if (ap === approachs.P1 && (n === 1 || n === 2)) {
		gamma = 0.025;
	} else if ( ((ap === approachs.P1 || ap === approachs.P2) && (n === 3 || n === 4)) || (ap === approachs.P3) ) {
		gamma = 0.02;
	}

	// pa
	const xam = x0 - l0;
	const yam = y0;
	const zam = z0;
 
	// pb
	const xem = x0 - (l0 + l1);
	const yem = y0;
	const zem = z0 + l1*gamma;

	function getW0() {
		if (ap === approachs.P1 && (n === 1 || n === 2)) {
			return 90;
		} else if (ap === approachs.P1 && (n === 3 || n === 4)) {
			return 120;
		} else if ((ap === approachs.P2 || ap === approachs.P3) && (n === 3 || n === 4)) {
        	//hay una excepción; si letra clave es F == 155 
			return 120;
		}
		return 0;
	}

	const w0 = getW0();
 
 	// p27
	const x27m = xam;
	const y27m = yam - (w0/2);
	const z27m = zam;
 
	// p28
	const x28m = xem;
	const y28m = yem - (w0/2);
	const z28m = zem;
	 
	// p20
	const x29m = xam;
	const y29m = yam + (w0/2);
	const z29m = zam;
	 
	// p30 
	const x30m = xem;
	const y30m = yem + (w0/2);
	const z30m = zem;

	return {
		x: [x27m, x28m, x29m, x30m],
		y: [y27m, y28m, y29m, y30m],
		z: [z27m, z28m, z29m, z30m]
	}
}

function takeOffClimb(n, x0, y0, z0, tora, tdda, lda, z_u2) {
	const delta = (n === 1 || n === 2)? 0.1 : 0.125;
	const w0 = n === 1? 60 : (n === 2? 80 : 180);
	const w1 = n === 1? 380 : (n === 2? 580 : 1200);
	const l1 = (w1 - w0)/(2*delta);

	function getL0() {
		if (tdda === tora) {
			return n === 1? 30 : 60;
		}

		return Math.max(tdda - tora, 60);
	}

	const l0 = getL0();
	const gamma = n === 1? .05 : (n === 2? .04 : 0.02);
	const ld = n === 1? 1600 : (n === 2? 2500 : 15000);
 
	// pf
	const xfm = x0 + lda + l0;
	const yfm = y0;
	const zfm = z_u2;
 
	// pg
 
	const xgm = x0 + lda + l0 + l1;
	const ygm = y0;
	const zgm = z_u2 + gamma*l1;

	// ph
	const xhm = x0 + lda + l1 + ld;
	const yhm = y0;
	const zhm = z_u2 + gamma*ld;
 
	// p21
	const x21m = xhm;
	const y21m = yhm - w1/2;
	const z21m = zhm;
 
	// p22
	const x22m = xgm;
	const y22m = ygm - w1/2;
	const z22m = zgm;
 
	// p23
	const x23m = xfm;
	const y23m = yfm - w0/2;
	const z23m = zfm;
	 
	// p24
	const x24m = xhm;
	const y24m = yhm + w1/2;
	const z24m = zhm;
 
	// p25
	const x25m = xgm;
	const y25m = ygm + w1/2;
	const z25m = zgm;
 
	// p26
	const x26m = xfm;
	const y26m = yfm + w0/2;
	const z26m = zfm;

	return {
		x: [x21m, x22m, x23m, x26m, x25m, x24m],
		y: [y21m, y22m, y23m, y26m, y25m, y24m],
		z: [z21m, z22m, z23m, z26m, z25m, z24m],
	}
}

function balkedLanding(n, x0, y0, z0, elev, lda, lf, z_u2) {
	const l0 = n === 1 || n === 2? lda + lf : 1800;

	const xlm = x0 + l0;
	const ylm = y0;

	const gammaP = Math.abs(z_u2 - z0) / lda;
	const gammaAt = n === 1 || n === 2? 0.04 : 1/30;

	let zlm = z0;
	if (z0 < z_u2) {
		zlm = z0 + gammaP*l0;
	} else if (z0 > z_u2) {
        zlm = z0 - gammaP*l0;
	}

	// m
	const xmm = xlm + (45+(elev-zlm))/gammaAt;
	const ymm = y0;
	const zmm = 45+(elev-zlm);
 

	const deltaAt = .1;
	const d = deltaAt*(xmm-xlm);
	const w0 = n === 1 || n === 2? 90 : 120;
      
	const w1 = 2*d + w0;

	// p31
	const x31m = xmm;
	const y31m = ymm - w1/2;
	const z31m = zmm;
 
	// p32
	const x32m = xlm;
	const y32m = ylm - w0/2;
	const z32m = zlm;
 
	// p33
	const x33m = xmm;
	const y33m = ymm + w1/2;
	const z33m = zmm;
 
	// p34
	const x34m = xlm;
	const y34m = ylm + w0/2;
	const z34m = zlm;

	return {
		x: [x31m, x32m, x34m, x33m],
		y: [y31m, y32m, y34m, y33m],
		z: [z31m, z32m, z34m, z33m],
	}
}

function transition(ap, n, x0, y0, z0, elev, lda, lf, wf, z_u2) {
	const dz = elev - z0;

 	const gamma = getGamma1Approach(ap, n);
 	const delta = getDeltaApproach(ap);

 	const approachPoints = approach(ap, n, x0, y0, z0);
	// p9
	const z9m = 45 + dz;
	const x9m = approachPoints['x'][0] - z9m/gamma;
	const y9m = approachPoints['y'][0] - (delta/gamma)*z9m;
 
 	// p10
	const x10m = approachPoints['x'][0];
	const y10m = approachPoints['y'][0];
	const z10m = approachPoints['z'][0];

	// p11
	const x11m = x0 + lda + lf;
	const y11m = y0 - wf;
	const z11m = z_u2;

	// p12
	const x12m = x0 + lda + lf;
	const z12m = 45 + dz;
	const y12m = (y0 - wf) - (delta/gamma)*z12m;

	/*  
	p9 = [x_t(1,1) y_t(1,1) z_t(1,1)];
	p10 = [x_t(1,2) y_t(1,2) z_t(1,2)];
	p11 = [x_t(1,3) y_t(1,3) z_t(1,3)];
	p12 = [x_t(1,4) y_t(1,4) z_t(1,4)];
	 
	p9b = [x_tb(1,1) y_tb(1,1) z_tb(1,1)];
	p10b = [x_tb(1,2) y_tb(1,2) z_tb(1,2)];
	p11b = [x_tb(1,3) y_tb(1,3) z_tb(1,3)];
	p12b = [x_tb(1,4) y_tb(1,4) z_tb(1,4)]
	*/
	return {
		x: [x9m, x10m, x11m, x12m, x9m, x10m, x11m, x12m],
		y: [y9m, y10m, y11m, y12m, -y9m, -y10m, -y11m, -y12m],
		z: [z9m, z10m, z11m, z12m, z9m, z10m, z11m, z12m],
	}
}

function innerTransition(ap, n, x0, y0, z0, elev, lda, lf, z_u2) {
	const dz = elev - z0;
	let gamma = 0.333;

	if (ap === approachs.P1 && (n === 1 || n === 2)) {
        gamma = 0.4;
	} else if (ap === approachs.V || ap === approachs.NP) {
        gamma = 0;
	}

	const iapPoints = innerApproach(ap, n, x0, y0, z0);
	const blPoints = balkedLanding(n, x0, y0, z0, elev, lda, lf, z_u2)

	// p36
	const x36m = iapPoints['x'][1];
	const y36m = iapPoints['y'][1];
	const z36m = iapPoints['z'][1];
 
	// p35
	const z35m = 45 + dz;
	const x35m = iapPoints['x'][1];
	const y35m = y36m - (z35m-z36m)/gamma;
 
 	// p37
	const x37m = blPoints['x'][1];
	const y37m = blPoints['y'][1];
	const z37m = blPoints['z'][1];
 
	// p39 
	const x38m = blPoints['x'][0];
	const y38m = blPoints['y'][0];
	const z38m = blPoints['z'][0];
 
	// p30
	const z39m = z35m;
	const x39m = iapPoints['x'][0];
	const y39m = iapPoints['y'][0] - (z39m/gamma);
 
	const xim_ti = [x35m, x36m, x37m, x38m, x39m, x37m];
	const yim_ti = [y35m, y36m, y37m, y38m, y39m, y37m];
	const zim_ti = [z35m, z36m, z37m, z38m, z39m, z37m];
 
	const xim_tib = [x35m, x36m, x37m, x38m, x39m, x37m];
	const yim_tib = [-y35m, -y36m, -y37m, -y38m, -y39m, -y37m];
	const zim_tib = [z35m, z36m, z37m, z38m, z39m, z37m];

	return {
		x: xim_ti.concat(xim_tib),
		y: yim_ti.concat(yim_tib),
		z: zim_tib.concat(zim_tib),
	}
}

tesis.ols.approach = function(ap, n, alpha, x0, y0, z0, x0_utm, y0_utm) {
	return normalize(approach(ap, n, x0, y0, z0), alpha, x0_utm, y0_utm);
}

tesis.ols.innerApproach = function(ap, n, alpha, x0, y0, z0, x0_utm, y0_utm) {
	console.log('tesis innerApproach', ap, n, alpha, x0, y0, z0, x0_utm, y0_utm)
	return normalize(innerApproach(ap, n, x0, y0, z0), alpha, x0_utm, y0_utm);
}

tesis.ols.transition = function(ap, n, alpha, x0, y0, z0, x0_utm, y0_utm, elev, lda, lf, wf, z_u2) {
	return normalize(transition(ap, n, x0, y0, z0, elev, lda, lf, wf, z_u2), alpha, x0_utm, y0_utm);
}

tesis.ols.innerTransition = function(ap, n, alpha, x0, y0, z0, x0_utm, y0_utm, elev, lda, lf, z_u2) {
	return normalize(innerTransition(ap, n, x0, y0, z0, elev), alpha, x0_utm, y0_utm);
}

tesis.ols.balkedLanding = function(n, alpha, x0, y0, z0, x0_utm, y0_utm, elev, lda, lf, z_u2) {
	return normalize(balkedLanding(n, x0, y0, z0, elev, lda, lf, z_u2), alpha, x0_utm, y0_utm);
}

tesis.ols.takeOffClimb = function(n, alpha, x0, y0, z0, x0_utm, y0_utm, tora, tdda, lda, z_u2) {
	return normalize(takeOffClimb(n, x0, y0, z0, tora, tdda, lda, z_u2), alpha, x0_utm, y0_utm);
}

function normalize(coords, alpha, x0_utm, y0_utm) {
	return tolist(translate(project(tondarray(coords), alpha), x0_utm, y0_utm));
}

function tondarray(coords) {
	return {
		x: nj.array(coords.x),
		y: nj.array(coords.y),
		z: coords.z
	}	
}

function tolist(coords) {
	return {
		x: coords.x.tolist(),
		y: coords.y.tolist(),
		z: coords.z
	}	
}

function project(coords, alpha) {
	return {
		x: projectX(coords.x, coords.y, alpha),
		y: projectY(coords.x, coords.y, alpha),
		z: coords.z
	}
}

function translate(coords, x, y) {
	return {
		x: translateX(coords.x, x),
		y: translateY(coords.y, y),
		z: coords.z
	}
}