import { setTimeout } from 'timers/promises';
import { author } from "./config";
import * as readline from "readline";

const max = (a: number, b: number) => {
  return a > b ? a : b;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const lcs = (a: string, b: string) => {
  const dp: Array<Array<number>> = Array(a.length + 1).fill(null).map(e =>
    Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  
  let ret: Array<string> = [];
  const findStr = (row: number, col: number, curStr: string) => {
    if (row === 0 || col === 0) {
      if (ret.indexOf(curStr) === -1) ret.push(curStr);
      return;
    }
    if (dp[row - 1][col] > dp[row][col - 1]) findStr(row - 1, col, curStr);
    else if (dp[row - 1][col] < dp[row][col - 1]) findStr(row, col - 1, curStr);
    else if (dp[row - 1][col] === dp[col][row]) {
      findStr(row - 1, col, curStr);
      findStr(row, col - 1, curStr);
    }
    else {
      findStr(row - 1, col - 1, a[row - 1] + curStr);
    }
  }
  findStr(a.length, b.length, '');
  return ret;
}

const main = async () => {
  console.log(`Starting LCS`);
  await setTimeout(100);
  console.log(`LCS with typescript by ${author}`);
  console.log('---------------------------------');
  rl.question("input first string: ", (answer) => {
    rl.question("input second string: ", (answer2) => {
      const result = lcs(answer, answer2);
      console.log("LCS result: ", result);
      console.log('---------------------------------');
      rl.close();
    })
  })

}

main();