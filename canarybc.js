var canary = !canary ? {} : canary;

var lastStr = "";
var lastSearchedStr = "";
var domc = null;

var searchIndex = 0;

canary.markMap = [];

function getElementIndex(cursor, tinymceTextElements) {
    var total = 0;

    __J(tinymceTextElements).each(function(i) {
        current = __J(this).text().length();
        total += current;
        if(cursor < total) {
            return i;
        }
    });
}

function run(str, tinymceTextElements) {
    clearTimeout(domc);

    console.log("Running scan...");

    if(__J("#plagcheck").length === 0) {
        __J("body").append("<div id=\"plagcheck\"></div>");
    }

    //str = str.replace(/[, ]+/g, " ").trim();

    var parts = str.split(" "), values = [], i = 0, tmpVar = "", cursor = 0;

    console.log("PARTS: "+parts);

    if(str.length > 55) {

    __J(parts).each(function() {
        if(tmpVar.length < 55)
        {
            tmpVar += " " + this;
        }else{
           // var elementIndex = getElementIndex(cursor, tinymceTextElements);
            values[i] = tmpVar.replace(/\s+/g, " ");
            i++;
            tmpVar = this;
        }

        //cursor++;
    });

    if(values.length < 1 &&  parts.length > 0) values[0] = { index: 0, value: tmpVar };

    }

    search(values, tinymceTextElements);

    domc = setTimeout(checkDOMChanged(true), 1000);
}

__J(".textboxtable").bind("mouseover", "body#tinymce", function() {
    if(domc === null) {
        domc = setTimeout(checkDOMChanged, 1000);
        console.log("dom checker attached");
    } else {
         __J(".textboxtable body#tinymce").unbind("mouseover");
    }
});

function checkDOMChanged(reset) {
   if(typeof reset == 'undefined') {
        reset = false;
   }

    canary.ifr = __J("#blogEntry_desc_text_ifr").contents();
    canary.tmceContent = __J(canary.ifr).find("#tinymce").contents();
    var str = __J(canary.tmceContent).text();

    var tinymceTextElements = __J(canary.ifr).find("#tinymce").find("*");

    if(reset === true) {
        lastStr = str;
        console.log("Resetting check...");
    }

     if(str.length - lastSearchedStr.length > 55) {
        if(lastStr !== str) {
        console.log("Changed: "+str);
        console.log("Last search str: "+lastSearchedStr+" DIFF: "+(str.length - lastSearchedStr.length));

            run(str, tinymceTextElements);
            lastSearchedStr = str;
        }

        lastStr = str;
    }

    domc = setTimeout(checkDOMChanged, 1000);
}

function parseResult(q, results, tinymceTextElements) {
            if(typeof results === 'undefined') {
                return;
            }

            var tdiv = __J(tinymceTextElements).clone().wrap("<div/>").parent();
            var items = __J(tdiv).contents();

            var sq = decodeURIComponent(q);

            var o = typeof results === "string" ? JSON.parse(results) : results;
            var color = "";
            var res = results[0];
            canary.prevLink = res.link;

                if(typeof res === 'undefined') {
                    console.log("No results");
                    return;
                }
            //__J(results).each(function() {
                console.log(res);
                if(parseFloat(res.perc) > 20) {
                    color = "#FFCBA4";
                }

                if(parseFloat(res.perc) > 50) {
                    color = "orange";
                }

                if(parseFloat(res.perc) > 80) {
                    color = "red";
                }
                console.log(color);

                var dupes = [];

                if(color != "") {
                    __J(tinymceTextElements).each(function(i, v) {
                        dupes.push(v);

                        if(dupes.indexOf(__J(this).parent()) == -1) {

                        var nodeStr = __J(v).html();//.toString();
                        if(nodeStr.length > 0) {
                            //var t = __J(v).text();
                          //  nodeStr = nodeStr.replace(/\s+/g, '');
                            var tnodestr = nodeStr.replace(/\s+/g, '');
                            var tphrase = res.phrase.replace(/\s+/g, '');
                            var ind = tnodestr.indexOf(tphrase);
                            var nphrase = "", orig_nphrase = "";

                            console.log("ind: "+ind+" "+tphrase+ "\n\n<<< FOR >>>\n"+tnodestr);
                            if(ind != -1) {
                                var id = "_can"+i;

                                __J(v).attr("id", id);

                                if(typeof canary.markMap[id] === 'undefined') {
                                    canary.markMap[id] = { maps: [] };
                                }


                                canary.markMap[id].maps.push({ index: ind, res: res, color: color });

                            }
                        }
                        }
                    });

                }

    console.log(canary.markMap);

    //orig_nphrase = nodeStr.substring(ind, res.phrase.length);



    for(var id in canary.markMap) {
        canary.ifr = __J("#blogEntry_desc_text_ifr").contents();
        var ft;
        if(__J("#plagcheck").html().length == 0) { // @FIXME copy entire contents to plagcheck FIRST!!!
            ft = __J(canary.ifr).find("#tinymce #"+id).html();
        } else {
            ft = __J("#plagcheck").html();
        }
        //var ft = __J(__J(canary.tmceContent).html()).find("#"+id).html();

        console.log(canary.tmceContent);
        console.log("CONTENT==== #"+id);

        console.log(ft);
        if(typeof ft !== 'undefined') {
        for(var i = 0; i < canary.markMap[id].maps.length; i++) {
            var map = canary.markMap[id].maps[i];
            console.log("==== MAP ====");
            console.log(map);
            var prea = "<a href='"+map.res.link+"' style='color: "+color+"; cursor: pointer;' title='"+map.res.perc+"% match with "+map.res.displayLink+"'>";

            var posta = "</a>";

             var index = ft.indexOf(map.res.phrase);
                var str1 = ft.slice(0, index);
                var str2 = ft.slice(index + map.res.phrase.length, ft.length);
                __J('#plagcheck').html(str1 + prea + map.res.phrase + posta + str2);
        }  // console.log(id+" -- "+ft);

        }
    }
};


 function search(values, tinymceTextElements) {

        var pdl = typeof canary.prevLink !== 'undefined' &&
                        canary.prevLink.length > 0 ?
                        "&pdl="+encodeURIComponent(canary.prevLink) : "";

        __J.ajax({
                url : base+"p_search.php?q="+encodeURIComponent(values[searchIndex])+pdl,
                type: "GET",
                async: false,
                dataType: "jsonp",
                jsonpCallback  : "check",
                success: function(json) {
                    console.log(json);
                    if(typeof json.results !== 'undefined') {
                        parseResult(values[searchIndex], json.results, tinymceTextElements);

                        searchIndex++;

                        if(searchIndex < values.length) {
                            search(values, tinymceTextElements);
                        } else {
                            searchIndex = 0;
                            // exit;
                        }
                    }
                },
                error: function(json) { alert("Error"); }

                });
        };

