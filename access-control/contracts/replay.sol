// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SecurePacemakerMonitor {
    address public admin;

    mapping(address => uint256) private lastUsedNonce;
    mapping(address => address) private pacemakerPubKeys;
    mapping(address => uint256) private lastCommandBlock;

    event CommandProcessed(address indexed device, bytes32 command, uint256 nonce);
    event DeviceRegistered(address indexed device, address pubKey);
    event DeviceRevoked(address indexed device);
    event DeviceUpdated(address indexed device, address newPubKey);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized: Admins only");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerDevice(address device, address pubKey) external onlyAdmin {
        require(device != address(0) && pubKey != address(0), "Invalid device or pubKey");
        require(pacemakerPubKeys[device] == address(0), "Device already registered");
        pacemakerPubKeys[device] = pubKey;
        emit DeviceRegistered(device, pubKey);
    }

    function revokeDevice(address device) external onlyAdmin {
        require(pacemakerPubKeys[device] != address(0), "Device not registered");
        delete pacemakerPubKeys[device];
        delete lastUsedNonce[device];
        delete lastCommandBlock[device];
        emit DeviceRevoked(device);
    }

    function updatePubKey(address device, address newPubKey) external onlyAdmin {
        require(pacemakerPubKeys[device] != address(0), "Device not registered");
        pacemakerPubKeys[device] = newPubKey;
        emit DeviceUpdated(device, newPubKey);
    }

    function sendCommand(
        uint256 _nonce,
        bytes32 _command,
        uint256 _timestamp,
        bytes memory _signature
    ) external {
        address device = msg.sender;

        require(pacemakerPubKeys[device] != address(0), "Device not registered");
        require(_command != bytes32(0), "Invalid command");
        require(_nonce > lastUsedNonce[device], "Replay or out-of-order nonce");
        require(block.number > lastCommandBlock[device] + 4, "Rate limit exceeded");
        require(block.timestamp <= _timestamp + 300, "Command expired");

        bytes32 messageHash = keccak256(
            abi.encodePacked(device, _command, _nonce, _timestamp, block.chainid, address(this))
        );

        address signer = recoverSigner(messageHash, _signature);
        require(signer == pacemakerPubKeys[device], "Invalid signature");

        lastUsedNonce[device] = _nonce;
        lastCommandBlock[device] = block.number;

        emit CommandProcessed(device, _command, _nonce);
    }

    function recoverSigner(bytes32 messageHash, bytes memory sig) internal pure returns (address) {
        bytes32 ethSignedMessageHash =
            keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));

        (bytes32 r, bytes32 s, uint8 v) = splitSignature(sig);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    // View functions
    function getLastNonce(address device) external view returns (uint256) {
        return lastUsedNonce[device];
    }

    function getPubKey(address device) external view onlyAdmin returns (address) {
        return pacemakerPubKeys[device];
    }

    function getLastCommandBlock(address device) external view returns (uint256) {
        return lastCommandBlock[device];
    }
}
