
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UnauthorizedAccessControl {
    address public owner;
    mapping(address => bool) public isAdmin;
    mapping(address => string[]) private deviceRoles;
    mapping(bytes32 => bool) public blacklistedCombos;
    bool public emergencyMode;

    struct AccessLog {
        address user;
        string purpose;
        string[] roles;
        bool success;
        string reason;
        uint timestamp;
    }
    AccessLog[] public logs;

    mapping(address => address[]) private doctorPatients;
    struct PatientOld {
        string name;
        uint age;
        string medicalHistory;
        bool exists;
    }
    mapping(address => PatientOld) private patientsOld;

    struct FirmwareUpdate {
        string deviceId;
        string firmwareVersion;
        string firmwareHash;
        address updatedBy;
        uint timestamp;
    }
    FirmwareUpdate[] public firmwareLogs;

    struct PatientNew {
        string name;
        string details;
        string[] checkupHistory;
    }
    struct Appointment {
        string date;
        string reason;
    }
    mapping(address => bool) public doctors;
    mapping(address => PatientNew) public patientsNew;
    mapping(address => Appointment[]) public doctorAppointments;

    // --- NEW EMERGENCY COMPONENTS START ---
    struct EmergencyEvent {
        string message;
        uint timestamp;
        address device; // To log which device triggered/logged
    }

    EmergencyEvent[] public emergencyEvents;
    bool public isEmergencyActive = false; // Dedicated state for the emergency device's features

    event EmergencyTriggered(address indexed device, string message, uint timestamp);
    event EmergencyResolved(address indexed device, uint timestamp);
    event EmergencyEventLogged(address indexed device, string message, uint timestamp);
    // --- NEW EMERGENCY COMPONENTS END ---


    event RoleRegistered(address indexed device, string[] roles);
    event RoleRevoked(address indexed device);
    event AccessAttempt(address indexed device, bool granted, string reason);
    event EmergencyToggled(bool status);
    event AdminAdded(address newAdmin);
    event AdminRemoved(address removedAdmin);
    event ComboRemoved(bytes32 comboHash);
    event DoctorRegistered(address indexed doctor);
    event PatientRegistered(address indexed patient, address indexed doctor);
    event FirmwareUpdated(string deviceId, string firmwareVersion, string firmwareHash, address updatedBy);
    event PatientUpdated(address patient, string updateNote, uint timestamp);
    event AppointmentAdded(address doctor, string date, string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this");
        _;
    }

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admin allowed");
        _;
    }

    modifier onlyDoctor() {
        require(doctors[msg.sender], "Not a doctor");
        _;
    }

    constructor(address _admin) {
        owner = msg.sender;
        isAdmin[msg.sender] = true;
        isAdmin[_admin] = true;
    }

    function addAdmin(address newAdmin) public onlyOwner {
        require(!isAdmin[newAdmin], "Address is already an admin");
        isAdmin[newAdmin] = true;
        emit AdminAdded(newAdmin);
    }

    function removeAdmin(address adminToRemove) public onlyOwner {
        require(isAdmin[adminToRemove], "Address is not an admin");
        require(adminToRemove != owner, "Owner cannot be removed as admin");
        isAdmin[adminToRemove] = false;
        emit AdminRemoved(adminToRemove);
    }

    function registerRoles(address device, string[] memory roles) public onlyAdmin {
        delete deviceRoles[device];
        for (uint i = 0; i < roles.length; i++) {
            deviceRoles[device].push(roles[i]);
        }
        emit RoleRegistered(device, roles);
    }

    function revokeRoles(address device) public onlyAdmin {
        delete deviceRoles[device];
        emit RoleRevoked(device);
    }

    function toggleEmergencyMode() public onlyAdmin {
        emergencyMode = !emergencyMode;
        emit EmergencyToggled(emergencyMode);
    }

    function removeBlacklistedCombo(string memory role, string memory purpose) public onlyAdmin {
        bytes32 hash = keccak256(abi.encodePacked(role, purpose));
        blacklistedCombos[hash] = false;
        emit ComboRemoved(hash);
    }

    function addDoctorNew(address _doctor) external onlyAdmin {
        require(_doctor != address(0), "Invalid doctor address");
        require(!doctors[_doctor], "Doctor already registered with new system");
        doctors[_doctor] = true;

        if (!hasRole(_doctor, "doctor")) {
            deviceRoles[_doctor].push("doctor");
            emit RoleRegistered(_doctor, deviceRoles[_doctor]);
        }
        emit DoctorRegistered(_doctor);
    }

    function registerPatient(address patient, string memory name, uint age, string memory medicalHistory, address doctor) public onlyAdmin {
        require(patient != address(0), "Invalid patient address");
        require(!patientsOld[patient].exists, "Patient already registered with original system");
        require(hasRole(doctor, "doctor"), "Associated doctor must be registered and have 'doctor' role");

        patientsOld[patient] = PatientOld(name, age, medicalHistory, true);
        doctorPatients[doctor].push(patient);
        emit PatientRegistered(patient, doctor);
    }

    function requestAccess(string memory purpose) public {
        string[] memory roles = deviceRoles[msg.sender];
        bool granted = false;
        string memory reason = "No matching role";

        for (uint i = 0; i < roles.length; i++) {
            bytes32 hash = keccak256(abi.encodePacked(roles[i], purpose));
            if (!blacklistedCombos[hash]) {
                granted = true;
                reason = "Access Granted";
                break;
            } else {
                reason = "Role-purpose combo blacklisted";
            }
        }

        if (emergencyMode) { // This is the global admin-controlled emergency override
            granted = true;
            reason = "Emergency Override (Admin)";
        } else if (isEmergencyActive && hasRole(msg.sender, "emergency")) { // Additional check for emergency role's specific active emergency
            granted = true;
            reason = "Emergency Device Access (Self-Declared Emergency)";
        }


        logs.push(AccessLog({
            user: msg.sender,
            purpose: purpose,
            roles: roles,
            success: granted,
            reason: reason,
            timestamp: block.timestamp
        }));

        emit AccessAttempt(msg.sender, granted, reason);
    }

    function hasRole(address device, string memory role) internal view returns (bool) {
        string[] memory roles = deviceRoles[device];
        for (uint i = 0; i < roles.length; i++) {
            if (keccak256(bytes(roles[i])) == keccak256(bytes(role))) {
                return true;
            }
        }
        return false;
    }

    function updateFirmware(string memory deviceId, string memory firmwareVersion, string memory firmwareHash) public {
        require(hasRole(msg.sender, "technician"), "Only technician can update firmware");
        require(bytes(deviceId).length > 0, "Invalid device ID");
        require(bytes(firmwareVersion).length > 0, "Invalid firmware version");
        require(bytes(firmwareHash).length > 0, "Invalid firmware hash");

        firmwareLogs.push(FirmwareUpdate({
            deviceId: deviceId,
            firmwareVersion: firmwareVersion,
            firmwareHash: firmwareHash,
            updatedBy: msg.sender,
            timestamp: block.timestamp
        }));

        emit FirmwareUpdated(deviceId, firmwareVersion, firmwareHash, msg.sender);
    }

    function addOrUpdatePatient(address _patient, string memory _name, string memory _details) external onlyDoctor {
        patientsNew[_patient].name = _name;
        patientsNew[_patient].details = _details;
    }

    function addCheckupDetail(address _patient, string memory _checkupNote) external onlyDoctor {
        patientsNew[_patient].checkupHistory.push(_checkupNote);
        emit PatientUpdated(_patient, _checkupNote, block.timestamp);
    }

    function addAppointment(string memory _date, string memory _reason) external onlyDoctor {
        doctorAppointments[msg.sender].push(Appointment(_date, _reason));
        emit AppointmentAdded(msg.sender, _date, _reason);
    }

    function getAccessLog(uint index) public view returns (AccessLog memory) {
        require(index < logs.length, "Invalid log index");
        return logs[index];
    }

    function getLogCount() public view returns (uint) {
        return logs.length;
    }

    function getRoles(address device) public view returns (string[] memory) {
        return deviceRoles[device];
    }

    function getFirmwareUpdate(uint index) public view returns (string memory, string memory, string memory, address, uint) {
        require(index < firmwareLogs.length, "Invalid firmware log index");
        FirmwareUpdate memory log = firmwareLogs[index];
        return (log.deviceId, log.firmwareVersion, log.firmwareHash, log.updatedBy, log.timestamp);
    }

    function getFirmwareUpdateCount() public view returns (uint) {
        return firmwareLogs.length;
    }

    function getPatientInfo(address patient) public view returns (string memory, uint, string memory) {
        require(patientsOld[patient].exists, "Patient not found in original system");
        PatientOld memory p = patientsOld[patient];
        return (p.name, p.age, p.medicalHistory);
    }

    function getDoctorPatients(address doctor) public view returns (address[] memory) {
        return doctorPatients[doctor];
    }

    function getPatientHistory(address _patient) public view returns (string[] memory) {
        return patientsNew[_patient].checkupHistory;
    }

    function getMyAppointments() external view onlyDoctor returns (Appointment[] memory) {
        return doctorAppointments[msg.sender];
    }

    // --- NEW EMERGENCY FUNCTIONS START ---
    function triggerEmergency(string memory _message) public {
        require(hasRole(msg.sender, "emergency"), "Only emergency device can trigger emergency");
        isEmergencyActive = true;
        emergencyEvents.push(EmergencyEvent(_message, block.timestamp, msg.sender));
        emit EmergencyTriggered(msg.sender, _message, block.timestamp);
    }

    function resolveEmergency() public {
        require(hasRole(msg.sender, "emergency"), "Only emergency device can resolve emergency");
        isEmergencyActive = false;
        emergencyEvents.push(EmergencyEvent("Emergency resolved", block.timestamp, msg.sender));
        emit EmergencyResolved(msg.sender, block.timestamp);
    }

    // The getter for `isEmergencyActive` is automatically created because it's a public state variable.
    // So, we removed the explicit function to avoid the name collision.

    function logEmergencyEvent(string memory _message) public {
        require(hasRole(msg.sender, "emergency"), "Only emergency device can log events");
        emergencyEvents.push(EmergencyEvent(_message, block.timestamp, msg.sender));
        emit EmergencyEventLogged(msg.sender, _message, block.timestamp);
    }

    function getEmergencyLogs() public view returns (EmergencyEvent[] memory) {
        return emergencyEvents;
    }

    function getLastEmergencyTime() public view returns (uint) {
        if (emergencyEvents.length == 0) return 0;
        return emergencyEvents[emergencyEvents.length - 1].timestamp;
    }

    function getEmergencyCount() public view returns (uint) {
        return emergencyEvents.length;
    }

    // Function to check if emergency is active (this is the public getter for the state variable)
    // function isEmergencyActive() public view returns (bool) {
    //     return isEmergencyActive; // This function is now redundant as 'bool public isEmergencyActive' provides it.
    // }

    function getEmergencyByIndex(uint _index) public view returns (EmergencyEvent memory) {
        require(_index < emergencyEvents.length, "Invalid index");
        return emergencyEvents[_index];
    }

    function clearEmergencyLogs() public onlyAdmin {
        delete emergencyEvents;
        isEmergencyActive = false; // Reset state if logs are cleared
    }
    // --- NEW EMERGENCY FUNCTIONS END ---
}
