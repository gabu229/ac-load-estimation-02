const room = {
  length: 25.786,
  width: 6.43,
  height: 3.11,
  occupants: 192,
  ac_rating: 3,
  air_changes: 1.5,
  infiltrated_air: 0,
  ac_count: 0,
};

const lighting = {
  count: 14,
  allowance_factor: 1.25,
  use_factor: 1,
  wattage_per_square: 14,
};

const infiltrated_air = {
  t1: 23,
  t2: 35,
  w1: 0.0277,
  w2: 0.01,
};

const doors = {
  length: 2.1336,
  width: 0.9144,
  get area() {
    return roundNumber(this.length * this.width);
  },
  north: 0,
  south: 0,
  east: 5,
  west: 0,
};

const windows = {
  length: 1.524,
  width: 1.2196,
  get area() {
    return roundNumber(this.length * this.width);
  },
  north: 0,
  south: 0,
  east: 6,
  west: 6,
};

const equipments = [
  {
    item: "computers",
    power_output: 125,
    count: 30,
  },
  {
    item: "printers",
    power_output: 550,
    count: 2,
  },
];

const HEAT_COEFFICIENT = {
  roof: 2.52,
  floor: 4.5,
  walls: {
    north: 2.5,
    south: 2.27,
    east: 2.27,
    west: 2.27,
  },
  doors: {
    north: 1.5,
    south: 1.5,
    east: 1.5,
    west: 1.5,
  },
  windows: {
    north: 5.6,
    south: 5.6,
    east: 5.6,
    west: 5.6,
  },
};

const AREA = {
  roof: 0,
  floor: 0,
  walls: {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  },
  doors: {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  },
  windows: {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  },
};

const EQUIVALENT_TEMPERATURE_DIFF = {
  roof: 15,
  floor: 2.5,
  walls: {
    north: 11,
    south: 27,
    east: 18,
    west: 18,
  },
  doors: {
    north: 12,
    south: 12,
    east: 12,
    west: 12,
  },
  windows: {
    north: 12,
    south: 12,
    east: 12,
    west: 12,
  },
};

const SENSIBLE_HEAT_GAIN = {
  roof: 0,
  floor: 0,
  walls: {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  },
  doors: {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  },
  windows: {
    north: 0,
    south: 0,
    east: 0,
    west: 0,
  },
  due_to: {
    occupants: 0,
    infiltrated_air: 0,
    lighting: 0,
    equipments: 0,
  },
  per: {
    occupant: 65,
  },
};

const LATENT_HEAT_GAIN = {
  due_to: {
    occupants: 0,
    infiltrated_air: 0,
    lighting: 0,
    equipments: 0,
  },
  per: {
    occupant: 30,
  },
};

const SOLAR_HEAT_GAIN_FACTOR = {
  windows: {
    north: 104,
    south: 504.7,
    east: 50,
    west: 350,
    total: 0,
  },
};

const SOLAR_COOLING_LOAD_FACTOR = {
  windows: {
    north: 128,
    south: 150,
    east: 50,
    west: 350,
    total: 0,
  },
};

const SOLAR_HEAT_GAIN = {
  windows: {
    north: 128,
    south: 150,
    east: 50,
    west: 350,
    total: 0,
  },
};

$(document).ready(function () {
  updateAllValuesToFields();

  doAllComputations();

  $("input").change(function () {
    doAllComputations();
  });

  $("input").keyup(function () {
    doAllComputations();
  });
});

function doAllComputations() {
  // GET ALL INPUT VALUES & PARAMS
  updateAllValuesFromFields();

  // DO NECESSARY CALCULATIONS STEP BY STEP
  calculateWallsArea();
  calculateRoofAndFloorArea();
  calculateDoorsAndWindowsArea();
  calculateWallsAndDoorsAndWindowsSensibleHeatGain();
  calculateRoofAndFloorSensibleHeatGain();
  calculateOccupantsParams();
  calculateOtherRequiredParams();
  calculateTotalSensibleHeatGain();
  calculateWindowsSolarHeatGain();
  doFinalCalculation();

  // DISPLAY VALUES AND RESULTS ON SCREEN
  updateValuesInDisplay();
}

