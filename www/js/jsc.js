'use strict';

/**
 * @namespace jsc
 */


/**
 * jsc基础类型判断, 基础操作
 */
(function(){

    var _jsc = window.jsc = window.jsc || {};

    var _toString = Object.prototype.toString;

    /**
     * each方法的回调函数
     * @callback eachArrayCallback
     * @param {*} item 数组元素
     * @param {Number} index 数组元素索引
     * @param {Array} array 遍历的数组
     */

    /**
     * each方法的回调函数
     * @callback eachObjectCallback
     * @param {String} propName 属性名称
     * @param {*} propValue 属性值
     * @param {Object} object 遍历的对象
     */

    /**
     * 迭代处理数组中的每个元素
     * @method each
     * @param {Array|Object} array 如果不是数组的话
     * @param {eachArrayCallback|eachObjectCallback} callback 回调函数
     */
    _jsc.each = function (array, callback) {
        if(jsc.isUndefinedOrNull(array)){
            return ;
        }

        if(this.isArray(array)){
            if (array && array.length > 0) {
                for (var i = 0, len = array.length; i < len; i++) {
                    if (callback(array[i], i, array) === false) {
                        return;
                    }
                }
            }
        }else {
            for(var p in array){
                if(array.hasOwnProperty(p)){
                    callback(p, array[p], array);
                }
            }
        }
    };

    /**
     * <p>判断值是否为空</p>
     * <p>下面的值，将判断为空<div><ul>
     * <li>null</li>
     * <li>undefined</li>
     * <li>空的数组</li>
     * <li>长度为0的字符串</li>
     * </ul></div>
     * @method isEmpty
     * @param {String|Array} v
     * @return {Boolean}
     */
    _jsc.isEmpty = function (v) {
        return v === null || v === undefined || ((_jsc.isArray(v) && !v.length)) || v === '';
    };

    /**
     * 判断值是否不为空，与isEmpty方法的值相反
     * @method isNotEmpty
     * @param {String|Array} v
     * @return {Boolean}
     */
    _jsc.isNotEmpty = function (v) {
        return !this.isEmpty.apply(this, arguments);
    };

    /**
     * 如果传递的参数为数组，则返回true，否则返回false。
     * @method isArray
     * @param {*} v
     * @return {Boolean}
     */
    _jsc.isArray = function (v) {
        return _toString.apply(v) === '[object Array]';
    };

    /**
     * 如果传递的参数为日期对象，则返回true，否则返回false。
     * @method isDate
     * @param {*} v
     * @return {Boolean}
     */
    _jsc.isDate = function (v) {
        return _toString.apply(v) === '[object Date]';
    };

    /**
     * 如果传递的参数为字符串，则返回true，否则返回false。
     * @method isString
     * @param {*} v
     * @return {Boolean}
     */
    _jsc.isString = function (v) {
        return typeof v === 'string';
    };

    /**
     * 如果传递的参数为布尔值，则返回true，否则返回false。
     * @method isBoolean
     * @param {*} v
     * @return {Boolean}
     */
    _jsc.isBoolean = function (v) {
        return typeof v === 'boolean';
    };

    /**
     * 如果传递的参数为数字,则返回true，否则返回false。
     * @param {*} v 判断该值是否是数字,并且不是无穷数
     * @return {Boolean}
     */
    _jsc.isNumber = function(v) {
        return typeof v === 'number';
    };

    /**
     * 如果传递的参数为函数对象，则返回true，否则返回false。
     * @method isFunction
     * @param {*} v
     * @return {Boolean}
     */
    _jsc.isFunction = function(v) {
        return _toString.apply(v) === '[object Function]';
    };

    /**
     * 判断一个变量有定义且不为null
     * @method  isDefinedAndNotNull
     * @param {*} o
     * @return {Boolean}
     */
    _jsc.isDefinedAndNotNull = function (o) {
        return !this.isUndefinedOrNull(o);
    };

    /**
     * 判断一个变量没定义或者为null
     * @method isUndefinedOrNull
     * @param {*} o
     * @return {Boolean}
     */
    _jsc.isUndefinedOrNull = function (o) {
        return this.isUndefined(o) || o == null;
    };

    /**
     * 判断一个变量是否没定义
     * @method  isUndefined
     * @param {*} o
     * @return {Boolean}
     */
    _jsc.isUndefined = function (o) {
        return !this.isDefined(o);
    };

    /**
     * 如果传递的参数为undefined，则返回true，否则返回false。
     * @method isDefined
     * @param {*} v
     * @return {Boolean}
     */
    _jsc.isDefined = function (v) {
        return typeof v !== 'undefined';
    };

    /**
     * 拷贝属性的值(不拷贝从原型继承的属性)
     * @param src
     * @param dest
     */
    _jsc.copyTo = function(src, dest){
        this.each(src, function(p,v){
            dest[p] = v;
        });
        return dest;
    };

    /**
     * 产生一个递增的id
     * @method nextId
     * @return {Number}
     */
    _jsc.nextId = (function () {
        var c = 0;
        return function () {
            return ++c;
        };
    })();

    /**
     * 合并URL和参数
     * @param url
     * @param param
     */
    _jsc.combineUrlParam = function(url, param){
        if(url.indexOf('?') == -1){
            return url + "?" + param;
        }else {
            return url + "&" + param;
        }
    };

})();

