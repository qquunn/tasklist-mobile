'use strict';

(function(){

    var Route = function () {
        this._routeMap = {};
        this._eleId = "";
    };

    Route.prototype.map = function (path, obj) {
        if(jsc.isString(path)){
            this._routeMap[path] = obj;
        }else {
            jsc.copyTo(path, this._routeMap);
        }
    };

    Route.prototype.start = function(url, eleId){
        this._eleId = eleId;
        this.go(url);
    };

    Route.prototype.go = function(url){
        jsc.log("go url=" + url);
        var strings = url.split('?');
        var path = strings[0];
        var obj = this._routeMap[path];

        var context = this._createContext(url);
        obj.renderHtml(this._eleId, context);
    };

    Route.prototype._createContext = function(url){
        var context = {};
        context.url = url;

        context.getParamValue = function(paramName){
            if(! this._flqURL){
                 this._flqURL = new FLQ.URL(this.url);
            }

            return this._flqURL.args[paramName];
        };
        return context;
    };

    jsc.createRoute = function(){
        return new Route();
    };

})();

(function (_jsc) {

    _jsc.asyncRequest = function (url) {
        jsc.postJsonData(url, function (ajaxMessage) {
            if (ajaxMessage.success) {
                if (ajaxMessage.successUrl == "RELOAD") {
                    window.location.reload();
                }
            } else {
                jsc.showErrorMessage(ajaxMessage.message || "操作失败");
            }
        });
    };

    _jsc.nextComponentId = function (compType) {
        return compType + "_js_auto_comp_" + _jsc.nextId();
    };

    _jsc.getComponent = function (elementId) {
        var $element = null;
        if (_jsc.isString(elementId)) {
            $element = $("#" + elementId);
        } else {
            $element = elementId;
        }

        return $element.data("ui-component");

    };

    _jsc.getInputValueByName = function (name, context) {
        return jsc.byName(name, context).val();
    };

    _jsc.byName = function (name, context) {
        if (context && context.size() > 0) {
            return context.find("input[name=" + name + "]");
        } else {
            return $("input[name=" + name + "]");
        }
    };

    _jsc.setInputValueByName = function (name, value, context) {
        jsc.byName(name, context).val(value);
    };

    _jsc.bindPropertyTableAndTextarea = function (config) {
        var tableId = config.tableId;
        var addButtonId = config.addButtonId;

        var inputTemplate = function (cellValue, rowData) {
            return jsc.string.formatByNumber('<input value="{0}" class="form-control" onblur="window.jsc.updatePropertyTableCellValue(this, \'{1}\')" />', cellValue, tableId);
        };

        var operationTemplate = function (cellValue, rowData) {
            return jsc.string.formatByNumber('<button class="btn btn-primary" onclick="window.jsc.deleteTableRow(this, \'{0}\')" >删除</button>', tableId);
        };

        var columns = [
            {"columnName": "name", "displayName": "属性名", width: 100,
                template: inputTemplate
            },
            {"columnName": "value", "displayName": "属性值", width: 100,
                template: inputTemplate
            }
        ];

        if (!config.readOnly) {
            columns.push({
                columnName: "operation",
                displayName: "操作",
                width: 80,
                template: operationTemplate
            });
        }

        var table = this.createTable(tableId, {
            "columns": columns,
            "data": config.data ? config.data() : [],
            dataChangedListener: config.dataChangedListener
        });

        $("#" + addButtonId).click(function () {
            table.addRow({});
        });

    };

    _jsc.createButtonGroup = function (buttonGroupId, buttonGroupData) {
        var bg = new _jsc.ButtonGroup(buttonGroupData);
        bg.renderTo(buttonGroupId);
        return bg;
    };

    _jsc.createList = function (listId, url, template) {
        this.getJsonData(url, function (ajaxMessage) {
            if (ajaxMessage.success) {
                var data = ajaxMessage.data;
                if (data && data.length > 0) {
                    var html = "";
                    jsc.each(data, function (item) {
                        html += "<div>" + (template ? jsc.string.format(template, item) : item) +
                            "</div>"
                    });
                    $("#" + listId).html(html);
                } else {
                    $("#" + listId).html("没有数据");
                }
            } else {
                $("#" + listId).html("加载数据失败");
            }
        });
    };

    _jsc.createTable = function (tableId, tableData, clearTable) {
        if (clearTable) {
            $("#" + tableId).empty();
        }

        if (tableData.fullTable) {
            tableData.tableClass = 'full';
        }
        var table = new _jsc.Table(tableData);
        table.renderTo(tableId);
        return table;
    };

    _jsc.getTable = function (tableId) {
        return $("#" + tableId).data("ui-component");
    };

    _jsc.getForm = function (formId) {
        return $("#" + formId).data("ui-component");
    };

    _jsc.updateElements = function (elementConfig) {
        _jsc.each(elementConfig, function (p, v) {
            var $element = $("#" + p);
            if ($element.size() > 0) {
                var tagName = $element[0].tagName.toLowerCase();
                if (tagName == 'table') {
                    _jsc.createTable(p, v);
                } else {
                    $element.html(v);
                }
            }
        });
    };

    /**
     * @typedef {Object} TableData
     * @property {Object} paging
     */

    /**
     * 创建列表页面
     * @method createListPage
     * @param {String} divId
     * @param {Object} listPageData
     * @param {TableData} listPageData.table
     * @param {Object} listPageData.searchForm
     */
    _jsc.createListPage = function (divId, listPageData) {

        var pagingData = listPageData.table.paging;
        var htmlElements = listPageData.htmlElements;

        var ifCreatePaging = pagingData && pagingData.pages > 1;
        var ifCreateTopbar = htmlElements && htmlElements.length > 0;

        var formId = _jsc.nextComponentId("form");
        var tableId = _jsc.nextComponentId("table");
        var pagingId = _jsc.nextComponentId("paging");
        var tbarId = _jsc.nextComponentId("tbar");

        var form = '<div class="row"><form id="' + formId + '"></form></div>';
        var table = '<div class="row"><table class="full listpage-table" id="' + tableId + '"></table></div>';
        var tbar = ifCreateTopbar ? '<div class="row" id="' + tbarId + '"></div>' : "";
        var paging = ifCreatePaging ? '<div class="row" id="' + pagingId + '"></div>' : "";

        $("#" + divId).html(form + tbar + table + paging);

        listPageData.searchForm.className = "listpage-searchform";
        var formComp = this.createForm(formId, listPageData.searchForm);
        this.createTable(tableId, listPageData.table);


        if (ifCreatePaging) {
            createPaging(pagingId, pagingData);
        }

        if (ifCreateTopbar) {
            createTopbar(tbarId, htmlElements);
        }

        function createTopbar(tbarId, htmlElements) {
            var $topbar = $("#" + tbarId);

            _jsc.each(htmlElements, function (htmlElement) {
                if (htmlElement.type == 'urlButton') {
                    $('<button onclick="location.href=\'' + htmlElement.url +
                        '\'">' + htmlElement.text +
                        '</button>').appendTo($topbar);
                }
            });
        }

        function createPaging(pagingId, pagingData) {
            laypage({
                cont: pagingId,
                pages: pagingData.pages,
                curr: pagingData.curr,
                first: false,
                last: false,
                jump: function (obj, first) {
                    if (!first) {
                        gotoPage(obj.curr);
                    }
                }
            });
        }

        /**
         * 跳转到某个页面,从1开始
         * @param index
         */
        function gotoPage(index) {
            formComp.submit({ add: {
                name: 'page',
                value: index
            }});
        }

    };

    _jsc.createForm = function (formId, formData) {
        var form = new _jsc.Form(formData);
        form.renderTo(formId);
        return form;
    };

    /**
     * 如果数据是字符串,则转换成对象
     * @method convertIfNotJSON
     * @param {*} ajaxMessage
     * @return {Object}
     */
    _jsc.convertIfNotJSON = function (ajaxMessage) {
        if (jsc.isString(ajaxMessage)) {
            try {
                return jQuery.evalJSON(ajaxMessage);
            } catch (e) {
                jsc.error("解析JSON出错,字符串为" + ajaxMessage);
            }
        }
        return ajaxMessage;
    };

    /**
     * 请求json格式的数据
     * @method getJsonData
     * @param {String} url
     * @param {Function} callback 回调函数
     */
    _jsc.getJsonData = function (url, callback) {
        // 通过ajax提交数据，最好采用POST方式。采用GET方式，中文会出现乱码。
        var requestConfig = {
            type: "GET",
            url: url,
            dataType: "json",
            success: function (ajaxMessage) {
                ajaxMessage = _jsc.convertIfNotJSON(ajaxMessage);
                callback(ajaxMessage);
            },
            error: function () {
                alert("获取数据失败,请重试");
            }
        };
        $.ajax(requestConfig);
    };

    /**
     * 请求json格式的数据
     * @method postJsonData
     * @param {String} url
     * @param {Function} callback 回调函数
     */
    _jsc.postJsonData = function (url, callback, data) {
        var requestConfig = {
            type: "POST",
            url: url,
            data: data,
            dataType: "json",
            success: function (ajaxMessage) {
                ajaxMessage = _jsc.convertIfNotJSON(ajaxMessage);
                jsc.log("post请求,url={0},data={1},返回结果{2}", url, _jsc.toJSONString(data), _jsc.toJSONString(ajaxMessage));
                callback(ajaxMessage);
            },
            error: function () {
                alert("获取数据失败,请重试");
            }
        };
        $.ajax(requestConfig);
    };

    _jsc.postForm = function ($form, callback) {
        if (!callback) {
            callback = function (ajaxMessage) {
                if (ajaxMessage.success) {
                    alert("操作成功");
                } else {
                    alert("操作失败");
                }
            };
        }

        var data = this.serializeFormData($form);
        this.postJsonData($form.attr("action"), callback, data);
    };

    _jsc.createSelect = function (selectId, url, template, sortByLabel, labelName, callback) {
        this.postJsonData(url, function (ajaxMessage) {
            if (ajaxMessage.success) {
                var data = ajaxMessage.data;

                if (sortByLabel) {
                    _jsc.array.sortByProperty(data, labelName);
                }

                var items = "";
                _jsc.each(data, function (item) {
                    items += _jsc.string.format(template, item);
                });

                $("#" + selectId).html(items);

                if (callback) {
                    callback();
                }
            }
        });
    };

    _jsc.setFieldValue = function (fieldName, fieldValue, $form) {
        $form = $form || $("form");

        var $input = $("[name=" + fieldName + "]", $form);
        if ($input.size() > 0) {
            var typeValue = $input.attr("type");
            if (typeValue == 'radio') {
                $input.each(function (i, radioDom) {
                    var $radio = $(radioDom);
                    var radioValue = $radio.val();
                    $radio.prop("checked", radioValue == fieldValue);
                });
            } else if (typeValue == 'checkbox') {
                $input.each(function (i, checkboxDom) {
                    var $checkbox = $(checkboxDom);
                    var checkboxValue = $checkbox.val();
                    $checkbox.prop("checked", contains(fieldValue, checkboxValue));
                });
            } else {
                $input.val(fieldValue);
            }
        }

        function contains(array, item) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] == item) {
                    return true;
                }
            }
            return false;
        }
    };

    _jsc.getFieldValue = function (fieldName, $form) {
        $form = $form || $("form");

        var value = null;

        var $input = $("[name=" + fieldName + "]", $form);
        if ($input.size() > 0) {
            var typeValue = $input.attr("type");
            if (typeValue == 'radio') {
                $input.each(function (i, radioDom) {
                    var $radio = $(radioDom);
                    if ($radio.prop("checked")) {
                        value = $radio.val();
                    }
                });
            } else if (typeValue == 'checkbox') {
                value = [];
                $input.each(function (i, checkboxDom) {
                    var $checkbox = $(checkboxDom);
                    if ($radio.prop("checked")) {
                        value.push($checkbox.val());
                    }
                });
            } else {
                value = $input.val();
            }
        }

        return value;
    };

    _jsc.initForm = function (fieldValues, $form) {
        for (var fieldName in fieldValues) {
            var fieldValue = fieldValues[fieldName];
            this.setFieldValue(fieldName, fieldValue, $form);
        }
    };

    _jsc.createChosen = function (selectId, options, value) {
        _jsc.createSelect.apply(this, arguments);
        $("#" + selectId).chosen();
    };

    _jsc.createMultiSelect = function (selectId, options, value) {
        _jsc.createSelect.apply(this, arguments);
        var $ele = $("#" + selectId);
        $ele.multiSelect({
            selectableHeader: "<input type='text' class='form-control' placeholder='待选择'>",
            selectionHeader: "<input type='text' class='form-control' placeholder='已选择'>",
            keepOrder: true,
            afterInit: function (ms) {
                var that = this,
                    $selectableSearch = that.$selectableUl.prev(),
                    $selectionSearch = that.$selectionUl.prev(),
                    selectableSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selectable:not(.ms-selected)',
                    selectionSearchString = '#' + that.$container.attr('id') + ' .ms-elem-selection.ms-selected';

                that.qs1 = $selectableSearch.on('keyup', function (e) {
                    //过滤逻辑
                    $(selectableSearchString).each(function (i1, e1) {
                        var $e1 = $(e1);
                        $e1.show();
                        if ($e1.find('span').text().indexOf($selectableSearch.val()) < 0) {
                            $e1.hide();
                        }
                    });
                    //方向键下
                    if (e.which === 40) {
                        that.$selectableUl.focus();
                        return false;
                    }

                });

                that.qs2 = $selectionSearch.on('keyup', function (e) {
                    //过滤逻辑
                    $(selectionSearchString).each(function (i2, e2) {
                        var $e2 = $(e2);
                        $e2.show();
                        if ($e2.find('span').text().indexOf($selectionSearch.val()) < 0) {
                            $e2.hide();
                        }
                    });
                    //方向键下
                    if (e.which == 40) {
                        that.$selectionUl.focus();
                        return false;
                    }
                });
            }
        });
    };

    _jsc.createOptionsHtml = function (options, value) {
        if (!options) {
            return "";
        }

        var html = "";
        for (var i = 0; i < options.length; i++) {
            var option = options[i];

            if (option.value == value) {
                html += jsc.string.format('<option value="{value}" selected>{label}</option>', options[i]);
            } else {
                html += jsc.string.format('<option value="{value}">{label}</option>', options[i]);
            }
        }

        return html;
    };

    _jsc.createHiddenFormatter = function (name) {
        return function (value, row, index) {
            var template = '<input type="hidden" value="{0}" name="{1}" /> {0}';
            return jsc.string.formatByNumber(template, value, name);
        };
    };

    _jsc.createInputFormatter = function (name) {
        return function (value, row, index) {
            var template = '<input value="{0}" name="{1}" />';
            return jsc.string.formatByNumber(template, value, name);
        };
    };

    _jsc.createSelectFormatter = function (name, optionDatas) {
        return function (value, row, index) {
            var optionHtml = _jsc.createOptionsHtml(optionDatas, value);
            var template = '<select name="{1}">{0}</select>';
            return jsc.string.formatByNumber(template, optionHtml, name);
        };
    };

    _jsc.getInputValues = function ($input) {
        var result = [];
        $input.each(function (i, dom) {
            result.push($(dom).val());
        });
        return result;
    };

    _jsc.getParamValue = function (url, name) {
        var reg = new RegExp('(\\?|&)' + name + '=([^&?]*)', 'i');
        var arr = url.match(reg);

        if (arr) {
            return arr[2];
        }

        return null;
    };

    _jsc.getValueFromFieldArray = function (array, name) {
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            if (item.name == name) {
                return item.value;
            }
        }
        return null;
    };

    _jsc.loadText = function (elementId, url) {
        _jsc.getJsonData(url, function (ajaxMessage) {
            if (ajaxMessage.success) {
                $("#" + elementId).text(ajaxMessage.data);
            }
        });
    };

})(jsc);

