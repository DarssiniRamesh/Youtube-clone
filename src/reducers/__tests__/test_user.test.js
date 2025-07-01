import userReducer, {
  addChannel,
  removeChannel,
  updateUser,
  logout,
} from "../user";

// Helper: freezes state deeply so we assert pure reducer changes
function deepFreeze(obj) {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (
      obj[prop] !== null &&
      (typeof obj[prop] === "object" || typeof obj[prop] === "function") &&
      !Object.isFrozen(obj[prop])
    ) {
      deepFreeze(obj[prop]);
    }
  });
  return obj;
}

describe("user reducer advanced/edge logic", () => {
  const initialUser = {
    token: "tok",
    channels: [{ id: 1, name: "a" }, { id: 2, name: "b" }],
    username: "boop",
    foo: "bar",
  };
  const initialState = { data: initialUser };

  it("returns default state when state is undefined", () => {
    expect(userReducer(undefined, { type: "@@INIT" })).toEqual({
      data: {},
    });
  });

  it("handles addChannel (prepends)", () => {
    const state = deepFreeze({ ...initialState });
    const result = userReducer(state, addChannel({ id: 3, name: "c" }));
    expect(result.data.channels.length).toBe(3);
    expect(result.data.channels[0]).toEqual({ id: 3, name: "c" });
    expect(result.data.channels[1]).toEqual({ id: 1, name: "a" });
  });

  it("handles removeChannel (filters correctly)", () => {
    const state = deepFreeze({ ...initialState });
    const result = userReducer(state, removeChannel(2));
    expect(result.data.channels.length).toBe(1);
    expect(result.data.channels[0].id).toBe(1);
  });

  it("handles updateUser (merges state)", () => {
    const state = deepFreeze({ ...initialState });
    const changes = { bio: "hi", token: "newtok" };
    const result = userReducer(state, updateUser(changes));
    expect(result.data.bio).toBe("hi");
    expect(result.data.token).toBe("newtok");
    expect(result.data.username).toBe("boop");
  });

  it("handles logout (resets user data completely)", () => {
    const state = deepFreeze({ ...initialState });
    const result = userReducer(state, logout());
    expect(result.data).toEqual({});
  });

  it("handles login.fulfilled & signup.fulfilled action (success payload)", () => {
    const resultLogin = userReducer(
      { data: {} },
      { type: "user/login/fulfilled", payload: { user: 42 } }
    );
    expect(resultLogin.data).toEqual({ user: 42 });

    const resultSignup = userReducer(
      { data: {} },
      { type: "user/signup/fulfilled", payload: { user: 88 } }
    );
    expect(resultSignup.data).toEqual({ user: 88 });
  });

  it("handles login.fulfilled & signup.fulfilled action (no payload)", () => {
    const resLogin = userReducer(
      { data: { a: 1 } },
      { type: "user/login/fulfilled", payload: undefined }
    );
    expect(resLogin.data).toEqual({});

    const resSignup = userReducer(
      { data: { b: 2 } },
      { type: "user/signup/fulfilled", payload: undefined }
    );
    expect(resSignup.data).toEqual({});
  });

  it("can handle addChannel if no existing channels", () => {
    const result = userReducer({ data: { foo: 1 } }, addChannel({ id: 55 }));
    expect(result.data.channels.length).toBe(1);
    expect(result.data.channels[0].id).toBe(55);
  });

  it("handles addChannel with channels null or undefined", () => {
    // null channels
    const resultNull = userReducer({ data: { channels: null } }, addChannel({ id: 42 }));
    expect(Array.isArray(resultNull.data.channels)).toBe(true);
    expect(resultNull.data.channels[0].id).toBe(42);
    // undefined channels
    const resultUnd = userReducer({ data: {} }, addChannel({ id: 42 }));
    expect(Array.isArray(resultUnd.data.channels)).toBe(true);
    expect(resultUnd.data.channels[0].id).toBe(42);
  });

  it("can handle removeChannel if channels is missing/empty", () => {
    // Try with undefined channels
    const result1 = userReducer({ data: {} }, removeChannel(1));
    expect(Array.isArray(result1.data.channels)).toBe(true);
    // Try with empty array
    const result2 = userReducer({ data: { channels: [] } }, removeChannel(42));
    expect(result2.data.channels).toEqual([]);
    // Try with null
    const result3 = userReducer({ data: { channels: null } }, removeChannel(42));
    expect(Array.isArray(result3.data.channels)).toBe(true);
  });

  it("updateUser merges over empty and missing objects", () => {
    const result1 = userReducer({ data: {} }, updateUser({ x: 1 }));
    expect(result1.data.x).toBe(1);

    const result2 = userReducer(undefined, updateUser({ z: 2 }));
    expect(result2.data.z).toBe(2);
  });

  it("handles unknown action gracefully", () => {
    const prev = { data: { foo: 123 } };
    const next = userReducer(prev, { type: "something/else", payload: 10 });
    expect(next).toEqual(prev);
    // Also check with an action object missing type
    const resultNoType = userReducer(prev, {});
    expect(resultNoType).toEqual(prev);
    // Check with totally empty action
    const resultEmpty = userReducer(prev, undefined);
    expect(resultEmpty).toEqual(prev);
  });
});
