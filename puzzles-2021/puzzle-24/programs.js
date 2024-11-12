'use strict';

function truncate(i) {
  return Math.sign(i) * Math.floor(Math.abs(i));
}

const prog1 = function(i, w, x, y, z) {
  // inp w
  w = i;

  // mul x 0
  x = x * 0;

  // add x z
  x = x + z;

  // mod x 26
  x = x%26;

  // div z 1
  z = truncate(z / 1);

  // add x 12
  x = x + 12;

  // eql x w
  x = x === w ? 1 : 0;

  // eql x 0
  x = x === 0 ? 1 : 0;

  // mul y 0
  y = y * 0;

  // add y 25
  y = y + 25;

  // mul y x
  y = y * x;

  // add y 1
  y = y + 1;

  // mul z y
  z = z * y;

  // mul y 0
  y = y * 0;

  // add y w
  y = y + w;

  // add y 1
  y = y + 1;

  // mul y x
  y = y * x;

  // add z y
  z = z + y;

  return { w, x, y, z };
}

const prog2 = function(i, w, x, y, z) {
  // inp w
  w = i;

  // mul x 0
  x = x * 0;

  // add x z
  x = x + z;

  // mod x 26
  x = x%26;

  // div z 1
  z = truncate(z / 1);

  // add x 12
  x = x + 12;

  // eql x w
  x = x === w ? 1 : 0;

  // eql x 0
  x = x === 0 ? 1 : 0;

  // mul y 0
  y = y * 0;

  // add y 25
  y = y + 25;

  // mul y x
  y = y * x;

  // add y 1
  y = y + 1;

  // mul z y
  z = z * y;

  // mul y 0
  y = y * 0;

  // add y w
  y = y + w;

  // add y 1
  y = y + 1;

  // mul y x
  y = y * x;

  // add z y
  z = z + y;

  return { w, x, y, z };
}

const prog3 = function(i, w, x, y, z) {
  // inp w
  w = i;

  // mul x 0
  x = x * 0;

  // add x z
  x = x + z;

  // mod x 26
  x = x%26;

  // div z 1
  z = truncate(z / 1);

  // add x 15
  x = x + 15;

  // eql x w
  x = x === w ? 1 : 0;

  // eql x 0
  x = x === 0 ? 1 : 0;

  // mul y 0
  y = y * 0;

  // add y 25
  y = y + 25;

  // mul y x
  y = y * x;

  // add y 1
  y = y + 1;

  // mul z y
  z = z * y;

  // mul y 0
  y = y * 0;

  // add y w
  y = y + w;

  // add y 16
  y = y + 16;

  // mul y x
  y = y * x;

  // add z y
  z = z + y;

  return { w, x, y, z };
}

const prog4 = function(i, w, x, y, z) {
  // inp w
  w = i;

  // mul x 0
  x = x * 0;

  // add x z
  x = x + z;

  // mod x 26
  x = x%26;

  // div z 26
  z = truncate(z / 26);

  // add x -8
  x = x - 8;

  // eql x w
  x = x === w ? 1 : 0;

  // eql x 0
  x = x === 0 ? 1 : 0;

  // mul y 0
  y = y * 0;

  // add y 25
  y = y + 25;

  // mul y x
  y = y * x;

  // add y 1
  y = y + 1;

  // mul z y
  z = z * y;

  // mul y 0
  y = y * 0;

  // add y w
  y = y + w;

  // add y 5
  y = y + 5

  // mul y x
  y = y * x;

  // add z y
  z = z + y;

  return { w, x, y, z };
}

const prog5 = function(i, w, x, y, z) {
  // inp w
  w = i;

  // mul x 0
  x = x * 0;

  // add x z
  x = x + z;

  // mod x 26
  x = x%26;

  // div z 26
  z = truncate(z / 26);

  // add x -4
  x = x - 4;

  // eql x w
  x = x === w ? 1 : 0;

  // eql x 0
  x = x === 0 ? 1 : 0;

  // mul y 0
  y = y * 0;

  // add y 25
  y = y + 25;

  // mul y x
  y = y * x;

  // add y 1
  y = y + 1;

  // mul z y
  z = z * y;

  // mul y 0
  y = y * 0;

  // add y w
  y = y + w;

  // add y 9
  y = y + 9;

  // mul y x
  y = y * x;

  // add z y
  z = z + y;

  return { w, x, y, z };
}

