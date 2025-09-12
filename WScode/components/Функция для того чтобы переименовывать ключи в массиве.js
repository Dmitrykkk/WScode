function transformArrayWithMapping(sourceArray, mapping) {
  var result = [];
  var i, obj, key, newObj, mappedKey, rawVal, realVal;
  for (i = 0; i < sourceArray.length; i++) {
    obj = sourceArray[i];
    newObj = new Object();
    for (key in obj) {
      mappedKey = mapping[key] != undefined ? mapping[key] : key;
      rawVal = obj[key];
      realVal = OptReal(rawVal);
      newObj.SetProperty(mappedKey, realVal == undefined ? rawVal : realVal);
    }
    result[i] = newObj;
  }
  return result;
}

var arr = [
  { r1_v: -6, r2_v: 760, r3_v: 50 },
  { r1_v: 10, r2_v: 755, r3_v: 60 }
];

var keyMap = {
  "r1_v": "Температура",
  "r2_v": "Давление",
  "r3_v": "Влажность"
};

arr = transformArrayWithMapping(arr, keyMap);

alert(tools.object_to_text(arr, 'json'));
