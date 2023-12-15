const telecom = artifacts.require("./telecom.sol");
module.exports = function(_deployer) {
  // Use deployer to state migration tasks.
};

module.exports = function (deployer, network, accounts) {
  const Address = "0x0aF9b8e5Db31E5f45d8c2926B358D9995ebf35de";
  deployer.deploy(telecom, Address);
};