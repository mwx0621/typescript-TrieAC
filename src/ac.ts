import { setTimeout } from 'timers/promises';
import { author, patterns } from "./config";
import * as readline from "readline";
import 'fs';
import { stat } from 'fs';

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
  patterns: Array<string>;

  constructor(index: number, character: string, father: tree_node) {
    this.index = index;
    this.character = character;
    this.father = father;
    this.children = [];
    this.patterns = [];
  }

  addChild(child: tree_node): void {
    this.children.push(child);
  }

  addPattern(...params: string[]): void {
    this.patterns.push(...params);
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

interface ac_result {
  position: number,
  pattern: string[],
}

const ac = (patterns: Array<string>, sample: string) => {
  const status_array: Array<tree_node> = [];
  const double_array: Array<trie_node> = Array(256).fill(null).map(
    (e): trie_node => { return { base: 0, check: -255 } });
  const next_array: Array<next_node> = Array(256).fill(null).map(
    (e): next_node => { return { state: -1, character: undefined } });
  const fail_array: Array<number> = Array<number>(256).fill(-1);
  // 数组扩展
  const expandNext = () => {
    next_array.push(...Array(256).fill(null).map(
      (e): next_node => { return { state: -1, character: undefined } }));
  };
  const expandDouble = () => {
    double_array.push(...Array(256).fill(null).map(
      (e): trie_node => { return { base: 0, check: -255 } }));
  }
  const expandFail = () => {
    fail_array.push(...Array<number>(256).fill(-1));
  }
  // 构建AC模式树
  const root: tree_node = new tree_node(0, undefined, null);
  status_array.push(root);
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
        status_array.push(new_node);
        total_status = total_status + 1;
        if (total_status > double_array.length) {
          expandDouble();
          expandFail();
        }
        cur_node.addChild(new_node);
        cur_node = new_node;
      }
    }
    cur_node.finish = pattern;
    cur_node.addPattern(pattern);
  };
  patterns.forEach(addPattern);

  // console.log(status_array);
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
  console.log("base&check:", double_array.filter(e => e.base !== 0 || e.check !== -255));

  console.log("next", next_array);

  // 计算fail
  node_queue.push(...root.children);
  fail_array[root.index] = root.index;
  while (node_queue.length !== 0) {
    const cur_node = node_queue.shift();
    const f = cur_node.father;
    if (f.index === root.index) fail_array[cur_node.index] = f.index; // 第一层子节点
    else {
      let fail = fail_array[f.index];
      while (fail !== null) {
        const result = status_array[fail].findChild(cur_node.character)
        if (result) {
          fail_array[cur_node.index] = result.index;
          break;
        } else {
          if (fail === root.index) {
            fail_array[cur_node.index] = root.index;
            break;
          } else {
            fail = fail_array[status_array[fail].index];
          }

        }
      }
    }
    node_queue.push(...cur_node.children);
  }
  console.log(fail_array.filter(e => e !== -1));

  node_queue.push(...root.children);
  while (node_queue.length !== 0) {
    const cur_node = node_queue.shift();
    cur_node.addPattern(...status_array[fail_array[cur_node.index]].patterns);
    node_queue.push(...cur_node.children);
  }
  // 匹配部分
  const ret: Array<ac_result> = [];
  let cur_pos = 0;
  let cur_status = 0;
  while (sample[cur_pos] !== undefined) {
    const forward = next_array[sample.charCodeAt(cur_pos) + double_array[cur_status].base]?.state;

    if (double_array[forward]?.check === cur_status) {
      cur_status = forward;
      cur_pos = cur_pos + 1;
      if (status_array[cur_status].patterns.length !== 0) ret.push({
        position: cur_pos - 1,
        pattern: status_array[cur_status].patterns,
      })
    } else {
      if (cur_status === root.index) {
        cur_pos = cur_pos + 1;
      } else {
        cur_status = fail_array[cur_status];
      }
    }
  }
  return ret;

}

const main = async () => {
  console.log(`Starting AC`);
  await setTimeout(100);
  console.log(`Double Array AC with typescript by ${author}`);
  console.log('---------------------------------');

  rl.question("input query string: ", (answer) => {
    const result = ac(patterns, answer);
    console.log(result);
    console.log('---------------------------------');
    rl.close();
  })
}

main();