jsc.createPanelGroup = (function () {

    /**
     * @param {Object} config
     * @param {String[]} config.panels
     * @param {String} config.visiblePanel;
     * @constructor
     */
    var PanelGroup = function (config) {
        this._panels = config.panels;
        if (jsc.isEmpty(config.visiblePanel)) {
            this._visiblePanel = this._panels[0];
        } else {
            this._visiblePanel = config.visiblePanel;
        }
    };

    PanelGroup.prototype.init = function () {
        this._refresh();
    };

    PanelGroup.prototype._refresh = function () {
        for (var i = 0; i < this._panels.length; i++) {
            var panelId = this._panels[i];
            if (panelId === this._visiblePanel) {
                this._getPanel(panelId).show();
            } else {
                this._getPanel(panelId).hide();
            }
        }
    };

    PanelGroup.prototype.showPanel = function (panelId) {
        this._visiblePanel = panelId;
        this._refresh();
    };

    PanelGroup.prototype._getPanel = function (panelId) {
        return $("[data-panel-id=" + panelId +
            "]");
    };

    return function (config) {
        var panelGroup = new PanelGroup(config);
        panelGroup.init();
        return panelGroup;
    };

})();

jsc.executeRemoteOperation = function (url, successFunction, data) {

//    jsc.showWaiting("正在处理");
    jsc.postData(url, function (ajax) {
//        jsc.hideWaiting();
        if (ajax.success) {
            if (successFunction) {
                successFunction(ajax.data);
            }
        } else {
            alert("操作失败");
        }
    }, data);
};

