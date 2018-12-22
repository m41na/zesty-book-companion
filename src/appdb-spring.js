let dao = {};

(function(dao, load){
    
    let DataSource = Java.type('org.apache.commons.dbcp2.BasicDataSource');
    let TransactionDefinition = Java.type('org.springframework.transaction.support.DefaultTransactionDefinition');
    let TransactionManager = Java.type('org.springframework.jdbc.datasource.DataSourceTransactionManager');
    let NamedJdbcTemplate = Java.type('org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate');
    let BatchStatement = Java.type('org.springframework.jdbc.core.BatchPreparedStatementSetter');
    let ResultSetExtractor = Java.type('org.springframework.jdbc.core.ResultSetExtractor');
    let RowMapper = Java.type('org.springframework.jdbc.core.RowMapper');

    let DB = function(params){
        this.config = {
            "jdbc.driverClass": params && params['driverClass'] || "org.h2.Driver",
            "jdbc.url":         params && params['url'] || "jdbc:h2:./data/todos.spring.js_db;DB_CLOSE_DELAY=-1",
            "jdbc.username":    params && params['username'] || "sa",
            "jdbc.password":    params && params['password'] || "sa"
        };
        //define instance variables
        this.ds = undefined;
        this.tx = undefined;
        this.tpl = undefined;
    };

    DB.prototype.initDS = function(){
        this.createDS();
        this.tx = new TransactionManager(this.ds);
        this.tpl = new NamedJdbcTemplate(this.ds);
    };

    DB.prototype.createDS = function(){
        let dataSource = new DataSource();
        dataSource.setDriverClassName(this.config["jdbc.driverClass"]);
        dataSource.setUrl(this.config["jdbc.url"]);
        dataSource.setUsername(this.config["jdbc.username"]);
        dataSource.setPassword(this.config["jdbc.password"]);
        dataSource.setDefaultAutoCommit(false);
        this.ds = dataSource;
    };

    DB.prototype.closeDS = function(){
        this.ds.close();
    };

    DB.prototype.getTemplate = function(){
        return this.tpl;
    };

    DB.prototype.startTransaction = function(){
        let definition = new TransactionDefinition();
        definition.setName("TodoTransction");
        definition.setPropagationBehavior(arguments && arguments[0] || 0);
        definition.setIsolationLevel(arguments && arguments[1] || 1);
        return this.tx.getTransaction(definition);
    };

    DB.prototype.commitTransaction = function(status){
        this.tx.commit(status);
    };

    DB.prototype.rollbackTransaction = function(status){
        this.tx.rollback(status);
    };

    DB.prototype.createTable = function(sql, onSuccess, onError){
        let jdbc = this.getTemplate().getJdbcTemplate();
        let status = this.startTransaction();
        try {
            jdbc.execute(sql);
        } catch (err) {
            this.rollbackTransaction(status);
            onError(err);
            return;
        }
        this.commitTransaction(status);
        onSuccess("createTable was successful");
    };

    DB.prototype.insertBatch = function(tasks, onSuccess, onError) {
        var sql = "merge into tbl_todos (task, completed) key(task) values (?, false)";
        let jdbc = this.getTemplate();
        let status = this.startTransaction();
        let result;
        try {
            result = jdbc.getJdbcTemplate().batchUpdate(sql, new BatchStatement( {
                setValues = function(ps, index){
                    ps.setString(1, tasks[index]);
                },
                getBatchSize = function(){
                    return tasks.length;
                }
            }));
        } catch (err)  {
            this.rollbackTransaction(status);
            onError(err);
            return;
        }
        this.commitTransaction(status);
        onSuccess(result, "insertBatch was successful");
    };

    DB.prototype.truncateTable = function(onSuccess, onError){
        let sql = "TRUNCATE table tbl_todos";
        let jdbc = this.getTemplate();
        let status = this.startTransaction(); 
        let result;
        try {
            result = jdbc.getJdbcTemplate().update(sql);
        } catch (err) {
            this.rollbackTransaction(status);
            onError(err);
            return;
        }
        this.commitTransaction(status);
        onSuccess(result, "truncateTable was successful");
    };

    DB.prototype.createTask = function(task, onSuccess, onError) {
        let sql = "INSERT INTO tbl_todos (task) values (:task)";
        let params = {task};            
        let jdbc = this.getTemplate();
        let status = this.startTransaction();
        let result;
        try {
            result = jdbc.update(sql, params);
        } catch (err) {
            this.rollbackTransaction(status);
            onError(err);
            return;
        }
        this.commitTransaction(status);
        onSuccess(result, "createTask was successful");
    };

    DB.prototype.updateDone = function(task, done, onSuccess, onError) {
        let sql = "UPDATE tbl_todos set completed=:done where task = :task";
        let params = {task, done};
        let jdbc = this.getTemplate();
        let status = this.startTransaction();
        let result;
        try {
            result = jdbc.update(sql, params);
        } catch (err) {
            this.rollbackTransaction(status);
            onError(err);
            return;
        }
        this.commitTransaction(status);
        onSuccess(result, "updated completed status");
    };

    DB.prototype.updateName = function(task, newName, onSuccess, onError) {
        let sql = "UPDATE tbl_todos set task=:newName where task = :task";
        let params = {task, newName};    
        let jdbc = this.getTemplate();
        let status = this.startTransaction();
        let result;
        try {
            result = jdbc.update(sql, params);
        } catch (err) {
            this.rollbackTransaction(status);
            onError(err);
            return;
        }
        this.commitTransaction(status);
        onSuccess(result, "updateName was successful");
    };

    DB.prototype.deleteTask = function(task, onSuccess, onError) {
        let sql = "DELETE from tbl_todos where task = :task";
        let params = {task};    
        let jdbc = this.getTemplate();
        let status = this.startTransaction();
        let result;
        try {
            result = jdbc.update(sql, params);
        } catch (err) {
            this.rollbackTransaction(status);
            onError(err);
            return;
        }
        this.commitTransaction(status);
        onSuccess(result, "deleteTask was successful");
    };

    DB.prototype.retrieveTask = function(name, onSuccess, onError) {
        let sql = "SELECT * from tbl_todos where task = :name";
        let params = {name};        
        let jdbc = this.getTemplate();
        let status = this.startTransaction(1); 
        let task;
        try {
            task = jdbc.query(sql, params, new ResultSetExtractor({            
                extractData = function(rs) {
                    if (rs.next()) {
                        let task = {};
                        task.completed = rs.getBoolean("completed");
                        task.name = rs.getString("task");
                        task.created = rs.getDate("date_created");
                        print("retrieveTask was successful ", task);
                        return task;
                    } else {
                        return null;
                    }
                }            	
            }));
                    
        } catch (err) {
            this.rollbackTransaction(status);
            onError(err);
            return;
        }
        this.commitTransaction(status);
        onSuccess(task, "retrieveTask was successful");
    };

    DB.prototype.retrieveByRange = function(start, size, onSuccess, onError) {
        let sql = "SELECT * from tbl_todos limit :size offset :start";
        let params = {start, size};    
        let jdbc = this.getTemplate();
        let status  = this.startTransaction(1); 
        let result = [];
        try {
            result = jdbc.query(sql, params, new RowMapper({
                mapRow = function(rs, rowNum) {
                    let task = {};
                    task.completed = rs.getBoolean("completed");
                    task.name = rs.getString("task");
                    task.created = rs.getDate("date_created");
                    return task;
                }            	
            }));
        } catch (err) {
            this.rollbackTransaction(status);
            onError(err);
            return;
        }
        this.commitTransaction(status);
        onSuccess(result, "retrieveByRange was successful");
    };

    DB.prototype.retrieveByDone = function(completed, onSuccess, onError) {
        let sql = "SELECT * from tbl_todos where completed = :completed";
        let params = {completed};    
        let jdbc = this.getTemplate();
        let status  = this.startTransaction(1); 
        let result = [];
        try {
            result = jdbc.query(sql, params, new RowMapper({
                mapRow = function(rs, rowNum){
                    let task = {};
                    task.completed = rs.getBoolean("completed");
                    task.name = rs.getString("task");
                    task.created = rs.getDate("date_created");
                    return task;
                }            	
            }));
        } catch (err) {
            this.rollbackTransaction(status);
            onError(err);
            return;
        }
        this.commitTransaction(status);
        onSuccess(result, "retrieveTasks was successful");
    };

    //export DB through 'dao' 
    dao.DB = DB;

    if(load){
        let onError = msg => print(msg);
        let onSuccess = msg => print(msg);    
        //init database and insert data
        var db = new dao.DB();
        db.initDS();        
        db.createTable([
            "CREATE TABLE IF NOT EXISTS tbl_todos (",
            "  task varchar(125) UNIQUE NOT NULL,",
            "  completed boolean DEFAULT false,",
            "  date_created datetime default current_timestamp,",
            "  PRIMARY KEY (task)",
            ")"
        ].join(" "), onSuccess, onError);
    
        let data = ['buy milk', 'work out', 'watch game', 'hit gym', 'go to meeting'];
        db.insertBatch(data, (res, msg)=>print("res=" + res + ", msg=" + msg), onError);

        let Date = Java.type('java.util.Date');
        print("load operation completed".concat(" @ ").concat(new Date().toString()));
    }
})(dao, true);