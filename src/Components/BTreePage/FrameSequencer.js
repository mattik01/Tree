import { HighQuality } from "@mui/icons-material";
import HighlightData from "./HighlightData";

const FRAME_BUFFER_SIZE = 50;

class FrameSequencer {
  constructor(tree, setSequencerProps) {
    this.tree = tree;
    this.setSequencerProps = setSequencerProps;

    this.frameBuffer = [];
    this.currentFrameIndex = 0;
  }

  getFinalFrame(sequencerProps) {
    this.tree.sequenceMode = false;

    for (let i = 0; i < sequencerProps.keyQueue.length; i++) {
      if (sequencerProps.keyQueue[i][0] === "add") {
        this.tree.add(sequencerProps.keyQueue[i][1]);
      }
      if (sequencerProps.keyQueue[i][0] === "remove") {
        this.tree.remove(sequencerProps.keyQueue[i][1]);
      }
    }

    this.setSequencerProps((prevSequencerProps) => ({
      ...prevSequencerProps,
      doForward: false,
      doBackward: false,
      hasPrevious: false,
      inSequence: false,
      keyQueue: [],
    }));

    return {
      nodeData: this.tree.toNodeData(),
      highlightData: new HighlightData(),

      counters: {
        splits: this.tree._splitCounter,
        merges: this.tree._mergeCounter,
        smallRotations: this.tree._smallRotationCounter,
        bigRotations: this.tree._bigRotationCounter,
      },
    };
  }

  getNextFrame(sequencerProps) {
    if (
      sequencerProps.sequenceMode === "step" &&
      sequencerProps.doBackward === true
    ) {
      if (this.currentFrameIndex > 0) {
        this.currentFrameIndex--;
        this.setSequencerProps((prevSequencerProps) => ({
          ...prevSequencerProps,
          doForward: false,
          doBackward: false,
          hasPrevious: this.currentFrameIndex > 0,
        }));
        return this.frameBuffer[this.currentFrameIndex];
      }
    }

    if (this.frameBuffer.length !== 0) {
      this.currentFrameIndex++;
    }

    if (this.currentFrameIndex >= this.frameBuffer.length) {
      const isEnd = this.fillFrameBuffer(sequencerProps.keyQueue);
      if (isEnd) {
        this.setSequencerProps((prevSequencerProps) => ({
          ...prevSequencerProps,
          doForward: false,
          doBackward: false,
          inSequence: false,
        }));
        return {
          nodeData: this.tree.toNodeData(),
          highlightData: new HighlightData(),
          counters:{
          splits: this.tree._splitCounter,
          merges: this.tree._mergeCounter,
          smallRotations: this.tree._smallRotationCounter,
          bigRotations: this.tree._bigRotationCounter,
          }
        };
      }
    }

    this.setSequencerProps((prevSequencerProps) => ({
      ...prevSequencerProps,
      doForward: false,
      doBackward: false,
      hasPrevious: true,
      inSequence: true,
    }));
    return this.frameBuffer[this.currentFrameIndex];
  }

  fillFrameBuffer(keyQueue) {
    if (keyQueue.length === 0) {
      return true;
    } else {
      this.frameBuffer = this.frameBuffer.slice(-FRAME_BUFFER_SIZE);
      this.currentFrameIndex = this.frameBuffer.length;

      this.tree._sequenceMode = true;
      this.tree._frameBufferRef = this.frameBuffer;

      if (keyQueue[0][0] === "add") {
        this.tree.add(keyQueue[0][1]);
      }
      if (keyQueue[0][0] === "remove") {
        this.tree.remove(keyQueue[0][1]);
      }

      keyQueue.shift();

      this.setSequencerProps((prevSequencerProps) => ({
        ...prevSequencerProps,
        keyQueue: keyQueue,
      }));
    }
    return false;
  }

  addKeys(keyList) {
    this.setSequencerProps((prevSequencerProps) => ({
      ...prevSequencerProps,
      keyQueue: [
        ...prevSequencerProps.keyQueue,
        ...keyList.map((key) => ["add", key]),
      ],
    }));
    this.newSequence();
  }

  removeKeys(keyList) {
    this.setSequencerProps((prevSequencerProps) => ({
      ...prevSequencerProps,
      keyQueue: [
        ...prevSequencerProps.keyQueue,
        ...keyList.map((key) => ["remove", key]),
      ],
    }));
    this.newSequence();
  }

  newSequence() {
    this.setSequencerProps((prevSequencerProps) => ({
      ...prevSequencerProps,
      hasPrevious: this.currentFrameIndex > 0,
      inSequence: true,
    }));
  }
}

export default FrameSequencer;
