"""
Signal Simulator Module
=======================
Simulates various types of signals sent to the pacemaker,
including safe signals and malicious attack attempts.

NOTE: nonce assignment is now delegated to BlockchainWall.get_next_nonce()
instead of being tracked independently here. This was the root cause of
the nonce-drift bug where individual scenarios run before the Complete
Test Suite would desync from what the wall actually expected.
"""

import random
from typing import Dict, Optional

class SignalSimulator:
    """Simulates different types of signals for demonstration"""

    def __init__(self, blockchain_wall=None):
        self.authorized_senders = [
            "0xDoctorWallet123",
            "0xAdminWallet456",
            "0xNurseWallet789"
        ]

        self.unauthorized_senders = [
            "0xHackerWallet999",
            "0xMaliciousDevice001",
            "0xUnknownDevice555"
        ]

        self.safe_commands = ["start", "stop", "status", "pulse-check", "heartbeat-check"]
        self.malicious_commands = ["rm -rf", "exec /bin/sh", "stop; rm data", "status | grep secret"]

        # Reference to the wall so we can ask it for the correct next nonce
        # per sender, instead of guessing independently.
        self.blockchain_wall = blockchain_wall

        # Kept only as a fallback for when no blockchain_wall is attached
        # (e.g. unit-testing this module in isolation).
        self.nonce_counters = {}

    def attach_wall(self, blockchain_wall):
        """Allow attaching/replacing the wall reference after construction."""
        self.blockchain_wall = blockchain_wall

    def _next_nonce(self, sender: str) -> int:
        """Get the correct next nonce for a sender from the wall if attached,
        otherwise fall back to an internal counter."""
        if self.blockchain_wall is not None:
            return self.blockchain_wall.get_next_nonce(sender)

        if sender not in self.nonce_counters:
            self.nonce_counters[sender] = 0
        else:
            self.nonce_counters[sender] += 1
        return self.nonce_counters[sender]

    def create_safe_signal(self, sender: str = None, command: str = None, frequency: int = None) -> Dict:
        """Create a safe, legitimate signal"""
        if sender is None:
            sender = random.choice(self.authorized_senders)

        if command is None:
            command = random.choice(self.safe_commands)

        if frequency is None:
            frequency = random.randint(60, 80)  # Normal heart rate range

        return {
            "sender": sender,
            "command": command,
            "frequency": frequency,
            "nonce": self._next_nonce(sender),
            "timestamp": "2026-02-01T10:30:00Z",
            "patient_id": "P12345"
        }

    def create_unauthorized_signal(self) -> Dict:
        """Create a signal from an unauthorized sender.
        Nonce doesn't matter here since Authorization Check fails first
        and the wall never reaches nonce validation — 0 is fine."""
        sender = random.choice(self.unauthorized_senders)

        return {
            "sender": sender,
            "command": random.choice(self.safe_commands),
            "frequency": random.randint(60, 80),
            "nonce": 0,
            "timestamp": "2026-02-01T10:31:00Z",
            "patient_id": "P12345"
        }

    def create_malicious_command_signal(self, sender: str = None) -> Dict:
        """Create a signal with malicious command injection"""
        if sender is None:
            sender = random.choice(self.authorized_senders)

        return {
            "sender": sender,
            "command": random.choice(self.malicious_commands),
            "frequency": random.randint(60, 80),
            "nonce": self._next_nonce(sender),
            "timestamp": "2026-02-01T10:32:00Z",
            "patient_id": "P12345"
        }

    def create_replay_attack_signal(self, sender: str = None) -> Dict:
        """Create a signal with a replayed (already-used) nonce.
        Pulls the wall's current tracked nonce for this sender and reuses
        it directly — this is guaranteed to be a real replay regardless
        of how many signals were sent before, fixing the old "guess an
        old nonce" approach that could drift out of sync."""
        if sender is None:
            sender = random.choice(self.authorized_senders)

        if self.blockchain_wall is not None:
            # The last nonce actually accepted by the wall for this sender.
            # Defaults to 0 if the sender has never sent anything yet —
            # in that case nonce 0 won't exist yet either, but Authorization
            # will have to be true and nonce 0 will simply be treated as
            # "Invalid nonce" rather than "replay", which is still a
            # correctly-rejected signal for demo purposes.
            already_used_nonce = self.blockchain_wall.nonce_tracker.get(sender, 0)
        else:
            already_used_nonce = max(0, self.nonce_counters.get(sender, 0) - 1)

        return {
            "sender": sender,
            "command": random.choice(self.safe_commands),
            "frequency": random.randint(60, 80),
            "nonce": already_used_nonce,
            "timestamp": "2026-02-01T10:33:00Z",
            "patient_id": "P12345"
        }

    def create_high_frequency_signal(self, sender: str = None) -> Dict:
        """Create a signal with abnormally high frequency"""
        if sender is None:
            sender = random.choice(self.authorized_senders)

        return {
            "sender": sender,
            "command": random.choice(self.safe_commands),
            "frequency": random.randint(95, 150),  # Abnormally high
            "nonce": self._next_nonce(sender),
            "timestamp": "2026-02-01T10:34:00Z",
            "patient_id": "P12345"
        }

    def reset_nonce(self, sender: str = None):
        """Reset the fallback nonce counter (only relevant when no
        blockchain_wall is attached)."""
        if sender:
            self.nonce_counters[sender] = 0
        else:
            self.nonce_counters = {}