

# Value of your codes

How much your software codes value?

We got a lot of free codes to use. Should we think it's value as "0", because
it's free?

A gentleman share his food to others, it's his kindness and the food is free.
But the food keep it's value, it isn't down to "0", even you can get
it freely.  

The same should be kept to software codes.  Even we pay nothing to use
it, it should has it's own value.  The value add up to the whole value of our
society, when it go up, the world can be better.

So I would want to make it a little bit easier, to value codes.  This can be a
lot of work, but let's do it step by step.

The first thing is to write small price tags for codes, same as we are used to
see in market places.   A small tag showing value will make a start point to
talk.  Then we can talk how much every one's code value.


# One byte ten cents

To talk about value, we need a referrence price, let's start with 10 cents,
it's one tenth of a US dollar.

One byte ten cents.  Count all bytes includes comments, empty spaces, anything
you typed in.  But be honestly count what is your own words, not others.

Why not to count lines of codes (LOC), isn't all bosses pay for LOC?

Because we can read the size of file more easier than count lines, so we value
it by bytes to save trouble from counting lines.

The byte means a byte in ASCII codec, for example "a" is a byte, "?" is also a
byte.  Nowdays, we use UTF-8 encoding more often, it turns out to be
compatible to ASCII encoding.  To make things simple, please use English
during coding like many programmers doing today.  It would be easier for
foreigner programmers to read your codes.  If it's not easy for you, please
use UTF8 as your file encoding at least.


# Use a json file to make your value records

After count the size of codes, write a json file as follow

    {
        "value":     22.00,
        "who":       "My-name-is-gg-cat",
        "date":      "2015 11-23 19:18",

        "description":   ".....",
        "for-what":      "a file (foo.c) doing some hello world print demo in project"

        "currency":      "USD",
        "more-things":   "...",
        "more":          "... ..."
    }


Using JSON file will make things simple for many programmers who has already
know it.  It's kind of standart data format, easy to learn and to use.  It can
be processed by almost all programming languages.  Put a single json object in
the file closed by a pair of "{}", it will describe the value of codes.

The first 3 attributes is mandatary: value, who (user-id) and date, the
currency of the value defaults to US dollars.  If currency is different from
US dollar, please add it's ratio of conversion in the rest.

Then upload the json file to user "jobs", he will do bookkeepings.


## Deleting a byte also counts a byte

Deleting is equally important as adding.  So deleting one byte can be equally
valued as type in a byte.  Tools like 'diff' can be used to count changes, and
add it up to total value.

Be free to claim for all coding activities.  Modifying codes can be harder
then writing new codes, but it's a way to improve and make coding useful.  An
10K file after modification becomes 8K, if you think it's labor counts equally
as writing a new 20K file, you can claim it (the modification) as 20K bytes
value.  This means you can write 10k codes, claim 1k USD, then, delete it,
claim another 1k, then do rewritings, do modifications, and claim value each
time.  But, do it only necessary, keep as an honest people.

Value can get bargainings.  Code's value can go up and down as well. Almost
everything has value causes bargainings, codes are useless without other's
judging and using.  So users need to be prepared to get value push down or up
once they claimed value to their codes.  Every one in the system gets right to
judge others codes, and get judged.

Claim value anyway, please, this will make a game, it can be interesting.  We
use command line tools such as "ls" or "du" to get bytes, it equals to the
file size.  Multiply the file size by 10 cents, it gives the start of
valueing.


# LOC means lines of codes

It's a common concept in measuring software project, people use it a lot,
counting lines of codes, and get a measurement of the size of the software
project.

How much should a LOC cost?  

We can not give a number fit all codes, it should depend on it's programmer,
as well as the project they work with.  Some would use long lines and a lot
comment, some would make short lines.  Good codes tends to be neaty and
self-explaining.  The cost of LOC varies from a few cents to hundred dollars.
Cost is not always equal to quality.

When counting line of codes, please think this single line of code:

    e = m * c * c

How much should this line of code value?  The code means e (energy) equals m
(mass) multiplied by square of c (speed of light).  Can we think it's a single
line of code?  How much you value this LOC?  

So we referr value of bytes as an referrence, the value we think it's ok to
start with, it can be not good for all.


# Every byte counts

Instead of LOC, using byte to count would be more compatible with computer,
where bytes is a nature unit of storagte.  Avoid using LOC would be less
trouble prone, where line width can varying from file to file.  

