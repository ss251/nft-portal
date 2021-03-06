require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const alchemy_url = process.env.ALCHEMY_API_URL;
const rinkeby_key = process.env.RINKEBY_ACCOUNT_KEY;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: alchemy_url,
      accounts: [rinkeby_key],
    },
  },
};
