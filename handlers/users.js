const redis = require("../libs/redis");

const getUser = async (req, res) => {
  const key = `users:${req.params.id}`;
  const val = await redis.getClient().get(key);
  const user = JSON.parse(val);
  return user;
};
exports.getUser = getUser;

const getUsers = async (req, res) => {
  const stream = redis.getClient().scanStream({ match: "users:*", count: 2 });
  const users = [];
  for await (const resultKeys of stream) {
    for (const key of resultKeys) {
      const val = await redis.getClient().get(key);
      const user = JSON.parse(val);
      users.push(user);
    }
  }
  return { users: users };
};
exports.getUsers = getUsers;
