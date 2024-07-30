import { FunctionFragment, Interface, ParamType, Result } from "ethers";

import abiList from "./abi";

export type InputData = {
  // The name of the parameter is not always correct, it is just a hint
  name: string;
  type: string;
  value: string | InputData[];
};

export type Function = {
  name: string;
  inputData: InputData[];
  // minimal format of function as key
  signature: string;
};

// minimal format of function, we use it as key to check if this type of function is already loaded
// howerver, the parameter names are not included in this format, so the decoded result may not have correct parameter names
export type FunctionSignature = string;

export type FunctionSelector = string;

export type InputDataType = string | string[];

export type FunctionHeader = {
  selector: FunctionSelector;
  signature: FunctionSignature;
};

export type FunctionData = {
  signature: FunctionSignature;
  data: string;
};

export interface ABIDatabase {
  loadAllFunctionHeaders(): Promise<FunctionHeader[]>;
  saveFunctionHeaders(headers: FunctionHeader[]): Promise<void>;
  saveFunctionData(data: FunctionData[]): Promise<void>;
  getFunctionData(signature: FunctionSignature): Promise<string | null>;
  reomveAllData(): Promise<void>;
}

export class EVMInputDataDecoder {
  // value is a list of minimum format of function, key is the function selector
  private signatureMap: Map<FunctionSelector, FunctionSignature[]> = new Map();
  // use minimal format of function as key to check if this type of function is already loaded
  private loadedSignature: Map<FunctionSignature, boolean> = new Map();
  // cache function fragments for loaded functions
  private functionsCache: Map<FunctionSignature, FunctionFragment> = new Map();
  public database: ABIDatabase | null; // TODO

  constructor(database: ABIDatabase | null = null) {
    this.database = database;
  }

  private loaded = false;
  public async loadAllABI() {
    if (this.loaded) {
      return;
    }
    this.loadBundledABI();
    this.loaded = true;
    await this.loadABIFromDatabase();
  }

  private loadBundledABI() {
    for (let i = 0; i < abiList.length; i++) {
      const abi = abiList[i];
      const contract = new Interface(abi);
      contract.forEachFunction((fragment) => {
        const signature = fragment.format("minimal");
        if (this.signatureExists(signature)) {
          return;
        }
        const selector = fragment.selector;
        let list = this.signatureMap.get(selector);
        if (list === undefined) {
          list = [];
        }
        list.push(signature);
        this.signatureMap.set(selector, list);

        this.functionsCache.set(signature, fragment);
      });
    }
    this.bundledFunctionCount = this.loadedSignature.size;
  }

  public async loadABIFromDatabase() {
    if (this.database !== null) {
      const list = await this.database.loadAllFunctionHeaders();
      for (let i = 0; i < list.length; i++) {
        const header = list[i];
        if (this.signatureExists(header.signature)) {
          return;
        }
        let signatures = this.signatureMap.get(header.selector);
        if (signatures === undefined) {
          signatures = [];
        }
        signatures.push(header.signature);
        this.signatureMap.set(header.selector, signatures);
      }
    }
  }

  public async importABI(abi: string) {
    const contract = new Interface(abi);
    const headers: FunctionHeader[] = [];
    const data: FunctionData[] = [];
    contract.forEachFunction((fragment) => {
      const signature = fragment.format("minimal");
      if (this.signatureExists(signature)) {
        return;
      }
      const selector = fragment.selector;
      let list = this.signatureMap.get(selector);
      if (list === undefined) {
        list = [];
      }
      list.push(signature);
      this.signatureMap.set(selector, list);
      this.functionsCache.set(signature, fragment);

      headers.push({
        signature,
        selector,
      });

      data.push({
        signature,
        data: fragment.format("json"),
      });
    });
    if (this.database !== null && headers.length > 0) {
      await this.database.saveFunctionHeaders(headers);
      await this.database.saveFunctionData(data);
    }
  }

  private signatureExists(signature: FunctionSignature) {
    if (this.loadedSignature.get(signature) === true) {
      return true;
    }
    this.loadedSignature.set(signature, true);
    return false;
  }

  public async deleteSavedABI() {
    if (this.database !== null) {
      await this.database.reomveAllData();
    }
  }

  public async decodeInputData(inputData: string): Promise<Function[]> {
    inputData = inputData.trim();
    if (inputData.length < 10) {
      throw new Error("Invalid input data");
    }
    const selector = inputData.slice(0, 10).toLowerCase();
    // try to match the signature
    const signatures = this.signatureMap.get(selector);
    if (signatures === undefined || signatures.length === 0) {
      // console.log("signature not found: " + selector);
      return [];
    }

    let functions: Function[] = [];
    for (let signature of signatures) {
      let fragment = this.functionsCache.get(signature);
      if (fragment === undefined) {
        if (this.database === null) {
          throw new Error("Database not found");
        }
        const data = await this.database!.getFunctionData(signature);
        if (data === null) {
          throw new Error("Function data not found in database");
        }
        fragment = FunctionFragment.from(JSON.parse(data));
        if (fragment === null) {
          throw new Error("Failed to parse function data");
        }
        this.functionsCache.set(signature, fragment);
      }

      let types = fragment.inputs.map((x) => x.type);
      const ifc = new Interface([]);
      let decodeResult = ifc.decodeFunctionData(fragment, inputData);
      const names = fragment.inputs.map((x) => x.name);

      let result: InputData[] = [];
      names.forEach((name, i) => {
        let input = decodeResult![i];
        if (typeof input === "string") {
          result.push({
            name,
            type: types[i],
            value: parseNumber(input),
          });
        } else if (typeof input === "bigint") {
          result.push({
            name,
            type: types[i],
            value: input.toString(),
          });
        } else if (Array.isArray(input)) {
          result.push({
            name,
            type: types[i],
            value: decodeArrayData(input, fragment!.inputs[i]),
          });
        } else {
          throw new Error("unknown type : " + typeof input);
        }
      });
      functions.push({
        name: fragment.name,
        inputData: result,
        signature: signature,
      });
    }

    return functions;
  }

  private bundledFunctionCount = 0;
  public functionCount(): number {
    return this.loadedSignature.size;
  }

  public importedFunctionCount(): number {
    return this.loadedSignature.size - this.bundledFunctionCount;
  }

  public async reomveAllData() {
    if (this.database !== null) {
      await this.database.reomveAllData();
      this.signatureMap.clear();
      this.loadedSignature.clear();
      this.functionsCache.clear();
      this.loadBundledABI();
    }
  }
}

function decodeArrayData(inputs: any, paramType: ParamType) {
  let items: InputData[] = [];
  if (paramType.arrayChildren !== null) {
    // array
    const childrenType = paramType.arrayChildren;
    inputs.forEach((input, index) => {
      let value = input;
      if (childrenType.type === "tuple" || childrenType.type.includes("]")) {
        value = decodeArrayData(value, childrenType);
      } else {
        value = parseNumber(value);
      }

      items.push({
        name: `${paramType.name}[${index}]`,
        type: childrenType.type,
        value: value,
      });
    });
  } else if (paramType.components !== null) {
    // tuple
    paramType.components.forEach((c, j) => {
      let value = inputs[j];
      if (c.type === "tuple" || c.type.includes("]")) {
        value = decodeArrayData(value, c);
      } else {
        value = parseNumber(value);
      }

      items.push({
        name: c.name,
        type: c.type,
        value: value,
      });
    });
  }
  return items;
}

function parseNumber(value: any) {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
}
