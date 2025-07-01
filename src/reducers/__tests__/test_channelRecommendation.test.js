import channelRecommendationReducer, {
  toggleSubscribeChannelRecommendation,
} from "../channelRecommendation";

describe("channelRecommendation reducer", () => {
  const initialState = {
    isFetching: true,
    channels: [],
  };

  it("should return the initial state when called with undefined", () => {
    expect(channelRecommendationReducer(undefined, { type: "@@INIT" })).toEqual(
      initialState
    );
  });

  it("should handle fulfilled getChannels", () => {
    const fulfilled = {
      type: "channelRecommendation/getChannels/fulfilled",
      payload: [{ id: "abc", isSubscribed: false }],
    };
    expect(channelRecommendationReducer(initialState, fulfilled)).toEqual({
      isFetching: false,
      channels: [{ id: "abc", isSubscribed: false }],
    });
  });

  it("should toggle subscription state for a channel", () => {
    const prevState = {
      isFetching: false,
      channels: [
        { id: "1", isSubscribed: false },
        { id: "2", isSubscribed: true },
      ],
    };
    expect(
      channelRecommendationReducer(
        prevState,
        toggleSubscribeChannelRecommendation("2")
      )
    ).toEqual({
      isFetching: false,
      channels: [
        { id: "1", isSubscribed: false },
        { id: "2", isSubscribed: false },
      ],
    });
  });

  it("should not change state if id not found in toggle", () => {
    const prevState = {
      isFetching: false,
      channels: [{ id: "1", isSubscribed: false }],
    };
    expect(
      channelRecommendationReducer(
        prevState,
        toggleSubscribeChannelRecommendation("nonexistent")
      )
    ).toEqual(prevState);
  });
});
