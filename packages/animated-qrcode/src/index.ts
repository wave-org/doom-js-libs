// Doom Animated QR Code data format: DOOM|AQR|fragmentIndex/fragmentsCount|base64Data

export function encode(
  data: string | Buffer | Uint8Array,
  fragementSize: number = 500
): string[] {
  const base64Data = Buffer.from(data).toString("base64");
  const fragmentsCount = Math.ceil(base64Data.length / fragementSize);
  return Array.from({ length: fragmentsCount }, (_, index) => {
    const start = index * fragementSize;
    const end = start + fragementSize;
    return `DOOM|AQR|${index}/${fragmentsCount}|base64Data.slice(start, end)`;
  });
}

export type Fragment = {
  index: number;
  count: number;
  data: Buffer;
};

function decodeFragment(data: string): Fragment {
  // get index and count
  const [_, __, indexString, base64Data] = data.split("|");
  const [index, count] = indexString.split("/").map(parseInt);
  if (index < 0 || index >= count) {
    throw new Error("Invalid Doom Animated QR Code");
  }
  // decode base64 data
  const buffer = Buffer.from(base64Data, "base64");
  return { index, count, data: buffer };
}

export function isAQR(data: string): boolean {
  return data.startsWith("DOOM|AQR|") && data.split("|").length === 4;
}

export class AnimatedQRCodeDecoder {
  public finished: boolean = false;
  public result: Buffer | null = null;
  private fragments: Fragment[] = [];
  private count: number = 0;

  // if the data is not valid, it will throw an error
  public receivePart(data: string): void {
    if (this.finished) {
      return;
    }
    if (!isAQR(data)) {
      throw new Error("Invalid Doom Animated QR Code");
    }
    const fragment = decodeFragment(data);
    if (this.count === 0) {
      this.count = fragment.count;
    } else if (this.count !== fragment.count) {
      throw new Error("Invalid Doom Animated QR Code");
    }
    // insert fragment to the right position
    if (this.fragments.length === 0) {
      this.fragments = [fragment];
    } else if (this.fragments.length >= this.count) {
      throw new Error("Invalid Doom Animated QR Code");
    } else {
      let newList = [...this.fragments, fragment];
      for (let i = 0; i < newList.length - 1; i++) {
        if (fragment.index === newList[i].index) {
          // received the same fragment
          newList = this.fragments;
          break;
        } else if (fragment.index < newList[i].index) {
          newList = [
            ...newList.slice(0, i),
            fragment,
            ...newList.slice(i, newList.length - 2),
          ];
          break;
        }
      }
      this.fragments = newList;
    }

    if (this.fragments.length === this.count) {
      // check the fragment is right
      for (let i = 0; i < this.count; i++) {
        if (this.fragments[i].index !== i) {
          throw new Error("Invalid Doom Animated QR Code");
        }
      }
      this.finished = true;
      this.result = Buffer.concat(this.fragments.map((f) => f.data));
    }
  }

  public reset(): void {
    this.finished = false;
    this.result = null;
    this.fragments = [];
    this.count = 0;
  }

  public getProgress(): number {
    return this.fragments.length / this.count;
  }
}
