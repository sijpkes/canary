# canary
Formative writing feedback tool for assessable web based writing in courses. 

Development build
=================

Implemented Features:
---------------------
* Unobtrusive asynchronous highlighting of text in the #tinymce iframe within Blackboard Learn
* Title attribute added to element in the format (n% match to [match url])
* Text can be ignoreb by canary by the student placing text within any of these style of quotes: " or “ ” 

Todo Features:
--------------
* small watermark logo indicating tool is running in bottom corner of tinymce
* clickable link that lists all match details in an absolute positioned div
* absolute positioned div to include tips on paraphrasing text
* compatibility with other platforms Moodle, Wordpress
* Artoo.js browser independent installer for instructors

Requirements
------------
Google search service using the Google API that returns JSONP in the following example format. 
(Example search is: "this is a test" on 7 Dec 2015 at 11:50 am)

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
Blackboard Learn
