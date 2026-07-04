"""
Demo Scenarios Module
=====================
Contains various demonstration scenarios showcasing the blockchain
security features protecting the pacemaker.
"""

import time
from typing import Dict
from blockchain_wall import BlockchainWall
from signal_simulator import SignalSimulator
from utils import (
    print_header, print_info, print_success, print_error,
    print_warning, print_block_details
)

class DemoScenarios:
    """Manages and executes various demonstration scenarios"""

    def __init__(self, blockchain_wall: BlockchainWall, signal_simulator: SignalSimulator):
        self.blockchain_wall = blockchain_wall
        self.signal_simulator = signal_simulator
        # Make sure the simulator always asks the wall for nonces,
        # regardless of how it was constructed by the caller.
        self.signal_simulator.attach_wall(self.blockchain_wall)

    def demo_authorized_access(self):
        """Demonstrate a legitimate, authorized signal"""
        print_header("=" * 80)
        print_header("SCENARIO 1: AUTHORIZED ACCESS - SAFE SIGNAL")
        print_header("=" * 80)

        print_info("\n📝 Scenario Description:")
        print_info("   A doctor sends a legitimate command to check the pacemaker status.")
        print_info("   This signal should pass all security checks and be added to blockchain.\n")

        time.sleep(1)

        signal = self.signal_simulator.create_safe_signal(
            sender="0xDoctorWallet123",
            command="status",
            frequency=72
        )

        print_info("📤 Sending signal to Blockchain Wall:")
        print_info(f"   {signal}\n")

        time.sleep(1)

        success, message, block = self.blockchain_wall.process_signal(signal)

        print()
        if success:
            print_success("=" * 80)
            print_success("✅ SIGNAL ACCEPTED - PACEMAKER RECEIVES COMMAND")
            print_success("=" * 80)
            print_success(f"\n{message}")
            print_block_details(block)
        else:
            print_error("=" * 80)
            print_error("❌ SIGNAL REJECTED")
            print_error("=" * 80)
            print_error(f"\n{message}")

    def demo_unauthorized_access(self):
        """Demonstrate an unauthorized access attempt"""
        print_header("=" * 80)
        print_header("SCENARIO 2: UNAUTHORIZED ACCESS ATTEMPT")
        print_header("=" * 80)

        print_info("\n📝 Scenario Description:")
        print_info("   An unknown hacker attempts to send a command to the pacemaker.")
        print_info("   The blockchain wall should detect and block this unauthorized access.\n")

        time.sleep(1)

        signal = self.signal_simulator.create_unauthorized_signal()

        print_warning("📤 Malicious signal detected:")
        print_warning(f"   {signal}\n")

        time.sleep(1)

        success, message, block = self.blockchain_wall.process_signal(signal)

        print()
        if not success:
            print_error("=" * 80)
            print_error("🛡️  THREAT BLOCKED - PACEMAKER PROTECTED")
            print_error("=" * 80)
            print_error(f"\n{message}")
            print_error("\n🔒 The blockchain wall successfully prevented unauthorized access!")
            print_block_details(block)
        else:
            print_warning("\n⚠️  Warning: Signal was unexpectedly accepted!")

    def demo_malicious_command_injection(self):
        """Demonstrate malicious command injection attempt"""
        print_header("=" * 80)
        print_header("SCENARIO 3: MALICIOUS COMMAND INJECTION")
        print_header("=" * 80)

        print_info("\n📝 Scenario Description:")
        print_info("   An attacker tries to inject malicious commands (e.g., 'rm -rf', shell commands)")
        print_info("   The blockchain wall should detect malicious patterns and block the signal.\n")

        time.sleep(1)

        # Use a sender that hasn't been used by an earlier scenario in this
        # run when possible, to keep nonce sequencing intuitive to read —
        # but it works correctly with any sender either way now that nonce
        # comes from the wall directly.
        signal = self.signal_simulator.create_malicious_command_signal(sender="0xNurseWallet789")

        print_warning("📤 Signal with malicious command detected:")
        print_warning(f"   {signal}\n")

        time.sleep(1)

        success, message, block = self.blockchain_wall.process_signal(signal)

        print()
        if not success:
            print_error("=" * 80)
            print_error("🛡️  MALICIOUS COMMAND BLOCKED")
            print_error("=" * 80)
            print_error(f"\n{message}")
            print_error("\n🔒 Command validation prevented potential system compromise!")
            print_block_details(block)
        else:
            print_warning("\n⚠️  Warning: Malicious command was unexpectedly accepted!")

    def demo_replay_attack(self):
        """Demonstrate replay attack prevention"""
        print_header("=" * 80)
        print_header("SCENARIO 4: REPLAY ATTACK PREVENTION")
        print_header("=" * 80)

        print_info("\n📝 Scenario Description:")
        print_info("   An attacker intercepts a legitimate command and tries to replay it.")
        print_info("   The blockchain wall uses nonce validation to detect and prevent replay attacks.\n")

        time.sleep(1)

        print_info("Step 1: Sending legitimate signal...")
        signal1 = self.signal_simulator.create_safe_signal(
            sender="0xDoctorWallet123",
            command="pulse-check"
        )
        print_info(f"   {signal1}\n")
        success1, msg1, block1 = self.blockchain_wall.process_signal(signal1)

        if success1:
            print_success(f"\n✅ Original signal accepted (Nonce: {signal1['nonce']})\n")
            time.sleep(2)

        print_warning("Step 2: Attacker attempting to replay the intercepted signal...")
        # Replay the EXACT same sender so the "already used nonce" pulled
        # from the wall matches signal1's nonce precisely — this is what
        # makes it a guaranteed, correctly-detected replay every time,
        # regardless of execution order.
        signal2 = self.signal_simulator.create_replay_attack_signal(sender="0xDoctorWallet123")
        print_warning(f"   {signal2}\n")

        time.sleep(1)

        success2, message, block2 = self.blockchain_wall.process_signal(signal2)

        print()
        if not success2:
            print_error("=" * 80)
            print_error("🛡️  REPLAY ATTACK DETECTED AND BLOCKED")
            print_error("=" * 80)
            print_error(f"\n{message}")
            print_error("\n🔒 Nonce validation successfully prevented the replay attack!")
            print_block_details(block2)
        else:
            print_warning("\n⚠️  Warning: Replay attack was unexpectedly accepted!")

    def demo_rate_limiting(self):
        """Demonstrate rate limiting protection"""
        print_header("=" * 80)
        print_header("SCENARIO 5: RATE LIMITING PROTECTION")
        print_header("=" * 80)

        print_info("\n📝 Scenario Description:")
        print_info("   An attacker tries to flood the pacemaker with rapid commands (DDoS-like attack).")
        print_info(f"   Rate limit: {self.blockchain_wall.max_commands_per_window} commands per {self.blockchain_wall.rate_limit_window} seconds.\n")

        time.sleep(1)

        # Use a fresh sender dedicated to this scenario so rate-limit
        # behavior is never confused with nonce sequencing from other
        # scenarios that may have run before this one.
        sender = "0xAdminWallet456"

        print_info(f"Sending multiple rapid commands from {sender}...\n")

        for i in range(5):
            print_info(f"Command {i+1}:")
            signal = self.signal_simulator.create_safe_signal(
                sender=sender,
                command="status"
            )

            success, message, block = self.blockchain_wall.process_signal(signal)

            if success:
                print_success(f"   ✅ Command {i+1} accepted\n")
            else:
                print_error(f"   ❌ Command {i+1} rejected: {message}\n")
                print_error("=" * 80)
                print_error("🛡️  RATE LIMIT ENFORCED - FLOOD ATTACK PREVENTED")
                print_error("=" * 80)
                print_error("\n🔒 Rate limiting successfully prevented potential DoS attack!")
                break

            time.sleep(0.3)

    def demo_abnormal_frequency(self):
        """Demonstrate abnormal frequency detection"""
        print_header("=" * 80)
        print_header("SCENARIO 6: ABNORMAL FREQUENCY DETECTION")
        print_header("=" * 80)

        print_info("\n📝 Scenario Description:")
        print_info("   An attacker tries to send a command with dangerously high frequency.")
        print_info(f"   Maximum safe frequency: {self.blockchain_wall.max_frequency} BPM\n")

        time.sleep(1)

        # Dedicated sender for this scenario too, for the same reason as above.
        signal = self.signal_simulator.create_high_frequency_signal(sender="0xNurseWallet789")

        print_warning("📤 Signal with abnormal frequency detected:")
        print_warning(f"   {signal}\n")

        time.sleep(1)

        success, message, block = self.blockchain_wall.process_signal(signal)

        print()
        if not success:
            print_error("=" * 80)
            print_error("🛡️  ABNORMAL FREQUENCY DETECTED - SIGNAL BLOCKED")
            print_error("=" * 80)
            print_error(f"\n{message}")
            print_error("\n🔒 Frequency validation prevented potentially dangerous pacemaker setting!")
            print_block_details(block)
        else:
            print_warning("\n⚠️  Warning: High frequency signal was unexpectedly accepted!")

    def run_complete_test_suite(self):
        """Run all security tests in sequence"""
        print_header("=" * 80)
        print_header("COMPLETE SECURITY TEST SUITE")
        print_header("=" * 80)

        print_info("\n🧪 Running comprehensive security test suite...")
        print_info("   This will demonstrate all security features of the blockchain wall.\n")

        input("Press Enter to start the test suite...")

        # Always start the suite from a clean slate — this is the actual
        # fix for the nonce-drift bug. It no longer matters whether
        # individual scenarios were run earlier in this session.
        self.blockchain_wall.reset_state()
        print_info("\n🔄 Blockchain Wall state reset — starting suite from a clean slate.\n")

        scenarios = [
            ("Authorized Access", self.demo_authorized_access),
            ("Unauthorized Access", self.demo_unauthorized_access),
            ("Malicious Command Injection", self.demo_malicious_command_injection),
            ("Replay Attack", self.demo_replay_attack),
            ("Rate Limiting", self.demo_rate_limiting),
            ("Abnormal Frequency", self.demo_abnormal_frequency)
        ]

        for i, (name, scenario_func) in enumerate(scenarios, 1):
            print_header(f"\n\n{'=' * 80}")
            print_header(f"TEST {i}/{len(scenarios)}: {name.upper()}")
            print_header(f"{'=' * 80}\n")

            scenario_func()

            if i < len(scenarios):
                input("\n\nPress Enter to continue to next test...")

        print_header("\n\n" + "=" * 80)
        print_header("TEST SUITE COMPLETED")
        print_header("=" * 80)

        self.show_statistics()

    def show_statistics(self):
        """Display system statistics"""
        print_header("\n" + "=" * 80)
        print_header("BLOCKCHAIN WALL STATISTICS")
        print_header("=" * 80)

        stats = self.blockchain_wall.get_statistics()

        print_info(f"\n📊 Signal Processing:")
        print_info(f"   Total Signals Processed: {stats['total_signals']}")
        print_success(f"   ✅ Accepted Signals: {stats['accepted_signals']}")
        print_error(f"   ❌ Rejected Signals: {stats['rejected_signals']}")
        print_warning(f"   🚨 Threats Detected: {stats['threats_detected']}")
        print_info(f"   📈 Acceptance Rate: {stats['acceptance_rate']:.2f}%")

        print_info(f"\n⛓️  Blockchain Status:")
        print_info(f"   Chain Length: {stats['chain_length']} blocks")
        print_info(f"   Chain Integrity: {'✅ Valid' if self.blockchain_wall.verify_chain_integrity() else '❌ Compromised'}")

        print_info(f"\n🔐 Device Management:")
        print_info(f"   Authorized Devices: {stats['authorized_devices']}")
        print_info(f"   Blacklisted Devices: {stats['blacklisted_devices']}")

        print_info("\n📋 Authorized Devices List:")
        for address, info in self.blockchain_wall.authorized_devices.items():
            print_success(f"   • {address[:20]}... - {info['name']} ({info['role']})")

        metrics = self.blockchain_wall.get_performance_metrics()
        print(metrics.get_comparative_summary())

        print_info("\n📁 Export Options:")
        export = input("   Export metrics to file? (json/csv/no): ").strip().lower()

        if export == 'json':
            filename = f"simulation_metrics_{int(time.time())}.json"
            metrics.export_to_json(filename)
            print_success(f"   ✅ Metrics exported to {filename}")
        elif export == 'csv':
            filename = f"simulation_data_{int(time.time())}.csv"
            metrics.export_to_csv(filename)
            print_success(f"   ✅ Data exported to {filename}")
        print()