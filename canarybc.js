/*
This script is loaded via JSONP into the users page when the click on the "Create Blog Entry link
in a Blackboard Learn blog.

Tested version:

Blackboard Learn ™
Course Delivery (9.1.201404.160205)
Community Engagement (9.1.201404.160205)
*/

var canary = !canary ? {} : canary;

var launching = true;
var lastStr = "";
var domc = null;
var sensitivity = 75;
var chunkLength = 1000;
var searchIndex = 0;

canary.markMap = [];
canary.total = 0;
canary.count = 0;
canary.mean = 0;
canary.ids = [];
canary.anchors = [];

canary.bigStr = [];
/*
    This function from:

    http://stackoverflow.com/questions/3787924/select-deepest-child-in-jquery/21884036#21884036

    By:
      http://stackoverflow.com/users/692646/russellfeeed
*/
(function ($) {

    $.fn.deepestChild = function () {
        if ($(this).children().length == 0)
            return $(this);

        var $target = $(this).children(),
            $next = $target;

        while ($next.length) {
            $target = $next;
            $next = $next.children();
        }

        return $target;
    };

}(jQuery));


__J(".taskbuttondiv_wrapper").on("click", "input.submit", function (e, options) {
    options = options || {};
    if (!options.pc) {
        e.preventDefault();

        var s = "&s=1";
        var u = "&u=" + canary.user.course_id + canary.user.blog_id + canary.user.blog_course_user_id;
        var csrf = "&name=" + csrfname + "&token=" + csrftoken;
        var sid = SID.length > 0 ? SID : "";

        // tell server to store this as a new entry to include in later searches.
        __J.ajax({
            url: base + "p_search.php?" + sid + u + csrf + s,
            type: "GET",
            async: false,
            dataType: "jsonp",
            jsonpCallback: "response",
            success: function (json) {
                console.log(json);
                if (json.msg.length > 0) {
                    alert(json.msg);
                    __J(e.currentTarget).trigger("click", {
                        'pc': true
                    });
                }
            },
            error: function (json) {
                alert("Error");
            }

        });
    }
});

