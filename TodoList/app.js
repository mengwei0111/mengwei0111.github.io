const todos = [
  { id: "1", name: "完成漢堡", done: false },
  { id: "2", name: "你才是漢堡", done: true },
  { id: "3", name: "我是漢堡王", done: true },
];

const App = {
  data() {
    return {
      todos: [], // 儲存所有待辦事項
      temp: {}, // 儲存編輯的事項
      isNew: false, // 是否為新增狀態
    };
  },
 
  methods: {
    // 新增任務
    addItem() {
      this.isNew = true;
      this.temp = {}; // 清空暫存資料
    },

    // 編輯任務
    editItem(item) {
      this.isNew = false; // 設定為編輯狀態
      this.temp = { ...item }; // 複製當前任務資料到暫存資料
    },

    // 確認新增or編輯編輯
    confirmEdit() {
      if (!this.temp.name) {
        return alert("請輸入任務內容");
      }
      if (!this.temp.id) {
        // 新增任務
        this.temp.id = new Date().getTime().toString();
        this.temp.done = false;
        this.todos.unshift(this.temp); // 將新任務添加到列表中
      } else {
        // 編輯任務
        const index = this.todos.findIndex((item) => item.id === this.temp.id);
        this.todos[index] = this.temp; // 更新任務資料
      }

      this.isNew = false; // 結束新增
      this.temp = {}; // 清空暫存資料
    },

    // 切換任務完成狀態
    toggleDone(item) {
      item.done = !item.done; // 切換完成狀態
    },
    
    // 刪除任務
    
    deleteItem : function (item) {
      // 刪除 todo
      this.todos = this.todos.filter((todo) => todo.id !== item.id); // 使用 filter 過濾出不符合的 id，並重新賦值給 todos 陣列
      
      //第二種寫法
      // //deleteItem : function (index) {
      // // 刪除 todo
      // this.todos.splice(index, 1); // 使用陣列方法splice(指定的index開始，刪除一筆)，依照抓到的 index 刪除
    },
  },
  created() {
    // 初始化數據，從預設資料開始
    this.todos = todos;
  },
};

Vue.createApp(App).mount("#app");
