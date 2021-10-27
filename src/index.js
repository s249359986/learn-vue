function observer(data) {
    if (!data || typeof data !== "object") return data;
    Object.keys(data).forEach((key) => defineReactiv(data, key, data[key]));
  }
  
  // 数据劫持具体实现
  function defineReactiv(data, key, val) {
    // 递归调用 对多层数据实现监听
    observer(val);
  
    // 一个数据的属性对应一个订阅器实例
    var dep = new Dep();
  
    // 数据监听核心 其中的get和set与defineReactiv构成了闭包环境
    Object.defineProperty(data, key, {
      get() {
        if (Dep.target) {
          dep.addSub(Dep.target); // 在这里添加一个订阅者
        }
        return val;
      },
      set(newVal) {
        if (val === newVal) return;
        val = newVal;
        dep.notify();
      },
      enumerable: true,
      configurable: true,
    });
  }
  
  /********************订阅器*********************/
  
  class Dep {
    // 缓存当前订阅者
    static target = null;
  
    // 存放订阅者数组
    subs = [];
  
    // 构造器
    constructor() {}
  
    // 添者订阅者
    addSub(sub) {
      this.subs.push(sub);
    }
  
    // 通知订阅者更新数据
    notify() {
      this.subs.forEach((sub) => sub.update());
    }
  }
  
  /********************订阅者*********************/
  
  class Watcher {
    callback = null;
    vm = null;
    key = undefined;
    value = undefined;
    constructor({ vm, key, callback }) {
      this.callback = callback;
      this.vm = vm;
      this.key = key;
      this.value = this.get();
    }
  
    // 订阅者执行更新函数
    update() {
      this.run();
    }
  
    // 更新函数具体逻辑
    run() {
      let value = this.vm.$data[this.key];
      var oldVal = this.value;
      if (value !== oldVal) {
        this.value = value;
        this.callback.call(this.vm, value, oldVal);
      }
    }
  
    // 实例化订阅者时，获取一次数据值
    get() {
      Dep.target = this;
      var value = this.vm.$data[this.key];
      Dep.target = null;
      return value;
    }
  }
  
  /********************Vue实现*********************/
  
  class Vue {
    // 实例数据
    $data = undefined;
    // 实例参数
    $options = undefined;
    // 构造器
    constructor(options) {
      const { data } = options;
  
      // 数据挂载
      this.$data = data;
      // 参数挂载
      this.$options = options;
      // 监听数据
      observer(data);
    }
  
    $watch(key, callback) {
      new Watcher({ vm: this, key, callback });
    }
  }
  
  /********************测试一下*********************/
  
  // 1. 创建Vue实例
  var vm = new Vue({
    data: {
      name: "小明",
    },
  });
  
  vm.$watch("name", (newValue, oldValue) => {
    // 通过改变 vm.$data.name 来触发此监听
    console.log(newValue, oldValue);
  });
  
  // 2. 设置实例上的数据
  vm.$data.name = "小张"; // 小张 小明
  