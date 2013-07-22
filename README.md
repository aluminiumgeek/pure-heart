pure-heart
==========

See the stuff your friends liked. 

Production version runs on [like.0x80.ru](http://like.0x80.ru).

### Requirements
* [MongoDB](http://www.mongodb.org/)
* [Node.js](http://nodejs.org)


### Nginx configuration

    upstream pure {
        server 127.0.0.1:3000;
    }
  
    
    server {
        listen 80;
        server_name example.com www.example.com;

        log_not_found off;
        charset utf-8;

        location / {
            if (!-e $request_filename) {
                proxy_pass http://pure;
            }
        }
    }
