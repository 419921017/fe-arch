const arrayProto = Array.prototype;

const proto = Object.create(arrayProto);

const reWriteArr = ["push", "shift", "splice"];

reWriteArr.forEach(method => {
  proto[method] = function(...args) {
    let inserted;
    switch (method) {
      case "push":
      case "shift":
        inserted = args;
        break;
      case "splice":
        inserted = args[2];
      default:
        break;
    }
    arrayObjserver(inserted);
    arrayProto[method].call(this, ...args);
  };
});

function arrayObjserver(obj) {
  for (let i = 0; i < obj.length; i++) {
    observer(obj[i]);
  }
}

function observer(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    Object.setPrototypeOf(obj, proto);
    arrayObjserver(obj);
  } else {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        defineReactive(obj, key, obj[key]);
      }
    }
  }
}

function defineReactive(obj, key, value) {
  observer(value);
  Object.defineProperty(obj, key, {
    get() {
      console.log("视图更新");
      return value;
    },
    set(newValue) {
      if (value !== newValue) {
        observer(newValue);
        value = newValue;
        console.log("视图更新");
      }
    }
  });
}

let data = {
  name: 123,
  arr: [123, { age: 123 }]
};

observer(data);

data.name = 456;

data.arr[0] = 1234;

data.arr[1].age = 222;

/**
 * 1. 使用对象的时候必须是声明属性, 只有声明属性才能相应
 * 2. 增加不存在的属性, 不能更新视图
 * 3. 默认会递归增加getter和setter
 * 4. 数组里嵌套对象, 对象是支持响应式变化的, 常量不会生效
 * 5. 修改数组的索引和长度, 不会导致视图更新
 * 5. 如果是新增的数据是对象类型, vue也会进行监控
 */
