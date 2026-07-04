// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PacemakerIDSLogger {
    address public admin;

    uint public alertCounter;
    uint public commandCounter;

    struct IDSAlert {
        uint id;
        string patientId;
        string patientDetails;
        string attackType;
        string alteredFrequency;
        string previousFrequency;
        string source;
        string ipfsHash;
        string severity;
        string deviceModel;
        string riskCategory;
        uint timestamp;
    }

    struct ApprovedCommand {
        uint id;
        string patientId;
        string command;
        string approvedBy;
        uint timestamp;
        uint expiry;
    }

    // 🔐 Replay attack & rate limit mappings
    mapping(address => uint256) private lastUsedNonce;
    mapping(address => address) private devicePubKeys;
    mapping(address => uint256) private lastCommandBlock;

    mapping(uint => IDSAlert) public idsAlerts;
    mapping(string => uint[]) public alertsByPatient;

    mapping(uint => ApprovedCommand) public approvedCommands;
    mapping(string => uint[]) public approvedByPatient;

    mapping(address => bool) public authorizedDevices;

    event IDSAlertLogged(
        uint indexed id,
        string patientId,
        string attackType,
        string ipfsHash,
        string severity,
        uint timestamp
    );

    event CommandApproved(
        uint indexed id,
        string patientId,
        string command,
        string approvedBy,
        uint expiry
    );

    event CommandProcessed(address indexed device, bytes32 command, uint256 nonce);
    event DeviceRegistered(address indexed device, address pubKey);
    event DeviceRevoked(address indexed device);
    event DeviceUpdated(address indexed device, address newPubKey);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedDevices[msg.sender], "Not authorized device");
        _;
    }

    constructor() {
        admin = msg.sender;
        authorizedDevices[admin] = true;
    }

    // ========== Device Control ==========
    function registerDevice(address device, address pubKey) external onlyAdmin {
        require(device != address(0) && pubKey != address(0), "Invalid input");
        require(devicePubKeys[device] == address(0), "Already registered");
        devicePubKeys[device] = pubKey;
        authorizedDevices[device] = true;
        emit DeviceRegistered(device, pubKey);
    }

    function revokeDevice(address device) external onlyAdmin {
        require(devicePubKeys[device] != address(0), "Not registered");
        delete devicePubKeys[device];
        delete lastUsedNonce[device];
        delete lastCommandBlock[device];
        authorizedDevices[device] = false;
        emit DeviceRevoked(device);
    }

    function updatePubKey(address device, address newPubKey) external onlyAdmin {
        require(devicePubKeys[device] != address(0), "Not registered");
        devicePubKeys[device] = newPubKey;
        emit DeviceUpdated(device, newPubKey);
    }

    function isDeviceAuthorized(address _addr) public view returns (bool) {
        return authorizedDevices[_addr];
    }

    // ========== IDS Logging ==========
    function logIDSAlert(
        string memory _patientId,
        string memory _patientDetails,
        string memory _attackType,
        string memory _alteredFrequency,
        string memory _previousFrequency,
        string memory _source,
        string memory _ipfsHash,
        string memory _severity,
        string memory _deviceModel,
        string memory _riskCategory
    ) public onlyAuthorized {
        alertCounter++;
        idsAlerts[alertCounter] = IDSAlert(
            alertCounter,
            _patientId,
            _patientDetails,
            _attackType,
            _alteredFrequency,
            _previousFrequency,
            _source,
            _ipfsHash,
            _severity,
            _deviceModel,
            _riskCategory,
            block.timestamp
        );

        alertsByPatient[_patientId].push(alertCounter);

        emit IDSAlertLogged(
            alertCounter,
            _patientId,
            _attackType,
            _ipfsHash,
            _severity,
            block.timestamp
        );
    }

    // ========== Command Approval ==========
    function logApprovedCommand(
        string memory _command,
        string memory _patientId,
        string memory _approvedBy
    ) public onlyAuthorized {
        commandCounter++;
        uint expiryTime = block.timestamp + 15 minutes;

        approvedCommands[commandCounter] = ApprovedCommand(
            commandCounter,
            _patientId,
            _command,
            _approvedBy,
            block.timestamp,
            expiryTime
        );

        approvedByPatient[_patientId].push(commandCounter);

        emit CommandApproved(
            commandCounter,
            _patientId,
            _command,
            _approvedBy,
            expiryTime
        );
    }

    // ========== Replay & DoS Protected Command Input ==========
    function sendCommand(
        uint256 _nonce,
        bytes32 _command,
        uint256 _timestamp,
        bytes memory _signature
    ) external {
        address device = msg.sender;

        require(devicePubKeys[device] != address(0), "Device not registered");
        require(_command != bytes32(0), "Empty command");
        require(_nonce > lastUsedNonce[device], "Replay detected");
        require(block.number > lastCommandBlock[device] + 4, "Rate limit");
        require(block.timestamp <= _timestamp + 300, "Command expired");

        bytes32 messageHash = keccak256(
            abi.encodePacked(device, _command, _nonce, _timestamp, block.chainid, address(this))
        );

        address signer = recoverSigner(messageHash, _signature);
        require(signer == devicePubKeys[device], "Invalid signature");

        lastUsedNonce[device] = _nonce;
        lastCommandBlock[device] = block.number;

        emit CommandProcessed(device, _command, _nonce);
    }

    function recoverSigner(bytes32 messageHash, bytes memory sig) internal pure returns (address) {
        bytes32 ethSigned = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(sig);
        return ecrecover(ethSigned, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid sig length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    // ========== View ==========

    function getAlertsByPatient(string memory _patientId) public view returns (uint[] memory) {
        return alertsByPatient[_patientId];
    }

    function getAlert(uint _id) public view returns (IDSAlert memory) {
        return idsAlerts[_id];
    }

    function getApprovedCommandsByPatient(string memory _patientId) public view returns (uint[] memory) {
        return approvedByPatient[_patientId];
    }

    function getApprovedCommand(uint _id) public view returns (ApprovedCommand memory) {
        return approvedCommands[_id];
    }

    function getLastNonce(address device) external view returns (uint256) {
        return lastUsedNonce[device];
    }

    function getPubKey(address device) external view onlyAdmin returns (address) {
        return devicePubKeys[device];
    }

    function getLastCommandBlock(address device) external view returns (uint256) {
        return lastCommandBlock[device];
    }
}
