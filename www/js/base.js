(function(){

    var Vue__default = 'default' in Vue ? Vue['default'] : Vue;

    var focusAuto = {
        priority: 100,
        bind: function() {
            var self = this;
            this.bound = true;

            Vue__default.nextTick(function() {
                if (self.bound === true) {
                    self.el.focus();
                }
            });
        },
        unbind: function(){
            this.bound = false;
        }
    };

    Vue.directive('autofocus', focusAuto);

})();

