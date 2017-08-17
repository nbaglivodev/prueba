let app;

(function ($, app) {
  function createPlot() {

    function createMesh(x, y, z) {
      return {
        color:'rgb(300,100,200)',
        type: 'mesh3d',
        x: x.map(i => i* 1000000),
        y: y.map(i => i* 1000000),
        z: z,
        opacity: .5,
        scene: 'scene1'
      };
    }

    var x = [4.2393, 4.2466, 4.2480, 4.2424];
    var y = [4.5012, 4.4968, 4.4985, 4.5049];
    var z = [156, 156, 156, 156]

    var x2 = [4.2466, 4.2480, 4.2497, 4.2504];
    var y2 = [4.4968, 4.4985, 4.4949, 4.4958];
    var z2 = [156, 156, 66, 66]

    var x3 = [4.2497, 4.2504, 4.2522, 4.2524];
    var y3 = [4.4949, 4.4958, 4.4933, 4.4935];
    var z3 = [66, 66, 6, 6]

    var data = [createMesh(x, y, z), createMesh(x2, y2, z2), createMesh(x3, y3, z3)]

    var layout = {title: '', scene1:{ aspectratio: {
      x: 10,
      y: 10,
      z:1
    }}}

    Plotly.newPlot('myDiv', data, layout)   
  }

  const approachTypes = [
    {label: 'V', plotGroup: '1'},
    {label: 'NP', plotGroup: '1'},
    {label: 'Cat I', plotGroup: 'all'},
    {label: 'Cat II', plotGroup: 'all'},
    {label: 'Cat III', plotGroup: 'all'},
  ]

  $(function () {
    // App initialization
    app = new Vue({
      el: '#app',
      data: {
        approach: approachTypes[0],
        approachTypes: approachTypes,
        plots: [
          {label: 'Conical', group: '1'},
          {label: 'Inner Horizontal', group: '1'},
          {label: 'Approach', group: '1'},
          {label: 'Transitional', group: '1'},
          {label: 'Inner Approach', group: '2'},
          {label: 'Zalked Landing', group: '2'},
          {label: 'Inner Transitional', group: '2'},
          {label: 'Take-off Climb', group: '2'},
        ]
      },
      methods: {
        showPlot: function(plot) {
          return this.approach.plotGroup === 'all' || this.approach.plotGroup === plot.group;
        }
      }
    });

    // View initialization
    $('.modal').modal();
    $('.stepper').activateStepper();
    $('select').material_select();

  });

})(jQuery, app); 
