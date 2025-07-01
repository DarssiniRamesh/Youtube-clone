import profileReducer, {
  updateProfile,
  clearProfile,
  subscribeFromProfile,
  unsubscribeFromProfile,
} from "../profile";

describe("profile reducer", () => {
  const initialState = {
    isFetching: true,
    data: {},
  };

  it("should return the initial state", () => {
    expect(profileReducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("should handle getProfile fulfilled", () => {
    const act = {
      type: "profile/getProfile/fulfilled",
      payload: { name: "Jake" },
    };
    expect(profileReducer(initialState, act)).toEqual({
      isFetching: false,
      data: { name: "Jake" },
    });
  });

  it("should update profile", () => {
    const prev = {
      isFetching: false,
      data: { a: 1, b: 2 },
    };
    expect(profileReducer(prev, updateProfile({ b: 4, c: 7 }))).toEqual({
      isFetching: false,
      data: { a: 1, b: 4, c: 7 },
    });
  });

  it("should handle clearProfile", () => {
    const prev = {
      isFetching: false,
      data: { foo: "bar" },
    };
    expect(profileReducer(prev, clearProfile())).toEqual(initialState);
  });

  it("should handle subscribeFromProfile", () => {
    const prev = {
      isFetching: false,
      data: { subscribersCount: 2, isSubscribed: false },
    };
    const next = profileReducer(prev, subscribeFromProfile());
    expect(next.data.subscribersCount).toBe(3);
    expect(next.data.isSubscribed).toBe(true);
  });

  it("should handle unsubscribeFromProfile", () => {
    const prev = {
      isFetching: false,
      data: { subscribersCount: 2, isSubscribed: true },
    };
    const next = profileReducer(prev, unsubscribeFromProfile());
    expect(next.data.subscribersCount).toBe(1);
    expect(next.data.isSubscribed).toBe(false);
  });
});
