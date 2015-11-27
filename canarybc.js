var lastStr = "";

var domc = null;

function run(str, items) {
    clearTimeout(domc);

    if(__J("#plagcheck").length === 0) {
        __J("body").append("<div id=\"plagcheck\"></div>");
    }

    var parts = str.split(" ");
    var values = [];
    var i = 0;
    var tmpVar = "";
   //  console.log("run called 2");
    if(parts.length > 5) {
    __J(parts).each(function(index, value) {
         //console.log("run called 3");
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

    }
    __J.each(values, function(i,v) {
            search(encodeURIComponent(v), items);
    });

    //domc = checkDOMChanged();
}

__J(".textboxtable").bind("mouseover", "body#tinymce", function() {
    if(domc === null) {
        domc = checkDOMChanged();
        console.log("dom checker attached");
    } else {
         __J(".textboxtable body#tinymce").unbind("mouseover");
    }
});

function checkDOMChanged() {
    var ifr = __J("#blogEntry_desc_text_ifr").contents();
    var items = __J(ifr).find("#tinymce p");
   // var currentCount = __J(items).length > 0 ? __J(items).length : 0;
    var str = "";
    __J(items).each(function(i, v) {
            str += __J(this).text();
    });

    currentStr = str;

    if(lastStr !== currentStr) {
       // console.log("Changed: "+str);
       // __J("iframe#blogEntry_desc_text_ifr").bind("mouseout", "#tinymce", function() { run(str, items); __J("#tinymce").unbind("mouseout"); });
        lastStr = currentStr;
    }

    //setTimeout(checkDOMChanged, 500);
}

 function search(q, items) {
         __J.ajax({
                url : base+"p_search.php?q="+q,
                type: "GET",
                async: false,
                dataType: "jsonp",
                jsonpCallback  : "check",
                success: function(json) {
                    console.log(json);
                    if(typeof json.results !== 'undefined') {
                        json.parse(q, json.results, items);
                    }
                },
                error: function(json) { alert("Error"); }

                });
        };

