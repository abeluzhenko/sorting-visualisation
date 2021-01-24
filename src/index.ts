import './index.html';
import './style.scss';

interface Frame {
  data: number[];
  currentA: number;
  currentB: number;
}

interface Algorithm {
  apply(data: number[]): Frame[];
}

function createFrame(data: number[], currentA: number, currentB: number) {
  return {
    data: data.slice(),
    currentA,
    currentB,
  };
}

const CURRENT_CLASSNAME = '_is_current';

class Visualizer {
  private static getRandomNumber(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min));
  }

  private static getRandomData(length = 16, min = 1, max = 10): number[] {
    return Array.from({ length }, (_, i) => Visualizer.getRandomNumber(min, max));
  }

  private static getRender(data: number[]): string {
    return data.map((it) => `<div class="item" style="height: ${ it * 10 }%"></div>`).join('');
  }

  private _intervalId!: number;
  public play(el: HTMLElement, algorithm: Algorithm, frameTime: number) {
    window.clearInterval(this._intervalId);

    const data = Visualizer.getRandomData();
    el.innerHTML = Visualizer.getRender(data);

    const frames = algorithm.apply(data);
    const itemEls = el.children;
    let currentFrameIndex = 0;

    this._intervalId = window.setInterval(() => {
      if (currentFrameIndex === frames.length) {
        window.clearInterval(this._intervalId);
        return;
      }

      const frame = frames[currentFrameIndex];
      frame.data.forEach((item, index) => {
        const itemEl = itemEls.item(index);
        if (!(itemEl instanceof HTMLElement)) {
          return;
        }

        itemEl.style.height = `${ item * 10 }%`;
        itemEl.classList.remove(CURRENT_CLASSNAME);

        if (frame.currentA === index || frame.currentB === index) {
          itemEl.classList.add(CURRENT_CLASSNAME);
        }
      });

      currentFrameIndex++;
    }, frameTime);
  }
}

class SelectionSort implements Algorithm {
  public apply(data: number[]): Frame[] {
    const frames = [];

    for (let i = 0; i <= data.length; i++) {
      for (let j = i + 1; j <= data.length; j++) {
        if (data[j] < data[i]) {
          const b = data[j];
          data[j] = data[i];
          data[i] = b;
        }
        frames.push(createFrame(data, i, j));
      }
    }

    return frames;
  }
}

class InsertionSort implements Algorithm {
  public step = 1;
  public apply(data: number[]): Frame[] {
    const frames = [];
    let i = 0;

    while (i < data.length) {
      let j = i;

      while (j > 0 && data[j] < data[j - 1]) {
        const b = data[j];
        data[j] = data[j - 1];
        data[j - 1] = b;
        frames.push(createFrame(data, j, j - 1));
        j--;
      }

      frames.push(createFrame(data, i, i + this.step));
      i += this.step;
    }

    return frames;
  }
}

class MergeSort implements Algorithm {
  private _input: number[] = [];

  public apply(data: number[]): Frame[] {
    const frames: Frame[] = [];
    this._input = data.slice();
    const output = this.sort(0, data.length, data, frames);
    frames.push(createFrame(output, 0, 0));
    return frames;
  }

  private sort(low: number, high: number, input: number[], frames: Frame[]): number[] {
    if (input.length === 1) {
      return input;
    }
    const n = input.length / 2;
    const l = this.sort(low, low + n, input.slice(0, n), frames);
    const r = this.sort(low + n, high, input.slice(n), frames);
    return this.merge(low, high, l, r, frames);
  }

  private merge(low: number, high: number, left: number[], right: number[], frames: Frame[]) {
    const result = new Array(right.length + left.length);
    const mid = low + (high - low) / 2;
    let li = 0;
    let ri = 0;

    for (let i = 0; i < result.length; i++) {
      const rv = ri < right.length ? right[ri] : Number.POSITIVE_INFINITY;
      const lv = li < left.length ? left[li] : Number.POSITIVE_INFINITY;

      if (rv < lv) {
        result[i] = rv;
        frames.push(createFrame(this.getFrameArray(result, low, high), low + i, low + ri));
        ri++;
        continue;
      }

      result[i] = lv;
      frames.push(createFrame(this.getFrameArray(result, low, high), mid + i, mid + li));
      li++;
    }
    return result;
  }

