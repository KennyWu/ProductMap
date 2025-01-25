export function createXYDirString(fractionDigits) {
  return (coordinate) => {
    let latDir = "";
    let longDir = "";
    let template = "{x}{longDir}, {y}{latDir}";
    if (coordinate[0] != 0) {
      if (coordinate[0] < 0) {
        longDir = "W";
      } else {
        longDir = "E";
      }
    }

    if (coordinate[1] != 0) {
      if (coordinate[1] < 0) {
        latDir = "S";
      } else {
        latDir = "N";
      }
    }

    let vars = {
      longDir: longDir,
      latDir: latDir,
      x: fixDigits(
        String(Math.abs(coordinate[0].toFixed(fractionDigits))),
        fractionDigits
      ),
      y: fixDigits(
        String(Math.abs(coordinate[1].toFixed(fractionDigits))),
        fractionDigits
      ),
    };

    return fillStringTemplate(template, vars);
  };
}

function fixDigits(floatVal, fractionDigits) {
  let strVal = floatVal;
  let split = strVal.split(".");
  let addToEnd = "";
  if (split.length != 2) {
    addToEnd = "." + "0".repeat(fractionDigits);
  } else if (split[1].length < fractionDigits) {
    addToEnd = "0".repeat(Math.abs(split[1].length - fractionDigits));
  }

  return strVal + addToEnd;
}

export function fillStringTemplate(template, vars) {
  let finalString = template;
  for (const key of Object.keys(vars)) {
    let toReplace = "{" + key + "}";
    finalString = finalString.replaceAll(toReplace, vars[key]);
  }
  return finalString;
}
