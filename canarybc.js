var canary = !canary ? {} : canary;

var lastStr = "";
var lastSearchedStr = "";
var domc = null;

var searchIndex = 0;

canary.markMap = [];

function getElementIndex(cursor, tinymceTextElements) {
    var total = 0;

    __J(tinymceTextElements).each(function (i) {
        current = __J(this).text().length();
        total += current;
        if (cursor < total) {
            return i;
        }
    });
}

function run(str, tinymceTextElements) {
    clearTimeout(domc);

    console.log("Running scan...");

    if (__J("#plagcheck").length === 0) {
        __J("body").append("<div id=\"plagcheck\"></div>");
    }

    //str = str.replace(/[, ]+/g, " ").trim();

    var parts = str.split(" "),
        values = [],
        i = 0,
        tmpVar = "",
        cursor = 0;

    console.log("PARTS: " + parts);

    if (str.length > 55) {

        __J(parts).each(function () {
            if (tmpVar.length < 55) {
                tmpVar += " " + this;
            } else {
                // var elementIndex = getElementIndex(cursor, tinymceTextElements);
                values[i] = tmpVar.replace(/\s+/g, " ");
                i++;
                tmpVar = this;
            }

            //cursor++;
        });

        if (values.length < 1 && parts.length > 0) values[0] = {
            index: 0,
            value: tmpVar
        };

    }

    search(values, tinymceTextElements);

    domc = setTimeout("checkDOMChanged(true)", 1000);
}

__J(".textboxtable").bind("mouseover", "body#tinymce", function () {
    if (domc === null) {
        domc = setTimeout("checkDOMChanged(false)", 1000);
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
    str = removeQuotedText(str);
    canary.rawContent = __J(canary.tmceContent).text();

    var tinymceTextElements = __J(canary.ifr).find("#tinymce").find("*");

    if (reset === true) {
        lastStr = str;
        console.log("Resetting check...");
    }

    if (lastStr != str) {
        console.log("unwrapping");
         __J(canary.tmceContent).find(".canned").contents().unwrap();

        run(str, tinymceTextElements);
        lastStr = str;
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

   // var tdiv = __J(tinymceTextElements).clone().wrap("<div/>").parent();
    //var items = __J(tdiv).contents();

    var sq = q;//decodeURIComponent(q);

    var o = typeof results === "string" ? JSON.parse(results) : results;
    var color = "";
    var res = results[0];
    canary.prevLink = res.link;

    if (typeof res === 'undefined') {
        console.log("No results");
        return;
    }
    //__J(results).each(function() {
    console.log(res);
    if (parseFloat(res.perc) > 20) {
        color = "#FFCBA4";
    }

    if (parseFloat(res.perc) > 50) {
        color = "orange";
    }

    if (parseFloat(res.perc) > 80) {
        color = "red";
    }

    var dupes = [];
    var prevPerc = 0;
    if (color != "") {
        __J(tinymceTextElements).each(function (i, v) {
            dupes.push(v);

            if (dupes.indexOf(__J(this).parent()) == -1) {

                var nodeStr = __J(v).text(); //.toString();

                if (nodeStr.length > 0) {

                    var tnodestr = nodeStr.replace(/\s+/g, '');
                    var tphrase = res.phrase.replace(/\s+/g, '');
                    var ind = tnodestr.indexOf(tphrase);
                    var nphrase = "",
                    orig_nphrase = "";

                    //console.log("ind: " + ind + " " + tphrase + "\n\n<<< FOR >>>\n" + tnodestr);
                    if (ind != -1) {
                        var id = "_can" + i;

                        if(__J(v).find("a#_cananch"+id).length == 0) {
                        var anchor = __J("<a/>");
                                __J(anchor).attr("href","#").attr("id","_cananch"+id).addClass('canned').css("color", color);

                        __J(v).attr("id", id).contents().wrap(anchor);
                        }

                        //__J(v).css("color", color);

                        var title = ! __J(v).attr("title") ? "" : __J(v).attr("title");

                        if(title.indexOf(res.displayLink) == -1) {
                            title += Math.floor(res.perc) + "% match with " + res.displayLink+"\n";
                        }

                        __J(v).attr("title", title);
                    }
                }
            }
        });

    }
}


function search(values, tinymceTextElements) {

    var pdl = typeof canary.prevLink !== 'undefined' &&
        canary.prevLink.length > 0 ?
        "&pdl=" + encodeURIComponent(canary.prevLink) : "";

    __J.ajax({
        url: base + "p_search.php?q=" + encodeURIComponent(values[searchIndex]) + pdl,
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
                    search(values, tinymceTextElements);
                } else {
                    searchIndex = 0;
                    // exit;
                }
            }
        },
        error: function (json) {
            alert("Error");
        }

    });
}
