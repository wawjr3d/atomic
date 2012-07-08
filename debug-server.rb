require 'sinatra'

set :port, 8084
set :static, true
set :public_folder, '.'

get '/' do
    'Sinatra is alive. You \'re probably looking for index.html.'
end
