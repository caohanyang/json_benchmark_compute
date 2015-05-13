var express = require("express"),
	app = express(),
	bodyParser = require('body-parser'),
	path = require('path'),
	userDb = require('./userDb'),
	router = express.Router();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(express.static(__dirname ));


router.route('/')
	.get(userDb.findUser)
	.put(userDb.updateUser);

app.use('/benchmark', router);

// MAIN CATCHALL ROUTE --------------- 
// SEND USERS TO FRONTEND ------------
// has to be registered after API ROUTES
app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(process.env.PORT || 8080);
