import { HighQuality } from "@mui/icons-material";
import Highlight from "./Highlight";

// how many past frames from previous operations are kept for backwards steps
const FRAME_BUFFER_SIZE = 50;

class FrameSequencer {
  constructor(tree, sequencerProps, setSequencerProps) {
    this.tree = tree;
    this.sequencerProps = sequencerProps;
    this.setSequencerProps = setSequencerProps;

    this.keyQueue = [];
    this.frameBuffer = [];
    this.currentFrameIndex = 0;
  }

  getFinalFrame() {
    //instantly perform all queued operations -> just compute the last frame
    this.tree.sequenceMode = false;
    for (let i = 0; i < this.keyQueue.length; i++) {
      if (this.keyQueue[i][0] == "add") {
        this.tree.add(this.keyQueue[i][1]);
      }
      if (this.keyQueue[i][0] == "remove") {
        this.tree.remove(this.keyQueue[i][1]);
      }
    }
    this.setSequencerProps((prevSequencerProps) => ({
      ...prevSequencerProps,
      hasPrevious: false,
      inSequence: false,
    }));

    return {
      treeData: this.tree.toTreeData(),
      highlights: new Highlight(),
    };
  }

  getNextFrame() {
    //backwards step -> get last frame
    if (
      this.sequencerProps.sequenceMode == "step" &&
      this.sequencerProps.doBackward == true
    ) {
      if (this.currentFrameIndex > 0) {
        this.currentFrameIndex--;
        this.setSequencerProps((prevSequencerProps) => ({
          ...prevSequencerProps,
          hasPrevious: this.currentFrameIndex > 0,
          doBackward: false,
        }));
        return this.frameBuffer[this.currentFrameIndex];
      }
    }

    //forward step -> return the next frame
    if (this.frameBuffer.length != 0) {
      this.currentFrameIndex++;
    }

    if (this.currentFrameIndex >= this.frameBuffer.length) {
      //frames buffer empty -> compute more
      const isEnd = this.fillFrameBuffer();
      if (isEnd) {
        // At End of Sequence
        this.setSequencerProps((prevSequencerProps) => ({
          ...prevSequencerProps,
          doForward: false,
          inSequence: false,
        }));
        return {
          treeData: this.tree.toTreeData(),
          highlights: new Highlight(),
        };
      }
    }
    // Not end of Sequence -> return next frame from frameBuffer
    this.setSequencerProps((prevSequencerProps) => ({
      ...prevSequencerProps,
      doForward: false,
      hasPrevious: true,
      inSequence: true,
    }));
    return this.frameBuffer[this.currentFrameIndex];
  }

  fillFrameBuffer() {
    if (this.keyQueue.length == 0) {
      return true;
    } else {
      //trim past frames down to N_BUFFER_SIZE
      this.frameBuffer = this.frameBuffer.slice(- FRAME_BUFFER_SIZE);
      this.currentFrameIndex = this.frameBuffer.length;

      //prepare tree for producing frames
      this.tree.sequenceMode = true;
      this.tree._frameBuffer = this.frameBuffer;

      //Compute frames of the next Operation
      if (this.keyQueue[0][0] == "add") {
        this.tree.add(this.keyQueue[0][1]);
      }
      if (this.keyQueue[0][0] == "remove") {
        this.tree.remove(this.keyQueue[0][1]);
      }
      //pop the first element from the queue
      this.keyQueue.shift();
    }
    return false;
  }

  addKeys(keyList) {
    this.newSequence();
    for (let i = 0; i < keyList.length; i++) {
      this.keyQueue.push(["add", keyList[i]]);
    }
  }

  removeKeys(keyList) {
    this.newSequence();
    for (let i = 0; i < keyList.length; i++) {
      this.keyQueue.push(["remove", keyList[i]]);
    }
  }

  newSequence() {
    this.keyQueue = [];
    this.frameBuffer = [];
    this.currentFrameIndex = 0;
    this.setSequencerProps((prevSequencerProps) => ({
      ...prevSequencerProps,
      hasPrevious: false,
      inSequence: true,
    }));
  }
}

export default FrameSequencer;