/**
 * 日志工具类
 */
(function () {

    var _jsc = window.jsc = window.jsc || {};

    var _console = window.console;

    var _logIf = function (msg) {
        if (_console && _console.log) {
            _console.log(msg);
        }
    };

    var _formatByNumber = function (stringTemplate) {
        if (arguments.length == 0) return "";
        var args = Array.prototype.slice.call(arguments, 1);
        return stringTemplate.replace(/\{(\d+)\}/g, function (m, i) {
            var val = args[i];
            if (val === undefined || val === null) {
                val = "";
            }
            return val;
        });
    };

    _jsc.debug = function () {
        var msg = _formatByNumber.apply(this, arguments);

        if (_console && _console.debug) {
            _console.debug(msg);
        } else {
            _logIf(msg);
        }
    };

    _jsc.log = function () {
        var msg = _formatByNumber.apply(this, arguments);

        _logIf(msg);
    };

    _jsc.warn = function () {
        var msg = _formatByNumber.apply(this, arguments);

        if (_console && _console.warn) {
            _console.warn(msg);
        } else {
            _logIf(msg);
        }
    };

    jsc.error = function () {
        var msg = _formatByNumber.apply(this, arguments);

        if (_console && _console.warn) {
            _console.error(msg);
        } else {
            _logIf(msg);
        }
    };

})();

/**
 * 数组操作工具类
 */