function calculateWallsArea() {
  let sections = ["north", "south", "east", "west"];

  sections.forEach((section) => {
    let wallArea;
    if (section === "north" || section === "south") {
      wallArea = room.height * room.width;
    } else {
      wallArea = room.height * room.length;
    }

    const totalDoorArea = doors.area * doors[section];
    const totalWindowArea = windows.area * windows[section];

    const calculationString = `${wallArea} - ${totalDoorArea} - ${totalWindowArea}`;
    const result = wallArea - totalDoorArea - totalWindowArea;

    // AREA.walls[section] = `${calculationString} = ${result}`;
    AREA.walls[section] = roundNumber(result);
  });
}

function calculateDoorsAndWindowsArea() {
  let sections = ["north", "south", "east", "west"];

  sections.forEach((section) => {
    const doorsArea = doors.area * doors[section];
    const windowsArea = windows.area * windows[section];

    AREA.doors[section] = roundNumber(doorsArea);
    AREA.windows[section] = roundNumber(windowsArea);
  });
}

function calculateRoofAndFloorArea() {
  let sections = ["roof", "floor"];

  sections.forEach((section) => {
    let result = room.length * room.width;

    AREA[section] = roundNumber(result);
  });
}

function calculateWallsAndDoorsAndWindowsSensibleHeatGain() {
  let sections = ["north", "south", "east", "west"];

  sections.forEach((section) => {
    // WALLS
    SENSIBLE_HEAT_GAIN.walls[section] = roundNumber(
      HEAT_COEFFICIENT.walls[section] *
        AREA.walls[section] *
        EQUIVALENT_TEMPERATURE_DIFF.walls[section]
    );

    // DOORS
    SENSIBLE_HEAT_GAIN.doors[section] = roundNumber(
      HEAT_COEFFICIENT.doors[section] *
        AREA.doors[section] *
        EQUIVALENT_TEMPERATURE_DIFF.doors[section]
    );

    // WINDOWS
    SENSIBLE_HEAT_GAIN.windows[section] = roundNumber(
      HEAT_COEFFICIENT.windows[section] *
        AREA.windows[section] *
        EQUIVALENT_TEMPERATURE_DIFF.windows[section]
    );
  });
}

function calculateSensibleHeatGainDueToFactors() {
  // CALCULATE AMOUNT OF INFILTRATED AIR
  room.infiltrated_air =
    (room.length * room.width * room.height * room.air_changes) / 60;
  // DUE TO INFILTRATED AIR
}

function calculateRoofAndFloorSensibleHeatGain() {
  let sections = ["roof", "floor"];

  sections.forEach((section) => {
    SENSIBLE_HEAT_GAIN[section] = roundNumber(
      HEAT_COEFFICIENT[section] *
        AREA[section] *
        EQUIVALENT_TEMPERATURE_DIFF[section]
    );
  });
}

function calculateWindowsSolarHeatGain() {
  let sections = ["north", "south", "east", "west"];

  sections.forEach((section) => {
    SOLAR_HEAT_GAIN.windows[section] = roundNumber(
      windows.area * windows[section] * SOLAR_HEAT_GAIN_FACTOR.windows[section]
    );
  });

  SOLAR_HEAT_GAIN.windows.total = roundNumber(
    sumOfValues(SOLAR_HEAT_GAIN.windows, ["total"])
  );
}

function calculateOccupantsParams() {
  SENSIBLE_HEAT_GAIN.due_to.occupants = roundNumber(
    SENSIBLE_HEAT_GAIN.per.occupant * room.occupants * 0.71
  );

  LATENT_HEAT_GAIN.due_to.occupants = roundNumber(
    LATENT_HEAT_GAIN.per.occupant * room.occupants
  );
}

function calculateOtherRequiredParams() {
  // CALCULATE SHG DUE TO LIGHTING
  SENSIBLE_HEAT_GAIN.due_to.lighting = roundNumber(
    lighting.count *
      (room.width * room.length) *
      lighting.use_factor *
      lighting.allowance_factor
  );

  // AMOUNT OF INF AIR
  room.infiltrated_air = roundNumber(
    (room.length * room.width * room.height * room.air_changes) / 60
  );

  // SHG DUE TO INF AIR
  SENSIBLE_HEAT_GAIN.due_to.infiltrated_air = roundNumber(
    20.44 *
      room.infiltrated_air *
      Math.abs(infiltrated_air.t1 - infiltrated_air.t2)
  );

  // LHG DUE TO INF AIR
  LATENT_HEAT_GAIN.due_to.infiltrated_air = roundNumber(
    // 50000 * room.infiltrated_air * Math.abs(infiltrated_air.w1 - infiltrated_air.w2)
    50000 * room.infiltrated_air * 0.00715
  );

  let x = 0;
  equipments.forEach((item) => {
    x += item.count * item.power_output;
  });

  SENSIBLE_HEAT_GAIN.due_to.equipments = x;
}

