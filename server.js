const app = require('./app');
var shell = require('shelljs');
const port = 4000;

app.listen(port, () => {
    console.log("The server has started");
    //open the browser to show images
    //seems to crash node
    //shell.exec("chromium-browser http://localhost:4000/live --kiosk");
});