(function (jsc) {

    var _jsc_array = jsc.array = jsc.array || {};

    /**
     * 迭代处理数组中的每个元素
     * @method each
     * @param {Array} array 如果不是数组的话
     * @param {eachArrayCallback} callback 回调函数
     */
    _jsc_array.each = function (array, callback) {
        if (array && array.length > 0) {
            for (var i = 0, len = array.length; i < len; i++) {
                if (callback(array[i], i, array) === false) {
                    return;
                }
            }
        }
    };
	
	_jsc_array.map = function(array, callback){
        var result = [];
        this.each(array, function(item){
            result.push(callback(item));
        });
        return result;
    };

    /**
     * 将一个数组融合到目标数组中
     * 说明: 不使用concat方法，concat方法不会修改原数组。
     * @method  addAll
     * @param {Array} target 目标数组
     * @param {Array} array 数组
     * @return {Array}
     */
    _jsc_array.addAll = function (target, array) {
        _jsc_array.each(array, function (item) {
            _jsc_array.add(target, item);
        });
    };

    /**
     * 将目标数组中的某一部分对象移除
     * @method removeAll
     * @param {Array} target 目标数组
     * @param {Array} array 对象组成的数组
     */
    _jsc_array.removeAll = function (target, array) {
        _jsc_array.each(array, function (obj) {
            _jsc_array.remove(target, obj);
        });
    };

    /**
     * 将一个变量转换成数组
     * @method itemToArray
     * @param {*} item
     * @return {Array}
     */
    _jsc_array.itemToArray = function (item) {
        if (!jsc.isArray(item)) {
            return [item];
        }
        return item;
    };

    /**
     * 交换数组中两个索引项的值
     * @method  exchangeArrayItem
     * @param {Array} array
     * @param {Number} index1
     * @param {Number} index2
     */
    _jsc_array.exchangeArrayItem = function (array, index1, index2) {
        var temp = array[index1];
        array[index1] = array[index2];
        array[index2] = temp;
    };

    /**
     * 将对象移到数组的后面
     * @method moveToLast
     * @param {Array} array
     * @param {*} item
     */
    _jsc_array.moveToLast = function (array, item) {
        this.remove(array, item);
        array.push(item);
    };

    /**
     * 将一个对象放到数组的某个索引中
     * @method add
     * @param {Array} array
     * @param {Object} item
     * @param {Number} [index]
     */
    _jsc_array.add = function (array, item, index) {
        if (jsc.isDefined(index)) {
            array.splice(index, 0, item);
        } else {
            array.push(item);
        }
    };

    /**
     * 根据索引值移除数组中的某一项
     * @method removeByIndex
     * @param {Array} array
     * @param {Number} i
     * @return {*}
     */
    _jsc_array.removeByIndex = function (array, i) {
        if (0 <= i && i < array.length) {
            return array.splice(i, 1);
        }
    };

    /**
     * 移除数组中某个索引值后面的全部项
     * @method removeAfter
     * @param {Array} array
     * @param {Number} index
     */
    _jsc_array.removeAfter = function (array, index) {
        for (var i = index + 1; i < array.length; i++) {
            this.removeByIndex(array, i);
        }
    };

    /**
     * 融合一个数组到目标数组中
     * @method  combine
     * @param {Array} thisArray  目标数组
     * @param {Array} array
     * @param {Boolean} [excludeSame]  是否排除相等的元素,默认为true
     */
    _jsc_array.combine = function (thisArray, array, excludeSame) {
        for (var i = 0, l = array.length; i < l; i++) {
            if (excludeSame) {
                _jsc_array.addIf(thisArray, array[i]);
            } else {
                thisArray.push(array[i]);
            }
        }
        return thisArray;
    };

    /**
     * 判断数组是否包含某个项
     * @method contains
     * @param {Array} thisArray
     * @param {*} item
     * @param {Number} [from] 从数组的某个索引开始判断，默认从第0个开始
     * @return {Boolean}
     */
    _jsc_array.contains = function (thisArray, item, from) {
        if (thisArray) {
            from = from || 0;
            for (var i = from; i < thisArray.length; i++) {
                if (thisArray[i] == item) {
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * 选择排序，默认按从小到大的顺序进行排序
     * @method sort
     * @param {Array} array
     * @param {String} dir  dir的值包括"asc", "desc"
     * @return {Array}
     */
    _jsc_array.sort = function (array, dir) {

        var desc = dir == 'desc';

        for (var i = 0; i < array.length - 1; i++) {

            var selectedIndex = i;
            for (var j = i + 1; j < array.length; j++) {
                if (desc) {
                    if (array[j] > array[selectedIndex]) {
                        selectedIndex = j;
                    }
                } else {
                    if (array[j] < array[selectedIndex]) {
                        selectedIndex = j;
                    }
                }
            }

            // 交换两者的值
            if (i != selectedIndex) {
                var temp = array[i];
                array[i] = array[selectedIndex];
                array[selectedIndex] = temp;
            }
        }

        return array;

    };

    /**
     * 获取最好一个元素
     * @method getLast
     * @param {Array} array
     * @return {*}
     */
    _jsc_array.getLast = function (array) {
        return (array.length) ? array[array.length - 1] : null;
    };

    /**
     * 移除最后一个元素,并返回
     * @method removeLast
     * @param {Array} array
     * @return {*}
     */
    _jsc_array.removeLast = function (array) {
        if (array.length > 0) {
            var item = array[array.length - 1];
            array.length = array.length - 1;
            return item;
        } else {
            return null;
        }
    };

    /**
     * 获取某对象在数组中的索引
     * @method indexOf
     * @param {Array} thisArray
     * @param {Number} item
     * @return {Number}
     */
    _jsc_array.indexOf = function (thisArray, item) {
        var ret = -1;
        _jsc_array.each(thisArray, function (ele, i) {
            if (ele == item) {
                ret = i;
                return false;
            }
        });
        return ret;
    };

    /**
     * 移除数组中某一项
     * 通过找到该项在数组中的位置，再将其移除
     * @method remove
     * @param {Array} thisArray
     * @param {*} item
     * @return {*}
     */
    _jsc_array.remove = function (thisArray, item) {
        var index = this.indexOf(thisArray, item);
        return this.removeByIndex(thisArray, index);
    };

    /**
     * 移入变量，判断数组中是否存在某变量，
     * 如果不存在则将其移入数组中
     * @method include
     * @param {Array} thisArray
     * @param {*} item
     */
    _jsc_array.addIf = function (thisArray, item) {
        if (!_jsc_array.contains(thisArray, item)) thisArray.push(item);
        return thisArray;
    };

    /**
     * 拷贝数组
     * @method copy
     * @param {Array} array
     * @return {Array}
     */
    _jsc_array.copy = function (array) {
        var ret = [];
        for (var i = 0; i < array.length; i++) {
            ret[i] = array[i];
        }
        return ret;
    };

    /**
     * 获取包含的元素的个数(相同的元素只计算一次)
     * @method countUniqueItem
     * @param array
     * @param item
     * @returns {number}
     */
    _jsc_array.countUniqueItem = function (array, item) {
        var count = 0;
        for (var i = 0; i < array.length; i++) {
            if (array[i] == item) {
                count++;
            }
        }
        return count;
    };

    /**
     * 出栈
     * @method pop
     * @param {Array} array
     * @return {*}
     */
    _jsc_array.pop = function (array) {
        var item = array[array.length - 1];
        array.splice(array.length - 1, 1);
        return item;
    };

    /**
     * 获取栈中最新一项
     * @method peek
     * @param {Array} array
     * @return {*}
     */
    _jsc_array.peek = function (array) {
        return array[array.length - 1];
    };

    /**
     * 入栈
     * @method push
     * @param {Array} array
     * @param {*} item
     */
    _jsc_array.push = function (array, item) {
        array.push(item);
    };

    /**
     * 获取数组中每一项的某属性对应的值
     * @method getPropertyValues
     * @param {Array} array
     * @param {String} propertyName
     * @return {Array}
     */
    _jsc_array.getPropertyValues = function (array, propertyName) {
        var ret = [];
        if (array) {
            for (var i = 0; i < array.length; i++) {
                var v = array[i][propertyName];
                ret.push(v);
            }
        }
        return ret;
    };

    /**
     * 根据属性过滤
     * @method filterByProperty
     * @param {Array} array
     * @param {String} propertyName
     * @return {Array}
     */
    _jsc_array.filterByProperty = function (array, propertyName, propertyValue) {
        var ret = [];
        if (array) {
            for (var i = 0; i < array.length; i++) {
                var v = array[i][propertyName];
                if(v == propertyValue){
                    ret.push(array[i]);
                }
            }
        }
        return ret;
    };
	
	/**
     * 根据函数的执行结果,进行过滤
     * @method filter
     * @param {Array} array
     * @param {Function} callback
     * @return {Array}
     */
    _jsc_array.filter = function (array, callback) {
        var ret = [];
        if (array) {
            for (var i = 0; i < array.length; i++) {
				if(callback(array[i])){
                    ret.push(array[i]);
                }
            }
        }
        return ret;
    };

    /**
     * 根据对象的属性进行排序. 默认按从小到大的顺序进行排序
     * @method sortByProperty
     * @param {Array} array
     * @param {String} propertyName  属性名
     * @param {String} dir  dir的值包括"asc", "desc"
     * @return {Array}
     */
    _jsc_array.sortByProperty = function (array, propertyName, dir) {

        var desc = dir == 'desc';

        for (var i = 0; i < array.length - 1; i++) {

            var selectedIndex = i;
            for (var j = i + 1; j < array.length; j++) {
                if (desc) {
                    if (array[j][propertyName] > array[selectedIndex][propertyName]) {
                        selectedIndex = j;
                    }
                } else {
                    if (array[j][propertyName] < array[selectedIndex][propertyName]) {
                        selectedIndex = j;
                    }
                }
            }

            // 交换两者的值
            if (i != selectedIndex) {
                var temp = array[i];
                array[i] = array[selectedIndex];
                array[selectedIndex] = temp;
            }
        }

        return array;

    };

})(jsc);

/**
 * 日期工具类
 */
(function (jsc) {

    var _jsc_date = jsc.date = jsc.date || {};

    _jsc_date.isDate = function (v) {
        return Object.prototype.toString.apply(v) === '[object Date]';
    };

    /**
     * 获得最晚日期，比如参数为2013/09/01,2013/09/09,
     * 则返回2013/09/09
     * @method max
     * @param {Date} date
     * @param {Date} date2
     * @return {Date}
     */
    _jsc_date.max = function (date, date2) {
        if (!date) {
            return date2;
        }
        if (!date2) {
            return date;
        }
        if (date.getTime() > date2.getTime()) {
            return date;
        } else {
            return date2;
        }
    };

    /**
     * 切换月份. 如果设置之后，月份值不匹配(例如2月与31号不匹配)，则重新设置(将日期设置成1号)。
     * @method setMonth
     * @param {Date} date
     * @param {Number} month 可能为负数
     */
    _jsc_date.switchMonth = function (date, month) {
        var day = date.getDate();

        date.setDate(1);
        date.setMonth(month);

        // 每月几号,对月份可能有影响
        var oldMonth = date.getMonth();
        date.setDate(day);
        var newMonth = date.getMonth();

        if (newMonth != oldMonth) {
            date.setDate(1);
            date.setMonth(oldMonth);
        }

    };

    /**
     * 将日期字符串格式化，比如将
     * "2013/09/09"转换为"2013-09-09"
     * @method parseDate
     * @param {String} string
     * @return {Date}
     */
    _jsc_date.parseDate = function (string) {
        string = string.replace(/-/g, "/");
        return new Date(string);
    };

    /**
     * 获取年月. 月份从0开始
     * @method getYM
     * @param {Date} date
     * @return {Array} 由年、月组成的数组
     */
    _jsc_date.getYM = function (date) {
        return [date.getFullYear(), date.getMonth()];
    };

    /**
     * 获取年月日. 月份从0开始
     * @method getYMD
     * @param {Date} date
     * @return {Array} 由年、月、日组成的数组
     */
    _jsc_date.getYMD = function (date) {
        return [date.getFullYear(), date.getMonth(), date.getDate()];
    };

    /**
     *  比较两个日期的年月
     *  @method compareYearMonth
     *  @param {Date} date
     *  @param {Date} date2
     *  @return {Number} 前者大则返回1，后者大则返回-1，相等则返回0
     */
    _jsc_date.compareYearMonth = function (date, date2) {
        return this._compareDateUseArray(this.getYM(date), this.getYM(date2));
    };

    /**
     *  比较两个日期的年月日
     *  @method compareYMD
     *  @param {Date} date
     *  @param {Date} date2
     *  @return  {Number} 前者大则返回1，后者大则返回-1，相等则返回0
     */
    _jsc_date.compareYMD = function (date, date2) {
        return this._compareDateUseArray(this.getYMD(date), this.getYMD(date2));
    };

    /**
     * 比较两个日期是否相等。参数为数组，
     * 数组项按年份，月份，日，时，分，秒往后排列。
     * @method compareDateUseArray
     * @param {Array} array
     * @param {Array} array2
     * @return {Number} 前者大则返回1，后者大则返回-1，相等则返回0
     */
    _jsc_date._compareDateUseArray = function (array, array2) {

        for (var i = 0; i < array.length; i++) {
            if (array[i] > array2[i]) {
                return 1;
            } else if (array[i] < array2[i]) {
                return -1;
            }
        }
        return 0;
    };
    /**
     * 格式化时间，
     * 如将[12,4,0]譬如将格式化为[12,04,00]
     * 数组对应的三个项分别为时、分、秒
     * @method formatTime
     * @param {Array} time 例如[12, 4, 0]
     * @param {String} format 例如"hh时mm分ss秒"
     * @return {String}
     */
    _jsc_date.formatTime = function (time, format) {
        var o = {
            "h+": time[0], // hour
            "m+": time[1], // minute
            "s+": time[2] // second
        };

        for (var k in o) {
            if (o.hasOwnProperty(k)) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
                        : ("00" + o[k]).substr(("" + o[k]).length));
                }
            }
        }
        return format;
    };
    /**
     * 格式化日期,如
     * <pre><code>
     *   var today = new Date();
     *   jsc.date.format(today,'yyyy-MM-dd hh:mm:ss');
     *   // 2013-09-09 12:34:05
     * </code></pre>
     * @method  format
     * @param {Date} date
     * @param {String} format
     * @return {String}
     */
    _jsc_date.format = function (date, format) {
        var _dateFormat = {
            "M+": date.getMonth() + 1, // month
            "d+": date.getDate(), // day
            "h+": date.getHours(), // hour
            "m+": date.getMinutes(), // minute
            "s+": date.getSeconds(), // second
            "q+": Math.floor((date.getMonth() + 3) / 3), // quarter
            'S': date.getMilliseconds()  // millisecond
        };

        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear() + "")
                .substr(4 - RegExp.$1.length));
        }

        for (var k in _dateFormat) {
            if (_dateFormat.hasOwnProperty(k)) {
                var pv = _dateFormat[k];
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? pv
                        : ("00" + pv).substr(("" + pv).length));
                }
            }
        }
        return format;
    };
    /**
     * 添加年份
     * @method addYears
     * @param {Date} date
     * @param {Number} years
     * @return {Date}
     */
    _jsc_date.addYears = function (date, years) {
        return this.addMonths(date, years * 12);
    };

    /*
     * 添加月份
     * 月份从0开始,保持日期不变
     * @method addMonths
     * @param {Date} date
     * @param {Number} months
     * @return {Date}
     */
    _jsc_date.addMonths = function (date, months) {

        var n = date.getDate();
        date.setDate(1);
        date.setMonth(date.getMonth() + months);
        date.setDate(Math.min(n, this.getDaysInMonth(date)));
        return date;

    };

    /**
     * 判断是否闰年
     * @method isLeapYear
     * @param {Number} year
     * @return {Boolean}
     */
    _jsc_date.isLeapYear = function (year) {
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
    };

    /**
     * 获取日期当月的一号
     * @method getFirstDateOfMonth
     * @param {Date} date
     * @return {Date}
     */
    _jsc_date.getFirstDateOfMonth = function (date) {
        var ret = new Date(date);
        ret.setDate(1);
        return ret;
    };

    /**
     * 获取某一年中某个月份的天数
     * month从0开始
     * @method getDaysInMonth
     * @param {Number | Date} year
     * @param {Number}  [month]
     * @return {Number}
     */
    _jsc_date.getDaysInMonth = function (year, month) {

        if (this.isDate(year)) {
            var date = year;
            year = date.getFullYear();
            month = date.getMonth();
        }

        return [31, (this.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    };
    /**
     * 获取某两个日期之间间隔的时间周期
     * @method  getInterval
     * @param {Date} d1
     * @param {Date} d2
     * @return {Object} 返回格式化后的时间周期，如{ h:12,m:2,s:23,ms:340}
     */
    _jsc_date.formatInterval = function (d1, d2) {

        var d3 = d1 - d2;
        var h = Math.floor(d3 / 3600000);
        var m = Math.floor((d3 - h * 3600000) / 60000);
        var s = (d3 - h * 3600000 - m * 60000) / 1000;
        var ms = d3 - h * 3600000 - m * 60000 - s * 1000;

        return {
            h: h,
            m: m,
            s: s,
            ms: ms
        }

    };

})(jsc);

