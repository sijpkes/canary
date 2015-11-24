/*
<script type="text/javascript" src="https://bold.newcastle.edu.au/libs/plag-check/bb-plugin.js">
*/

var __J = jQuery.noConflict(); 

__J(document).ready(function() {
    __J("#addBlogLink").css({"color":"red", "border" : "thick solid green"});


    __J("input[onclick*='saveComment']").css({"color":"purple", "border":"thick dotted purple"}).bind("click", function(e) {
        e.preventDefault();
        
       var onclick = __J(e.target).attr("onclick"); 
        __J(e.target).removeAttr("onclick");
        alert(onclick);
    __J("body").append("<div id=\"plagcheck\"></div>");
    var innerText =  __J("textarea[name='commentField']").val();

    var parts = innerText.split(" ");
    var values = [];
    var i = 0;
    var tmpVar = "";

    __J.each(parts, function(index, value) {

        if(tmpVar.length < 55)
        {
            tmpVar += " " + value;
        }else{
            values[i] = tmpVar.replace(/\s+/g, " ");
            i++;
            tmpVar = value;
        }
    });

    if(values.length < 1 &&  parts.length > 0) values[0] = tmpVar;

    console.log(values);
    
        
    /*
        change this to a store function that is then loaded at blog load and highlights problems in
        the current page...
    */
    __J.each(values, function(i,v) {
        
            search(encodeURIComponent(v));
    });    
    
        
    // move this to a PHP function...
    function search(q) {    
        __J.get("https://bold.newcastle.edu.au/libs/plag-check/p_search.php?q="+q, 
                          function(data) {     
                
            var sq = decodeURIComponent(q);
            var i = innerText.indexOf();
            var o = JSON.parse(data);
            var color = "";
                
                if(parseFloat(o[0].perc) > 20) {
                    color = "#FFCBA4";
                }
                
                if(parseFloat(o[0].perc) > 50) {
                    color = "orange";
                }
                
                if(parseFloat(o[0].perc) > 80) {
                    color = "red";
                }

                if(color.length > 0) {
                    if( __J("div#probs").length == 0) {
                        __J("body").append("<div id='probs' style='position: absolute; top: 10%; left: 10%; background-color: white; width: 800px; height: 600px; border: thin solid gray;'><b>Problems found with this entry.  Click each entry to see where the source of this text came from.</b></div>");
                    }
                    
                    __J("div#probs").append("<p><b><a style='color: "+color+"' href='"+o[0].link+"'>"+sq+" "+o[0].perc+" % </a></b></p>");
                }
        });
    }
        

 /*var newWin = window.open("http://smallseotools.com/plagiarism-checker/", "_blank");
 var html = __J("textarea[name='commentField']").val();
        
    function checkPlagWin() {
                setTimeout(function() {
                    //var test='ll';
                    var test = __J(newWin.document.body).find("#textBox").val();
                    console.log("pragcheck output: \n\n"+test);
                  
                    checkPlagWin();
                   // alert(1);
                }, 1000);      
        }
    checkPlagWin();*/
    });
});