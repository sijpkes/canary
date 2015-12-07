# canary
Formative writing feedback tool for assessable web based writing in courses. 

Development build
=================

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
* Google Custom Search API 
* A Google Custom Search Engine

You will need to implement a Google search service using the Google API that takes up to two GET parameters:

`q` and `pdl` (optional)

The `q` is similar to a standard Google query URL:
q=this%20is%20a%20test

The optional `pdl` is for queries following the initial search, in order for your service to favour results from the first result URL.
e.g. `pdl=http://my.previous.search.result.com`

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
Blackboard Learn built in blogs