/**
 * 数字工具类
 */
(function (jsc) {

    var _jsc_number = jsc.number = jsc.number || {};

    /**
     * 整除
     * @method div
     * @param {Number} dividend
     * @param {Number} divisor
     * @return {Number}
     */
    Math.div = function (dividend, divisor) {
        return Math.floor(dividend / divisor);
    };

    /**
     * 取余
     * @method mod
     * @param {Number} dividend
     * @param {Number} divisor
     * @return {Number}
     */
    Math.mod = function (dividend, divisor) {
        return dividend - Math.floor(dividend / divisor) * divisor;
    };

    /**
     * 判断数字是否是奇数
     * @method isOdd
     * @param {Number} i
     * @return {Boolean}
     */
    _jsc_number.isOdd = function (i) {
        return Math.mod(i, 2) == 1;
    };

    /**
     * 判断数字是否是偶数
     * @method isEven
     * @param {Number} i
     * @return {Boolean}
     */
    _jsc_number.isEven = function (i) {
        return Math.mod(i, 2) == 0;
    };

    /**
     * 抽取字符串中的数字，
     * 如抽取"Abc123com456",返回[123,456]
     * @method  extractInts
     * @param {String} str
     * @return {Array}
     */
    _jsc_number.extractInts = function (str) {
        var results = str.match(/\d+/g);

        var ret = [];
        for (var i = 0; i < results.length; i++) {
            ret.push(parseInt(results[i]));
        }

        return ret;
    };

    /**
     * 抽取字符串中第一个数字,
     * 如抽取"Abc123com"中的123
     * @method  extractInt
     * @param {String} str
     *  @return {Number}
     */
    _jsc_number.extractInt = function (str) {
        var ints = this.extractInts(str);
        return ints[0];
    };

    /**
     * 获取小数位数
     * @method  getDecimalDigits
     * @param num
     * @return {number}
     */
    _jsc_number.getDecimalDigits = function (num) {
        var str = num + "";
        var pointIndex = str.indexOf(".");
        if (pointIndex < 0) {
            return 0;
        } else {
            return str.length - 1 - pointIndex;
        }
    };

    /**
     * 取小数点后n位
     * @method  fixedNumberString
     * @param {String} numStr
     * @param {number} count
     * @return {String}
     */
    _jsc_number.fixedNumberString = function (numStr, count) {
        var str = numStr + "";
        var index = str.indexOf(".");
        if (index >= 0) {
            str = str.substring(0, index + count + 1);
        }
        return str;
    };

    /**
     * 取小数点后n位
     * @method  fixNumber
     * @param {number} num
     * @param {number} count
     * @return {Number}
     */
    _jsc_number.fixNumber = function (num, count) {
        return parseFloat(this.fixedNumberString(num + "", count));
    };

    /**
     * 取最小值
     * @method  min
     * @param {Array} nums
     * @return {number}
     */
    _jsc_number.min = function (nums) {
        var min = Number.MAX_VALUE;
        jsc.each(nums, function (num) {
            min = Math.min(min, num);
        });
        return min;
    };

    /**
     * 取最大值
     * @method  max
     * @param {Array} nums
     * @return {number}
     */
    _jsc_number.max = function (nums) {
        var max = Number.MIN_VALUE;
        jsc.each(nums, function (num) {
            max = Math.max(max, num);
        });
        return max;
    };

    /**
     * 将数值约束在一个范围内
     * @method  containment
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @return {number}
     */
    _jsc_number.containment = function (value, min, max) {

        if (jsc.isArray(min)) {
            max = min[1];
            min = min[0];
        }

        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    };

})(jsc);

