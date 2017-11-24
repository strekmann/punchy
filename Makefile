REPORTER = spec

build:
	@./node_modules/.bin/grunt

production:
	yarn install
	./node_modules/.bin/bower install
	@./node_modules/.bin/grunt prod

nodemon:
	./node_modules/.bin/nodemon

watch:
	@./node_modules/.bin/grunt watch

hint:
	@./node_modules/.bin/grunt hint

locales:
	@./node_modules/.bin/grunt locales

test: hint
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--ui bdd

test-w:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--growl \
		--ui bdd \
		--watch

install:
	yarn install
	./node_modules/.bin/bower install

update:
	yarn update
	./node_modules/.bin/bower update

clean:
	rm -r ./node_modules ./bower_components ./public

.PHONY: build production watch test test-w hint locales install update clean