  private getFrameArray(temp: number[], low: number, high: number) {
    const result = this._input;

    for (let i = low; i < high; i++) {
      result[i] = temp[i - low];
    }
    return result;
  }
}

class BubbleSort implements Algorithm {
  public apply(data: number[]): Frame[] {
    const frames = [];
    let done = false;

    while (!done) {
      done = true;

      for (let i = 1; i < data.length; i++) {
        if (data[i] < data[i - 1]) {
          const b = data[i - 1];

          data[i - 1] = data[i];
          data[i] = b;
          done = false;
          frames.push(createFrame(data, i - 1, i));
        }
      }
    }

    return frames;
  }
}

class QuickSort implements Algorithm  {
  private _input!: number[];

  public apply(data: number[]): Frame[] {
    const frames: Frame[] = [];
    const output = this.sort(0, data.length, data, frames);

    this._input = data.slice();
    frames.push(createFrame(output, 0, 0));

    return frames;
  }

  private sort(low: number, high: number, input: number[], frames: Frame[]): number[] {
    if (input.length === 1) {
      return input;
    }

    const n = input.length / 2;
    const l = this.sort(low, low + n, input.slice(0, n), frames);
    const r = this.sort(low + n, high, input.slice(n), frames);

    return this.merge(low, high, l, r, frames);
  }

  private merge(low: number, high: number, left: number[], right: number[], frames: Frame[]) {
    const result = new Array(right.length + left.length);
    const mid = low + (high - low) / 2;
    let ri = 0;
    let li = 0;

    for (let i = 0; i < result.length; i++) {
      const rv = ri < right.length ? right[ri] : Number.POSITIVE_INFINITY;
      const lv = li < left.length ? left[li] : Number.POSITIVE_INFINITY;

      if (rv < lv) {
        result[i] = rv;
        frames.push(createFrame(this.getFrameArray(result, low, high), low + i, low + ri));
        ri++;

        continue;
      }
      result[i] = lv;
      frames.push(createFrame(this.getFrameArray(result, low, high), mid + i, mid + li));
      li++;
    }

    return result;
  }

  private getFrameArray(temp: number[], low: number, high: number) {
    const result = this._input;

    for (let i = low; i < high; i++) {
      result[i] = temp[i - low];
    }

    return result;
  }
}

const FRAME_ANIMATION_DURATION = 230;

window.onload = () => {
  const itemsEl = document.getElementById('items');
  if (!itemsEl) {
    return;
  }

  const visualizer = new Visualizer();

  const data = [
    { label: "Bubble Sort", algorithm: new BubbleSort() },
    { label: "Selection Sort", algorithm: new SelectionSort() },
    { label: "Insertion Sort", algorithm: new InsertionSort() },
    { label: "Merge Sort", algorithm: new MergeSort() }
  ];
  const [{ algorithm }] = data;

  visualizer.play(itemsEl, algorithm, FRAME_ANIMATION_DURATION);

  const formEl = document.getElementById('form');
  if (!formEl) {
    return;
  }

  formEl.innerHTML = data.map(
    ({ label }, i) => `
        <input name="type" ${ i ? 'checked' : '' } id="sort-${ i }" value="${ i }" type="radio">
        <label for="sort-${ i }">${ label }</label>
    `
  ).join('');

  const radios = document.querySelectorAll('[name="type"]');
  Array.from(radios).forEach(it =>
    it.addEventListener('click', ({ target }) => {
      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      const dataIndex = parseInt(target.value, 10);
      visualizer.play(itemsEl, data[dataIndex].algorithm, FRAME_ANIMATION_DURATION);
    })
  );
}
