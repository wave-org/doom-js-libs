import { encode, AnimatedQRCodeDecoder} from ".";

describe("AQR", function () {
  const ABI1 = `[{"inputs":[{"internalType":"address","name":"_lido","type":"address"},{"internalType":"address","name":"_treasury","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"requestedBy","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ERC20Recovered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"requestedBy","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721Recovered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ETHReceived","type":"event"},{"inputs":[],"name":"LIDO","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TREASURY","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"recoverERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"recoverERC721","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxAmount","type":"uint256"}],"name":"withdrawRewards","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]`
  const ABI2 = `[{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"recoverERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"recoverERC721","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_maxAmount","type":"uint256"}],"name":"withdrawRewards","outputs":[],"stateMutability":"nonpayable","type":"function"}]`
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
});