const prog6 = function(i, w, x, y, z) {
  // inp w
  w = i;

  // mul x 0
  x = x * 0;

  // add x z
  x = x + z;

  // mod x 26
  x = x%26;

  // div z 1
  z = truncate(z / 1);

  // add x 15
  x = x + 15;

  // eql x w
  x = x === w ? 1 : 0;

  // eql x 0
  x = x === 0 ? 1 : 0;

  // mul y 0
  y = y * 0;

  // add y 25
  y = y + 25;

  // mul y x
  y = y * x;

  // add y 1
  y = y + 1;

  // mul z y
  z = z * y;

  // mul y 0
  y = y * 0;

  // add y w
  y = y + w;

  // add y 3
  y = y + 3;

  // mul y x
  y = y * x;

  // add z y
  z = z + y;

  return { w, x, y, z };
}

const prog7 = function(i, w, x, y, z) {
  // inp w
  w = i;

  // mul x 0
  x = x * 0;

  // add x z
  x = x + z;

  // mod x 26
  x = x%26;

  // div z 1
  z = truncate(z / 1);

  // add x 14
  x = x + 14;

  // eql x w
  x = x === w ? 1 : 0;

  // eql x 0
  x = x === 0 ? 1 : 0;

  // mul y 0
  y = y * 0;

  // add y 25
  y = y + 25;

  // mul y x
  y = y * x;

  // add y 1
  y = y + 1;

  // mul z y
  z = z * y;

  // mul y 0
  y = y * 0;

  // add y w
  y = y + w;

  // add y 2
  y = y + 2;

  // mul y x
  y = y * x;

  // add z y
  z = z + y;

  return { w, x, y, z };
}

const prog8 = function(i, w, x, y, z) {
  // inp w
  w = i;

  // mul x 0
  x = x * 0;

  // add x z
  x = x + z;

  // mod x 26
  x = x%26;

  // div z 1
  z = truncate(z / 1);

  // add x 14
  x = x + 14;

  // eql x w
  x = x === w ? 1 : 0;

  // eql x 0
  x = x === 0 ? 1 : 0;

  // mul y 0
  y = y * 0;

  // add y 25
  y = y + 25;

  // mul y x
  y = y * x;

  // add y 1
  y = y + 1;

  // mul z y
  z = z * y;

  // mul y 0
  y = y * 0;

  // add y w
  y = y + w;

  // add y 15
  y = y + 15;

  // mul y x
  y = y * x;

  // add z y
  z = z + y;

  return { w, x, y, z };
}

const prog9 = function(i, w, x, y, z) {
  // inp w
  w = i;

  // mul x 0
  x = x * 0;

  // add x z
  x = x + z;

  // mod x 26
  x = x%26;

  // div z 26
  z = truncate(z / 26);

  // add x -13
  x = x - 13;

  // eql x w
  x = x === w ? 1 : 0;

  // eql x 0
  x = x === 0 ? 1 : 0;

  // mul y 0
  y = y * 0;

  // add y 25
  y = y + 25;

  // mul y x
  y = y * x;

  // add y 1
  y = y + 1;

  // mul z y
  z = z * y;

  // mul y 0
  y = y * 0;

  // add y w
  y = y + w;

  // add y 5
  y = y + 5;

  // mul y x
  y = y * x;

  // add z y
  z = z + y;

  return { w, x, y, z };
}

