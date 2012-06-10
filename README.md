#atomic

##What is a Component?
A directory containing the following directories
- css
- js
- templates
- assets
- data 

###css 
Stylesheets required to render component on its own

###js
Javascripts required for any interaction functionality or in the case of thick client code, the code to decide which template to render

###templates
If client side code is required, the templates to render the different states

###assets
The associated PSDs or images

###data
Sample data that the component will render


##Where do components live?
**In your project's repos**

One for component code

One for component assets


#How to build
After cloning, be sure to run `bundle` in order to fetch the gems laid out in the Gemfile. This project depends on `sass`, `saas`, and `sinatra`.

There is currently a single rake target to run Sinatra:
    rake server
will run sinatra from `debug-server.rb`.