/**
 * 字符串工具类
 */
(function (jsc) {

    var _jsc_string = jsc.string = jsc.string || {};

    /**
     * 将值为null的变量转换为空字符串
     * @method nullToEmpty
     * @param {String} obj
     * @return {*} 如果值为null，返回"",否则返回原参数
     */
    _jsc_string.nullToEmpty = function (obj) {
        if (obj === undefined || obj == null) {
            return "";
        } else {
            return obj;
        }
    };

    /**
     * 字符串局部替换功能
     * 比如，将"abc{0}d{1}"中的{0}和{1}替换成G,F， 代码如下
     * <pre><code>
     *    jsc.string.formatByNumber('abc{0}d{1}','G','F');
     * </code></pre>
     * @method formatByNumber
     * @param {String} src
     * @return {String}
     */
    _jsc_string.formatByNumber = function (src) {
        if (arguments.length == 0) return "";
        var args = Array.prototype.slice.call(arguments, 1);
        return src.replace(/\{(\d+)\}/g, function (m, i) {
            var val = args[i];
            if (val === undefined || val == null) {
                val = "";
            }
            return val;
        });
    };
    /**
     * 字符串局部替换功能
     * 将"abc{abc}d{name}"中的{abc}和{name}替换成一个对象中的属性的值.代码如下
     * <pre><code>
     *    jsc.string.format('abc{abc}d{name}',{ abc:123, name: 456});
     * </code></pre>
     * @method format
     * @param string
     * @param obj
     */
    _jsc_string.format = function (string, obj) {
        return string.replace(/\{([A-Za-z_]+)\}/g, function (m, i) {
            //m：{abc}{name} ; i: abc name
            return obj[i];
        });
    };
    /**
     * 判断字符传中是否包含指定的子字符串
     * @method contains
     * @param {String} str
     * @param {String} substr
     * @return {Boolean}
     */
    _jsc_string.contains = function (str, substr) {
        return str.indexOf(substr) != -1;
    };
    /**
     * 将字符串中首尾两端的空格去除
     * @method trim
     * @param {String} string
     * @param {Boolean} nullToEmpty  是否将值为null的变量转换为“”
     * @return {String}
     */
    _jsc_string.trim = function (string, nullToEmpty) {
        if (jsc.isUndefinedOrNull(string)) {
            if (nullToEmpty) {
                return "";
            } else {
                return string;
            }
        }
        return String(string).replace(/^\s+|\s+$/g, '');
    };
    /**
     * 判断某字符串是否以某子字符串做结尾
     * @method endsWith
     * @param {String} string
     * @param {String} pattern
     * @return {Boolean}
     */
    _jsc_string.endsWith = function (string, pattern) {
        if (jsc.isUndefinedOrNull(string)) {
            return false;
        }
        var d = string.length - pattern.length;
        return d >= 0 && string.lastIndexOf(pattern) === d;
    };
    /**
     * 判断某字符串是否以某子字符串做开头
     * @method startWith
     * @param {String} string
     * @param {String} subString
     * @return {Boolean}
     */
    _jsc_string.startWith = function (string, subString) {
        if (jsc.isUndefinedOrNull(string)) {
            return false;
        }
        return string.indexOf(subString) == 0;
    };
    /**
     * 获取末尾几个字符组成的字符串
     * @method getEndChars
     * @param {String} string
     * @param {Number} count 指定字符的个数
     * @return {String}
     */
    _jsc_string.getEndChars = function (string, count) {
        return string.substring(string.length - count);
    };

    /**
     * 计算不相同的字符串的个数
     * @method  countUniqueItem
     * @param {Array} array
     * @return {number}
     */
    _jsc_string.countUniqueItem = function (array) {
        var map = {};
        var count = 0;
        for (var i = 0; i < array.length; i++) {
            var value = array[i];
            if (!map[value]) {
                count += 1;
                map[value] = true;
            }
        }
        return count;
    };

    /**
     * 移除相同的字符串
     * @method  removeSameItem
     * @param {Array} array
     * @return {Array}
     */
    _jsc_string.removeSameItem = function (array) {
        var map = {};
        var ret = [];
        for (var i = 0; i < array.length; i++) {
            var value = array[i];
            if (!map[value]) {
                ret.push(value);
                map[value] = true;
            }
        }
        return ret;
    };

    /**
     * 如果一个字符串是以某字符串开头，则将其删除
     * @method removeStart
     * @param {String} str
     * @param {String} substring
     * @param {Boolean} iterator 是否迭代删除
     * @return {String}
     */
    _jsc_string.removeStart = function (str, substring, iterator) {

        if (this.startWith(str, substring)) {
            str = str.substring(substring.length);

            if (iterator) {
                return this.removeStart(str, substring, iterator);
            } else {
                return str;
            }

        } else {
            return str;
        }
    };

    /**
     * 如果一个字符串是以某字符串结尾，则将其删除
     * @method removeEnd
     * @param {String} str
     * @param {String} substring
     * @return {String}
     */
    _jsc_string.removeEnd = function (str, substring) {
        if (this.endsWith(str, substring)) {
            return str.substring(0, str.length - substring.length);
        } else {
            return str;
        }
    };

})(jsc);

