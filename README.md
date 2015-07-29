Punchy - the friendly time tracker
==================================

This is a very simple time tracker, that lacks most features you want

Based on
--------

* node
* express
* mongoose
* passport
* jade
* react
* alt (flux pattern)
* iso (isomorphic react)
* i18n-abide
* mocha

Howto
-----

* Clone this repository: ``git clone git://github.com/strekmann/punchy.git``
* Change directory: ``cd punchy``
* Install dependencies: ``npm install``
* Create a settings file, and remember to edit it: ``cp server/settings.example.js server/settings.js``
* See that everything works on your side: ``make test``
* Run: ``node index``
* Open browser at localhost:3000

Developers howto
----------------

* Make everything: ``make``
* Make translation files: ``make locales``
* Compile sass and react components on file changes: ``make watch``
* Restart cluster on file changes: ``nodemon cluster``

Bugs? Contributions?
--------------------

Please use the issues and pull requests at Github.

Copyright and license
---------------------
Copyright © 2013-2015 Jørgen Bergquist and Sigurd Gartmann, released under the [AGPL license](https://github.com/strekmann/punchy/blob/master/LICENSE).