function run(mutation, item, callback) {
    callback = typeof callback !== 'function' ? function () {} : callback;

    console.log("Running scan...");

    __J(".taskbuttondiv_wrapper input.submit, .taskbuttondiv_wrapper input[name*='Save Entry as Draft']").prop("disabled", true).css("opacity", "0.5");

    var innerText = "";
   if(mutation.type === "characterData") {
       innerText = mutation.target.data;
   } else if(mutation.type === "childList") {
       innerText = item.innerText;
   }

    console.log("INNERTEXT: "+innerText);
    var parts = innerText.split(" "),
        values = [],
        i = 0,
        tmpVar = "",
        cursor = 0;

    __J(parts).each(function () {
        if (tmpVar.length < 70) {
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

    search(values, mutation, callback);
}

canary.domChanged = false;

function segmentCheck(str, ostr, lastStr, tinymceTextElements) {
    if (lastStr.length != ostr.length || lastStr !== ostr) {
        console.log("\n\n **** searching *** \n\n");

        __J(canary.tmceContent).find(".canned").contents().unwrap();

        canary.total = 0;
        canary.count = 0;
        canary.mean = 0;

        run(str, tinymceTextElements);

        canary.domChanged = true;
        return ostr;
    }

    return lastStr;
}

function checkDOMChanged(mutation, reset) {

    if (typeof reset == 'undefined') {
        reset = false;
    }

    canary.ifr = __J("#blogEntry_desc_text_ifr").contents();
    canary.tmceContent = __J(canary.ifr).find("#tinymce").contents();

    var str = __J(canary.tmceContent).text();

    var _el = __J(canary.ifr).find("#tinymce").get(0);
    var ostr = !_el ? "" : _el.outerHTML;

    if (str.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~() ]/g, '').length == 0) {
        console.log("reset tmce body");
        __J(canary.tmceContent).html("");
    }

    str = removeQuotedText(str);

    canary.rawContent = __J(canary.tmceContent).text();

    var tinymceTextElements = __J(canary.ifr).find("#tinymce").find("*");

    if (reset === true) {
        lastStr = ostr;
        canary.domChanged = false;
        console.log("Resetting check...");
        enableButtons();
    }

    if(mutation.addedNodes.length > 0) {
        // segment large strings
        for (var i = 0; i < mutation.addedNodes.length; ++i) {
            var item = mutation.addedNodes[i];
            if(typeof item.outerText !== 'undefined' && item.outerText.length > 0) {
                    run(mutation, item);
            }
        }
    }

    if(mutation.type === "characterData") {
        run(mutation);
    }

}



function removeQuotedText(str) {
    var stra;
    if (str.indexOf('\"') !== -1) {
        stra = str.split('\"');
    } else if (str.indexOf('“') !== -1 && str.indexOf('”') !== -1) {
        stra = str.split("[“”]");
    } else {
        return str;
    }

    for (var i = 1; i < stra.length; i = i + 2) {
        delete stra[i];
    }

    str = stra.join("");

    return str;
}

function parseResult(q, results, mutation) {
    if (typeof results === 'undefined') {
        return;
    }

    canary.observer.disconnect();

    var sq = q;

    var o = typeof results === "string" ? JSON.parse(results) : results;
    var color = "";
    var res = results[0];


    if (typeof res === 'undefined') {
        console.log("No results");
        return;
    }

    canary.prevLink = typeof res.link === 'undefined' ? "" : res.link;
    canary.total += parseFloat(res.perc);
    canary.count = canary.count + 1;
    canary.mean = Math.floor(canary.total / canary.count);

    var tier1 = Math.floor(sensitivity - (sensitivity * 0.6666));
    var tier2 = Math.floor(sensitivity - (sensitivity * 0.3333));

    console.log("Tier1: "+tier1+" Tier2: "+tier2+" Sensitivity: "+sensitivity);

    if (res.perc > tier1) {
        color = "#FFCBA4";
    }

    if (res.perc > tier2) {
        color = "orange";
    }

    if (res.perc > sensitivity) {
        color = "red";
    }

    var dupes = [];
    //var ids = [];
    var prevPerc = 0;

    var list = [];
    if(mutation.type === "childList") {
        list = mutation.addedNodes;
    }
    if(mutation.type === "characterData") {
        list[0] = mutation.target.parentElement;
    }
    console.log(mutation.type);
    console.log(list);
    console.log(list.length);
    console.log(canary.mean);
    //sensitivity = 20;
    if (canary.mean > sensitivity) {
        for(var _i = 0; _i < list.length; _i++) {
            var v = list[_i];

            if (__J(v).text().length > 0 && v.tagName != "BR") {
                console.log("checking tag: " + v.tagName);
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

                    var al = __J(v).find("a._cananch" + id);
                    var elm;

                    if (__J(v).hasClass("canary")) {
                        elm = __J(v);
                    } else {
                        elm = __J(v).closest(".canary");
                    }

                    if (elm.length == 0) {
                        __J(v).addClass("canary");
                        __J(v).addClass(id);
                        elm = __J(v);
                    }

                    if (__J( canary.ifr).contents().find("body _cananch"+id).length == 0) {
                        var anchor;

                        if (v.tagName == "A") {
                            anchor = __J(v);
                            anchor.data("prevContent", anchor.html());
                        } else {
                            anchor = __J("<a/>");
                        }

                        var q = encodeURIComponent(__J(v).contents().text());
                        __J(anchor).attr("href", clientUrl + "index.html?text=" + q).addClass("_cananch" + id).addClass('canned').css("color", color);

                        __J(v).contents().wrap(anchor);

                        var acontext = __J(v).find("._cananch" + id).get(0);

                        if(! canary.anchors.contains(acontext))
                            canary.anchors.push(acontext);
                    }

                    var title = typeof __J(elm).attr("title") === 'undefined' || elm.attr("title").length == 0 ? "Matched:     \nParts of this section have a: \n" : __J(elm).attr("title");

                    var oldTitle = "";
                    if (title.indexOf("Matched: ") == -1) {
                        oldTitle = title;
                        title = "Matched:     \nParts of this section have a: \n";
                    }

                    var ti = title.indexOf("Matched: ") + 9;

                    if (title.indexOf(res.displayLink) == -1) {
                        title += Math.floor(res.perc) + "% match with " + res.displayLink + "\n";
                    }

                    // insert average percentage
                    var tp1 = title.substr(0, ti);
                    var tp2 = title.substr(ti + 3, title.length);

                    title = tp1 + canary.mean + "%" + tp2;

                    if (oldTitle.length > 0) {
                        title += "\n---------\n Original text: " + oldTitle;
                    }

                    __J(elm).attr("title", title);
                }


            }
         }
    }

   /* console.log("ANCHORS");
    console.log(canary.anchors);
    console.log(__J( canary.ifr).contents().find(".canned").length);

    console.log("mean = " + canary.mean);*/

    canary.ids = [];
    canary.mean = 0;
    canary.total = 0;

    /*
        User has tried to remove anchors manually, let us fuck with them.
        We don't really care about efficiency here because its not going to be called
        very often.
    */
    if(canary.anchors.length !== __J( canary.ifr).contents().find(".canned").length) {
        canary.anchors.forEach(function(ma) {
            var tstr = __J( canary.ifr).contents().find("body").html();
            if(tstr.indexOf(ma.innerText) !== -1) {
                var res = tstr.replace(ma.innerText, ma.outerHTML);
                __J( canary.ifr).contents().find("body").html(res);
            }
        });
    }

    canary.observer.observe(canary.iframeDocument.body, canary.observeConfig);

    enableButtons();
}

