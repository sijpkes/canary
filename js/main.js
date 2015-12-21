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

var clientUrl = "https://nandi.16mb.com/canary/js/";
var base = "https://bold.newcastle.edu.au/libs/plag-check/";

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

function run(str, tinymceTextElements, callback) {
    clearTimeout(domc);
    console.log("Running scan...");

    if ($("#plagcheck").length === 0) {
        $("body").append("<div id=\"plagcheck\"></div>");
    }

    var parts = str.split(" "),
        values = [],
        i = 0,
        tmpVar = "",
        cursor = 0;
    console.log("Parts:");
       console.info(parts);
    $(parts).each(function () {
        //console.info(this);
        if (tmpVar.length < 70) {
            tmpVar += " " + this;
        } else {
            values[i] = tmpVar.replace(/\s+/g, " ");
            i++;
            tmpVar = this;
        }
    });
    console.info(tmpVar);
        console.info(values);

    if (values.length < 1 && parts.length > 0) {
        values[0] = tmpVar;
    }

    search(values, tinymceTextElements, callback);

    domc = setTimeout("checkDOMChanged(true)", 1000);
}

function checkDOMChanged(reset) {
    if (typeof reset == 'undefined') {
        reset = false;
    }

    canary.ifr = $("#tinyTextarea_ifr").contents();
    canary.tmceContent = $(canary.ifr).find("#tinymce").contents();

    var str = $(canary.tmceContent).text();

    var _el = $(canary.ifr).find("#tinymce").get(0);
    var ostr = !_el ? "" : _el.outerHTML;

    if (str.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~() ]/g, '').length == 0) {
        $(canary.tmceContent).html("");
    }
    str = removeQuotedText(str);

    if(str.length == 0) {
        $("#results").html("");
    }

    canary.rawContent = $(canary.tmceContent).text();

    var tinymceTextElements = $(canary.ifr).find("#tinymce").find("*");

    if (reset === true) {
        lastStr = ostr;
        console.log("Resetting check...");
        //  enableButtons();
    }

    if (lastStr.length != ostr.length || lastStr !== ostr) {
        console.log("\n\n **** searching *** \n\n");

        $(canary.tmceContent).find(".canned").contents().unwrap();

        canary.total = 0;
        canary.count = 0;
        canary.mean = 0;

        run(str, tinymceTextElements, function () {});
        lastStr = ostr;
    }

    domc = setTimeout("checkDOMChanged(false)", 1000);

}

function search(values, tinymceTextElements, callback, firstIteration) {

    if (typeof firstIteration === 'undefined') {
        firstIteration = true;
    }

    var pdl = typeof canary.prevLink !== 'undefined' &&
        canary.prevLink.length > 0 ?
        "&pdl=" + encodeURIComponent(canary.prevLink) : "";

    $.ajax({
        url: base + "p_search.php?limit=5&q=" + encodeURIComponent(values[searchIndex]) + pdl,
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

function parseResult(q, results, tinymceTextElements) {
    if (typeof results === 'undefined') {
        return;
    }

    var sq = q; //decodeURIComponent(q);

    var o = typeof results === "string" ? JSON.parse(results) : results;
    var color = "";

    //results.forEach(function(res) {
    res = results[0];

    if (typeof res === 'undefined') {
        console.log("No results");
        return;
    }

    console.log(results);
    canary.prevLink = typeof res.link === 'undefined' ? "" : res.link;
    canary.total += parseFloat(res.perc);
    canary.count = canary.count + 1;
    canary.mean = Math.floor(canary.total / canary.count);

    if (res.perc > 30) {
        color = "#FFCBA4";
    }

    if (res.perc > 65) {
        color = "orange";
    }

    if (res.perc > 85) {
        color = "red";
    }

    var prevPerc = 0;

        $(tinymceTextElements).each(function (i, v) {
            if ($(v).text().length > 0 && v.tagName != "BR") {
                var id;

                var nodeStr = $(v).text(); //.toString();

                var tnodestr = nodeStr.replace(/\s+/g, '');
                var tphrase = res.phrase.replace(/\s+/g, '');
                var ind = tnodestr.indexOf(tphrase);
                var nphrase = "",
                orig_nphrase = "";

                if($("#results article > p:contains('"+res.phrase+"')").length === 0) {
                    // output to div
                    var article = $("<article style='border: thick solid "+color+"; color: "+color+"; padding: 1em; margin: 0.5em; cursor: pointer'></article>");
                   // article = article.find("article");
                    article.append("<h3>"+Math.floor(res.perc)+"% Match</h3>");
                    article.append("<p><a href='"+res.link+"'>"+res.displayLink+"</a></p>");
                    article.append("<p><em>"+res.phrase+"</em></p>");

                $("#results").append(article);
                }

                // window highlight
                if (ind != -1 && res.perc > sensitivity) {
                    console.log(res.perc);
                    id = "_can" + i;
                    canary.ids[id] = res.perc;

                    var al = $(v).find("a._cananch" + id);
                    var elm;

                    if ($(v).hasClass("canary")) {
                        elm = $(v);
                    } else {
                        elm = $(v).closest(".canary");
                    }

                    if ($(elm).length == 0) {
                        $(v).addClass("canary");
                        $(v).addClass(id);
                        elm = $(v);
                    }

                    if (al.length == 0) {
                        var anchor;

                        if (v.tagName == "A") {
                            anchor = $(v);
                            anchor.data("prevContent", anchor.html());
                        } else {
                            anchor = $("<a/>");
                        }
                        $(anchor).attr("href", "#").addClass("_cananch" + id).addClass('canned').css("color", color);


                        $(v).contents().wrap(anchor);
                    }

                    var title = typeof $(elm).attr("title") === 'undefined' || elm.attr("title").length == 0 ? "Matched:     \nParts of this section have a: \n" : $(elm).attr("title");

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

                    $(elm).attr("title", title);
                }
            }
        });
        console.log("count: " + canary.count + " total: " + canary.total + " canary mean: " + canary.mean + " IDS");
    //}); //end forEach
   // }

    console.log("mean = " + canary.mean);

    canary.ids = [];
}



//$(document).ready(function() {
var text = window.location.search.replace("?", "").split("&")[0];

var new_text = decodeURIComponent(text.split("=")[1]);

console.log("got text "+new_text);
    if(typeof text !== 'undefined' && text.length > 0) {
        console.log("pasting... "+new_text);

        $(".container textarea").val("<p>"+new_text+"</p>");

       // tinymce.init({ selector:'#tinyTextarea' });

        $(".container").trigger("mouseover");
    }

    $(".container").on("mouseover", function () {
    if (domc === null) {
        domc = setTimeout("checkDOMChanged()", 1000);
        console.log("dom checker attached");
    } else {
        $(".container").unbind("change");
    }
});
//});
