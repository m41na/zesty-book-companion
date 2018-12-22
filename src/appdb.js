let dao = {};

(function (dao, load) {

    let DataSource = Java.type('org.apache.commons.dbcp2.BasicDataSource');

    var DB = function (params) {
        this.config = {
            "jdbc.driverClass": params && params['driverClass'] || "org.h2.Driver",
            "jdbc.url": params && params['url'] || "jdbc:h2:./data/todos.js_db;DB_CLOSE_DELAY=-1",
            "jdbc.username": params && params['username'] || "sa",
            "jdbc.password": params && params['password'] || "sa"
        };
        this.ds = undefined;
    };

    DB.prototype.initDS = function () {
        var dataSource = new DataSource();
        dataSource.setDriverClassName(this.config["jdbc.driverClass"]);
        dataSource.setUrl(this.config["jdbc.url"]);
        dataSource.setUsername(this.config["jdbc.username"]);
        dataSource.setPassword(this.config["jdbc.password"]);
        this.ds = dataSource;
    };

    DB.prototype.closeDS = function () {
        this.ds.close();
    };

    DB.prototype.createTable = function (query, onSuccess, onError) {
        var con, stmt;
        try {
            con = this.ds.getConnection();
            stmt = con.createStatement();
            var result = stmt.execute(query);
            if (result) {
                onSuccess("createTable was successful");
            }
        } catch (error) {
            onError(error);
        } finally {
            if (stmt) stmt.close();
            if (con) con.close();
        }
    };

    DB.prototype.insertBatch = function (tasks, onSuccess, onError) {
        var con, stmt;
        try {
            con = this.ds.getConnection();
            stmt = con.createStatement();
            for (var i = 0; i < tasks.length; i++) {
                stmt.addBatch(tasks[i]);
            }
            var result = stmt.executeBatch();
            onSuccess(result, "batch insert was successful");
        } catch (error) {
            onError(error);
        } finally {
            if (stmt) stmt.close();
            if (con) con.close();
        }
    };

    DB.prototype.truncateTable = function (onSuccess, onError) {
        var query = "TRUNCATE table tbl_todos";
        var con, stmt;
        try {
            con = this.ds.getConnection();
            stmt = con.createStatement();
            var result = stmt.executeUpdate(query);
            onSuccess(result, "Table data truncated");
        } catch (error) {
            onError(error);
        } finally {
            if (stmt) stmt.close();
            if (con) con.close();
        }
    };

    DB.prototype.createTask = function (task, onSuccess, onError) {
        var query = "INSERT INTO tbl_todos (task) values (?)";
        var con, pst;
        try {
            con = this.ds.getConnection();
            pst = con.prepareStatement(query);
            pst.setString(1, task);
            var result = pst.executeUpdate();
            onSuccess(result, "createTask was successful");
        } catch (error) {
            onError(error);
        } finally {
            if (pst) pst.close();
            if (con) con.close();
        }
    };

    DB.prototype.updateDone = function (task, done, onSuccess, onError) {
        var query = "UPDATE tbl_todos set completed=? where task = ?";
        var con, pst;
        try {
            con = this.ds.getConnection();
            pst = con.prepareStatement(query);
            pst.setBoolean(1, done);
            pst.setString(2, task);
            var result = pst.executeUpdate();
            onSuccess(result, "updated complete status");
        } catch (error) {
            onError(error);
        } finally {
            if (pst) pst.close();
            if (con) con.close();
        }
    };

    DB.prototype.updateName = function (task, newName, onSuccess, onError) {
        var query = "UPDATE tbl_todos set task=? where task = ?";
        var con, pst;
        try {
            con = this.ds.getConnection();
            pst = con.prepareStatement(query);
            pst.setString(1, newName);
            pst.setString(2, task);
            var result = pst.executeUpdate();
            onSuccess(result, "updateName was successful");
        } catch (error) {
            onError(error);
        } finally {
            if (pst) pst.close();
            if (con) con.close();
        }
    };

    DB.prototype.deleteTask = function (task, onSuccess, onError) {
        var query = "DELETE from tbl_todos where task = ?";
        var con, pst;
        try {
            con = this.ds.getConnection();
            pst = con.prepareStatement(query);
            pst.setString(1, task);
            var result = pst.executeUpdate();
            onSuccess(result, "deleteTask was successful");
        } catch (error) {
            onError(error);
        } finally {
            if (pst) pst.close();
            if (con) con.close();
        }
    };

    DB.prototype.retrieveTask = function (name, onSuccess, onError) {
        var query = "SELECT * from tbl_todos where task = ?";
        var con, pst;
        try {
            con = this.ds.getConnection();
            pst = con.prepareStatement(query);
            pst.setString(1, name);
            var rs = pst.executeQuery();
            if (rs.next()) {
                var task = {};
                task.completed = rs.getBoolean("completed");
                task.name = rs.getString("task");
                task.created = rs.getDate("date_created");
                onSuccess(task, "retrieveTask was successful");
            } else {
                onSuccess({}, "no task found");
            }
        } catch (error) {
            onError(error);
        } finally {
            if (pst) pst.close();
            if (con) con.close();
        }
    };

    DB.prototype.retrieveByRange = function (start, size, onSuccess, onError) {
        var query = "SELECT * from tbl_todos limit ? offset ?";
        var con, pst;
        try {
            con = this.ds.getConnection();
            pst = con.prepareStatement(query);
            pst.setInt(1, size);
            pst.setInt(2, start);
            var rs = pst.executeQuery();
            var result = [];
            while (rs.next()) {
                var task = {};
                task.completed = rs.getBoolean("completed");
                task.name = rs.getString("task");
                task.created = rs.getDate("date_created");
                result.push(task);
            }
            onSuccess(result, "retrieveByRange was successful");
        } catch (error) {
            onError(error);
        } finally {
            if (pst) pst.close();
            if (con) con.close();
        }
    };

    DB.prototype.retrieveByDone = function (completed, onSuccess, onError) {
        var query = "SELECT * from tbl_todos where completed = ?";
        var con, pst;
        try {
            con = this.ds.getConnection();
            pst = con.prepareStatement(query);
            pst.setBoolean(1, completed);
            var rs = pst.executeQuery();
            var result = [];
            while (rs.next()) {
                var task = {};
                task.completed = rs.getBoolean("completed");
                task.name = rs.getString("task");
                task.created = rs.getDate("date_created");
                result.push(task);
            }
            onSuccess(result, "retrieveByDone was successful");
        } catch (error) {
            onError(error);
        } finally {
            if (pst) pst.close();
            if (con) con.close();
        }
    };

    //export DB through 'dao' 
    dao.DB = DB;

    if (load) {
        function onCreate(msg) {
            print(msg);
        }

        //init database and insert data
        var db = new dao.DB();
        db.initDS();

        var data = [
            "merge into tbl_todos (task, completed) key(task) values ('buy milk', false);",
            "merge into tbl_todos (task, completed) key(task) values ('work out', true);",
            "merge into tbl_todos (task, completed) key(task) values ('watch game', false);",
            "merge into tbl_todos (task, completed) key(task) values ('hit gym', false);",
            "merge into tbl_todos (task, completed) key(task) values ('go to meeting', true);"
        ];

        db.createTable([
            "CREATE TABLE IF NOT EXISTS tbl_todos (",
            "  task varchar(25) NOT NULL,",
            "  completed boolean DEFAULT false,",
            "  date_created datetime default current_timestamp,",
            "  PRIMARY KEY (task)",
            ")"
        ].join(""), onCreate, onCreate);

        db.insertBatch(data, (res, msg) => {
            db.closeDS();
            print("res=" + res + ", msg=" + msg);
        }, (error) => print(error));

        let Date = Java.type('java.util.Date');
        print("data loaded".concat(" @ ").concat(new Date().toString()));
    }
})(dao, true);