jsc.Set = (function(){

    var Set = function(){
        this._elements = [];
    };

    Set.prototype.add = function(object){
        if(! this.contains(object)){
            this._elements.push(object);
        }
    };

    Set.prototype.remove = function(object){
        for (var i = 0; i < this._elements.length; i++) {
            if (this._elements[i] === object) {
                this._elements.splice(i, 1);
                break;
            }
        }
    };

    Set.prototype.contains = function (object) {
        for (var i = 0; i < this._elements.length; i++) {
            if (this._elements[i] === object) {
                return true;
            }
        }
        return false;
    };

    Set.prototype.toArray = function () {
        return this._elements.slice();
    };

    return Set;

})();

jsc.Map = (function(jsc_Set){

    var Map = function(){
        this._innerMap = {};
        this._keys = new jsc_Set();
    };

    Map.prototype.put = function (key, value) {
        this._innerMap[key] = value;
        this._keys.add(key);
    };

    Map.prototype.get = function (key) {
        return this._innerMap[key];
    };

    Map.prototype.getKeys = function () {
        return this._keys.toArray();
    };

    return Map;

})(jsc.Set);

jsc.MultiValueMap = (function (jsc_Map) {

    var MultiValueMap = function(){
        this._innerMap = new jsc_Map();
    };

    MultiValueMap.prototype.put = function (key, value) {
        var array = this._innerMap.get(key);
        if (array === undefined) {
            array = [];
            this._innerMap.put(key, array);
        }

        array.push(value);
    };

    MultiValueMap.prototype.getValues = function (key) {
        return this._innerMap.get(key);
    };

    return MultiValueMap;

})(jsc.Map);

