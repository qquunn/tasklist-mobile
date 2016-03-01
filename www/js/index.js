var taskStates = {
    finished: 'FINISHED',
    todo: 'TODO'
};

// Task表
var TaskFields = {
    id : "id",
    state : 'state',
    modifiedTime : 'modifiedTime',
    createTime : 'createTime',
    finishedTime : 'finishedTime',
    taskDesc : 'taskDesc'
};

var taskMethods = {};
taskMethods.createTask = function(task){
    task.id = taskMethods._createTaskId();
    task.state = taskStates.todo;
    task.createTime = jsc.date.toIntegerYMD_HMS(new Date());
    task.finishedTime = null;
    task.modifiedTime = task.createTime;
};

taskMethods.finishTask = function(task, finishedTime){
    task.modifiedTime = task.finishedTime;
    task.finishedTime = finishedTime;
    task.state = taskStates.finished;
};

taskMethods._createTaskId = function () {
    return new Date().getTime() + "_" + jsc.nextId();
};

var paths = {
    TASK_LIST: '/taskList',
    CREATE_TASK: '/createTask',
    VIEW_TASK: '/viewTask'
};

var tasksCache = jsc.createObjectArray([]);
var taskListCached = false;

tasksCache.resort = function(){
    var tasksSortFunction = function(o, o2){
        var v1 = jsc.compareString(o.state, o2.state);
        v1 = - v1;
        if(v1 == 0){
            var v2 = o.modifiedTime - o2.modifiedTime;
            v2 = - v2;

            return v2;
        }else {
            return v1;
        }
    };

    tasksCache.applySort(tasksSortFunction);
};

var dataPersistService = {};

dataPersistService.initData = function (callback) {
    this._db = window.openDatabase("tasklist", "1.0", "tasklist", 1024 * 1024);

    this._db.transaction(function (context) {
        context.executeSql('CREATE TABLE IF NOT EXISTS Task (id unique, state VARCHAR(20), taskDesc TEXT, modifiedTime INTEGER, createTime INTEGER, finishedTime INTEGER)', [], function(){
            callback();
        });
    });
};

dataPersistService.getMoreTasks = function(offset, limit, callback){
    this._db.transaction(function (context) {
        context.executeSql('SELECT * FROM Task order by state desc, modifiedTime desc limit ?,?', [offset, limit], function (context, results) {
            var tasks = [];

            var len = results.rows.length, i;
            for (i = 0; i < len; i++) {
                // 不拷贝的话,safari浏览器会有问题
                tasks.push(jsc.copyTo(results.rows.item(i), {}));
            }

            tasksCache.insertAll(tasks);
            taskListCached = true;

            callback(tasks);
        });
    });
};

dataPersistService.getTasks = function (limit, callback) {
    if(taskListCached){
        callback(tasksCache.data());
        return ;
    }else {
        this._db.transaction(function (context) {
            context.executeSql('SELECT * FROM Task order by state desc, modifiedTime desc limit 0,?', [limit], function (context, results) {
                var tasks = [];

                var len = results.rows.length, i;
                for (i = 0; i < len; i++) {
                    // 不拷贝的话,safari浏览器会有问题
                    tasks.push(jsc.copyTo(results.rows.item(i), {}));
                }

                tasksCache.insertAll(tasks);

                taskListCached = true;
                callback(tasks);
            });
        });
    }
};

dataPersistService.createTask = function (callback, formData) {
    taskMethods.createTask(formData);

    this._db.transaction(function (context) {
        context.executeSql("insert into Task(id, state, taskDesc, createTime, finishedTime, modifiedTime) values(?,?,?,?,?, ?)",
            [formData.id, formData.state, formData.taskDesc, formData.createTime, formData.finishedTime, formData.modifiedTime], function(){

            tasksCache.insertHead(formData);
            tasksCache.resort();

            callback(formData);

        }, function(e, e2){
			jsc.log("insert task失败" + e2.code + "," + e2.message);
		});
    });
};

dataPersistService.getTask = function (taskId, callback) {
    var task = tasksCache.find({
        id: taskId
    }).getRecordData(0);

    if(callback){
        callback(task);
    }
};

dataPersistService.deleteTask = function (taskId, callback) {
    this._db.transaction(function (context) {
        context.executeSql("delete from Task where id = ?", [taskId], function(){
            tasksCache.remove({
                id: taskId
            });

            callback();
        });
    });
};