Writers using words to count their work, they didn't count their writing in
lines.  Only when writter's job get printed out, it will get re-arranged into
lines and pages during font type settings of the books.  Programmers kind of
writter, their codes need more changes and tests.  But we can follow writter's
tradition to count by words/bytes.  It make things natural and simple.

When bytes get counted, some good programmers will not stop.  They always
optimise their codes, they keep doing code refactorring, It's one reason why
they are good ones.  So if a file size change from 10K to 8K, it might be a
sign the author paid more energy and expertise to achieve the reduction.

But we get less bytes, during the process of improving codes. How it happen?
It shows more working hours get less bytes.

It shows there is no magic number fit all.  Programmer are welcomed to add up
values when they achieved more with less bytes.  Measure your working time,
and add it up to the number of value.  Add some comments if possible.
Programmer are welcomed to add up value by refactorring.


## Open source gets value

There are tons of codes in open source world.  They can be free to use, but
let's respect the value.  It's totally ok for open source writter to claim
value for their codes.  If we use their codes, it's ofcourse ok to mark a
value in our system, for their codes.  And we add up values.

Consider the numerous amount of open source projects, and the possibilities it
being used, we don't know if we can find a boundary for the valueing of open
sources.  



# Play together

Software is hard enough, when size increase it's complexity grow
exponentially.  This has been proved throughly.  When writing codes or any
thing, we live in maze where everything can tangle with other things, they can
have roots far away from we can see.  When it get large, we get dropped into
such maze.  It's a kind of maze of human thoughts.

The condition lead to conclusion that team can help to win, because no one can
read or write so many codes, it must be kind of sharing make it happen.  Team
dynamic is a topic of uncertainty for me.  It has roles working at different
aspects.

## Reviewer and tester

Codes need be reviewed, and test it running.  What's good for any codes get
written but not test anymore?  When some one review codes, they contribute
efforts into it.

What happens when people reading a borrowed book?  They pay nearly nothing
compare to buy it from book shop.
But author's value still get improved because their reading.

Code reviewer play similar roles, when they start to review other's code, it's
value get improved.  So reviewers should claim a value for their works, for
example, half of the code value.  It's extra value, it can be claimed
without substracting value from code's author, it can improve code value.

## Designer

A good design save thousands LOC. 

Before construction of each building, builders get very detailed blue print.
The convention doesn't hold true in software building, where top-down or
bottom-up constructions happens spontaneously. 

When tens of thoundsand LOC wasted, programmers kind of thinking what if they
got a good design before starting.  The value of designer can't be overlooked.

Designer should claim value for their designs, even if they don't look like
codes.

## Organizer and supporter

Organizers can be leader or simply partner or friend. They might not write
codes by themself.  They make team work healthy, they can turn team dynamics
to good results.  They can do warming up or pushing forward.  If leadership
recognized, they should get extra value for their partnership, without
substracting from coder's value, for example 20% of other members.  Same as
organizers.


## Writing is kind of coding

From beginning, programming codes work as instructions to computer machines,
but people write their thoughts into codes.  Thus codes start to carrie
human's cognative knowledges.  Thus it's potentials went beyond it's simple
appearances, such as:

    If (2 > 1): we execute cmd files.  // Think this as a line of code.
    
Now we can find similarities between codes and other kind of writings.  Both
are written by human beings, carrying our intelligence, even emotional feels.

Then we can extend concepts of coding.  It can be anything representing our
knowledges and imaginations.  It can be anything created by human beings,
carry out our thoughts and feels.  It can be get involved in activities of
anywhere, when people think and feel it, what's codes.

Put it with a simple example. If you write text about our system, or discuss
our ideas, it can be viewed as codes for the system as well.  You are welcomed
to claim a value for it, add it up to the system.  When it get more reading
and discussion, when people follow your thoughts, it represented by your text,
it's code value should be improved.  Then it can be help of our system, and
improve it's own value.  Value your writing in our system, thank you.

Thus we keep thinking every byte can get value.  Value can vary largely.  Any
one can throw a line of writing or coding into our system, it might happen
that the line of code improved value over millions.  And by the way, we
improve the world, because we start value more.


---




## Upload the json file

An user named "jobs", he's willing to accept all json file uploading from
other users.  So upload the json file of value registering to "jobs".

"jobs" is a pseudo user currently, he can also be played by a real one. He has
folders of: codes, designs, organizers.  Upload your json file to relative
folder.


# Final thoughts



<!--
vim: set ft=markdown tw=78:
-->