function enableButtons() {
    if (canary.mean <= sensitivity) {
        __J(".taskbuttondiv_wrapper input.submit").prop("disabled", false).css("opacity", "");
    }

    __J(".taskbuttondiv_wrapper input[name*='Save Entry as Draft']").prop("disabled", false).css("opacity", "");
}

function search(values, mutation, callback, firstIteration) {

    if(typeof values[searchIndex] !== "string") {
        console.log("VALUE WASN'T A STRING, it was: "+typeof values[searchIndex]);
       return false;
    }

    if (typeof firstIteration === 'undefined') {
        firstIteration = true;
    }

    var pdl = typeof canary.prevLink !== 'undefined' &&
        canary.prevLink.length > 0 ?
        "&pdl=" + encodeURIComponent(canary.prevLink) : "";

    var u = "&u=" + canary.user.course_id + canary.user.blog_id + canary.user.blog_course_user_id;
    var csrf = "&name=" + csrfname + "&token=" + csrftoken;
    var sid = SID.length > 0 ? SID : "";
    var f = firstIteration === true ? "&f=1" : "";

    __J.ajax({
        url: base + "p_search.php?" + sid + "q=" + encodeURIComponent(values[searchIndex]) + pdl + u + csrf + f,
        type: "GET",
        async: false,
        dataType: "jsonp",
        jsonpCallback: "check",
        success: function (json) {
            console.log(json);
            if (typeof json.results !== 'undefined') {
                parseResult(values[searchIndex], json.results, mutation);

                searchIndex++;

                if (searchIndex < values.length) {
                    search(values, mutation, callback, false);
                } else {
                    searchIndex = 0;
                    callback();
                }
            }
        },
        error: function (json) {
            if (typeof check !== 'function') {
                console.log("ERROR - trying again...");
                console.log(json);
                search(values, mutation, callback, false);
            }
        }

    });
}

var fr;
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

function iframeReady() {
    canary.ifr = document.getElementById("blogEntry_desc_text_ifr");
    console.log('>>> canary.ifr.length');
   // console.log(canary.ifr.length);
    if (canary.ifr === null) {
        setTimeout("iframeReady()", 100);
    } else {
            console.log("loaded");

            canary.observer = new MutationObserver(function(mutations) {
                console.info(mutations);

                mutations.forEach(function(mutation) {
                      if(mutation.addedNodes.length > 0) {
                          switch(mutation.type) {
                              case "attributes":
                              case "childList":
                              case "characterData":
                                    checkDOMChanged(mutation);
                              default:
                          }
                      }
                     else
                        if(mutation.type === "characterData") {
                                    checkDOMChanged(mutation);
                        }
                });

            });

       canary.observeConfig = { attributes: true, childList: true, characterData: true, subtree: true };
        canary.iframeDocument = canary.ifr.contentDocument || canary.ifr.contentWindow.document;

        canary.observer.observe(canary.iframeDocument.body, canary.observeConfig);
        //observer.disconnect();

        console.log("dom observer attached");

        clearTimeout(fr);
    }
}


fr = setTimeout("iframeReady()", 100);
// parse out blog user details from here to pass to server...

var userStr = __J("#breadcrumbs").contents().find("a[href*='viewBlog']").attr("href");
console.log(userStr);

var urlParts = userStr.split("?");

var segments = urlParts[1];
var params = segments.split("&");

var user = {};
for (var i = 0; i < params.length; i++) {
    var bits = params[i].split("=");
    user[bits[0]] = bits[1];
}

console.log(user);

canary.user = user;
//});
