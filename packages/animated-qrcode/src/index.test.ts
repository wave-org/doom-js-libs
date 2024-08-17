import { encode, AnimatedQRCodeDecoder } from ".";

describe("AQR", function () {
  const ABI1 = `[{"inputs":[{"internalType":"address","name":"_lido","type":"address"},{"internalType":"address","name":"_treasury","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"requestedBy","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ERC20Recovered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"requestedBy","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721Recovered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ETHReceived","type":"event"},{"inputs":[],"name":"LIDO","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TREASURY","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"recoverERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"recoverERC721","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxAmount","type":"uint256"}],"name":"withdrawRewards","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]`;
  const ABI2 = `[{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"recoverERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"recoverERC721","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxAmount","type":"uint256"}],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;
  it("encode and decode 1", async function () {
    const fragments = encode(ABI1);
    const decoder = new AnimatedQRCodeDecoder();
    fragments.forEach((fragment) => {
      decoder.receivePart(fragment);
    });
    expect(decoder.finished).toBe(true);
    expect(decoder.result).not.toBeNull();
    const result = decoder.result!.toString();
    expect(result).toBe(ABI1);
  });
  it("encode and decode 2", async function () {
    const fragments = encode(ABI2);
    const decoder = new AnimatedQRCodeDecoder();
    fragments.forEach((fragment) => {
      decoder.receivePart(fragment);
    });
    expect(decoder.finished).toBe(true);
    expect(decoder.result).not.toBeNull();
    const result = decoder.result!.toString();
    expect(result).toBe(ABI2);
  });

  it("decode test 1", async function () {
    const decoder = new AnimatedQRCodeDecoder();
    decoder.receivePart(
      "DOOM|AQR|5/6|LCJuYW1lIjoiZGF0YSIsInR5cGUiOiJieXRlcyJ9XSwibmFtZSI6InVwZ3JhZGVUb0FuZENhbGwiLCJvdXRwdXRzIjpbXSwic3RhdGVNdXRhYmlsaXR5IjoicGF5YWJsZSIsInR5cGUiOiJmdW5jdGlvbiJ9XQ==",
    );
    decoder.receivePart(
      "DOOM|AQR|0/6|W3siaW5wdXRzIjpbXSwibmFtZSI6ImFkbWluIiwib3V0cHV0cyI6W3siaW50ZXJuYWxUeXBlIjoiYWRkcmVzcyIsIm5hbWUiOiIiLCJ0eXBlIjoiYWRkcmVzcyJ9XSwic3RhdGVNdXRhYmlsaXR5Ijoibm9ucGF5YWJsZSIsInR5cGUiOiJmdW5jdGlvbiJ9LHsiaW5wdXRzIjpbeyJpbnRlcm5hbFR5cGUiOiJhZGRyZXNzIiwibmFtZSI6Im5ld0FkbWluIiwidHlwZSI6ImFkZHJlc3MifV0sIm5hbWUiOiJjaGFuZ2VBZG1pbiIs",
    );
    decoder.receivePart(
      "DOOM|AQR|1/6|Im91dHB1dHMiOltdLCJzdGF0ZU11dGFiaWxpdHkiOiJub25wYXlhYmxlIiwidHlwZSI6ImZ1bmN0aW9uIn0seyJpbnB1dHMiOltdLCJuYW1lIjoiaW1wbGVtZW50YXRpb24iLCJvdXRwdXRzIjpbeyJpbnRlcm5hbFR5cGUiOiJhZGRyZXNzIiwibmFtZSI6IiIsInR5cGUiOiJhZGRyZXNzIn1dLCJzdGF0ZU11dGFiaWxpdHkiOiJub25wYXlhYmxlIiwidHlwZSI6ImZ1bmN0aW9uIn0seyJpbnB1dHMiOlt7ImludGVybmFsVHlw",
    );
    decoder.receivePart(
      "DOOM|AQR|2/6|ZSI6ImFkZHJlc3MiLCJuYW1lIjoiX2xvZ2ljIiwidHlwZSI6ImFkZHJlc3MifSx7ImludGVybmFsVHlwZSI6ImFkZHJlc3MiLCJuYW1lIjoiX2FkbWluIiwidHlwZSI6ImFkZHJlc3MifSx7ImludGVybmFsVHlwZSI6ImJ5dGVzIiwibmFtZSI6Il9kYXRhIiwidHlwZSI6ImJ5dGVzIn1dLCJuYW1lIjoiaW5pdGlhbGl6ZSIsIm91dHB1dHMiOltdLCJzdGF0ZU11dGFiaWxpdHkiOiJwYXlhYmxlIiwidHlwZSI6ImZ1bmN0aW9u",
    );
    decoder.receivePart(
      "DOOM|AQR|3/6|In0seyJpbnB1dHMiOlt7ImludGVybmFsVHlwZSI6ImFkZHJlc3MiLCJuYW1lIjoiX2xvZ2ljIiwidHlwZSI6ImFkZHJlc3MifSx7ImludGVybmFsVHlwZSI6ImJ5dGVzIiwibmFtZSI6Il9kYXRhIiwidHlwZSI6ImJ5dGVzIn1dLCJuYW1lIjoiaW5pdGlhbGl6ZSIsIm91dHB1dHMiOltdLCJzdGF0ZU11dGFiaWxpdHkiOiJwYXlhYmxlIiwidHlwZSI6ImZ1bmN0aW9uIn0seyJpbnB1dHMiOlt7ImludGVybmFsVHlwZSI6ImFk",
    );
    decoder.receivePart(
      "DOOM|AQR|4/6|ZHJlc3MiLCJuYW1lIjoibmV3SW1wbGVtZW50YXRpb24iLCJ0eXBlIjoiYWRkcmVzcyJ9XSwibmFtZSI6InVwZ3JhZGVUbyIsIm91dHB1dHMiOltdLCJzdGF0ZU11dGFiaWxpdHkiOiJub25wYXlhYmxlIiwidHlwZSI6ImZ1bmN0aW9uIn0seyJpbnB1dHMiOlt7ImludGVybmFsVHlwZSI6ImFkZHJlc3MiLCJuYW1lIjoibmV3SW1wbGVtZW50YXRpb24iLCJ0eXBlIjoiYWRkcmVzcyJ9LHsiaW50ZXJuYWxUeXBlIjoiYnl0ZXMi",
    );

    expect(decoder.finished).toBe(true);
    expect(decoder.result).not.toBeNull();
  });
});
