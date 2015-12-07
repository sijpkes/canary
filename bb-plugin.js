var __J = jQuery.noConflict();
var base = "https://bold.newcastle.edu.au/libs/plag-check/";

/*var canaryBlogCheck = function(href, script, base) {

    __J.get(href, function(data) {
            window.document.open();
            var js = "<script>var base='"+base+"';\n"+script+"</script>";
           window.document.write(data);
           window.document.write(js);
           window.document.close();
    });
};*/

__J(document).ready(function() {
    __J("#addBlogLink").css({"color":"red", "border" : "thick solid green"});

    __J("li.mainButton a").bind("click", function(e) {

    e.preventDefault();

    console.log("Canary is active... loading... "+e.target.href);

    // fixed for jsonp XD
    __J.ajax({
        url : base+"canaryBlogCheck.php?base="+encodeURIComponent(base),
        type: "GET",
        async: false,
        dataType: "jsonp",
        jsonpCallback  : "canaryBlogCheck",
        success: function(json) {
          //  alert(json.script)
          //  console.log(json.script);

            canaryBlogCheck(e.target.href, json.script, json.base);
        ;},
        error: function(json) { alert("Error"); }

        });
    });


       //__J("#editmodeWrapper").append("<div id=floathis class=contentBox></div>");
 /*   __J.get(base+"canary-injector.min.js"), function(data) {
        __J.get(e.target.href, function(data) {  window.document.open();
                                               var js = "<div id='uhjdhkjfasdh123_nnnzz'>"+data+"<script></script></div>";
                                               window.document.write(data);
                                               window.document.write(js);
                                    window.document.close();
                                              });
        //__J("#uhjdhkjfasdh123_nnnzz").prepend("<p>stop it! </P>").append("<p>puck u miss</p>");});
     //  alert(e.href === "https://uonline.newcastle.edu.au/webapps/blogs-journals/execute/editBlogEntry?course_id=_1378679_1&editBlogEntryAction=createBlogEntry&type=blogs&blog_id=_56669_1&group_id=");

    });*/
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

    //console.log(values);
    
        
    /*
        change this to a store function that is then loaded at blog load and highlights problems in
        the current page...
    */
    __J.each(values, function(i,v) {
        
            search(encodeURIComponent(v));
    });    


        

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
