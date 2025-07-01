import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Suggestions from "../Suggestions";

jest.mock("../ChannelInfo", () => ({ channel }) =>
  <div data-testid="channel-info">{channel?.name ?? "unknown"}</div>
);
jest.mock("../skeletons/SuggestionSkeleton", () => () =>
  <div data-testid="loader">Loading...</div>
);
jest.mock("../pages/Trending", () => ({
  StyledTrending: ({ children }) => <div data-testid="trending">{children}</div>
}));

const mockStore = configureStore([]);

describe("Suggestions advanced state UI", () => {
  it("renders loader when isFetching=true", () => {
    const store = mockStore({
      channelRecommendation: { isFetching: true, channels: [] },
    });
    render(
      <Provider store={store}>
        <Suggestions />
      </Provider>
    );
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("renders channel list when fetched", () => {
    const mockChannels = [{ id: 5, name: "Alpha" }, { id: 6, name: "Beta" }];
    const store = mockStore({
      channelRecommendation: { isFetching: false, channels: mockChannels },
    });
    render(
      <Provider store={store}>
        <Suggestions />
      </Provider>
    );
    // Both channels rendered
    expect(screen.getAllByTestId("channel-info")).toHaveLength(2);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("renders empty content if no channels present", () => {
    const store = mockStore({
      channelRecommendation: { isFetching: false, channels: [] },
    });
    render(
      <Provider store={store}>
        <Suggestions />
      </Provider>
    );
    // Only the header and container should be present, no channel-info children
    expect(screen.getByText(/suggestions/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId("channel-info").length).toBe(0);
  });
});