/* 用来生成html */
jsc.HtmlNode = (function (jsc, jsc_Map, jsc_array) {

    var _isSelfClosed = function (tagName) {
        var _notSelfClosingTags = ['textarea', 'script', 'em', 'strong', 'option', 'select'];
        return !jsc_array.contains(_notSelfClosingTags, tagName);
    };

    var HtmlNode = function (tagName) {
        this._tagName = tagName;
        this._attrs = new jsc_Map();
        this._children = [];
        this._classNames = [];
    };

    HtmlNode.prototype.html = function (html) {
        this._children.push(html);
        return this;
    };


    HtmlNode.prototype.attr = function (name, value) {
        this._attrs.put(name, value);
        return this;
    };

    HtmlNode.prototype.addClass = function(className){
        this._classNames.push(className);
        return this;
    };

    HtmlNode.prototype.setOnclick = function(onclick){
        this._attrs.put("onclick", onclick);
        return this;
    };

    HtmlNode.prototype.child = function (htmlNode) {
        this._children.push(htmlNode);
        return this;
    };

    HtmlNode.prototype._renderAttrs = function () {
        var ret = "";

        var keys = this._attrs.getKeys();
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = this._attrs.get(key);
            ret += " " + key + "='" + value + "' ";
        }

        if(this._classNames.length > 0){
            ret += " class='" + this._classNames.join(' ') +
                "'"
        }

        return ret;
    };

    HtmlNode.prototype.render = function () {
        var ret = "<" + this._tagName + this._renderAttrs();
        if (_isSelfClosed(this._tagName) && this._children.length == 0) {
            ret += "/>";
        } else {
            ret += ">";

            ret += this.renderChildren();

            ret += "</" + this._tagName + ">";
        }

        return ret;
    };

    HtmlNode.prototype.renderChildren = function () {
        var ret = "";
        for (var i = 0; i < this._children.length; i++) {
            var child = this._children[i];
            if (child.render) {
                ret += child.render();
            } else {
                ret += child;
            }
        }
        return ret;
    };

    jsc.createTag = function (tagName) {
        return new HtmlNode(tagName);
    };

    return HtmlNode;

})(jsc, jsc.Map, jsc.array);

