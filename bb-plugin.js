var __J = jQuery.noConflict();

var clientUrl =  "https://nandi.16mb.com/canary/";
var base = "https://bold.newcastle.edu.au/libs/plag-check/";

canary.loadErrorCount = 0;
var canaryBlogCheck = function(href, script, base, SID, name, token) {

    var x = function(data) {
        canary.loadErrorCount = 0;
         window.document.open();
            var js = "<script>var base='"+base+"';\n\
                                var clientUrl='"+clientUrl+"';\n\
                               var SID = '"+SID+"';\n\
                               var csrfname='"+name+"';\n\
                               var csrftoken='"+token+"';\n"
                                +script+"</script>";

           window.document.write(data);
           window.document.write(js);
           window.document.close();
    };

    // get the clicked button href and forward to that page with a script attached.
    __J.ajax(
        { url: href,
          type: "get",
          success: x,
          error: function(error) {
              if(canary.loadErrorCount > 2) {
                  alert("Gave up trying to reach "+href+"after "+canary.loadErrorCount+
" attempts\n\nERROR is: \n-----\n"+error);
                  return false;
              }
              console.error("ERROR loading page... retrying");
              canaryBlogCheck(href, script, base, SID, name, token);
              canary.loadErrorCount = canary.loadErrorCount + 1;
          }
    });
};

__J(document).ready(function() {
    __J("#addBlogLink").css({"color":"red", "border" : "thick solid green"});

    __J("li.mainButton a, div.cmdiv a[title='Edit']").bind("click", function(e) {

    e.preventDefault();

    console.log("Canary is active... loading... "+e.target.href);

    // fixed for jsonp XD
    __J.ajax({
        url : base+"canaryBlogCheck.php?base="+encodeURIComponent(base)+"&clientUrl="+encodeURIComponent(clientUrl),
        type: "GET",
        async: false,
        dataType: "jsonp",
        jsonpCallback  : "canaryBlogCheck",
        success: function(canarybc) {
            canaryBlogCheck(e.target.href, canarybc.script, base, canarybc.SID, canarybc.name, canarybc.token);
        ;},
        error: function(json) { alert("Error"); }

        });
    });

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

    });
});
