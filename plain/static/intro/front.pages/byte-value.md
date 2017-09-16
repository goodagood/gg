
![bread pieces](/gglocal/bread-a.jpg)

# Value of your codes

How much your software codes value?

There are lot's of free codes to use. Should we think it's value as "0",
because it's free so it's zero?

Let's see, a gentleman share his food to others, it's his kindness and the
food is free.  But the food actually keep it's value, it isn't down to "0".

The same concept value should be kept for software codes.  Even we pay nothing
to use it, it should has it's own value.

Codes has value.  How to calculate the value?

First, We need keep away from the concept of market prices, price in market
means buyer is obliged to pay the amount in currency.  We value codes in
senses of how much labor we put in, and how much benefits we get from it.
When we think value this way, it remind us to respect those who contribute to
make us get useful codes.

Then we can try to write small price tags for codes, same as we are used to
see in marketplaces.   This is a little bit controversial because we are
trying to write price tag when we aren't in marketplace.

Now, it's time to talk how much, we need number it.


# One byte ten cents

How about 10 cents each byte?  it's one tenth of an US dollar.

One byte values to ten cents.  Count all bytes includes comments, empty
spaces, anything you typed in.  But be honestly count only your own words, not
others.

Why not to count lines of codes (LOC)?  LOC is widely used.  But because we
can read the size of file more easier than count lines, so we can save trouble
from counting lines by reading the size in bytes.

The byte means a byte in ASCII codec, for example "a" is a byte, it's actually
8 bits.  Byte is a natural unit in computer storage.  Nowdays, we use UTF-8
encoding more often, it turns out to be compatible to ASCII encoding.  Beside
English, UTF-8 supports nearly all human languages.

When talk about value, there are more ways to count the value, for example,
count it as hours of labor, man monthes, or instead just keep using LOC.  And
value is not only produced by code-writters, actually, more value is
contributed by those not programmers, such as organizers, designers,
reviewers, other supporters and more.  Count them all if needed.


# Put it in a JSON file

After we get value, write a json file as follow:

    {
        "value":     22.00,
        "who":       "My-name-is-gg-cat",
        "what":      "a few php files set up a blog",
        "when":      "2015 11-23 19:18",

        "and":       "all the rest are optional :)",
        "key":       "value of key",
        "attribute": "value of the attribute",

        "description":   ".....",
        "for-what":      "a file (foo.c) doing some hello world print demo in project"

        "currency":      "USD",
        "more-things":   "more is you want",
        "more":          "... ..."
    }


Using JSON file will make things simple for programmers who has already know
it.  It's kind of standart data structure, easy to learn and easy to use.  It
can be processed by almost all programming languages.  Put a single json
object in the file closed by a pair of "{}", it can describe the value of
codes.

The first 3 attributes is mandatary: value, who (user-id), what and when, the
unit of the value defaults to US dollar.  All the rest keys, values are
optional, it give chances to make thing more clear if you add more attributes.

Then upload the json file to user "jobs", he will do the file keeping things.

At last we value codes, use json file to save data of value.  But thing will
not stop, it always moving forward.  Value is going to change, it keep
changing all the time.  Even price of gold changes in market, in history,
value can not be fix to a number.  And keep in mind that, when we talk about
code's value, we need to know huge part of value come from those who are not
programmer.  


# Conclusions

We try to set up a simple approach to measure value of software codes, this
should be helpful to improve software projects.  The picture can be broad and
deep when there're actually many roles and labors involved.  Still we want
keep it simple:

    1, measure value data
    2, write json file and upload it

We tried to make it easy to claim value, at least in our system. But,
there is no attempt to make the process accurate or make it close to
marketplace exchangeable.

![small bread](/gglocal/bread-300.jpg)

# Links

a [backup link](http://goodagood.blogspot.com/2015/12/byte-value.html)

<!--
backup link: http://goodagood.blogspot.com/2015/12/byte-value.html

vim: set ft=markdown tw=78:
-->