jsc.queryData = function (url, successFunction, data) {

//    jsc.showWaiting("正在处理");
    jsc.postData(url, function (ajax) {
//        jsc.hideWaiting();
        if (ajax.success) {
            if (successFunction) {
                successFunction(ajax.data);
            }
        } else {
            alert("操作失败");
        }
    }, data);

};

(function () {

    var AdminRole = "A";
    var NormalRole = "N";

    if (!window.AppUtils) {
        window.AppUtils = {};
    }
    var AppUtils = window.AppUtils;

    AppUtils.logout = function () {
        jsc.getJsonData("logout", function (ajaxMessage) {
            if (ajaxMessage.success) {
                location.href = "login.html";
            }
        });
    };

    AppUtils.validateCurrentUserIsNotEmpty = function (successCallback) {
        jsc.getJsonData("getCurrentUser", function (ajaxMessage) {
            var existUser = false;
            if (ajaxMessage.success) {
                var data = ajaxMessage.data;
                if (data && data.username) {
                    $("#top-bar .username").html(data.username);
                    existUser = true;
                }
            }

            if (existUser) {
                if (successCallback) {
                    successCallback();
                }
            } else {
                jsc.log("还没有登录");
                AppUtils.showLoginPage();
            }
        });
    };

    AppUtils.validateCurrentUserIsAdmin = function (successCallback) {
        jsc.getJsonData("getCurrentUser", function (ajaxMessage) {
            var isAdmin = false;
            if (ajaxMessage.success) {
                var data = ajaxMessage.data;
                if (data && data.username) {
                    $("#top-bar .username").html(data.username);
                    if (data.role == AdminRole) {
                        isAdmin = true;
                    }
                }
            }

            if (isAdmin) {
                if (successCallback) {
                    successCallback();
                }
            } else {
                jsc.log("当前用户不是管理员");
                AppUtils.showLoginPage();
            }
        });
    };

    AppUtils.showLoginPage = function () {
        layer.open({
            type: 2,
            area: ['560px', '200px'],
            skin: 'layui-layer-rim',
            title: "登录",
            content: ['login.html?afterLogin=refreshParent', 'no']
        });
    };


})();

