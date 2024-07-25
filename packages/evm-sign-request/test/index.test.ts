import { constructEthLegacyRequest } from "../src/index";

describe("Sign Request", function () {
  it("generate a normal eth sign request", async function () {
    const request = constructEthLegacyRequest(
      {
        nonce: 0,
        gasPrice: 1,
        gasLimit: 21000,
        to: "0x0763Fda29DA6EE74Ca6e8EB264b3d22DB91f46d1",
        value: 1000,
      },
      "m/44'/60'/0'/0/0",
      "0x0763Fda29DA6EE74Ca6e8EB264b3d22DB91f46d1"
    );
    expect(request.toUREncoder().nextPart()).not.toBeNull();
  });
});