dataPersistService.finishTask = function (taskId, callback) {
    this._db.transaction(function (context) {
        var finishedTime = jsc.date.toIntegerYMD_HMS(new Date());
        var modifiedTime = finishedTime;
        context.executeSql("update Task set state = ?, finishedTime = ?, modifiedTime = ? where id = ?", [taskStates.finished, finishedTime, modifiedTime, taskId], function(){
            tasksCache.find({
                id: taskId
            }).update({
                state: taskStates.finished,
                modifiedTime: modifiedTime,
                finishedTime: finishedTime
            });

            tasksCache.resort();

            callback();
        });
    });
};

var taskCountPerPage = 10;

var TaskListComponent = Vue.extend({
    template: '#taskListFragement',
    data: function () {
        return {
			showMoreVisible : false,
            tasks: []
        }
    },

    route : {
        data: function (transition) {
            dataPersistService.getTasks(taskCountPerPage, function(data){
				var showMoreVisible = data.length == taskCountPerPage;				
			
                transition.next({
                    tasks : data,
					showMoreVisible : showMoreVisible
                });
            });
        }
    },

    methods: {
        onTaskItemClick: function (e) {
            var $ele = $(e.target);
            var data = $ele.attr("data");
            var taskId = $ele.attr("data-task-id");
            if (!taskId) {
                taskId = $ele.parent().attr("data-task-id");
            }
            jsc.log("点击任务,taskId=" + taskId);
            if (data == 'finishButton') {
                this.finishTask(taskId);
            } else {
                this.viewTask(taskId);
            }
        },

        onShowMore : function(e){
            var currentCount = tasksCache.size();
            var self = this;
            dataPersistService.getMoreTasks(currentCount, taskCountPerPage, function(data){
                var result = [];
                jsc.array.addAll(result, self._data.tasks);
                jsc.array.addAll(result, data);
                self._data.tasks = result;

                if(data.length < taskCountPerPage){
                    $(e.target).hide();
                }
            });
        },

        viewTask: function (taskId) {
            router.go(paths.VIEW_TASK + "?id=" + taskId);
        },

        finishTask: function (taskId) {
            dataPersistService.finishTask(taskId, function (data) {
                router.go(paths.TASK_LIST);
            });
        }

    }
});

var CreateTaskComponent = Vue.extend({
    template: '#createTaskFragement',
    methods: {
        onSubmit: function (e) {
            var formData = {};
            formData.taskDesc = $("#taskDesc").val();

            dataPersistService.createTask(function (data) {
                router.go(paths.TASK_LIST);
            }, formData);

            e.preventDefault();
        }
    }
});

var ViewTaskComponent = Vue.extend({
    template: '#viewTaskFragement',
    data: function () {
        var taskId = this.$route.query.id;
        jsc.log("查看任务,taskId=" + taskId);
        return {
            id : "",
            taskDesc : ""
        };
    },
    route : {
        data: function (transition) {
            dataPersistService.getTask(transition.to.query.id, function(task){
                transition.next(task);
            });
        }
    },
    methods: {
        onSubmit: function () {
            var formData = {};
            formData.taskDesc = $("#taskDesc").val();

            dataPersistService.createTask(function (data) {
                router.go(paths.TASK_LIST);
            }, formData);

            return false;
        },
        onFinishTask : function(e){
            var taskId = $(e.target).attr("data-task-id");
            dataPersistService.finishTask(taskId, function (data) {
                router.go(paths.TASK_LIST);
            });
        },

        onDeleteTask : function(e){
            var taskId = $(e.target).attr("data-task-id");
            dataPersistService.deleteTask(taskId, function (data) {
                router.go(paths.TASK_LIST);
            });
        }

    }
});

var router = new VueRouter();
var routerMap = {};

routerMap[paths.TASK_LIST] = {
    component: TaskListComponent
};

routerMap[paths.CREATE_TASK] = {
    component: CreateTaskComponent
};

routerMap[paths.VIEW_TASK] = {
    component: ViewTaskComponent
};

router.map(routerMap);

var App = Vue.extend({
});

// 预加载数据
dataPersistService.initData(function () {
    router.start(App, '#page');
    router.replace(paths.TASK_LIST);
});
