/*
This script is loaded via JSONP into the users page when the click on the "Create Blog Entry link
in a Blackboard Learn blog.

If you don't want to use the canaryBlogCheck.php convenience script then uncomment the lines indicated
*/

/* uncomment next line if not using PHP script
(you must also escape sensitive characters in the script)*/
//canaryBlogCheck( { "script" : "

var canary = !canary ? {} : canary;

var launching = true;
var lastStr = "";
var domc = null;
var sensitivity = 75;

var searchIndex = 0;

canary.markMap = [];
canary.total = 0;
canary.count = 0;
canary.mean = 0;
canary.ids = [];

/*
    This function from:

    http://stackoverflow.com/questions/3787924/select-deepest-child-in-jquery/21884036#21884036

    By:
      http://stackoverflow.com/users/692646/russellfeeed
*/
(function($) {

    $.fn.deepestChild = function() {
        if ($(this).children().length==0)
            return $(this);

        var $target = $(this).children(),
        $next = $target;

        while( $next.length ) {
          $target = $next;
          $next = $next.children();
        }

        return $target;
    };

}(jQuery));


__J(".taskbuttondiv_wrapper").on("click", "input.submit",  function(e, options) {
        options = options || {};
       if(!options.pc) {
        e.preventDefault();

        var s = "&s=1";
        var u = "&u="+canary.user.course_id+canary.user.blog_id+canary.user.blog_course_user_id;
        var csrf = "&name="+csrfname+"&token="+csrftoken;
        var sid = SID.length > 0 ? SID : "";

        // tell server to store this as a new entry to include in later searches.
        __J.ajax({
        url: base + "p_search.php?"+sid+ u + csrf + s,
        type: "GET",
        async: false,
        dataType: "jsonp",
        jsonpCallback: "response",
        success: function (json) {
            console.log(json);
            if(json.msg.length > 0) {
                alert(json.msg);
                __J(e.currentTarget).trigger("click", { 'pc' : true });
            }
        },
        error: function (json) {
            alert("Error");
        }

    });
    }
});

function run(str, tinymceTextElements, callback) {
    clearTimeout(domc);
    console.log("Running scan...");

     __J(".taskbuttondiv_wrapper input.submit, .taskbuttondiv_wrapper input[name*='Save Entry as Draft']").prop("disabled", true).css("opacity", "0.5");

    if (__J("#plagcheck").length === 0) {
        __J("body").append("<div id=\"plagcheck\"></div>");
    }

    var parts = str.split(" "),
        values = [],
        i = 0,
        tmpVar = "",
        cursor = 0;

    //console.log("PARTS: " + parts);
    //console.log("Remainder: "+(str.length % 55));
   // var mod = Math.abs(lastStr.length - str.length);
 //   console.log("Mod: "+mod);
  //  if (mod > 1) {

        __J(parts).each(function () {
            if (tmpVar.length < 55) {
                tmpVar += " " + this;
            } else {
                values[i] = tmpVar.replace(/\s+/g, " ");
                i++;
                tmpVar = this;
            }
        });

        if (values.length < 1 && parts.length > 0) values[0] = {
            index: 0,
            value: tmpVar
        };

    search(values, tinymceTextElements, callback);
  //  }

    domc = setTimeout("checkDOMChanged(true)", 1000);
}

__J(".textboxtable").bind("mouseover", "body#tinymce", function () {
    if (domc === null) {
        domc = setTimeout("checkDOMChanged()", 1000);
        console.log("dom checker attached");
    } else {
        __J(".textboxtable body#tinymce").unbind("mouseover");
    }
});

function checkDOMChanged(reset) {
    if (typeof reset == 'undefined') {
        reset = false;
    }

    canary.ifr = __J("#blogEntry_desc_text_ifr").contents();
    canary.tmceContent = __J(canary.ifr).find("#tinymce").contents();

    var str = __J(canary.tmceContent).text();
    var ostr = str.toString();

   // if(str.length === 0) return;

 //   console.log(str.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~() ]/g, ''));
    if(str.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~() ]/g, '').length == 0) {
        __J(canary.tmceContent).html("");
    }

    str = removeQuotedText(str);
    canary.rawContent = __J(canary.tmceContent).text();


    var tinymceTextElements = __J(canary.ifr).find("#tinymce").find("*");

    if (reset === true) {
        lastStr = ostr;
        console.log("Resetting check...");
        enableButtons();
    }

    if (lastStr.length != ostr.length || lastStr !== ostr) {
        console.log("\n\n **** searching *** \n\n");

        __J(canary.tmceContent).find(".canned").contents().unwrap();

        canary.total = 0;
        canary.count = 0;
        canary.mean = 0;

        run(str, tinymceTextElements, function() { });
        lastStr = ostr;
    }

    domc = setTimeout("checkDOMChanged(false)", 1000);

}



function removeQuotedText(str) {
    var stra;
    if(str.indexOf('\"') !== -1) {
        stra = str.split('\"');
    } else if(str.indexOf('“') !== -1 && str.indexOf('”') !== - 1) {
        stra = str.split("[“”]");
    } else {
        return str;
    }

    for(var i = 1; i < stra.length; i=i+2) {
           delete stra[i];
    }

    str = stra.join("");

    return str;
}

