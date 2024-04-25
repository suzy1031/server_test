const mockRedisGet = jest.fn(); // getのmock
const mockRedisScanStream = jest.fn(); // scanStreamのmock
jest.mock("../libs/redis", () => {
  return {
    getClient: jest.fn().mockImplementation(() => {
      return {
        get: mockRedisGet,
        scanStream: mockRedisScanStream,
      };
    }),
  };
});

const { getUser, getUsers } = require("./users");

beforeEach(() => {
  mockRedisGet.mockClear();
  mockRedisScanStream.mockClear();
});

test("getUser", async () => {
  mockRedisGet.mockResolvedValue(JSON.stringify({ id: 1, name: "alpha" }));

  const reqMock = { params: { id: 1 } };

  const res = await getUser(reqMock);

  // 返り値のテスト
  expect(res.id).toStrictEqual(1);
  expect(res.name).toStrictEqual("alpha");

  // mockの呼び出し回数のテスト
  expect(mockRedisGet).toHaveBeenCalledTimes(1);

  // mockの引数のテスト
  const [arg1] = mockRedisGet.mock.calls[0];
  expect(arg1).toStrictEqual("users:1");
});

test("getUser 失敗", async () => {
  expect.assertions(2);

  mockRedisGet.mockRejectedValue(new Error("something error"));

  const reqMock = { params: { id: 1 } };

  try {
    await getUser(reqMock);
  } catch (err) {
    expect(err.message).toStrictEqual("something error");
    expect(err instanceof Error).toStrictEqual(true);
  }
});

test("getUsers", async () => {
  const streamMock = {
    async *[Symbol.asyncIterator]() {
      yield ["users:1", "users:2"];
      yield ["users:3", "users:4"];
    },
  };
  mockRedisScanStream.mockReturnValueOnce(streamMock);
  mockRedisGet.mockImplementation((key) => {
    switch (key) {
      case "users:1":
        return Promise.resolve(JSON.stringify({ id: 1, name: "alpha" }));
      case "users:2":
        return Promise.resolve(JSON.stringify({ id: 2, name: "bravo" }));
      case "users:3":
        return Promise.resolve(JSON.stringify({ id: 3, name: "charlie" }));
      case "users:4":
        return Promise.resolve(JSON.stringify({ id: 4, name: "delta" }));
    }
    return Promise.resolve(null);
  });

  const reqMock = {};

  const res = await getUsers(reqMock);

  expect(mockRedisGet).toHaveBeenCalledTimes(4);
  expect(res.users.length).toStrictEqual(4);
  expect(res.users).toStrictEqual([
    { id: 1, name: "alpha" },
    { id: 2, name: "bravo" },
    { id: 3, name: "charlie" },
    { id: 4, name: "delta" },
  ]);
});