(function () {

    var jsc = window.jsc = window.jsc || {};

    jsc.aopMethod = function(callback, scope, methodName){
        return function(){
            jsc.log(methodName + ",参数为:" + jsc.toJSONString(arguments));
            var result = callback.apply(scope, arguments);
            jsc.log(methodName + ",返回结果为:" + jsc.toJSONString(result));
            return result;
        };
    };

    jsc.toJSONString = function(o){
        if(JSON && JSON.stringify){
            return JSON.stringify(o);
        }else {
            return o;
        }
    };

    jsc.getParameter = jsc.aopMethod(function(url, paramName){
        var reg = new RegExp('(\\?|&)' + paramName + '=([^&?]*)', 'i');
        var arr = url.match(reg);

        if (arr) {
            return arr[2];
        }

        return null;
    }, "getParameter方法");

    jsc.getPageParameter = function(paramName){
        return jsc.getParameter(location.href, paramName);
    };

    var conditionMatch = function(record, condition){
        var matched = true;
        jsc.each(condition, function(k, v){
            // 数字12和字符串"12"也是相等的
            if(record[k] != v){
                matched = false;
                return false;
            }
        });
        return matched;
    };

    var ObjectArray = function (array) {
        if(array && array.length > 0){
            this._data = jsc.array.copy(array);
        }else {
            this._data = [];
        }
    };

    ObjectArray.prototype.data = function () {
        return this._data;
    };

    ObjectArray.prototype.insertHead = function(record){
        jsc.array.add(this._data, record, 0);
    };

    ObjectArray.prototype.find = function(condition){
        var subarray = [];

        jsc.array.each(this._data, function(record){
            if(conditionMatch(record, condition)){
                subarray.push(record);
            }
        });

        return new ObjectArray(subarray);
    };

    ObjectArray.prototype.update = function(keyvalues){
        jsc.array.each(this._data, function(record){
            jsc.copyTo(keyvalues, record);
        });

        return this;
    };

    ObjectArray.prototype.remove = function(condition){
        for(var i = 0; i < this._data.length; i++){
            var record = this._data[i];
            if(conditionMatch(record, condition)){
                this._data.splice(i, 1);
            }
        }

        return this;
    };

    ObjectArray.prototype.each = function(callback){
        jsc.array.each(this._data, callback);
    };

    ObjectArray.prototype.getRecordData = function(index){
        return this._data[index];
    };

    jsc.createObjectArray = function(array){
        return new ObjectArray(array);
    };

})();
