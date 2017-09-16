
I made a video shows how to write function to add file value.

    https://www.youtube.com/watch?v=h-5QndyHiLk

When doing software for goodogood, We are using express js and node js.

To set up plain simple web pages for file value, in goodogood/goodagood system, to
view and change file's value.

When we view the page, we use HTTP GET.  When we change the value and submit
the form, we use HTTP POST method.  

This is not suppose to be fancy, because we are setting up a way for the old
time browsers to change file value.  They can have not javascript support, so
by doing this we let acient user get abilities to set their file value.

It's simple, it's most compatible.

Because value is one of the basic elements of our system, goodogood or
goodagood, we are going to support it in low levels.


# Express.js

Server is writting on express.js and node.js.

We use 
        route.get(...) 
        route.post(...)

to do it.

the codes ....

the test through ...
    test address, [goodogood.me] /file/add-value/abc/add-2/a.html


File name can be duplicated, in goodogood system.
This might be another stupid decision i made, because we are going to support
team sharing a bounch of files or folder.  We should not know if members will
put file in, we don't know what file name they are going to use for new files
put into shared folder.  This is why i made it accept duplicated file name in
folder.  This might be a stupid decision or a stupid way to implement it, but
the purpose is to give less limits for users.

If they each put in files from their home, don't know each other is using the
same file name.  It should be ok, they can solve the name conflicts after a
while when they find out.  But the system should be ok to accept it.


## Response Object:

    Properties

        res.app      res.headersSent      res.locals

    Methods

        res.append()         res.attachment()      res.cookie()
        res.clearCookie()    res.download()        res.end()
        res.format()         res.get()             res.json()
        res.jsonp()          res.links()           res.location()
        res.redirect()       res.render()          res.send()
        res.sendFile()       res.sendStatus()      res.set()
        res.status()         res.type()            res.vary()


## What is HTTP?

    http://www.w3schools.com/tags/ref_httpmethods.asp

The Hypertext Transfer Protocol (HTTP) is designed to enable communications
between clients and servers.

    The client can be the computer or mobile using to browser online, more
    acurately, it's the software on it showing the webpages.

    The server means the online machines serving this contents.


HTTP works as a request-response protocol between a client and server.

A web browser may be the client, and an application on a computer that hosts a
web site may be the server.

Example: A client (browser) submits an HTTP request to the server; then the
server returns a response to the client. The response contains status
information about the request and may also contain the requested content.

Two HTTP Request Methods: GET and POST

Two commonly used methods for a request-response between a client and server
are: GET and POST.

    GET - Requests data from a specified resource
    POST - Submits data to be processed to a specified resource


## http methods



HEAD

The HEAD method asks for a response identical to that of a GET request, but
without the response body. This is useful for retrieving meta-information
written in response headers, without having to transport the entire content.

POST

The POST method requests that the server accept the entity enclosed in the
request as a new subordinate of the web resource identified by the URI. The
data POSTed might be, for example, an annotation for existing resources; a
message for a bulletin board, newsgroup, mailing list, or comment thread; a
block of data that is the result of submitting a web form to a data-handling
process; or an item to add to a database.[14]

PUT

The PUT method requests that the enclosed entity be stored under the supplied
URI. If the URI refers to an already existing resource, it is modified; if the
URI does not point to an existing resource, then the server can create the
resource with that URI.[15]

DELETE

The DELETE method deletes the specified resource.

TRACE

The TRACE method echoes the received request so that a client can see what (if
any) changes or additions have been made by intermediate servers.

OPTIONS

The OPTIONS method returns the HTTP methods that the server supports for the
specified URL. This can be used to check the functionality of a web server by
requesting `*` instead of a specific resource.

CONNECT

[16] The CONNECT method converts the request connection to a transparent
TCP/IP tunnel, usually to facilitate SSL-encrypted communication (HTTPS)
through an unencrypted HTTP proxy.[17][18] See HTTP CONNECT tunneling.

PATCH

The PATCH method applies partial modifications to a resource.[19] 



<!--
    2016 0114
    vim: set filetype=markdown textwidth=78:
-->
