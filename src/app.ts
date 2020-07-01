import express = require("express");
import path = require("path");
import routes from "./routes/index";

const app = express();
app.use("/", routes);

// Error handlers

// Development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use((err: any, req, res, next) => {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err: any, req, res, next) => {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
  });
});

app.set("port", process.env.PORT || 3000);

const server = app.listen(app.get("port"), () => {
  console.log("Express server listening on port " + app.get("port"));
});


