// const solution = (numbers) => {
//   if (numbers.length > 0) {
//     max = numbers[0];
//     for (each of numbers) {
//       if (each > max) {
//         max = each;
//       }
//     }
//     return max;
//   } else {
//     return 0;
//   }
// };

const solution = (arr) => {
  // Type your solution here
  if (arr.length == 0) return "";

  left = arr[0];
  right = arr[0];

  counter = 0;
  flag = true; //true means left
  level = 0;
  for (each of arr.slice(1, arr.length)) {
  }
  console.log("LEFT", left);
  console.log("RIGHT", right);
  return left > right ? "Left" : "Right";
};

console.log(isEven(0));
console.log(isEven(4));
console.log(isEven(9));

console.log(solution([1, 10, 5, 1, 0, 6]));
