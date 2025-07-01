import channelRecommendationReducer, {
  toggleSubscribeChannelRecommendation,
} from "../channelRecommendation";

/** 
* Advanced tests for channelRecommendation slice:
* - Handles initial state
* - Fetch & set channels
* - Toggle subscription (existing, missing, double toggle)
* - Invalid actions (should not mutate state)
* - Edge cases (empty/null/undefined channels array)
*/
describe("channelRecommendation reducer (advanced/edge cases)", () => {
  const initialState = { isFetching: true, channels: [] };

  it("should return the initial state", () => {
    expect(
      channelRecommendationReducer(undefined, { type: "@@INIT" })
    ).toEqual(initialState);
  });

  it("handles getChannels fulfilled", () => {
    const sampleChannels = [
      { id: 123, name: "X", isSubscribed: false },
      { id: 456, name: "Y", isSubscribed: true },
    ];
    const action = {
      type: "channelRecommendation/getChannels/fulfilled",
      payload: sampleChannels,
    };
    expect(channelRecommendationReducer(initialState, action)).toEqual({
      isFetching: false,
      channels: sampleChannels,
    });
  });

  it("toggleSubscribeChannelRecommendation toggles correct channel", () => {
    const before = {
      isFetching: false,
      channels: [{ id: 3, isSubscribed: false }, { id: 4, isSubscribed: true }],
    };
    const after = channelRecommendationReducer(
      before,
      toggleSubscribeChannelRecommendation(3)
    );
    expect(after.channels[0].isSubscribed).toBe(true);
    expect(after.channels[1].isSubscribed).toBe(true);
  });

  it("toggleSubscribe with non-existent id does nothing", () => {
    const before = {
      isFetching: false,
      channels: [{ id: 3, isSubscribed: false }],
    };
    const after = channelRecommendationReducer(
      before,
      toggleSubscribeChannelRecommendation(999)
    );
    expect(after.channels).toEqual(before.channels);
  });

  it("toggleSubscribe double toggling restores original", () => {
    const before = {
      isFetching: false,
      channels: [{ id: 3, isSubscribed: false }],
    };
    const afterOnce = channelRecommendationReducer(
      before,
      toggleSubscribeChannelRecommendation(3)
    );
    const afterTwice = channelRecommendationReducer(
      afterOnce,
      toggleSubscribeChannelRecommendation(3)
    );
    expect(afterTwice.channels[0].isSubscribed).toBe(false);
  });

  it("handles invalid/unrecognized action types", () => {
    const prev = { isFetching: false, channels: [{ id: 3, isSubscribed: false }] };
    const res = channelRecommendationReducer(prev, { type: "random/unknown/action", payload: 77 });
    expect(res).toEqual(prev);
  });

  it("handles state where channels is null/undefined/empty gracefully", () => {
    // null
    const stateNull = { isFetching: false, channels: null };
    const outNull = channelRecommendationReducer(
      stateNull,
      toggleSubscribeChannelRecommendation(3)
    );
    expect(Array.isArray(outNull.channels)).toBe(true);

    // undefined
    const stateUndef = { isFetching: false };
    const outUndef = channelRecommendationReducer(
      stateUndef,
      toggleSubscribeChannelRecommendation(3)
    );
    expect(Array.isArray(outUndef.channels)).toBe(true);

    // empty
    const stateEmpty = { isFetching: false, channels: [] };
    const outEmpty = channelRecommendationReducer(
      stateEmpty,
      toggleSubscribeChannelRecommendation(3)
    );
    expect(outEmpty.channels).toEqual([]);
  });
});

