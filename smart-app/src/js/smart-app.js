(function(window){
  window.extractData = function() {
    console.log('extracting data')
    var ret = $.Deferred();
    var creatinine = window.document.getElementById("creatinine").value

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        var pt = patient.read();
        var obv = smart.patient.api.fetchAll({
           type: 'Observation',
           query: {
             code: {
               $or: ['http://loinc.org|8302-2', 
               'http://loinc.org|3141-9'] 
             }
           }
         });
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
          var weight = byCodes('3141-9');
          
    
          var p = defaultPatient();
          p.birthdate = patient.birthDate;
          var dob = new Date(patient.birthDate);
          p.age = parseFloat(calculateAge(dob));
          p.gender = patient.gender;
          p.fname = fname;
          p.lname = lname;
          var heightValue = getQuantityValue(height);
          p.height = parseFloat(heightValue);
          var weightValue = getQuantityValue(weight);
          p.weight = weightValue;
          p.creatinine = parseFloat(creatinine)
          p.height_unit = getUnit(height)
          p.weight_unit = getUnit(weight)
          p.creatinine_clearance = calculate_creatinine_clearance(p)

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
      height_unit: {value: ''}
      weight:  {value: ''},
      weight_unit: {value: ''}
      creatinine:  {value: ''},
      creatinine_clearance: {value: ''},
    };
  };

  function getQuantityValue(x){
    if(typeof x[0] != 'undefined' && typeof x[0].valueQuantity.value != 'undefined' && typeof x[0].valueQuantity.unit != 'undefined') {
            return x[0].valueQuantity.value;
    }
    return ''
  }
  function getUnit(x){
    if(typeof x[0] != 'undefined' && typeof x[0].valueQuantity.value != 'undefined' && typeof x[0].valueQuantity.unit != 'undefined') {
            return x[0].valueQuantity.unit;
    }
    return ''
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

  function isLeapYear(year) {
    return new Date(year, 1, 29).getMonth() === 1;
  }


  function calculate_creatinine_clearance(p){
    var femaleCte = 1;
    if (p.gender=='female'){
      femaleCte = 0.85;
    }
    console.log(p)
    console.log(p.age)
    console.log(isfemale)
    console.log(p.weight)
    console.log(p.creatinine)
    var creatinine_clearance = ((140 - age) * weight * femaleCte) / (72 * p.creatinine);

    return creatinine_clearance
  };

  window.drawVisualization = function(p) {
    $('#calculator').hide();
    $('#data').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#age').html(p.age);
    $('#height').html(p.height + ' ' + p.height_unit);
    $('#weight').html(p.weight + ' ' + p.weight_unit);
    $('#creatinine').html(p.creatinine);
    $('#creatinine_clearance').html(p.creatinine_clearance);
  };

})(window);