const prog10 = function(i, w, x, y, z) {
  // inp w
  w = i;

  // mul x 0
  x = x * 0;

  // add x z
  x = x + z;

  // mod x 26
  x = x%26;

  // div z 26
  z = truncate(z / 26);

  // add x -3
  x = x - 3;

  // eql x w
  x = x === w ? 1 : 0;

  // eql x 0
  x = x === 0 ? 1 : 0;

  // mul y 0
  y = y * 0;

  // add y 25
  y = y + 25;

  // mul y x
  y = y * x;

  // add y 1
  y = y + 1;

  // mul z y
  z = z * y;

  // mul y 0
  y = y * 0;

  // add y w
  y = y + w;

  // add y 11
  y = y + 11;

  // mul y x
  y = y * x;

  // add z y
  z = z + y;

  return { w, x, y, z };
}

const prog11 = function(i, w, x, y, z) {
  // inp w
  w = i;

  // mul x 0
  x = x * 0;

  // add x z
  x = x + z;

  // mod x 26
  x = x%26;

  // div z 26
  z = truncate(z / 26);

  // add x -7
  x = x - 7;

  // eql x w
  x = x === w ? 1 : 0;

  // eql x 0
  x = x === 0 ? 1 : 0;

  // mul y 0
  y = y * 0;

  // add y 25
  y = y + 25;

  // mul y x
  y = y * x;

  // add y 1
  y = y + 1;

  // mul z y
  z = z * y;

  // mul y 0
  y = y * 0;

  // add y w
  y = y + w;

  // add y 7
  y = y + 7;

  // mul y x
  y = y * x;

  // add z y
  z = z + y;

  return { w, x, y, z };
}

const prog12 = function(i, w, x, y, z) {
  // inp w
  w = i;

  // mul x 0
  x = x * 0;

  // add x z
  x = x + z;

  // mod x 26
  x = x%26;

  // div z 1
  z = truncate(z / 1);

  // add x 10
  x = x + 10;

  // eql x w
  x = x === w ? 1 : 0;

  // eql x 0
  x = x === 0 ? 1 : 0;

  // mul y 0
  y = y * 0;

  // add y 25
  y = y + 25;

  // mul y x
  y = y * x;

  // add y 1
  y = y + 1;

  // mul z y
  z = z * y;

  // mul y 0
  y = y * 0;

  // add y w
  y = y + w;

  // add y 1
  y = y + 1;

  // mul y x
  y = y * x;

  // add z y
  z = z + y;

  return { w, x, y, z };
}

const prog13 = function(i, w, x, y, z) {
  // inp w
  w = i;

  // mul x 0
  x = x * 0;

  // add x z
  x = x + z;

  // mod x 26
  x = x%26;

  // div z 26
  z = truncate(z / 26);

  // add x -6
  x = x - 6;

  // eql x w
  x = x === w ? 1 : 0;

  // eql x 0
  x = x === 0 ? 1 : 0;

  // mul y 0
  y = y * 0;

  // add y 25
  y = y + 25;

  // mul y x
  y = y * x;

  // add y 1
  y = y + 1;

  // mul z y
  z = z * y;

  // mul y 0
  y = y * 0;

  // add y w
  y = y + w;

  // add y 10
  y = y + 10;

  // mul y x
  y = y * x;

  // add z y
  z = z + y;

  return { w, x, y, z };
}

const prog14 = function(i, w, x, y, z) {
  // inp w
  w = i;

  // mul x 0
  x = x * 0;

  // add x z
  x = x + z;

  // mod x 26
  x = x%26;

  // div z 26
  z = truncate(z / 26);

  // add x -8
  x = x - 8;

  // eql x w
  x = x === w ? 1 : 0;

  // eql x 0
  x = x === 0 ? 1 : 0;

  // mul y 0
  y = y * 0;

  // add y 25
  y = y + 25;

  // mul y x
  y = y * x;

  // add y 1
  y = y + 1;

  // mul z y
  z = z * y;

  // mul y 0
  y = y * 0;

  // add y w
  y = y + w;

  // add y 3
  y = y + 3;

  // mul y x
  y = y * x;

  // add z y
  z = z + y;

  return { w, x, y, z };
}

exports.programs = [ prog1, prog2, prog3, prog4, prog5, prog6, prog7, prog8, prog9, prog10, prog11, prog12, prog13, prog14 ];

