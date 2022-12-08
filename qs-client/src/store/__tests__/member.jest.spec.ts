import mockAxios from "jest-mock-axios";
import getStore from "..";
import { TOKEN_EXPIRATION } from "../member";

const store = getStore(mockAxios as any);

function makeReq({
  url,
  data,
  params,
  method,
}: {
  url: string;
  data?: any;
  params?: any;
  method?: string;
}) {
  const token = store.state.member.token;
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  method = method || "get";
  data = data || {};
  return {
    baseURL: "",
    url,
    method,
    data,
    params,
    headers,
  };
}

describe("Member store", () => {
  afterEach(() => mockAxios.reset());
  const mail = "test@example.com";
  const token = "some_login_token";

  it("gets a token", async () => {
    // using the component, which should make a server response
    const clientMessage = {
      signonEmail: mail,
      password: "password",
    };
    const promise = store.dispatch("member/signin", clientMessage);

    expect(mockAxios.request).toHaveBeenCalledWith(
      makeReq({
        url: "/rpc/get_token",
        data: {
          mail,
          pass: "password",
        },
        method: "post",
      })
    );

    // simulating a server response
    mockAxios.mockResponse({ data: token });

    const result = await promise;
    expect(result.data).toEqual(token);
    expect(store.state.member.token).toEqual(token);
    const expiry = new Date(store.state.member.tokenExpiry);
    const interval = expiry.getTime() - Date.now();
    expect(interval).toBeGreaterThan(0);
    expect(interval).toBeLessThanOrEqual(TOKEN_EXPIRATION);
  });
  it("fetches the login user", async () => {
    store.dispatch("member/ensureLoginUser");
    expect(mockAxios.request).toHaveBeenCalledWith(
      makeReq({
        url: "/rpc/current_member",
      })
    );
    expect(store.state.member.member).toBeDefined();
  });
  it("resets correctly", async () => {
    await store.dispatch("reset");
    expect(store.state.member.token).toBeNull();
  });
});
