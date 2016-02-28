var taskStates = {
    finished: 'FINISHED',
    todo: 'TODO'
};

var paths = {
    TASK_LIST: '/taskList',
    CREATE_TASK: '/createTask',
    VIEW_TASK: '/viewTask'
};

var tasksCache = null;
var dataPersistService = {};
dataPersistService.initData = function(callback){
    tasksCache = tasksCache = jsc.createObjectArray([]);
    callback();
};

dataPersistService.getTasks = function (callback) {
    callback(tasksCache.data());
};

dataPersistService.createTask = function (callback, formData) {
    formData.id = dataPersistService._createTaskId();
    formData.state = taskStates.todo;
    formData.createTime = new Date();

    tasksCache.insertHead(formData);
    callback(formData);
};

dataPersistService.getTask = function (taskId, callback) {
    var task = tasksCache.find({
        id: taskId
    }).getRecordData(0);

    callback(task);
};

dataPersistService.deleteTask = function (taskId, callback) {
    tasksCache.remove({
        id: taskId
    });

    callback();
};

dataPersistService.finishTask = function (taskId, callback) {
    tasksCache.find({
       id : taskId
    }).update({
        state : taskStates.finished
    });

    callback();
};

dataPersistService._createTaskId = function () {
    return new Date().getTime() + "_" + jsc.nextId();
};

var taskListPage = {};
taskListPage.renderHtml = function (parentId) {
    dataPersistService.getTasks(function (tasks) {
        var html = template('taskListFragement', {
            tasks: tasks
        });
        $("#" + parentId).html(html);

        $("#createTask").bind('click', function(){
            route.go(paths.CREATE_TASK);
        });
    });
};

taskListPage.onTaskItemClick = function (e, taskId) {
    var data = $(e.target).attr("data");
    if (data == 'finishButton') {
        taskListPage.finishTask(taskId);
    } else {
        taskListPage.viewTask(taskId);
    }
};

taskListPage.finishTask = function (taskId, toTaskList) {
    dataPersistService.finishTask(taskId, function (data) {
        route.go(paths.TASK_LIST);
    });
};

taskListPage.viewTask = function (taskId) {
    route.go(paths.VIEW_TASK + "?id=" + taskId);
};

var createTaskPage = {};
createTaskPage.renderHtml = function (parentId) {
    var html = template('createTaskFragement', {});
    $("#" + parentId).html(html);

    $("#save").bind('click', function(){
        createTaskPage.onSubmit();
    });
};

createTaskPage.onSubmit = function () {
    var formData = {};
    formData.taskDesc = $("#taskDesc").val();

    dataPersistService.createTask(function (data) {
        route.go(paths.TASK_LIST);
    }, formData);
};

var viewTaskPage = {};
viewTaskPage.renderHtml = function (parentId, context) {
    var taskId = context.getParamValue("id");
    dataPersistService.getTask(taskId, function (data) {
        var html = template('viewTaskFragement', data);
        $("#" + parentId).html(html);
    });
};

viewTaskPage.finishTask = function (taskId) {
    dataPersistService.finishTask(taskId, function (data) {
        route.go(paths.TASK_LIST);
    });
};

viewTaskPage.deleteTask = function (taskId) {
    dataPersistService.deleteTask(taskId, function () {
        route.go(paths.TASK_LIST);
    });
};

var route = jsc.createRoute();
route.map(paths.TASK_LIST, taskListPage);
route.map(paths.CREATE_TASK, createTaskPage);
route.map(paths.VIEW_TASK, viewTaskPage);

// 预加载数据
dataPersistService.initData(function () {
    route.start(paths.TASK_LIST, "page");
});
