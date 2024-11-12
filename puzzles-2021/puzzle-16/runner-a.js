'use strict';

const reader = require('../../lib/readStrings');

const dataFilePath = './data.txt';

function parseData(data) {
  const charArray = data[0].split('');
  const intArray = charArray.map(x => parseInt(x, 16));
  const binaryArray = intArray.map(x => x.toString(2).padStart(4, '0'));
  const binaryString = binaryArray.join('');

  return binaryString;
}

function parseOperator(message) {
  const version = parseInt(message.slice(0, 3), 2);
  const typeId = parseInt(message.slice(3, 6), 2);
  let pos = 6;

  const packet = {
    version ,
    typeId,
    subpackets: []
  };

  const lengthTypeId = message.charAt(pos);
  pos++;

  if (lengthTypeId === '0') {
    const subpacketsLength = parseInt(message.slice(pos, pos+15), 2);
    let foundLength = 0;
    pos += 15;
    while (foundLength < subpacketsLength) {
      let subpacket = getNextPacket(message.slice(pos));
      foundLength += subpacket.size;
      pos += subpacket.size;
      packet.subpackets.push(subpacket);
    }
  }
  else {
    const subpacketsCount = parseInt(message.slice(pos, pos+11), 2);
    pos += 11;
    while (packet.subpackets.length < subpacketsCount) {
      let subpacket = getNextPacket(message.slice(pos));
      pos += subpacket.size;
      packet.subpackets.push(subpacket);
    }
  }

  packet.size = pos;

  return packet;
}

function parseLiteral(message) {
  const version = parseInt(message.slice(0, 3), 2);
  const typeId = parseInt(message.slice(3, 6), 2);
  let pos = 6;

  const packet = {
    version ,
    typeId,
    subpackets: []
  };

  let lastGroup = false;
  let binaryString = '';
  while (!lastGroup) {
    const nextGroup = message.slice(pos, pos+5);
    const firstBit = nextGroup.charAt(0);
    const valueBits = nextGroup.slice(1);
    binaryString += valueBits;

    lastGroup = (firstBit === '0');
    pos += 5;
  }

  packet.value = parseInt(binaryString, 2);
  packet.size = pos;

  return packet;
}

function getNextPacket(message) {
  const version = parseInt(message.slice(0, 3), 2);
  const typeId = parseInt(message.slice(3, 6), 2);

  let packet;
  if (typeId === 4) {
    packet = parseLiteral(message);
  }
  else {
    packet = parseOperator(message);
  }

  return packet;
}

function sumVersions(packet) {
  let total = packet.version;
  for (const subpacket of packet.subpackets) {
    total += sumVersions(subpacket);
  }

  return total;
}

function computePacket(packet) {
  let result = 0;
  if (packet.typeId === 4) {
    return packet.value;
  }
  else if (packet.typeId === 0) {
    // Sum of the subpackets
    for (const subpacket of packet.subpackets) {
      result += computePacket(subpacket);
    }
  }
  else if (packet.typeId === 1) {
    // Product of the subpackets
    result = 1;
    for (const subpacket of packet.subpackets) {
      result = result * computePacket(subpacket);
    }
  }
  else if (packet.typeId === 2) {
    // Min value of the subpackets
    const values = [];
    for (const subpacket of packet.subpackets) {
      values.push(computePacket(subpacket));
    }
    result = Math.min(...values);
  }
  else if (packet.typeId === 3) {
    // Max value of the subpackets
    const values = [];
    for (const subpacket of packet.subpackets) {
      values.push(computePacket(subpacket));
    }
    result = Math.max(...values);
  }
  else if (packet.typeId === 5) {
    // subpacket 1 greater than subpacket 2
    const values = [];
    for (const subpacket of packet.subpackets) {
      values.push(computePacket(subpacket));
    }
    result = values[0] > values[1] ? 1 : 0;
  }
  else if (packet.typeId === 6) {
    // subpacket 1 less than subpacket 2
    const values = [];
    for (const subpacket of packet.subpackets) {
      values.push(computePacket(subpacket));
    }
    result = values[0] < values[1] ? 1 : 0;
  }
  else if (packet.typeId === 7) {
    // subpacket 1 equal to subpacket 2
    const values = [];
    for (const subpacket of packet.subpackets) {
      values.push(computePacket(subpacket));
    }
    result = values[0] === values[1] ? 1 : 0;
  }

  return result;
}

async function runner() {
  const data = await reader.readFile(dataFilePath);
  let fullMessage = parseData(data);

  console.time();

  let packet = getNextPacket(fullMessage);

  const totalVersions = sumVersions(packet);
  const total = computePacket(packet);

  console.timeEnd();

  console.log(total);

  console.log('done');
}

runner()
  .then(() => process.exit())
  .catch(err => {
    console.log('runner() - Error: ' + err);
    process.exit(1);
  });
