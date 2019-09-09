var https = require("https");
var http = require("http");
var express = require("express");
var bodyParser = require("body-parser");
var databox = require("node-databox");

const DATABOX_ARBITER_ENDPOINT = process.env.DATABOX_ARBITER_ENDPOINT || 'tcp://127.0.0.1:4444';
const DATABOX_ZMQ_ENDPOINT = process.env.DATABOX_ZMQ_ENDPOINT || "tcp://127.0.0.1:5555";
const DATABOX_TESTING = !(process.env.DATABOX_VERSION);
const PORT = process.env.port || '8080';

// own store
const store = databox.NewStoreClient(DATABOX_ZMQ_ENDPOINT, DATABOX_ARBITER_ENDPOINT);

//create store schema for saving key/value config data
const configMetadata = {
    ...databox.NewDataSourceMetadata(),
    Description: 'spendingalarm app config',
    ContentType: 'application/json',
    Vendor: 'Databox Inc.',
    DataSourceType: 'spendingalarmAppConfig',
    DataSourceID: 'spendingalarmAppConfig',
    StoreType: 'kv',
}

// transaction store client
let tmetadata = databox.HypercatToSourceDataMetadata(process.env.DATASOURCE_TRANSACTIONS);
let tstore = databox.NewStoreClient(tmetadata.getStoreUrlFromMetadata(tmetadata), ARBITER_URI);

// report store client
let rmetadata = databox.HypercatToSourceDataMetadata(process.env.DATASOURCE_REPORTS);
let rstore = databox.NewStoreClient(tmetadata.getStoreUrlFromMetadata(rmetadata), ARBITER_URI);

///now create our stores using our clients.
store.RegisterDatasource(configMetadata).then(() => {
	console.log("registered spendingalarmAppConfig");
	// no DATABOX_TESTING for now
	if (DATABOX_TESTING) 
		throw('DATABOX_TESTING not supported');
	return tstore.TSBlob.Observe(tmetadata.DataSourceID, 0); 
}).then((emitter) => {
	console.log("started listening to", tmetadata.DataSourceID);

	emitter.on('data', (data) => {
		console.log("seen transaction", JSON.parse(data.data));
	});

	emitter.on('error', (err) => {
		console.warn("transactions observer error", err);
	});

}).catch((err) => { 
	console.log("error setting up datasources", err) 
})

//set up webserver to serve driver endpoints
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('views', './views');
app.set('view engine', 'ejs');

app.get("/", function (req, res) {
    res.redirect("/ui");
});

app.get("/ui", function (req, res) {
    store.KV.Read(configMetadata.DataSourceID, "config").then((result) => {
        console.log("result:", configMetadata.DataSourceID, result);
        res.render('index', { config: result.value });
    }).catch((err) => {
        console.log("get config error", err);
        res.send({ success: false, err });
    });
});

app.post('/ui/setConfig', (req, res) => {

    const config = req.body.config;

    return new Promise((resolve, reject) => {
        store.KV.Write(configMetadata.DataSourceID, "config", { key: helloWorldConfig.DataSourceID, value: config }).then(() => {
            console.log("successfully written config!", config);
            resolve();
        }).catch((err) => {
            console.log("failed to write config", err);
            reject(err);
        });
    }).then(() => {
        res.send({ success: true });
    });
});

app.get("/status", function (req, res) {
    res.send("active");
});

//when testing, we run as http, (to prevent the need for self-signed certs etc);
if (DATABOX_TESTING) {
    console.log("[Creating TEST http server]", PORT);
    http.createServer(app).listen(PORT);
} else {
    console.log("[Creating https server]", PORT);
    const credentials = databox.GetHttpsCredentials();
    https.createServer(credentials, app).listen(PORT);
}
