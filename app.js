load('./lib/jvm-npm.js');
load('./src/appdb-spring.js');

var todos = new dao.DB();
todos.initDS();
print('created todos DAO instance');

let onSuccess = (msg) => {
    print(msg);
};

let onError = (msg) =>{
    print(msg);
};

let Date = Java.type('java.util.Date');
let DateFormat = Java.type('java.text.SimpleDateFormat');

let zesty = Java.type('com.practicaldime.zesty.app.AppProvider');

var app = zesty.provide({
    appctx: "/",
    assets: "www",
    engine: "freemarker"
});

var router = app.router();

router.get('/', function(req, res) {
    res.send(app.status().concat(" @ ").concat(new DateFormat("hh:mm:ss a").format(new Date())))
});

router.get("/todos", function (req, res) {
    let start = req.param('start') || 0;
    let size = req.param('size') || 10;
    todos.retrieveByRange(start, size, function (tasks, msg) {
        var model = {
            "tasks": tasks,
            title: "TodosJs List"
        };
        res.render("todos", model);
    }, onError);
});

router.get("/todos/done", function (req, res) {
    var completed = req.param("complete");
    todos.retrieveByDone(completed, function (tasks, msg) {
        var model = {
            "tasks": tasks
        };
        res.render("todos", model);
    }, onError);
});

router.get("/todos/refresh", function (req, res) {
    let start = req.param('start') || 0;
    let size = req.param('size') || 10;
    todos.retrieveByRange(start, size, function (tasks, msg) {
        print('TASKS RETRIEVED FROM DATABASE /todo/refresh');
        res.json(tasks);
    }, onError);
});

router.post("/todos", function (req, res) {
    var task = req.param("task");
    todos.createTask(task, onSuccess, onError);

    todos.retrieveTask(task, function (created, msg) {
        res.json(created);
    }, onError);
});

router.put("/todos/done", function (req, res) {
    var task = req.param("task");
    var done = req.param("complete");
    todos.updateDone(task, done, onSuccess, onError);

    todos.retrieveTask(task, function (updated, msg) {
        res.json(updated);
    }, onError);
});

router.put("/todos/rename", function (req, res) {
    var task = req.param("task");
    var newName = req.param("newName");
    todos.updateName(task, newName, onSuccess, onError);

    todos.retrieveTask(newName, function (updated, msg) {
        res.json(updated);
    }, onError);
});

router.delete("/todos", function (req, res) {
    var task = req.param("name");
    todos.deleteTask(task, onSuccess, onError);

    res.redirect(app.resolve("/todos/refresh"));
});

let port = 8080, host = 'localhost';
router.listen(port, host, function(result){
    print(result);
});

//jjs --language=es6 -ot -scripting -J-Djava.class.path=./lib/jetty-router-0.1.0-shaded.jar app.js
///opt/graalvm-ee-1.0.0-rc9/bin/npm --jvm --polyglot -J-Djava.class.path=./lib/jetty-router-0.1.0-shaded.jar test
///opt/graalvm-ee-1.0.0-rc9/bin/npm --jvm start


