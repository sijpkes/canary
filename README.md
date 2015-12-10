# canary
Formative writing feedback tool for assessable web based writing in courses. 

-Development build


Implemented Features:
---------------------
* Unobtrusive asynchronous highlighting of text in the #tinymce iframe within Blackboard Learn
* Title attribute added to element in the format (n% match to [match url])
* Text can be ignoreb by canary by placing text within any of these style of quotes: " or “ ” 

Todo Features:
--------------
* small watermark logo indicating tool is running in bottom corner of tinymce
* clickable link that lists all match details in an absolute positioned div
* absolute positioned div to include tips on paraphrasing text
* compatibility with other platforms Moodle, Wordpress
* Artoo.js browser independent installer for instructors

Requirements
------------

Custom Search Engine
--------------------

The custom search engine returns 55 character string matches to web sites.  Only the top 3 matches, orderered by percentage matched in descending order are returned. The `sensitivity` variable in the `canarybc.js` file determines the threshold for highlighting items in the text either in pale blue for a 30% - 65% match, orange for a 66% to 85% match and red for an 86% to 100% match.

A dedicated search service will be available soon, OR you can implement your own using the following instructions:

* Google Custom Search API 
* A Google Custom Search Engine

Implement a Google search service using the Google API that takes up to two GET parameters:

* `q` : URI encoded search query
* `u` : generated user id from Blackboard Learn
* `name` : CSRF name
* `token` : CSRF token
* `pdl` : previously matched link (optional)
* `sid` : PHP session id (this is optional depending on what language you are using to implement your server).

The `q` is similar to a standard Google query URL:
q=this%20is%20a%20test

The optional `pdl` is for queries following the initial search, in order for your service to favour results from the first result URL.
e.g. `pdl=http://my.previous.search.result.com`

CSRF tokens follow standard CSRF conventions (see OWASP website)

The service must return JSONP in the following example format. 

[Example search is: "this is a test" on 7 Dec 2015 at 11:50 am Sydney/Australia]

```
check ({  
   "results":[  
      {  
         "match":10,
         "phrase":"this is a test",
         "perc":71.428571428571,
         "displayLink":"www.youtube.com",
         "link":"https:\/\/www.youtube.com\/watch?v=APUqB6RR7bc"
      },
      {  
         "match":4,
         "phrase":"this is a test",
         "perc":44.444444444444,
         "displayLink":"www.redstate.com",
         "link":"http:\/\/www.redstate.com\/2015\/06\/17\/this-is-a-test-for-the-next-30-days-well-see-how-stupid-the-republicans-are-this-is-only-a-test\/"
      },
      {  
         "match":4,
         "phrase":"this is a test",
         "perc":44.444444444444,
         "displayLink":"www.dramaticpublishing.com",
         "link":"http:\/\/www.dramaticpublishing.com\/p1532\/This-Is-a-Test\/product_info.html"
      }
   ]
});
```


Compatibility
============
Blackboard Learn blog tool
