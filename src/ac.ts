import { setTimeout } from 'timers/promises';
import { author } from "./config";
import * as readline from "readline";
import 'fs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

interface trie_node {
  base: number,
  check: number,
}

interface tree_node_interrface {
  index: number,
  character: string,
  children: Array<tree_node>,
  finish?: string,
}

class tree_node implements tree_node_interrface {
  index: number;
  character: string;
  children: tree_node[];
  father: tree_node;
  finish?: string;

  constructor(index: number, character: string, father: tree_node) {
    this.index = index;
    this.character = character;
    this.father = father;
    this.children = [];
  }

  addChild(child: tree_node): void {
    this.children.push(child);
  }

  findChild(charater: string): tree_node {
    let ret: tree_node;
    this.children.forEach(e => {
      if (e.character === charater) ret = e;
    });
    return ret;
  }
}

interface next_node {
  state: number,
  character: string,
}

const ac = (patterns: Array<string>, sample: string) => {
  const double_array: Array<trie_node> = Array(256).fill(null).map(
    (e): trie_node => { return { base: 0, check: -255 } });
  const next_array: Array<next_node> = Array(256).fill(null).map(
    (e): next_node => { return { state: -1, character: undefined } });

  // 构建AC模式树
  const root: tree_node = new tree_node(0, undefined, null);
  let total_status = 1;

  const addPattern = (pattern: string) => {
    let cur = 0;
    let cur_node: tree_node = root;
    if (pattern === '') return
    while (pattern[cur]) {
      const child = cur_node.findChild(pattern[cur]);
      if (child) {
        cur = cur + 1;
        cur_node = child;
      } else {
        const new_node = new tree_node(total_status, pattern[cur], cur_node);
        cur = cur + 1;
        total_status = total_status + 1;
        cur_node.addChild(new_node);
        cur_node = new_node;
      }
    }
  };
  patterns.forEach(addPattern);
  console.log("test");
  // next数组扩展
  const expandNext = () => {
    console.log("expand");
    next_array.push(...Array(256).fill(null).map(
      (e): next_node => { return { state: -1, character: undefined } }));
  };
  // 获取空位函数
  const getBase = (node: tree_node) => {
    let ret = -255;
    for (; ret < next_array.length; ret = ret + 1) {
      let occupied = node.children.some(e => {
        const pos = e.character.charCodeAt(0) + ret;
        if (pos < 0 || pos >= next_array.length) return true;
        else {
          // 获取对应位置的状态
          const next_status = next_array[pos].state;
          // 若不为空位，说明被占用
          if (next_status !== -1) {
            return true;
          } else {
            return false;
          }
        }
      });
      if (!occupied) {
        return ret;
      } else {
        continue;
      }
    }
    // 若不够则扩展数组继续执行
    expandNext();
    return getBase(node);
  };

  // 构造next表
  const node_queue: Array<tree_node> = [root];
  while (node_queue.length !== 0) {
    const cur_node = node_queue.shift();
    node_queue.push(...cur_node.children);

    const base = getBase(cur_node);
    double_array[cur_node.index].base = base;
    cur_node.children.forEach(e => {
      const pos = e.character.charCodeAt(0) + base;
      next_array[pos].state = e.index;
      next_array[pos].character = e.character;
      double_array[e.index].check = e.father.index;
    });
  }

  // 表展示函数
  console.log(double_array.filter(e => e.base === 0 && e.check === -255));
  console.log(next_array);



}

const main = async () => {
  console.log(`Starting LCS`);
  await setTimeout(100);
  console.log(`Double Array AC with typescript by ${author}`);
  console.log('---------------------------------');
  ac(['he', 'she', 'his', 'hers'], 'gg');
  // rl.question("input first string: ", (answer) => {
  //   rl.question("input second string: ", (answer2) => {

  //     console.log("AC result: ");
  //     console.log('---------------------------------');
  //     rl.close();
  //   })
  // })
}

main();