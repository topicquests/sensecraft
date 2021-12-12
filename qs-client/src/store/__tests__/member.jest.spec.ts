import mockAxios from "jest-mock-axios";
import getStore from "../index";

const store = getStore(mockAxios as any);

function makeReq(url: string, data: any, method?: string) {
  method = method || "get";
  return {
    url,
    method,
    data,
    baseURL: "",
    headers: {},
  };
}

describe("Member store", () => {
  afterEach(() => mockAxios.reset());

  it("gets a token", async () => {
    // using the component, which should make a server response
    const clientMessage = {
      signonEmail: "test@example.com",
      password: "password",
    };
    const promise = store.dispatch("member/signin", clientMessage);

    expect(mockAxios.request).toHaveBeenCalledWith(
      makeReq(
        "/rpc/get_token",
        {
          mail: "test@example.com",
          pass: "password",
        },
        "post"
      )
    );

    // simulating a server response
    mockAxios.mockResponse({ data: "some_login_token" });

    try {
      const result = await promise;
      expect(result.data).toEqual("some_login_token");
    } catch (e) {
      expect(e).toBeUndefined();
    }
  });
});
