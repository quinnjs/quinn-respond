# TODO: Replace by quinnc proper once this moves out
COMPILE = ./node_modules/.bin/quinnc

default: build

.PHONY: build test check-checkout-clean clean clean-dist lint
build: node_modules
	@$(COMPILE) src dist

# This will fail if there are unstaged changes in the checkout
check-checkout-clean:
	git diff --exit-code

test: build node_modules
	@./node_modules/.bin/mocha

node_modules: package.json
	@npm install

lint: build
	@./node_modules/.bin/jshint src

clean:
	rm -rf dist

watch: node_modules
	@./node_modules/.bin/reakt -g "{src,test,build}/**/*.js" "make test"
