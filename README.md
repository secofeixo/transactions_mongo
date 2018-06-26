# transaction in mongodb

Code creating a simple api for making transaction between users using a mongo database and developed with NodeJS

1. Clone the repo: `https://github.com/secofeixo/transactions_mongo.git`
2. Install packages: `npm install`
3. Install mongodb and create a database with name transaction
4. Change out the database configuration in config/database.js
5. Change out the email configuration in config/email.js. Use a google email account, but configuring that account in order to be able to send emails.
6. Launch: `npm start`
7. Visit in your browser at: `http://localhost:8080`

## Docker

You can use it with docker, running `docker-compose up --build`.<br>
It will create the docker image for the node server, and then run the two images of the docker-compose file.<br>
Currently the database is not setup with a volume, so the data is not persistent. <br>
If you want to use with persistent data:
1. Uncomment the lines in the docker-compose file for tyhe service mongo_db
2. create the folder /mongo/data with the write permissions in order to write on it from the docker image.

## usage

First you must signup at least two users<br>
`POST localhost:8080/singup`<br>
`data: {
	"email": "test1@domain.com",
	"password": "12345678"
}`
<br>
The sign up process must send an email witha  toekn to the email specified by the user. If you don't receive it you can get new token to authenticate using:<br>
`GET localhost:8080/renewtoken/:email`<br>
<br>
To verify the user the API cal is: <br>
`GET localhost:8080/verifyProfile?token=token_received_in_the_email`<br>
If you want to get the token in the logs of node, or directly you can set the attribute `verified` to true in the database transaction, collection users<br>
<br>
A user must be logged in, in order to get the balance or to make a transaction.<br>
`POST localhost/login`<br>
`data: {
	"email": "test1@domain.com",
	"password": "12345678"
}`<br>
<br>
You can check if tehre is a user logged in with:<br>
`GET localhost/login`<br>
<br>
For getting the balance:<br>
`GET localhost/user/:idUSer/balance`<br>
It returna  JSON object with the balance.<br>
<br>
For making a transaction between two users<br>
`POST /loclahost:8080/user/:idUserSource/transfer/:amount/to/:idUserDestination`<br>
<br>
For logout the user<br>
`GET /loclahost:8080/logout`<br>
<br>
