import videoReducer, {
  clearVideo,
  addComment,
  like,
  dislike,
  cancelLike,
  cancelDislike,
  subscribeFromVideo,
  unsubscribeFromVideo,
} from "../video";

describe("video reducer", () => {
  const initialState = {
    isFetching: true,
    data: {},
  };

  it("should return the initial state", () => {
    expect(videoReducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("should handle getVideo fulfilled", () => {
    const action = {
      type: "video/getVideo/fulfilled",
      payload: { foo: "bar" },
    };
    expect(videoReducer(initialState, action)).toEqual({
      isFetching: false,
      data: { foo: "bar" },
    });
  });

  it("should handle clearVideo", () => {
    const prev = { isFetching: false, data: { foo: "bar" } };
    expect(videoReducer(prev, clearVideo())).toEqual(initialState);
  });

  it("should prepend comment to data.comments", () => {
    const prev = {
      isFetching: false,
      data: { comments: ["a"], foo: "bar" },
    };
    expect(
      videoReducer(prev, addComment("newComment")).data.comments[0]
    ).toBe("newComment");
  });

  it("should increment likes and toggle isLiked on like", () => {
    const prev = {
      isFetching: false,
      data: { isLiked: false, likesCount: 0 },
    };
    const next = videoReducer(prev, like());
    expect(next.data.isLiked).toBe(true);
    expect(next.data.likesCount).toBe(1);
  });

  it("should increment dislikes and toggle isDisliked on dislike", () => {
    const prev = {
      isFetching: false,
      data: { isDisliked: false, dislikesCount: 3 },
    };
    const next = videoReducer(prev, dislike());
    expect(next.data.isDisliked).toBe(true);
    expect(next.data.dislikesCount).toBe(4);
  });

  it("should decrement likes and toggle isLiked on cancelLike", () => {
    const prev = {
      isFetching: false,
      data: { isLiked: true, likesCount: 2 },
    };
    const next = videoReducer(prev, cancelLike());
    expect(next.data.isLiked).toBe(false);
    expect(next.data.likesCount).toBe(1);
  });

  it("should decrement dislikes and toggle isDisliked on cancelDislike", () => {
    const prev = {
      isFetching: false,
      data: { isDisliked: true, dislikesCount: 2 },
    };
    const next = videoReducer(prev, cancelDislike());
    expect(next.data.isDisliked).toBe(false);
    expect(next.data.dislikesCount).toBe(1);
  });

  it("should toggle isSubscribed on subscribeFromVideo", () => {
    const prev = {
      isFetching: false,
      data: { isSubscribed: false },
    };
    expect(
      videoReducer(prev, subscribeFromVideo()).data.isSubscribed
    ).toBe(true);
  });

  it("should toggle isSubscribed on unsubscribeFromVideo", () => {
    const prev = {
      isFetching: false,
      data: { isSubscribed: true },
    };
    expect(
      videoReducer(prev, unsubscribeFromVideo()).data.isSubscribed
    ).toBe(false);
  });
});
