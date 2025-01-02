<template>
  <div>
    <h2>插入排序动画</h2>

    <!-- 显示数字柱状图 -->
    <div class="array-container">
      <div v-for="(value, index) in toSortNumbers" :key="index" :style="getStyle(index)" class="array-bar">
        {{ value }}
      </div>
    </div>

    <!-- 速度控制滑动条 -->
    <div class="speed-control">
      <input type="range" id="speed" min="50" max="1000" step="50" v-model="animationSpeed" :disabled="isSorting" />
    </div>

    <!-- 按钮容器 -->
    <div class="button-container">
      <button class="btn" @click="startSorting" :disabled="isSorting">开始排序</button>
      <button class="btn" @click="stopSorting" :disabled="!isSorting">停止排序</button>
      <button class="btn" @click="resetArray" :disabled="isSorting">重新生成数字</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      toSortNumbers: this.generateRandomArray(20),
      isSorting: false, // 用来标识是否正在排序
      currentIndexes: [], // 用于记录正在交换的柱状体索引
      animationSpeed: 300, // 默认的动画速度，单位：毫秒
      sortingTimer: null, // 用来存储排序定时器
      positions: [] // 用来记录柱状体的当前位置
    };
  },
  computed: {
    realAnimateSpeed() {
      return 1000 - this.animationSpeed;
    }
  },
  methods: {
    // 生成指定长度的随机数组
    generateRandomArray(length) {
      const toSortNumbers = [];
      for (let i = 0; i < length; i++) {
        toSortNumbers.push(Math.floor(Math.random() * 100) + 1); // 生成 1 到 100 之间的随机数
      }
      return toSortNumbers;
    },
    // 获取每个条目的样式
    getStyle(index) {
      const baseColor = '#FF6347'; // 基础红色
      const pos = this.positions[index] || 0; // 获取当前柱状体的 X 坐标位置

      if (this.currentIndexes.includes(index)) {
        return {
          height: `${this.toSortNumbers[index]}px`,
          backgroundColor: 'black', // 交换中的柱状体（亮黄色）
          transition: `height ${this.realAnimateSpeed / 1000}s ease, background-color ${this.realAnimateSpeed / 1000}s ease`,
          transform: `translateX(${pos}px)`, // 通过 X 坐标平滑移动
        };
      }

      return {
        height: `${this.toSortNumbers[index]}px`,
        backgroundColor: baseColor, // 正常柱状体的颜色
        transition: `height ${this.realAnimateSpeed / 1000}s ease, background-color ${this.realAnimateSpeed / 1000}s ease`,
        transform: `translateX(${pos}px)`, // 通过 X 坐标平滑移动
      };
    },
    // 执行插入排序
    async startSorting() {
      if (this.isSorting) return; // 如果已经在排序，阻止重复点击
      this.isSorting = true;

      const arr = [...this.toSortNumbers];  // 克隆数组，以防直接修改原始数据
      let i = 1;

      // 插入排序过程
      while (i < arr.length) {
        if (!this.isSorting) return; // 如果被停止，退出排序

        let key = arr[i];
        let j = i - 1;

        // 移动大于 key 的元素到右边
        while (j >= 0 && arr[j] > key) {
          arr[j + 1] = arr[j];

          // 记录当前交换的柱状体索引
          this.currentIndexes = [j, j + 1];

          // 更新柱状体的 X 坐标位置
          this.updatePositions(j, j + 1);

          this.toSortNumbers = [...arr]; // 更新数组状态以触发视图更新
          await this.sleep(this.realAnimateSpeed);  // 根据速度控制每步的延迟
          j = j - 1;
        }
        arr[j + 1] = key;
        this.toSortNumbers = [...arr]; // 更新数组状态以触发视图更新
        i++;
        await this.sleep(this.realAnimateSpeed);  // 每次插入之后暂停
      }

      this.isSorting = false;
      this.currentIndexes = []; // 清空正在交换的柱状体
    },
    // 停止排序
    stopSorting() {
      this.isSorting = false; // 设置标志位为 false，停止排序
      this.currentIndexes = []; // 清空交换的柱状体
    },
    // 模拟延时，控制动画的步伐
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    // 更新柱状体的 X 坐标位置
    updatePositions(i, j) {
      const distance = (j - i) * 40; // 假设每个柱状体之间的间距为 40px
      this.positions[i] = this.positions[i] + distance; // 计算并更新柱状体的位置
      this.positions[j] = this.positions[j] - distance; // 交换柱状体时，更新它的目标位置
    },

    // 重新生成新的随机数字并更新柱状图
    resetArray() {
      if (this.isSorting) return;  // 如果正在排序，不能重新生成数字
      this.toSortNumbers = this.generateRandomArray(20);  // 重新生成随机数组
      this.currentIndexes = [];  // 清空正在交换的柱状体
      this.positions = []; // 清空柱状体的位置记录
    },
  },
};
</script>

<style scoped>
.array-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 300px;
  margin-top: 20px;
}

.array-bar {
  width: 20px;
  background-color: #FF6347;
  /* 红色 */
  display: inline-block;
  margin: 0 2px;
  text-align: center;
  color: white;
  font-size: 12px;
  position: relative;
  /* 使 transform 生效 */
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  /* 设置按钮之间的间距 */
  margin-top: 20px;
  /* 按钮容器与柱状图之间的间距 */
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #45a049;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.speed-control {
  margin-top: 20px;
}

input[type="range"] {
  width: 100%;
}
</style>
