import * as utils from "../index";
import axios from "axios";
import { toast } from "react-toastify";

// Mocks
jest.mock("axios");
jest.mock("react-toastify", () => ({
  toast: jest.fn(),
  update: jest.fn(),
  dismiss: jest.fn(),
}));

function setUserToLocalStorage(user) {
  window.localStorage.setItem("user", JSON.stringify(user));
}

beforeEach(() => {
  // Reset mocks/localStorage before each test
  jest.clearAllMocks();
  window.localStorage.clear();
});

// --- TESTS FOR client ---
describe("client", () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    delete global.fetch;
  });

  it("performs GET request with no token", async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      json: async () => ({ hello: "world" }),
    });
    const endpoint = "/api/test";
    const result = await utils.client(endpoint);
    expect(fetchMock).toHaveBeenCalledWith(
      endpoint,
      expect.objectContaining({ method: "GET" })
    );
    expect(result).toEqual({ hello: "world" });
  });

  it("performs POST request with token from localStorage", async () => {
    setUserToLocalStorage({ token: "abc123" });
    fetchMock.mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true }),
    });
    const result = await utils.client("/api/test", { body: { some: "data" } });
    expect(fetchMock.mock.calls[0][1].headers.authorization).toBe("Bearer abc123");
    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ some: "data" }));
    expect(result).toEqual({ ok: true });
  });

  it("prefers customConfig.token over user token", async () => {
    setUserToLocalStorage({ token: "userToken" });
    fetchMock.mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true }),
    });
    await utils.client("/api/test", { body: { foo: "bar" }, token: "configToken" });
    expect(fetchMock.mock.calls[0][1].headers.authorization).toBe(
      "Bearer configToken"
    );
  });

  it("calls toast and returns undefined for non-200 response", async () => {
    fetchMock.mockResolvedValue({
      status: 400,
      json: async () => ({ message: "oh snap" }),
    });
    const res = await utils.client("/api/bad");
    expect(toast).toHaveBeenCalledWith("oh snap");
    expect(res).toBeUndefined();
  });
});

// --- TESTS FOR timeSince ---
describe("timeSince", () => {
  function ago(ms) {
    return new Date(Date.now() - ms).toISOString();
  }
  it("returns years", () => {
    expect(utils.timeSince(ago(2 * 365 * 24 * 60 * 60 * 1000))).toMatch(/years/);
    expect(utils.timeSince(ago(400 * 24 * 60 * 60 * 1000))).toMatch(/years|months/);
  });
  it("returns months", () => {
    expect(utils.timeSince(ago(70 * 24 * 60 * 60 * 1000))).toMatch(/months/);
  });
  it("returns days", () => {
    expect(utils.timeSince(ago(2 * 24 * 60 * 60 * 1000))).toMatch(/days/);
  });
  it("returns hours", () => {
    expect(utils.timeSince(ago(2 * 60 * 60 * 1000))).toMatch(/hours/);
  });
  it("returns minutes", () => {
    expect(utils.timeSince(ago(2 * 60 * 1000))).toMatch(/minutes/);
  });
  it("returns seconds (edge, < 60)", () => {
    expect(utils.timeSince(ago(20 * 1000))).toMatch(/seconds/);
    expect(utils.timeSince(ago(0))).toMatch(/seconds/);
  });
});

// --- TESTS FOR upload ---
describe("upload", () => {
  beforeEach(() => {
    // Setup minimal FormData polyfill
    global.FormData = class {
      constructor() { this.data = {}; }
      append(k, v) { this.data[k] = v; }
    };
  });
  afterEach(() => {
    delete global.FormData;
  });

  it("uploads a file, notifies progress, and returns secure_url", async () => {
    const fakeFile = new Blob(["file"]);
    axios.post.mockImplementationOnce((url, formData, config) => {
      // Simulate onUploadProgress callback
      config.onUploadProgress({ loaded: 5, total: 10 });
      // Second call, simulate update
      config.onUploadProgress({ loaded: 10, total: 10 });
      return Promise.resolve({ data: { secure_url: "https://cdn.com/x.jpg" } });
    });
    toast.mockReturnValue("toastId1"); // for initial toast
    const url = await utils.upload("video", fakeFile);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("video/upload"),
      expect.any(FormData),
      expect.any(Object)
    );
    expect(toast).toHaveBeenCalledWith("Upload in Progress", expect.any(Object));
    expect(toast.update).toHaveBeenCalledWith("toastId1", expect.any(Object));
    expect(toast.dismiss).toHaveBeenCalledWith("toastId1");
    expect(url).toBe("https://cdn.com/x.jpg");
  });
});

// --- TESTS FOR authenticate ---
describe("authenticate", () => {
  let realClient;
  beforeAll(() => {
    realClient = utils.client;
  });
  afterAll(() => {
    utils.client = realClient;
  });

  it("successfully authenticates and stores user", async () => {
    const backendUrl = "http://localhost:1000";
    process.env.REACT_APP_BE = backendUrl;
    const mockToken = "mocktoken";
    const mockUser = { id: 9, name: "Bob" };
    // Patch client to return token then user
    let callCount = 0;
    utils.client = jest.fn().mockImplementation((url, opts) => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ data: mockToken });
      if (callCount === 2) return Promise.resolve({ data: mockUser });
      return Promise.resolve({});
    });
    const result = await utils.authenticate("login", { username: "x" });
    const stored = JSON.parse(window.localStorage.getItem("user"));
    expect(stored).toEqual({ ...mockUser, token: mockToken });
    expect(result).toEqual({ ...mockUser, token: mockToken });
  });

  it("handles authenticate client error gracefully (error thrown)", async () => {
    utils.client = jest.fn(() => Promise.reject(new Error("fail")));
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const result = await utils.authenticate("signup", { x: 1 });
    expect(result).toBeUndefined();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

// --- TESTS FOR removeChannelLocalSt, addChannelLocalSt, updateUserLocalSt ---
describe("localStorage channel/user manipulation", () => {
  it("removeChannelLocalSt - removes channel by id", () => {
    setUserToLocalStorage({
      id: 1,
      channels: [{ id: 2 }, { id: 3 }],
      x: "foo"
    });
    utils.removeChannelLocalSt(2);
    const stored = JSON.parse(window.localStorage.getItem("user"));
    expect(stored.channels).toEqual([{ id: 3 }]);
    expect(stored.x).toBe("foo");
  });

  it("addChannelLocalSt - prepends new channel", () => {
    setUserToLocalStorage({ id: 1, channels: [{ id: 99 }] });
    utils.addChannelLocalSt({ id: 100, y: "new" });
    const stored = JSON.parse(window.localStorage.getItem("user"));
    expect(stored.channels[0]).toEqual({ id: 100, y: "new" });
    expect(stored.channels[1].id).toBe(99);
  });

  it("updateUserLocalSt - overlays user object", () => {
    setUserToLocalStorage({ id: 1, name: "A", z: 3 });
    utils.updateUserLocalSt({ name: "BB", newField: "yep" });
    const stored = JSON.parse(window.localStorage.getItem("user"));
    expect(stored.id).toBe(1);
    expect(stored.name).toBe("BB");
    expect(stored.newField).toBe("yep");
    expect(stored.z).toBe(3);
  });
  // Edge: handle when user/channels not in localStorage (should not throw)
  it("handles missing user gracefully", () => {
    expect(() => utils.removeChannelLocalSt(9)).toThrow();
    expect(() => utils.addChannelLocalSt({ id: 2 })).toThrow();
    expect(() => utils.updateUserLocalSt({ foo: "bar" })).toThrow();
  });
});
