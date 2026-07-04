"""
Blockchain Wall Module
=====================
Simulates the blockchain-based security layer that protects the pacemaker
from unauthorized signals and malicious commands.
"""

import hashlib
import time
import sys
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from utils import print_info, print_success, print_error, print_warning
from performance_metrics import PerformanceMetrics

class Block:
    """Represents a single block in the blockchain"""

    def __init__(self, index: int, timestamp: str, data: Dict, previous_hash: str):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.calculate_hash()

    def calculate_hash(self) -> str:
        block_string = f"{self.index}{self.timestamp}{str(self.data)}{self.previous_hash}{self.nonce}"
        return hashlib.sha256(block_string.encode()).hexdigest()

    def mine_block(self, difficulty: int = 2):
        target = "0" * difficulty
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()

    def get_size(self) -> int:
        return sys.getsizeof(str(self.data)) + sys.getsizeof(self.hash) + sys.getsizeof(self.previous_hash)

class BlockchainWall:
    """
    The Blockchain Wall that protects the pacemaker
    All signals must pass through this security layer
    """

    def __init__(self):
        self.chain: List[Block] = []
        self.authorized_devices: Dict[str, Dict] = {}
        self.command_history: Dict[str, List] = {}
        self.nonce_tracker: Dict[str, int] = {}
        self.rate_limit_tracker: Dict[str, List[float]] = {}
        self.blacklisted_addresses: List[str] = []
        self.allowed_commands: List[str] = ["start", "stop", "status", "pulse-check", "heartbeat-check"]
        self.blocked_patterns: List[str] = [";", "|", "&", "rm", "wg", "cu", "su", "exec"]
        self.max_frequency: int = 90
        self.rate_limit_window: int = 10  # seconds
        self.max_commands_per_window: int = 3

        # Statistics
        self.total_signals: int = 0
        self.accepted_signals: int = 0
        self.rejected_signals: int = 0
        self.threats_detected: int = 0

        # Performance metrics
        self.metrics = PerformanceMetrics('simulation')

        # Create genesis block
        self._create_genesis_block()

        # Register default authorized devices
        self._register_default_devices()

    def _create_genesis_block(self):
        genesis_block = Block(
            0,
            datetime.now().isoformat(),
            {"type": "genesis", "message": "Pacemaker Security System Initialized"},
            "0"
        )
        genesis_block.mine_block()
        self.chain.append(genesis_block)

    def _register_default_devices(self):
        self.authorized_devices["0xDoctorWallet123"] = {
            "role": "Doctor", "name": "Dr. Smith", "authorized": True
        }
        self.authorized_devices["0xAdminWallet456"] = {
            "role": "Admin", "name": "Admin User", "authorized": True
        }
        self.authorized_devices["0xNurseWallet789"] = {
            "role": "Nurse", "name": "Nurse Johnson", "authorized": True
        }

    def register_device(self, address: str, role: str, name: str):
        self.authorized_devices[address] = {
            "role": role, "name": name, "authorized": True
        }

    def is_device_authorized(self, address: str) -> bool:
        if address in self.blacklisted_addresses:
            return False
        return address in self.authorized_devices and self.authorized_devices[address].get("authorized", False)

    # ------------------------------------------------------------------
    # NEW: single source of truth for "what nonce should this sender use
    # next". SignalSimulator now calls this instead of guessing its own
    # nonce — this is what fixes the drift bug between SignalSimulator's
    # internal counter and the wall's actual nonce_tracker.
    # ------------------------------------------------------------------
    def get_next_nonce(self, address: str) -> int:
        """Return the next valid nonce for a sender, without consuming it."""
        return self.nonce_tracker.get(address, -1) + 1

    def reset_state(self):
        """
        Fully reset the wall's runtime state (nonces, rate limits, chain,
        stats) while keeping the same authorized device list. Used at the
        start of the Complete Test Suite so it behaves identically whether
        or not individual scenarios were run earlier in the same session.
        """
        self.chain = []
        self.command_history = {}
        self.nonce_tracker = {}
        self.rate_limit_tracker = {}
        self.total_signals = 0
        self.accepted_signals = 0
        self.rejected_signals = 0
        self.threats_detected = 0
        self.metrics = PerformanceMetrics('simulation')
        self._create_genesis_block()

    def check_rate_limit(self, address: str) -> Tuple[bool, str]:
        current_time = time.time()

        if address not in self.rate_limit_tracker:
            self.rate_limit_tracker[address] = []

        self.rate_limit_tracker[address] = [
            ts for ts in self.rate_limit_tracker[address]
            if current_time - ts < self.rate_limit_window
        ]

        if len(self.rate_limit_tracker[address]) >= self.max_commands_per_window:
            return False, f"Rate limit exceeded: {len(self.rate_limit_tracker[address])} commands in {self.rate_limit_window}s window"

        self.rate_limit_tracker[address].append(current_time)
        return True, "Within rate limits"

    def check_replay_attack(self, address: str, nonce: int) -> Tuple[bool, str]:
        if address not in self.nonce_tracker:
            self.nonce_tracker[address] = -1

        expected_nonce = self.nonce_tracker[address] + 1

        if nonce <= self.nonce_tracker[address]:
            return False, f"Replay attack detected! Nonce {nonce} already used. Expected: {expected_nonce}"

        if nonce > expected_nonce:
            return False, f"Invalid nonce! Expected: {expected_nonce}, Got: {nonce}"

        self.nonce_tracker[address] = nonce
        return True, "Nonce valid"

    def check_command_validity(self, command: str) -> Tuple[bool, str]:
        for pattern in self.blocked_patterns:
            if pattern in command.lower():
                return False, f"Malicious pattern detected: '{pattern}'"

        if command.lower() not in [cmd.lower() for cmd in self.allowed_commands]:
            return False, f"Command '{command}' not in allowed list"

        return True, "Command valid"

    def check_frequency(self, frequency: int) -> Tuple[bool, str]:
        if frequency > self.max_frequency:
            return False, f"Abnormal frequency spike detected: {frequency} > {self.max_frequency}"
        return True, "Frequency within safe limits"

    def process_signal(self, signal: Dict) -> Tuple[bool, str, Optional[Block]]:
        process_start = time.time()

        self.total_signals += 1

        sender = signal.get("sender", "unknown")
        command = signal.get("command", "")
        frequency = signal.get("frequency", 0)
        nonce = signal.get("nonce", 0)

        print_info(f"\n🔍 Processing signal through Blockchain Wall...")
        print_info(f"   Sender: {sender}")
        print_info(f"   Command: {command}")
        print_info(f"   Frequency: {frequency}")
        print_info(f"   Nonce: {nonce}")

        validation_start = time.time()

        checks = [
            ("Authorization Check", lambda: (self.is_device_authorized(sender),
                                            "Device authorized" if self.is_device_authorized(sender)
                                            else "Unauthorized device")),
            ("Rate Limit Check", lambda: self.check_rate_limit(sender)),
            ("Replay Attack Check", lambda: self.check_replay_attack(sender, nonce)),
            ("Command Validation", lambda: self.check_command_validity(command)),
            ("Frequency Check", lambda: self.check_frequency(frequency)),
        ]

        print_info("\n🛡️  Running Security Checks:")

        for check_name, check_func in checks:
            check_start = time.time()
            passed, message = check_func()
            check_time = time.time() - check_start

            if passed:
                print_success(f"   ✅ {check_name}: {message} ({check_time*1000:.2f} ms)")
            else:
                print_error(f"   ❌ {check_name}: {message} ({check_time*1000:.2f} ms)")
                self.rejected_signals += 1
                self.threats_detected += 1

                self.metrics.record_threat(check_name)

                mine_start = time.time()
                rejection_block = Block(
                    len(self.chain),
                    datetime.now().isoformat(),
                    {
                        "type": "rejection",
                        "signal": signal,
                        "reason": f"{check_name} failed: {message}",
                        "threat_detected": True
                    },
                    self.chain[-1].hash
                )
                rejection_block.mine_block()
                mine_time = time.time() - mine_start

                self.chain.append(rejection_block)

                validation_time = time.time() - validation_start
                total_time = time.time() - process_start

                self.metrics.record_validation(validation_time)
                self.metrics.record_mining(mine_time)
                self.metrics.record_transaction(total_time, success=False,
                                              failure_reason=f"{check_name} failed")
                self.metrics.record_block(rejection_block.get_size())

                return False, f"{check_name} failed: {message}", rejection_block

        validation_time = time.time() - validation_start
        self.metrics.record_validation(validation_time)

        print_success(f"\n✅ All security checks passed! (Validation: {validation_time*1000:.2f} ms)")

        mine_start = time.time()
        new_block = Block(
            len(self.chain),
            datetime.now().isoformat(),
            {
                "type": "approved_signal",
                "signal": signal,
                "device_info": self.authorized_devices.get(sender, {}),
                "status": "accepted"
            },
            self.chain[-1].hash
        )

        print_info(f"\n⛏️  Mining block #{new_block.index}...")
        new_block.mine_block()
        mine_time = time.time() - mine_start

        self.chain.append(new_block)

        self.accepted_signals += 1

        total_time = time.time() - process_start
        self.metrics.record_mining(mine_time)
        self.metrics.record_transaction(total_time, success=True)
        self.metrics.record_block(new_block.get_size())

        print_info(f"   ⏱️  Total Time: {total_time*1000:.2f} ms")
        print_info(f"      • Validation: {validation_time*1000:.2f} ms")
        print_info(f"      • Mining: {mine_time*1000:.2f} ms")

        if sender not in self.command_history:
            self.command_history[sender] = []
        self.command_history[sender].append({
            "command": command,
            "timestamp": datetime.now().isoformat(),
            "block_index": new_block.index
        })

        return True, "Signal accepted and added to blockchain", new_block

    def get_statistics(self) -> Dict:
        return {
            "total_signals": self.total_signals,
            "accepted_signals": self.accepted_signals,
            "rejected_signals": self.rejected_signals,
            "threats_detected": self.threats_detected,
            "acceptance_rate": (self.accepted_signals / self.total_signals * 100) if self.total_signals > 0 else 0,
            "chain_length": len(self.chain),
            "authorized_devices": len(self.authorized_devices),
            "blacklisted_devices": len(self.blacklisted_addresses)
        }

    def verify_chain_integrity(self) -> bool:
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]

            if current_block.hash != current_block.calculate_hash():
                return False

            if current_block.previous_hash != previous_block.hash:
                return False

        return True

    def get_performance_metrics(self) -> PerformanceMetrics:
        return self.metrics