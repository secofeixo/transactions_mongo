# transaction in mongodb

Code creating a simple api for making transaction between users using a mongo database and developed with NodeJS

1. Clone the repo: `https://github.com/secofeixo/transactions_mongo.git`
2. Install packages: `npm install`
3. Install mongodb and create a database with name transaction
4. Change out the database configuration in config/database.js
5. Change out the email configuration in config/email.js. Use a google email account, but configuring that account in order to be able to send emails.
6. Launch: `npm start`
7. Visit in your browser at: `http://localhost:8080`

#Docker

You can use it with docker, running docker-compose up --build. It will create the docker image for the node server, and then run the two images of the docker-compose file.
Currently the database is not setup with a volume, so the data is not persistent. 
If you want to use with persistent data, uncomment the lines in the docker-compose file for tyhe service mongo_db, and create the folder /mongo/data with the permissions in order to write on them from the docker image.
