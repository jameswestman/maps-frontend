import {
  faArrowLeft,
  faArrowRight,
  faArrowUp,
  faBicycle,
  faBus,
  faCar,
  faFlag,
  faFlagCheckered,
  faWalking,
} from "@fortawesome/free-solid-svg-icons";

export const getInstructionIcon = (
  direction: number,
  mode_of_transport: string
) => {
  if ([1, 2, 3].includes(direction)) {
    return (
      {
        auto: faCar,
        bicycle: faBicycle,
        bus: faBus,
        pedestrian: faWalking,
      }[mode_of_transport] ?? faFlag
    );
  }

  return {
    // kDestination = 4;
    // kDestinationRight = 5;
    // kDestinationLeft = 6;
    4: faFlagCheckered,
    5: faFlagCheckered,
    6: faFlagCheckered,

    // kBecomes = 7;
    // kContinue = 8;
    7: faArrowUp,
    8: faArrowUp,

    // kSlightRight = 9;
    // kRight = 10;
    // kSharpRight = 11;
    9: faArrowRight,
    10: faArrowRight,
    11: faArrowRight,

    // kUturnRight = 12;
    // kUturnLeft = 13;

    // kSharpLeft = 14;
    // kLeft = 15;
    // kSlightLeft = 16;
    14: faArrowLeft,
    15: faArrowLeft,
    16: faArrowLeft,

    // kRampStraight = 17;
    // kRampRight = 18;
    // kRampLeft = 19;
    // kExitRight = 20;
    // kExitLeft = 21;
    // kStayStraight = 22;
    // kStayRight = 23;
    // kStayLeft = 24;
    // kMerge = 25;
    // kRoundaboutEnter = 26;
    // kRoundaboutExit = 27;
    // kFerryEnter = 28;
    // kFerryExit = 29;
    // kTransit = 30;
    // kTransitTransfer = 31;
    // kTransitRemainOn = 32;
    // kTransitConnectionStart = 33;
    // kTransitConnectionTransfer = 34;
    // kTransitConnectionDestination = 35;
    // kPostTransitConnectionDestination = 36;
    // kMergeRight = 37;
    // kMergeLeft = 38;
    // kElevatorEnter = 39;
    // kStepsEnter = 40;
    // kEscalatorEnter = 41;
    // kBuildingEnter = 42;
    // kBuildingExit = 43;
  }[direction];
};
