function transformArray(sourceArray, mapping, options) {
  var preserveUnmapped = options && options.preserveUnmapped != undefined ? options.preserveUnmapped : true;
  var coerce = options && options.coerce != undefined ? options.coerce : 'real';

  var arr = ArrayDirect(sourceArray);

  var pairs = [];
  var fromKey, toKey;
  for (fromKey in mapping) {
    toKey = mapping[fromKey];
    pairs[pairs.length] = {
      from: fromKey,
      to: toKey,
      col: ArrayExtractKeys(arr, fromKey)
    };
  }

  var result = [];
  var i, j, newObj, rawVal, coercedVal, obj, k;
  var n = ArrayCount(arr);

  for (i = 0; i < n; i++) {
    newObj = new Object();

    for (j = 0; j < pairs.length; j++) {
      rawVal = pairs[j].col[i];
      if (rawVal == undefined) continue;
      if (coerce == 'real') {
        coercedVal = OptReal(rawVal);
        newObj.SetProperty(pairs[j].to, coercedVal == undefined ? rawVal : coercedVal);
      } else if (coerce == 'int') {
        coercedVal = OptInt(rawVal);
        newObj.SetProperty(pairs[j].to, coercedVal == undefined ? rawVal : coercedVal);
      } else {
        newObj.SetProperty(pairs[j].to, rawVal);
      }
    }

    if (preserveUnmapped) {
      obj = arr[i];
      for (k in obj) {
        toKey = mapping[k] != undefined ? mapping[k] : k;
        if (newObj.HasProperty && newObj.HasProperty(toKey)) continue;
        rawVal = obj[k];
        if (coerce == 'real') {
          coercedVal = OptReal(rawVal);
          newObj.SetProperty(toKey, coercedVal == undefined ? rawVal : coercedVal);
        } else if (coerce == 'int') {
          coercedVal = OptInt(rawVal);
          newObj.SetProperty(toKey, coercedVal == undefined ? rawVal : coercedVal);
        } else {
          newObj.SetProperty(toKey, rawVal);
        }
      }
    }

    result[i] = newObj;
  }

  return result;
}

var sampleArray = [
  { r1_v: -6, r2_v: 760, r3_v: 50, extra: 'x' },
  { r1_v: 10, r2_v: 755, r3_v: 60 }
];

var keyMap = {
  'r1_v': 'Температура',
  'r2_v': 'Давление',
  'r3_v': 'Влажность'
};

var transformed = transformArray(sampleArray, keyMap, {
  preserveUnmapped: true,
  coerce: 'real'
});

alert(tools.object_to_text(transformed, 'json'));


