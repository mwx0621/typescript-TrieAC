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

const ac = (patterns: Array<string>, sample: string) => {
  const double_array: Array<trie_node> = Array(256).fill(null).map(
    (e): trie_node => { return { base: 0, check: -255 } });

}

const main = async () => {
  console.log(`Starting LCS`);
  await setTimeout(100);
  console.log(`Double Array AC with typescript by ${author}`);
  console.log('---------------------------------');
  rl.question("input first string: ", (answer) => {
    rl.question("input second string: ", (answer2) => {

      console.log("AC result: ");
      console.log('---------------------------------');
      rl.close();
    })
  })
}