function calculateTotalSensibleHeatGain() {
  $("#totalOfTotalSensibleHeatGain").html(
    roundNumber(sumOfValues(SENSIBLE_HEAT_GAIN, ["due_to", "per"]))
  );
}

function doFinalCalculation() {
  let x = sumOfValues(SENSIBLE_HEAT_GAIN, ["due_to", "per"]);
  let y = sumOfValues(SENSIBLE_HEAT_GAIN.due_to);

  let totalSHG = x + y + SOLAR_HEAT_GAIN.windows.total;
  let totalLHG = sumOfValues(LATENT_HEAT_GAIN.due_to);

  let totalHeat = totalLHG + totalSHG;

  // CONVERT TO TONS THEN HP
  let totalInTons = roundNumber(0.0002843 * totalHeat);
  let totalInHP = 4.714 * totalInTons;

  console.warn(totalInHP);

  room.ac_count = Math.round(totalInHP / room.ac_rating);
}

// RECURSIVE FUNCTION TO SUM OBJECT VALUES WITH EXCLUSIONS
function sumOfValues(object, exclusions = []) {
  let sum = 0;

  for (const key in object) {
    if (!exclusions.includes(key)) {
      if (typeof object[key] === "object") {
        sum += sumOfValues(object[key], exclusions);
      } else if (typeof object[key] === "number") {
        sum += object[key];
      }
    }
  }

  return sum;
}