function parseResult(q, results, tinymceTextElements) {
    if (typeof results === 'undefined') {
        return;
    }

    var sq = q;//decodeURIComponent(q);

    var o = typeof results === "string" ? JSON.parse(results) : results;
    var color = "";
    var res = results[0];
    canary.prevLink = ! res.link ? "" : res.link;
    canary.total += parseFloat(res.perc);
    canary.count = canary.count + 1;

    canary.mean = Math.floor(canary.total / canary.count);

    if (typeof res === 'undefined') {
        console.log("No results");
        return;
    }
    console.log(results);

     if (res.perc > 30) {
                      color = "#FFCBA4";
                  }

                if (res.perc > 65) {
                    color = "orange";
                }

                if (res.perc > 85) {
                    color = "red";
                }

    var dupes = [];
    //var ids = [];
    var prevPerc = 0;

    if (canary.mean > 85) {
        __J(tinymceTextElements).each(function (i, v) {
            //console.log("Children: "+__J(v).children().length);
            if(__J(v).text().length > 0 && v.tagName != "BR") {
                console.log("checking tag: "+v.tagName);
            dupes.push(v);
            var id;
           // if (dupes.indexOf(__J(this).parent()) == -1) {

                var nodeStr = __J(v).text(); //.toString();

                    var tnodestr = nodeStr.replace(/\s+/g, '');
                    var tphrase = res.phrase.replace(/\s+/g, '');
                    var ind = tnodestr.indexOf(tphrase);
                    var nphrase = "",
                    orig_nphrase = "";

                    //console.log("ind: " + ind + " " + tphrase + "\n\n<<< FOR >>>\n" + tnodestr);
                    if (ind != -1 && res.perc > sensitivity) {
                        console.log(res.perc);
                        id = "_can" + i;
                        canary.ids[id] = res.perc;

                        var al = __J(v).find("a._cananch"+id);
                        var elm;

                        if(__J(v).hasClass("canary")) {
                               elm = __J(v);
                        } else {
                            elm = __J(v).closest(".canary");
                        }

                        if(elm.length == 0) {
                             __J(v).addClass("canary");
                            __J(v).addClass(id);
                        }

                        //if(__J(v).closest(".canary").length == 0) {


                        if(al.length == 0) {
                            var anchor;

                            if(v.tagName == "A") {
                                anchor = __J(v);
                                anchor.data("prevContent", anchor.html());
                            } else {
                                anchor = __J("<a/>");
                            }
                            __J(anchor).attr("href","#").addClass("_cananch"+id).addClass('canned').css("color", color);


                                __J(v).contents().wrap(anchor);
                        }


                        var title = ! elm.attr("title") ? "Matched:     \nParts of this section have a: \n" : elm.attr("title");

                        var oldTitle = "";
                        if(title.indexOf("Matched: ") == -1) {
                            oldTitle = title;
                            title = "Matched:     \nParts of this section have a: \n";
                        }

                        var ti = title.indexOf("Matched: ") + 9;

                        if(title.indexOf(res.displayLink) == -1) {
                            title += Math.floor(res.perc) + "% match with " + res.displayLink+"\n";
                        }

                        // insert average percentage
                        var tp1 = title.substr(0, ti);
                        var tp2 = title.substr(ti+3, title.length);

                        title = tp1 + canary.mean + "%" + tp2;

                        if(oldTitle.length > 0) {
                            "\n---------\n Original text: "+oldTitle;
                        }

                        elm.attr("title", title);
                }


        //    __J(v).find("a._cananch"+id).css("color", color);
            }
        });
           console.log("count: "+canary.count+" total: "+canary.total+" canary mean: "+canary.mean+" IDS");
       // console.log(canary.ids);
      /*  for(var i in canary.ids) {
            console.log(canary.ids[i] + " < " + sensitivity);

            if(canary.ids[i] < sensitivity) {
                __J("#tinymce").find("#"+i+" a").remove();
            }
        }*/
    }

    console.log("mean = "+canary.mean);

    canary.ids = [];

    enableButtons();
}

function enableButtons() {
     if(canary.mean <= sensitivity) {
        __J(".taskbuttondiv_wrapper input.submit").prop("disabled", false).css("opacity", "");
    }

    __J(".taskbuttondiv_wrapper input[name*='Save Entry as Draft']").prop("disabled", false).css("opacity", "");
}

function search(values, tinymceTextElements, callback, firstIteration) {

    if(typeof firstIteration === 'undefined') {
        firstIteration = true;
    }

    var pdl = typeof canary.prevLink !== 'undefined' &&
        canary.prevLink.length > 0 ?
        "&pdl=" + encodeURIComponent(canary.prevLink) : "";

    var u = "&u="+canary.user.course_id+canary.user.blog_id+canary.user.blog_course_user_id;
    var csrf = "&name="+csrfname+"&token="+csrftoken;
    var sid = SID.length > 0 ? SID : "";
    var f = firstIteration === true ? "&f=1" : "";
    //var firstIteration = true;

    __J.ajax({
        url: base + "p_search.php?"+sid+"q=" + encodeURIComponent(values[searchIndex]) + pdl + u + csrf + f,
        type: "GET",
        async: false,
        dataType: "jsonp",
        jsonpCallback: "check",
        success: function (json) {
            console.log(json);
            if (typeof json.results !== 'undefined') {
                parseResult(values[searchIndex], json.results, tinymceTextElements);

                searchIndex++;

                if (searchIndex < values.length) {
                    search(values, tinymceTextElements, callback, false);
                } else {
                    searchIndex = 0;
                    callback();
                }
            }
        },
        error: function (json) {
            alert("Error");
        }

    });
}

// parse out blog user details from here to pass to server...

var userStr = __J("#breadcrumbs").contents().find("a[href*='viewBlog']").attr("href");
console.log(userStr);

var urlParts = userStr.split("?");

var segments = urlParts[1];
var params = segments.split("&");

var user = {};
for(var i=0; i < params.length; i++) {
     var bits = params[i].split("=");
     user[bits[0]] = bits[1];
}

console.log(user);

canary.user = user;

// /webapps/blackboard/execute/viewBlog?course_id=_1378679_1&blog_id=_56659_1&blog_course_user_id=_16647479_1




/* uncomment next line if not using PHP script*/
// " } );
