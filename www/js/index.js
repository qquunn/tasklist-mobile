var taskStates = {
    finished: 'FINISHED',
    todo: 'TODO'
};

// Task表
var TaskFields = {
    id : "id",
    state : 'state',
    createTime : 'createTime',
    finishedTime : 'finishedTime',
    taskDesc : 'taskDesc'
};

var paths = {
    TASK_LIST: '/taskList',
    CREATE_TASK: '/createTask',
    VIEW_TASK: '/viewTask'
};

var tasksCache = jsc.createObjectArray([]);
var dataPersistService = {};

dataPersistService.initData = function (callback) {
    this._db = window.openDatabase("tasklist", "1.0", "tasklist", 1000000);

    this._db.transaction(function (context) {
        context.executeSql('CREATE TABLE IF NOT EXISTS Task (id unique, state VARCHAR(20), taskDesc TEXT, createTime INTEGER, finishedTime INTEGER)');
    });

    this._db.transaction(function (context) {
        context.executeSql('SELECT * FROM Task order by state desc, createTime desc', [], function (context, results) {
            var tasks = [];

            var len = results.rows.length, i;
            for (i = 0; i < len; i++) {
                // 不拷贝的话,safari浏览器会有问题
                tasks.push(jsc.copyTo(results.rows.item(i), {}));
            }

            tasksCache = jsc.createObjectArray(tasks);
            callback();

        });
    });

};

dataPersistService.getTasks = function (callback) {
    callback(tasksCache.data());
};

dataPersistService.createTask = function (callback, formData) {
    formData.id = dataPersistService._createTaskId();
    formData.state = taskStates.todo;
    formData.createTime = jsc.date.toIntegerYMD_HMS(new Date());
    formData.finishedTime = null;

    this._db.transaction(function (context) {
        context.executeSql("insert into Task(id, state, taskDesc, createTime, finishedTime) values(?,?,?,?,?)", [formData.id, formData.state, formData.taskDesc, formData.createTime, formData.finishedTime]);
    });

    tasksCache.insertHead(formData);
    callback(formData);
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
        context.executeSql("update Task set state = ?, finishedTime = ? where id = ?", [taskStates.finished, finishedTime, taskId], function(){
            tasksCache.find({
                id: taskId
            }).update({
                finishedTime : finishedTime,
                state: taskStates.finished
            });

            callback();
        });
    });
};

dataPersistService._createTaskId = function () {
    return new Date().getTime() + "_" + jsc.nextId();
};

var TaskListComponent = Vue.extend({
    template: '#taskListFragement',
    data: function () {
        return {
            tasks: tasksCache.data()
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

var App = Vue.extend({
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


// 预加载数据
dataPersistService.initData(function () {
    router.start(App, '#page');
    router.go(paths.TASK_LIST);
});
