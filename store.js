"use strict";

module.exports = {
  addResponse ( response ) {
    for(let item in response) {
      console.log(`${item} : ${response[item]}`);
    }
    return Promise.resolve()
  }
}