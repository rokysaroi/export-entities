// import * as express from 'express'
// import * as fs from 'fs'
// const httpProxy = require('http-proxy');
// const proxy = httpProxy.createProxyServer();

// let app = express();
// let config: any = JSON.parse(fs.readFileSync(__dirname +"/config.json", 'utf8'));
// let port = process.env.port || config.port || 1337;

// app.post('/', (req, res) => {
//     regle.postRegle(req).then(function (val) {
//         res.status(200).send(val)
//     }).catch(function (error) {
//         res.status(error.code).send(error)
//     })
// });

// app.get('/', (req, res) => {
//     tools.proxyWeb(req, res);
// });

// app.put('/', (req, res) => {
//     tools.proxyWeb(req, res);
// });

// app.delete('/', (req, res) => {
//     tools.proxyWeb(req, res);
// });

// app.listen(port, function () {
//     console.log("Server started at port %d", port);
// });

// function proxyWeb(req: any, res: any) {
//     delete req.headers['host'];
//     // transformation URL
//     if (req.originalUrl.indexOf(pathServiceMdr) == -1)
//         req.url = pathServiceMdr + req.originalUrl;
//     else
//         req.url = req.originalUrl;

//     console.log(req.url)
//     proxy.web(req, res, { target: hostname });
//     proxy.on('error', function (e) {
//         console.log(e)
//     });
// }