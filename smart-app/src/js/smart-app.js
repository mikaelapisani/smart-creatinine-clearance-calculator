(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        var pt = patient.read();
         console.log('Patient:'); 
         console.log(pt);
         var obv = smart.patient.api.fetchAll({
           type: 'Observation',
           query: {
             code: {
               $or: ['http://loinc.org|8302-2', #height
                     'http://loinc.org|29463-7', #weight
                     'http://loinc.org|39802-4'] #Creatinine
             }
           }
         });

        console.log('patient:');
        console.log(patient)

        $.when(pt, obv).fail(onError);

        $.when(pt, obv).done(function(patient, obv) {
          var byCodes = smart.byCodes(obv, 'code');
        
          var fname = '';
          var lname = '';

          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family;
          }

          // Observations
          var height = byCodes('8302-2');
          var weight = byCodes('29463-7');
          var creatinine = byCodes('39802-4');
    
          var p = defaultPatient();
          p.birthdate = patient.birthDate;
          p.age = patient.age;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.height = getQuantityValueAndUnit(height[0]);
          p.weight = getQuantityValueAndUnit(weight[0]);
          p.creatinine = getQuantityValueAndUnit(creatinine[0]);
          p.creatinine_clearance = calculate_creatinine_clearance(p)
          console.log('p:');
          console.log(p);
          ret.resolve(p);
        });
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      height: {value: ''},
      weight:  {value: ''},
      creatinine:  {value: ''},
      creatinine_clearance: {value: ''},
    };
  };

  function calculate_creatinine_clearance(p){
    isfemale = 0
    if (p.gender=='female'){
      isfemale = 1
    }
    var creatinine_clearance = (140 – p.age) × (p.weight) × (0.85 x isfemale) / (72 × p.creatinine)
    return creatinine_clearance
  };



  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#height').html(p.height);
    $('#weight').html(p.weight);
    $('#creatinine').html(p.creatinine);
    $('#creatinine_clearance').html(p.creatinine_clearance);
  };

})(window);