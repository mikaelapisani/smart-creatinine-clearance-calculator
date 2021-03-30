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
               $or: ['http://loinc.org|8302-2', 
                     'http://loinc.org|29463-7', 
                     'http://loinc.org|39802-4'] 
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
          var dob = new Date(patient.birthDate);
          p.age = parseInt(calculateAge(dob));
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.height = getQuantityValueAndUnit(height);
          p.weight = getQuantityValueAndUnit(weight);
          p.creatinine = getQuantityValueAndUnit(creatinine);
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
      age: {value: ''},
      height: {value: ''},
      weight:  {value: ''},
      creatinine:  {value: ''},
      creatinine_clearance: {value: ''},
    };
  };

  function getQuantityValueAndUnit(x){
    if(typeof x[0] != 'undefined' && typeof x[0].valueQuantity.value != 'undefined' && typeof x[0].valueQuantity.unit != 'undefined') {
            p.height = x[0].valueQuantity.value + ' ' + x[0].valueQuantity.unit;
          }
  }

  function calculateAge(date) {
    if (Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime())) {
      var d = new Date(date), now = new Date();
      var years = now.getFullYear() - d.getFullYear();
      d.setFullYear(d.getFullYear() + years);
      if (d > now) {
        years--;
        d.setFullYear(d.getFullYear() - 1);
      }
      var days = (now.getTime() - d.getTime()) / (3600 * 24 * 1000);
      return years + days / (isLeapYear(now.getFullYear()) ? 366 : 365);
    }
    else {
      return undefined;
    }
  };


  function calculate_creatinine_clearance(p){
    var isfemale = 0.85
    if (p.gender=='female'){
      isfemale = 1
    }
    var creatinine_clearance = isfemale
    return creatinine_clearance
  };



  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#age').html(p.creatinine);
    $('#height').html(p.height);
    $('#weight').html(p.weight);
    $('#creatinine').html(p.creatinine);
    $('#creatinine_clearance').html(p.creatinine_clearance);
  };

})(window);