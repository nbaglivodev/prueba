(function ($) {

  function linspace(a,b,n) {
    if(typeof n === "undefined") n = Math.max(Math.round(b-a)+1,1);
    if(n<2) { return n===1?[a]:[]; }
    var i,ret = Array(n);
    n--;
    for(i=n;i>=0;i--) { ret[i] = (i*b+(n-i)*a)/n; }
    return ret;
  }

  const approachTypes = [
    {label: 'Non-Instrument', plotGroup: '1', value: 'V'},
    {label: 'Non-Precision', plotGroup: '1', value: 'NP'},
    {label: 'Precision Category I', plotGroup: 'all', value: 'P1'},
    {label: 'Precision Category II', plotGroup: 'all', value: 'P2'},
    {label: 'Precision Category III', plotGroup: 'all', value: 'P3'},
  ]

  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  function toGeoPoint(point, zone) {
    console.log(point)
    const geo = utmToLatLng(zone, point[0], point[1], false)
    return [geo.lon, geo.lat, point[2]]
  }

  function toGeoJSON(coords) {
    return {
      "type": "Polygon",
      "coordinates": [coords]
    }
  }

  function getData(opts) {
    const colors = {
        approach: 'rgb(220, 100, 200)',
        innerApproach: 'rgb(0, 150, 100)',
        balkedLanding: 'rgb(20, 300, 100)',
        takeOffClimb: 'rgb(40, 30, 100)',
        transition: 'rgb(140, 10, 200)',
        innerTransition: 'rgb(40, 150, 30)',
      }

      function createMesh(x, y, z, c) {
        return {
          color: c,
          type: 'mesh3d',
          x: x,
          y: y,
          z: z,
          opacity: .5,
          scene: 'scene1'
        };
      }

      function approach() {
        var res = tesis.ols.approach(opts.approach, opts.code, opts.alpha, 0, 0, opts.z, opts.x, opts.y);
        return [
          {
            x: [res['x'][2], res['x'][3], res['x'][7], res['x'][6]],
            y: [res['y'][2], res['y'][3], res['y'][7], res['y'][6]],
            z: [res['z'][2], res['z'][3], res['z'][7], res['z'][6]],
          },
          {
            x: [res['x'][1], res['x'][5], res['x'][2], res['x'][6]],
            y: [res['y'][1], res['y'][5], res['y'][2], res['y'][6]],
            z: [res['z'][1], res['z'][5], res['z'][2], res['z'][6]],
          },
          {
            x: [res['x'][0], res['x'][4], res['x'][1], res['x'][5]],
            y: [res['y'][0], res['y'][4], res['y'][1], res['y'][5]],
            z: [res['z'][0], res['z'][4], res['z'][1], res['z'][5]],
          },
        ]
      }

      function innerApproach() {
        console.log('innerApproach', opts.approach, opts.code, opts.alpha, 0, 0, opts.z, opts.x, opts.y)
        return tesis.ols.innerApproach(opts.approach, opts.code, opts.alpha, 0, 0, opts.z, opts.x, opts.y);
      }

      function balkedLanding() {
        console.log('balkedLanding', opts.code, opts.alpha, 0, 0, opts.z, opts.x, opts.y, opts.elev, opts.lf, opts.thresholdTwo.z)
        return tesis.ols.balkedLanding(opts.code, opts.alpha, 0, 0, opts.z, opts.x, opts.y, opts.elev, opts.lf, opts.thresholdTwo.z)
      }

      function innerTransition() {
        var res = tesis.ols.innerTransition(opts.approach, opts.code, opts.alpha, 0, 0, opts.z, opts.x, opts.y, opts.elev, opts.distances.lda, opts.lf, opts.thresholdTwo.z);
        return [
          {
            x: [res['x'][0], res['x'][1], res['x'][2], res['x'][3], res['x'][4], res['x'][5]],
            y: [res['y'][0], res['y'][1], res['y'][2], res['y'][3], res['y'][4], res['y'][5]],
            z: [res['z'][0], res['z'][1], res['z'][2], res['z'][3], res['z'][4], res['z'][5]],
          },
          {
            x: [res['x'][6], res['x'][7], res['x'][8], res['x'][9], res['x'][10], res['x'][11]],
            y: [res['y'][6], res['y'][7], res['y'][8], res['y'][9], res['y'][10], res['y'][11]],
            z: [res['z'][6], res['z'][7], res['z'][8], res['z'][9], res['z'][10], res['z'][11]],
          },
        ]
      }

      function transition() {
        var res = tesis.ols.transition(opts.approach, opts.code, opts.alpha, 0, 0, opts.z, opts.x, opts.y, opts.elev, opts.distances.lda, opts.lf, opts.wf, opts.thresholdTwo.z);
        return [
          {
            x: [res['x'][0], res['x'][1], res['x'][2], res['x'][3]],
            y: [res['y'][0], res['y'][1], res['y'][2], res['y'][3]],
            z: [res['z'][0], res['z'][1], res['z'][2], res['z'][3]],
          },
          {
            x: [res['x'][4], res['x'][5], res['x'][6], res['x'][7]],
            y: [res['y'][4], res['y'][5], res['y'][6], res['y'][7]],
            z: [res['z'][4], res['z'][5], res['z'][6], res['z'][7]],
          },
        ]
      }

      function takeOffClimb() {
        return tesis.ols.takeOffClimb(opts.code, opts.alpha, 0, 0, opts.z, opts.x, opts.y, opts.distances.tora, opts.distances.tdda, opts.distances.lda, opts.thresholdTwo.z);
      }

      function createFromPlane(plane, type) {
        return createMesh(plane.x, plane.y, plane.z, colors[type]);
      }

      let data = [];
      data = approach().map(plane => createFromPlane(plane, 'approach'));
      data = data.concat(createFromPlane(innerApproach(), 'innerApproach'));
      data = data.concat(createFromPlane(takeOffClimb(), 'takeOffClimb'));
      data = data.concat(createFromPlane(balkedLanding(), 'balkedLanding'));
      data = data.concat(transition().map(plane => createFromPlane(plane, 'transition')));
      data = data.concat(innerTransition().map(plane => createFromPlane(plane, 'innerTransition')));

      return data
  }

  function createPlot(data) {
      const layout = {
        title: '',
        width: $(window).width(),
        height: $('.step-content').height() - 60,
        scene1: {
          aspectratio: {
            x: 10,
            y: 10,
            z: 1
          },
          xaxis: {
            ticks: false,
            backgroundcolor: "rgb(230, 230,200)",
            gridcolor: "rgb(255, 255, 255)",
            showbackground: false,
            zerolinecolor: "rgb(255, 255, 255)"
          }, 
          yaxis: {
            ticks: false,
            showbackground: false,
            backgroundcolor: "rgb(230, 230,200)",
            gridcolor: "rgb(255, 255, 255)",
            showbackground: false,
            zerolinecolor: "rgb(255, 255, 255)"
          },
          zaxis: {
            ticks: false,
            showbackground: false,
            backgroundcolor: "rgb(230, 230,200)",
            gridcolor: "rgb(255, 255, 255)",
            showbackground: false,
            zerolinecolor: "rgb(255, 255, 255)"
          }
        },
      }

      Plotly.newPlot('plot', data, layout)
  }
  
  $(function () {
    // App initialization
    const app = new Vue({
      el: '#app',
      data: {
        approach: approachTypes[2],
        code: 4,
        alpha: 130,
        thresholdOne: {
          x: -34.553888,
          y: -58.425126,
          z: 6,
        },
        thresholdTwo: {
          z: 5,
        },
        distances: {
          tora: 2100,
          tdda: 2100,
          lda: 2100,
          asda: 2100
        },
        strip: {
          length: 60,
          width: 150,
        },
        elev: 6,
        approachTypes: approachTypes,
        plots: [
          {label: 'Conical', group: '1'},
          {label: 'Inner Horizontal', group: '1'},
          {label: 'Approach', group: '1'},
          {label: 'Transitional', group: '1'},
          {label: 'Inner Approach', group: '2'},
          {label: 'Balked Landing', group: '2'},
          {label: 'Inner Transitional', group: '2'},
          {label: 'Take-off Climb', group: '2'},
        ]
      },
      methods: {
        showPlot: function(plot) {
          return this.approach.plotGroup === 'all' || this.approach.plotGroup === plot.group;
        },
        generateKML: function() {
          const pos = toUTM(app.thresholdOne.x, app.thresholdOne.y);
          const data = getData({
            approach: app.approach.value,
            code: app.code,
            alpha: app.alpha,
            x: pos.x,
            y: pos.y,
            z: app.thresholdOne.z,
            lf: app.strip.length,
            thresholdTwo: app.thresholdTwo,
            wf: app.strip.width,
            elev: app.elev,
            distances: app.distances
          });

          const geoPoints = data
            .map(d => _.pick(d, ['x', 'y', 'z']) )
            .map(d => _.zip(d.x, d.y, d.z))
            .map(d => d.map(p => toGeoPoint(p, pos.zone)))

          const kml = tokml(toGeoJSON(geoPoints))
          download('file.klm', kml)
        }
      }
    });

    window.generatePlot = (function() {
      setTimeout(function() {
        const pos = toUTM(app.thresholdOne.x, app.thresholdOne.y);
        createPlot(getData({
          approach: app.approach.value,
          code: app.code,
          alpha: app.alpha,
          x: pos.x,
          y: pos.y,
          z: app.thresholdOne.z,
          lf: app.strip.length,
          thresholdTwo: app.thresholdTwo,
          wf: app.strip.width,
          elev: app.elev,
          distances: app.distances
        }));
        $('.stepper').nextStep(function() { console.log('done') });
      }, 2000);
    })

    // View initialization
    $('.modal').modal();
    $('.stepper').activateStepper({
      linearStepsNavigation: false,
      autoFormCreation: false,
    });
    $('select').material_select();

  });

})(jQuery); 
