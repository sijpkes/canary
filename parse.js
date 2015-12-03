function parse(q, results, tinymceTextElements) {
            if(typeof results === 'undefined') {
            return;
            }

            var tdiv = __J(tinymceTextElements).clone().wrap("<div/>").parent();
            var items = __J(tdiv).contents();
            var sq = decodeURIComponent(q);

            var o = typeof results === "string" ? JSON.parse(results) : results;
            var color = "";
            var res = results[0];

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

               /* if(__J("#canaryResult").length == 0) {
                    __J("body").append("<div id='canaryResult'></div>");
                }*/

             //   var replaced =

                if(color != "") {

                    __J(tinymceTextElements).each(function(i, v) {
                        var nodeStr = __J(v).text().toString();
                        if(nodeStr.length > 0) {
                        console.log("checking element "+i+" obj: "+v+" text:"+__J(v).text() + "with: "+res.phrase);
                       // if(i == elementIndex) {
                            var t = __J(v).text(), ind = t.indexOf(res.phrase), nphrase = "";
                                console.log("ind: "+ind+" phrase.len: "+res.phrase.length);
                            if(ind != -1) {
                                nphrase = t.substring(ind, res.phrase.length);
                                nphrase = "<a href='"+res.link+"' style='color: "+color+"; cursor: pointer;' title='"+res.perc+"% match with "+res.displayLink+"'>"+nphrase+"</a>";

                                __J("#plagcheck").append(nphrase);
                            } /*else {
                                __J("#plagcheck").append(t);
                                console.log("No match: "+t);
                            }*/

                        }
                    });

                }

      console.log("REPLACED");
      //console.log(replaced);

      //  tdiv.html(__J(items).html());

      //  __J(tinymceTextElements).html(__J(tdiv).contents());
};

