require 'sinatra'

set :port, 8084
set :static, true
set :public_folder, '.'

get '/' do
    redirect to('/component-browser.html')
end

