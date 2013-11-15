define(['moment'], function(moment){
    
   var format = "hh:mm:ss";
    
   return {
       
       encode : function(modelValue){
           
           //seconds to hh:mm:ss
           var seconds = parseInt(modelValue, 10);
           if(isNaN(seconds)){
               seconds = 0;
           }
           return moment().seconds(seconds).format(format);
       },
       
       decode : function(nodeValue){
           //hh:mm:ss to seconds
           var time  =  moment(nodeValue, format);
           return time.seconds() + (time.minutes() * 60) + (time.hours() * 3600);
       }
   };
});


