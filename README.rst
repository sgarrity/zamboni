This is an experimental branch to try inlining Translation queries using LEFT
JOINs.  I expected this to perform better than our current method of fetching
an object and then doing two extra queries to find it's primary translations
and fallbacks.  Once MySQL got warmed up, the inline translations performed
better in the cold cache case, but had too much overhead in the hot cache case,
when we get all our data from memcached.  On the homepage, inline translations
added an extra 45ms of processing in Python code.

If the Django ORM gets faster at managing filters and joins, we should take a
look at this again.  It would be nice to have fewer queries on a cold cache,
but it's not worth it for the processing penalty.

This branch is being published so it can perhaps be resurrected one day, or at
least serve as an example for future generations.
