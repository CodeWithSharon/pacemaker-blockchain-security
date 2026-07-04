// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CommandValidator {
    uint256 public cooldown = 10;
    address public owner;
    bool public paused = false;

    mapping(address => uint256) public lastCommandTime;
    mapping(bytes32 => bool) public usedCommandHashes;
    mapping(address => uint256) public nonces;
    mapping(address => bool) public isAdmin;
    mapping(address => bool) public blacklisted;

    string[] private allowedCommands;

    event EmergencyLockdownTriggered(address indexed triggeredBy, uint timestamp, string reason);
    event CommandLogged(address indexed user, string command, uint timestamp);
    mapping(string => bool) public approvedFirmwareHashes;
    event ThreatReported(address indexed reporter, string reason, uint timestamp);
    string[] public blockedPatterns;

    event CommandAccepted(address indexed sender, string command, uint timestamp);
    event CommandRejected(address indexed sender, string reason, uint timestamp);
    event Paused(bool isPaused);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event UserBlacklisted(address indexed user);
    event UserWhitelisted(address indexed user);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can do this");
        _;
    }

    modifier onlyAdminOrOwner() {
        require(msg.sender == owner || isAdmin[msg.sender], "Not authorized");
        _;
    }

    modifier notPaused() {
        require(!paused, "System is paused");
        _;
    }

    modifier notBlacklisted() {
        require(!blacklisted[msg.sender], "Sender is blacklisted");
        _;
    }

    constructor() {
        owner = msg.sender;

        allowedCommands.push("start");
        allowedCommands.push("stop");
        allowedCommands.push("status");
        allowedCommands.push("pulse-check");
        allowedCommands.push("heartbeat-check");

        blockedPatterns.push(";");
        blockedPatterns.push("|");
        blockedPatterns.push("&");
        blockedPatterns.push("rm");
        blockedPatterns.push("wg");
        blockedPatterns.push("cu");
        blockedPatterns.push("su");
    }

    function submitCommand(string calldata command) external notPaused notBlacklisted {
        require(block.timestamp >= lastCommandTime[msg.sender] + cooldown, "Cooldown period active");
        require(!isMalicious(command), "Malicious pattern detected");
        require(isAllowed(command), "Command not allowed");

        uint256 userNonce = nonces[msg.sender];
        bytes32 commandHash = keccak256(abi.encodePacked(command, msg.sender, userNonce));
        require(!usedCommandHashes[commandHash], "Command already used");

        usedCommandHashes[commandHash] = true;
        nonces[msg.sender]++;
        lastCommandTime[msg.sender] = block.timestamp;

        emit CommandAccepted(msg.sender, command, block.timestamp);
    }

    function isMalicious(string memory command) internal view returns (bool) {
        for (uint i = 0; i < blockedPatterns.length; i++) {
            if (compareStrings(command, blockedPatterns[i])) return true;
        }
        return false;
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    function isAllowed(string memory input) internal view returns (bool) {
        for (uint i = 0; i < allowedCommands.length; i++) {
            if (
                keccak256(abi.encodePacked(allowedCommands[i])) ==
                keccak256(abi.encodePacked(input))
            ) {
                return true;
            }
        }
        return false;
    }

    function getAllowedCommands() external view returns (string[] memory) {
        return allowedCommands;
    }

    function addCommand(string calldata command) external onlyAdminOrOwner {
        require(!isMalicious(command), "Can't add a malicious command");
        allowedCommands.push(command);
    }

    function updateCooldown(uint256 newCooldown) external onlyAdminOrOwner {
        require(newCooldown <= 300, "Cooldown too high");
        cooldown = newCooldown;
    }

    function togglePause() external onlyOwner {
        paused = !paused;
        emit Paused(paused);
    }

    function triggerEmergencyLockdown(string memory reason) public onlyOwner {
        paused = true;
        emit EmergencyLockdownTriggered(msg.sender, block.timestamp, reason);
    }

    function addApprovedFirmwareHash(string memory hash) public onlyAdminOrOwner {
        approvedFirmwareHashes[hash] = true;
    }

    function submitFirmwareCommand(string memory commandHash) public notPaused notBlacklisted {
        require(approvedFirmwareHashes[commandHash], "Firmware hash not approved");
        emit CommandAccepted(msg.sender, string.concat("FirmwareUpdate:", commandHash), block.timestamp);
    }

    function reportThreat(string memory reason) public {
        emit ThreatReported(msg.sender, reason, block.timestamp);
    }

    function addBlockedPattern(string memory pattern) public onlyAdminOrOwner {
        require(!isMalicious(pattern), "Cannot add malicious pattern as a blocked pattern itself.");
        blockedPatterns.push(pattern);
    }

    function removeBlockedPattern(string memory pattern) public onlyAdminOrOwner {
        bool found = false;
        for (uint i = 0; i < blockedPatterns.length; i++) {
            if (compareStrings(blockedPatterns[i], pattern)) {
                blockedPatterns[i] = blockedPatterns[blockedPatterns.length - 1];
                blockedPatterns.pop();
                found = true;
                break;
            }
        }
        require(found, "Pattern not found");
    }

    function getBlockedPatterns() public view returns (string[] memory) {
        return blockedPatterns;
    }

    function addAdmin(address _admin) external onlyOwner {
        isAdmin[_admin] = true;
        emit AdminAdded(_admin);
    }

    function removeAdmin(address _admin) external onlyOwner {
        isAdmin[_admin] = false;
        emit AdminRemoved(_admin);
    }

    function blacklistUser(address user) external onlyAdminOrOwner {
        require(!blacklisted[user], "Already blacklisted");
        blacklisted[user] = true;
        emit UserBlacklisted(user);
    }

    function whitelistUser(address user) external onlyAdminOrOwner {
        require(blacklisted[user], "User is not blacklisted");
        blacklisted[user] = false;
        emit UserWhitelisted(user);
    }

   
    function resetCooldown(address user) external onlyAdminOrOwner {
        lastCommandTime[user] = 0;
    }

    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }
}