function updateAllValuesFromFields() {
  // Update room values
  room.length = parseFloat($("#roomLength").val()) || 0;
  room.width = parseFloat($("#roomWidth").val()) || 0;
  room.height = parseFloat($("#roomHeight").val()) || 0;
  room.occupants = parseFloat($("#occupantsCount").val()) || 0;
  room.ac_rating = parseFloat($("#roomRating").val()) || 0;
  
  // Update Equipments
  equipments[0].count = parseFloat($("#computersCount").val()) || 0;
  equipments[0].power_output = parseFloat($("#computerPower").val()) || 0;
  equipments[1].count = parseFloat($("#printersCount").val()) || 0;
  equipments[1].power_output = parseFloat($("#printerPower").val()) || 0;

  // Update Lighting
  lighting.count = parseFloat($("#lightingCount").val()) || 0;
  lighting.use_factor = parseFloat($("#lightingUseFactor").val()) || 0;
  lighting.allowance_factor =
    parseFloat($("#lightingAllowanceFactor").val()) || 0;

  // Update Inf Air Params
  infiltrated_air.t1 = parseFloat($("#CLTD1").val()) || 0;
  infiltrated_air.t2 = parseFloat($("#CLTD2").val()) || 0;
  infiltrated_air.w1 = parseFloat($("#infiltratedAirW1").val()) || 0;
  infiltrated_air.w2 = parseFloat($("#infiltratedAirW2").val()) || 0;

  // Update SHG
  SENSIBLE_HEAT_GAIN.per.occupant = parseFloat($("#occupantSHG").val()) || 0;
  LATENT_HEAT_GAIN.per.occupant = parseFloat($("#occupantLHG").val()) || 0;

  // Update door values
  doors.length = parseFloat($("#doorLength").val()) || 0;
  doors.width = parseFloat($("#doorWidth").val()) || 0;

  doors.north = parseInt($("#doorsCountNorth").val()) || 0;
  doors.south = parseInt($("#doorsCountSouth").val()) || 0;
  doors.east = parseInt($("#doorsCountEast").val()) || 0;
  doors.west = parseInt($("#doorsCountWest").val()) || 0;
  doors.area = doors.length * doors.width;

  // Update window values
  windows.length = parseFloat($("#windowsLength").val()) || 0;
  windows.width = parseFloat($("#windowsWidth").val()) || 0;

  windows.north = parseInt($("#windowsCountNorth").val()) || 0;
  windows.south = parseInt($("#windowsCountSouth").val()) || 0;
  windows.east = parseInt($("#windowsCountEast").val()) || 0;
  windows.west = parseInt($("#windowsCountWest").val()) || 0;
  windows.area = windows.length * windows.width;

  // Update Heat coefficient values
  HEAT_COEFFICIENT.walls.north =
    parseFloat($("#heatCoefficientNorthWall").val()) || 0;
  HEAT_COEFFICIENT.walls.south =
    parseFloat($("#heatCoefficientSouthWall").val()) || 0;
  HEAT_COEFFICIENT.walls.east =
    parseFloat($("#heatCoefficientEastWall").val()) || 0;
  HEAT_COEFFICIENT.walls.west =
    parseFloat($("#heatCoefficientWestWall").val()) || 0;
  HEAT_COEFFICIENT.roof = parseFloat($("#heatCoefficientRoof").val()) || 0;
  HEAT_COEFFICIENT.floor = parseFloat($("#heatCoefficientFloor").val()) || 0;
  HEAT_COEFFICIENT.doors.north =
    parseFloat($("#heatCoefficientNorthDoors").val()) || 0;
  HEAT_COEFFICIENT.doors.south =
    parseFloat($("#heatCoefficientSouthDoors").val()) || 0;
  HEAT_COEFFICIENT.doors.east =
    parseFloat($("#heatCoefficientEastDoors").val()) || 0;
  HEAT_COEFFICIENT.doors.west =
    parseFloat($("#heatCoefficientWestDoors").val()) || 0;
  HEAT_COEFFICIENT.windows.north =
    parseFloat($("#heatCoefficientNorthWindows").val()) || 0;
  HEAT_COEFFICIENT.windows.south =
    parseFloat($("#heatCoefficientSouthWindows").val()) || 0;
  HEAT_COEFFICIENT.windows.east =
    parseFloat($("#heatCoefficientEastWindows").val()) || 0;
  HEAT_COEFFICIENT.windows.west =
    parseFloat($("#heatCoefficientWestWindows").val()) || 0;

  // Update temperature coefficient
  EQUIVALENT_TEMPERATURE_DIFF.walls.north =
    parseFloat($("#eqTemperatureDifferenceNorthWall").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.walls.south =
    parseFloat($("#eqTemperatureDifferenceSouthWall").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.walls.east =
    parseFloat($("#eqTemperatureDifferenceEastWall").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.walls.west =
    parseFloat($("#eqTemperatureDifferenceWestWall").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.doors.north =
    parseFloat($("#eqTemperatureDifferenceNorthDoors").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.doors.south =
    parseFloat($("#eqTemperatureDifferenceSouthDoors").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.doors.east =
    parseFloat($("#eqTemperatureDifferenceEastDoors").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.doors.west =
    parseFloat($("#eqTemperatureDifferenceWestDoors").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.windows.north =
    parseFloat($("#eqTemperatureDifferenceNorthWindows").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.windows.south =
    parseFloat($("#eqTemperatureDifferenceSouthWindows").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.windows.east =
    parseFloat($("#eqTemperatureDifferenceEastWindows").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.windows.west =
    parseFloat($("#eqTemperatureDifferenceWestWindows").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.roof =
    parseFloat($("#eqTemperatureDifferenceRoof").val()) || 0;
  EQUIVALENT_TEMPERATURE_DIFF.floor =
    parseFloat($("#eqTemperatureDifferenceFloor").val()) || 0;

  // Log updated values
  //   console.log(room);
  //   console.log(doors);
  //   console.log(windows);
}

function updateAllValuesToFields() {
  // Update room values
  $("#roomLength").val(room.length);
  $("#roomWidth").val(room.width);
  $("#roomHeight").val(room.height);
  $("#roomRating").val(room.ac_rating);
  $("#occupantsCount").val(room.occupants);
  $("#occupantSHG").val(SENSIBLE_HEAT_GAIN.per.occupant);
  $("#occupantLHG").val(LATENT_HEAT_GAIN.per.occupant);
  
  // Update Equipments
  $("#computersCount").val(equipments[0].count);
  $("#computerPower").val(equipments[0].power_output);
  $("#printersCount").val(equipments[1].count);
  $("#printerPower").val(equipments[1].power_output);

  // Update lighting values
  $("#lightingCount").val(lighting.count);
  $("#lightingAllowanceFactor").val(lighting.allowance_factor);
  $("#lightingUseFactor").val(lighting.use_factor);

  // Update inf air param values
  $("#CLTD1").val(infiltrated_air.t1);
  $("#CLTD2").val(infiltrated_air.t2);
  $("#infiltratedAirW1").val(infiltrated_air.w1);
  $("#infiltratedAirW2").val(infiltrated_air.w2);

  // Update door values
  $("#doorLength").val(doors.length);
  $("#doorWidth").val(doors.width);

  $("#doorsCountNorth").val(doors.north);
  $("#doorsCountSouth").val(doors.south);
  $("#doorsCountEast").val(doors.east);
  $("#doorsCountWest").val(doors.west);
  doors.area = doors.length * doors.width;

  // Update window values
  $("#windowsLength").val(windows.length);
  $("#windowsWidth").val(windows.width);

  $("#windowsCountNorth").val(windows.north);
  $("#windowsCountSouth").val(windows.south);
  $("#windowsCountEast").val(windows.east);
  $("#windowsCountWest").val(windows.west);
  windows.area = windows.length * windows.width;

  // Update Heat coefficient values
  $("#heatCoefficientNorthWall").val(HEAT_COEFFICIENT.walls.north);
  $("#heatCoefficientSouthWall").val(HEAT_COEFFICIENT.walls.south);
  $("#heatCoefficientEastWall").val(HEAT_COEFFICIENT.walls.east);
  $("#heatCoefficientWestWall").val(HEAT_COEFFICIENT.walls.west);
  $("#heatCoefficientRoof").val(HEAT_COEFFICIENT.roof);
  $("#heatCoefficientFloor").val(HEAT_COEFFICIENT.floor);

  $("#heatCoefficientNorthDoors").val(HEAT_COEFFICIENT.doors.north);
  $("#heatCoefficientSouthDoors").val(HEAT_COEFFICIENT.doors.south);
  $("#heatCoefficientEastDoors").val(HEAT_COEFFICIENT.doors.east);
  $("#heatCoefficientWestDoors").val(HEAT_COEFFICIENT.doors.west);
  $("#heatCoefficientNorthWindows").val(HEAT_COEFFICIENT.windows.north);
  $("#heatCoefficientSouthWindows").val(HEAT_COEFFICIENT.windows.south);
  $("#heatCoefficientEastWindows").val(HEAT_COEFFICIENT.windows.east);
  $("#heatCoefficientWestWindows").val(HEAT_COEFFICIENT.windows.west);

  // Update temperature coefficient
  $("#eqTemperatureDifferenceNorthWall").val(
    EQUIVALENT_TEMPERATURE_DIFF.walls.north
  );
  $("#eqTemperatureDifferenceSouthWall").val(
    EQUIVALENT_TEMPERATURE_DIFF.walls.south
  );
  $("#eqTemperatureDifferenceEastWall").val(
    EQUIVALENT_TEMPERATURE_DIFF.walls.east
  );
  $("#eqTemperatureDifferenceWestWall").val(
    EQUIVALENT_TEMPERATURE_DIFF.walls.west
  );
  $("#eqTemperatureDifferenceNorthDoors").val(
    EQUIVALENT_TEMPERATURE_DIFF.doors.north
  );
  $("#eqTemperatureDifferenceSouthDoors").val(
    EQUIVALENT_TEMPERATURE_DIFF.doors.south
  );
  $("#eqTemperatureDifferenceEastDoors").val(
    EQUIVALENT_TEMPERATURE_DIFF.doors.east
  );
  $("#eqTemperatureDifferenceWestDoors").val(
    EQUIVALENT_TEMPERATURE_DIFF.doors.west
  );
  $("#eqTemperatureDifferenceNorthWindows").val(
    EQUIVALENT_TEMPERATURE_DIFF.windows.north
  );
  $("#eqTemperatureDifferenceSouthWindows").val(
    EQUIVALENT_TEMPERATURE_DIFF.windows.south
  );
  $("#eqTemperatureDifferenceEastWindows").val(
    EQUIVALENT_TEMPERATURE_DIFF.windows.east
  );
  $("#eqTemperatureDifferenceWestWindows").val(
    EQUIVALENT_TEMPERATURE_DIFF.windows.west
  );
  $("#eqTemperatureDifferenceRoof").val(EQUIVALENT_TEMPERATURE_DIFF.roof);
  $("#eqTemperatureDifferenceFloor").val(EQUIVALENT_TEMPERATURE_DIFF.floor);

  // Update Solar Heat Gain Factors
  $("#windowsSHGFNorth").val(SOLAR_HEAT_GAIN_FACTOR.windows.north);
  $("#windowsSHGFSouth").val(SOLAR_HEAT_GAIN_FACTOR.windows.south);
  $("#windowsSHGFEast").val(SOLAR_HEAT_GAIN_FACTOR.windows.east);
  $("#windowsSHGFWest").val(SOLAR_HEAT_GAIN_FACTOR.windows.west);

  // Log updated values
  //   console.log(room);
  //   console.log(doors);
  //   console.log(windows);
}

function updateValuesInDisplay() {
  // UPDATE TOP DISPLAY
  $("#ACHPRatingDisplay").html(room.ac_rating);
  $("#requiredConditioningCountDisplay").html(room.ac_count);
  $("#dimensionDisplay").html(
    room.length + " x " + room.width + " x " + room.height
  );

  // UPDATE WALLS DISPLAY
  $("#northWallAreaTotal").html(AREA.walls.north);
  $("#southWallAreaTotal").html(AREA.walls.south);
  $("#eastWallAreaTotal").html(AREA.walls.east);
  $("#westWallAreaTotal").html(AREA.walls.west);
  $("#northWallSensibleHeat").html(SENSIBLE_HEAT_GAIN.walls.north);
  $("#southWallSensibleHeat").html(SENSIBLE_HEAT_GAIN.walls.south);
  $("#eastWallSensibleHeat").html(SENSIBLE_HEAT_GAIN.walls.east);
  $("#westWallSensibleHeat").html(SENSIBLE_HEAT_GAIN.walls.west);

  // UPDATE ROOF & FLOOR
  $("#roofAreaTotal").html(AREA.roof);
  $("#floorAreaTotal").html(AREA.floor);
  $("#roofSensibleHeat").html(SENSIBLE_HEAT_GAIN.roof);
  $("#floorSensibleHeat").html(SENSIBLE_HEAT_GAIN.floor);

  // UPDATE DOORS
  $("#northDoorsAreaTotal").html(AREA.doors.north);
  $("#southDoorsAreaTotal").html(AREA.doors.south);
  $("#eastDoorsAreaTotal").html(AREA.doors.east);
  $("#westDoorsAreaTotal").html(AREA.doors.west);
  $("#northDoorsSensibleHeat").html(SENSIBLE_HEAT_GAIN.doors.north);
  $("#southDoorsSensibleHeat").html(SENSIBLE_HEAT_GAIN.doors.south);
  $("#eastDoorsSensibleHeat").html(SENSIBLE_HEAT_GAIN.doors.east);
  $("#westDoorsSensibleHeat").html(SENSIBLE_HEAT_GAIN.doors.west);

  // UPDATE WINDOWS
  $("#northWindowsAreaTotal").html(AREA.windows.north);
  $("#southWindowsAreaTotal").html(AREA.windows.south);
  $("#eastWindowsAreaTotal").html(AREA.windows.east);
  $("#westWindowsAreaTotal").html(AREA.windows.west);
  $("#northWindowsSensibleHeat").html(SENSIBLE_HEAT_GAIN.windows.north);
  $("#southWindowsSensibleHeat").html(SENSIBLE_HEAT_GAIN.windows.south);
  $("#eastWindowsSensibleHeat").html(SENSIBLE_HEAT_GAIN.windows.east);
  $("#westWindowsSensibleHeat").html(SENSIBLE_HEAT_GAIN.windows.west);

  // UPDATE WINDOWS SOLAR HEAT GAIN
  $("#solarHeatGainNorthGlassWindow").html(SOLAR_HEAT_GAIN.windows.north);
  $("#solarHeatGainSouthGlassWindow").html(SOLAR_HEAT_GAIN.windows.south);
  $("#solarHeatGainEastGlassWindow").html(SOLAR_HEAT_GAIN.windows.east);
  $("#solarHeatGainWestGlassWindow").html(SOLAR_HEAT_GAIN.windows.west);
  $("#totalSolarHeatGain").html(SOLAR_HEAT_GAIN.windows.total);

  // UPDATE OTHER PARAMS
  $("#sensibleHeatGainDueToOccupants").html(
    SENSIBLE_HEAT_GAIN.due_to.occupants
  );
  $("#latentHeatGainDueToOccupants").html(LATENT_HEAT_GAIN.due_to.occupants);
  
  $("#sensibleHeatGainDueToEquipments").html(
    SENSIBLE_HEAT_GAIN.due_to.equipments
  );
  $("#latentHeatGainDueToEquipments").html(LATENT_HEAT_GAIN.due_to.equipments);

  $("#sensibleHeatGainDueToLighting").html(SENSIBLE_HEAT_GAIN.due_to.lighting);

  $("#sensibleHeatGainDueToInfiltratedAir").html(
    SENSIBLE_HEAT_GAIN.due_to.infiltrated_air
  );
  $("#latentHeatGainDueToInfiltratedAir").html(
    LATENT_HEAT_GAIN.due_to.infiltrated_air
  );
}

function roundNumber(number) {
  return Math.round((number + Number.EPSILON) * 100) / 100;
}