(function () {

    var jsc = window.jsc = window.jsc || {};

    var taskServerURLPrefix = "";

    var loadingMaskId = 'loading-mask';
    var loadingMaskHtml =
        '<div id="loading-mask">' +
        '    <div class="loading">' +
        '       <div class="loading-indicator">' +
        '           <img src="loading.gif" class="loading-img" /><br/>' +
        '           <span class="loading-msg"></span>' +
        '       </div>' +
        '   </div>' +
        '</div>';

    jsc.showWaiting = function () {
        if ($("#" + loadingMaskId).size() == 0) {
            var maskHeight = $(document).height() - 5;
            $("body").after(loadingMaskHtml);
        }
    };

    jsc.hideWaiting = function () {
        $("#" + loadingMaskId).remove();
    };

    jsc.getData = function (url, success, data) {
        jsc.log("执行请求{0},请求参数为{1}", url, JSON.stringify(data));
        // showWaiting
        $.ajax({
            url: taskServerURLPrefix + url,
            type: 'get',
            dataType: 'json',
            async: true,
            data: data,
            success: function (ajaxMessage) {
                if (ajaxMessage.success) {
                    if (success) {
                        success(ajaxMessage.data);
                    }
                } else {
                    alert("操作失败");
                }
            }
        });
    };

    jsc.postData = function (url, success, data) {
        jsc.log("执行请求{0},请求参数为{1}", url, JSON.stringify(data));
        jsc.showWaiting();
        $.ajax({
            url: taskServerURLPrefix + url,
            type: 'post',
            dataType: 'json',
            async: true,
            data: data,
            success: function (ajaxMessage) {
                jsc.hideWaiting();
                if (ajaxMessage.success) {
                    if (success) {
                        success(ajaxMessage.data);
                    }
                } else {
                    alert("操作失败");
                }
            }
        });
    };

    jsc.focus = function(id){
        // jq.mobi不支持focus函数
        $("#" + id)[0].focus();
    }
})();

