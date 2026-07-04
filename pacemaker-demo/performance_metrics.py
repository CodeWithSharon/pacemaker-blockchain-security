"""
Performance Metrics Module
===========================
Tracks latency, throughput, gas usage, and security/threat statistics
for both Blockchain Mode and Simulation Mode, so they can be compared
for the research paper's Results section.
"""

import json
import csv
import statistics
from typing import Dict, List, Optional


class PerformanceMetrics:
    """Collects and reports performance + security metrics for a single mode run"""

    def __init__(self, mode: str):
        """
        Args:
            mode: 'blockchain' or 'simulation'
        """
        self.mode = mode

        # Raw timing samples (in seconds)
        self._validation_times: List[float] = []
        self._mining_times: List[float] = []
        self._transaction_latencies: List[float] = []

        # Gas usage (blockchain mode only)
        self._gas_used: List[int] = []

        # Block sizes (bytes)
        self._block_sizes: List[int] = []

        # Transaction outcome counters
        self.successful_transactions = 0
        self.failed_transactions = 0
        self.failure_reasons: Dict[str, int] = {}

        # Threat counters
        self.threat_counts: Dict[str, int] = {}

        # Security category counters (used by comparative_analysis.py)
        self.replay_attacks_prevented = 0
        self.rate_limits_enforced = 0
        self.malicious_commands_blocked = 0
        self.unauthorized_access_blocked = 0

    # ------------------------------------------------------------------
    # Recording methods
    # ------------------------------------------------------------------

    def record_validation(self, duration_seconds: float):
        """Record how long a validation/build step took"""
        self._validation_times.append(duration_seconds)

    def record_mining(self, duration_seconds: float):
        """Record how long mining/confirmation took"""
        self._mining_times.append(duration_seconds)

    def record_transaction(self, duration_seconds: float, gas_used: Optional[int] = None,
                            success: bool = True, failure_reason: Optional[str] = None):
        """Record a completed transaction's total latency and outcome"""
        self._transaction_latencies.append(duration_seconds)

        if gas_used is not None:
            self._gas_used.append(gas_used)

        if success:
            self.successful_transactions += 1
        else:
            self.failed_transactions += 1
            if failure_reason:
                self.failure_reasons[failure_reason] = self.failure_reasons.get(failure_reason, 0) + 1

    def record_block(self, size_bytes: Optional[int] = None):
        """Record that a block was added to the chain"""
        if size_bytes is not None:
            self._block_sizes.append(size_bytes)

    def record_threat(self, threat_type: str):
        """
        Record a detected/blocked threat.

        Accepts either the human-readable check names used in simulation mode
        ('Rate Limit Check', 'Replay Attack Check', etc.) or the snake_case
        reason codes used in blockchain mode ('rate_limit', 'replay_attack', etc.)
        and buckets them into the categories used for the security comparison.
        """
        self.threat_counts[threat_type] = self.threat_counts.get(threat_type, 0) + 1

        label = threat_type.lower()

        if 'replay' in label:
            self.replay_attacks_prevented += 1
        elif 'rate' in label or 'cooldown' in label or 'frequency' in label:
            self.rate_limits_enforced += 1
        elif 'malicious' in label or 'command' in label or 'invalid' in label:
            self.malicious_commands_blocked += 1
        elif 'unauthorized' in label or 'authorization' in label or 'blacklist' in label:
            self.unauthorized_access_blocked += 1

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _ms_stats(samples_seconds: List[float]) -> Dict:
        """Convert a list of second-based samples into a millisecond stats dict"""
        if not samples_seconds:
            return {'mean': 0.0, 'median': 0.0, 'min': 0.0, 'max': 0.0,
                     'std_dev': 0.0, 'p95': 0.0, 'p99': 0.0}

        samples_ms = sorted(s * 1000 for s in samples_seconds)
        n = len(samples_ms)

        def percentile(p):
            if n == 1:
                return samples_ms[0]
            k = (p / 100) * (n - 1)
            f = int(k)
            c = min(f + 1, n - 1)
            if f == c:
                return samples_ms[f]
            return samples_ms[f] + (samples_ms[c] - samples_ms[f]) * (k - f)

        return {
            'mean': statistics.mean(samples_ms),
            'median': statistics.median(samples_ms),
            'min': min(samples_ms),
            'max': max(samples_ms),
            'std_dev': statistics.stdev(samples_ms) if n > 1 else 0.0,
            'p95': percentile(95),
            'p99': percentile(99),
        }

    # ------------------------------------------------------------------
    # Reporting
    # ------------------------------------------------------------------

    def get_latency_stats(self) -> Dict:
        """Latency stats (in ms) based on total transaction latency"""
        return self._ms_stats(self._transaction_latencies)

    def get_throughput_stats(self) -> Dict:
        """Throughput / success-rate stats"""
        total = self.successful_transactions + self.failed_transactions
        success_rate = (self.successful_transactions / total * 100) if total > 0 else 0.0

        total_time = sum(self._transaction_latencies)
        tps = (total / total_time) if total_time > 0 else 0.0

        return {
            'total_transactions': total,
            'successful_transactions': self.successful_transactions,
            'failed_transactions': self.failed_transactions,
            'success_rate': success_rate,
            'transactions_per_second': tps,
        }

    def get_security_stats(self) -> Dict:
        """Security / threat-blocking stats"""
        total_blocked = sum(self.threat_counts.values())
        return {
            'total_threats_blocked': total_blocked,
            'replay_attacks_prevented': self.replay_attacks_prevented,
            'rate_limits_enforced': self.rate_limits_enforced,
            'malicious_commands_blocked': self.malicious_commands_blocked,
            'unauthorized_access_blocked': self.unauthorized_access_blocked,
            'threat_breakdown': dict(self.threat_counts),
        }

    def get_gas_stats(self) -> Dict:
        """Gas usage stats (blockchain mode only)"""
        if not self._gas_used:
            return {'mean_gas': 0, 'min_gas': 0, 'max_gas': 0, 'total_gas': 0}

        return {
            'mean_gas': statistics.mean(self._gas_used),
            'min_gas': min(self._gas_used),
            'max_gas': max(self._gas_used),
            'total_gas': sum(self._gas_used),
        }

    def get_comprehensive_report(self) -> Dict:
        """Full structured report, used by ComparativeAnalyzer"""
        return {
            'mode': self.mode,
            'latency': self.get_latency_stats(),
            'throughput': self.get_throughput_stats(),
            'security': self.get_security_stats(),
            'gas_consumption': self.get_gas_stats(),
        }

    def get_comparative_summary(self) -> str:
        """Human-readable summary printed in the CLI demo"""
        latency = self.get_latency_stats()
        throughput = self.get_throughput_stats()
        security = self.get_security_stats()
        gas = self.get_gas_stats()

        lines = []
        lines.append("=" * 80)
        lines.append(f"PERFORMANCE METRICS SUMMARY ({self.mode.upper()} MODE)")
        lines.append("=" * 80)
        lines.append("")
        lines.append("Latency:")
        lines.append(f"   Mean: {latency['mean']:.2f} ms   Median: {latency['median']:.2f} ms")
        lines.append(f"   Min: {latency['min']:.2f} ms   Max: {latency['max']:.2f} ms")
        lines.append(f"   P95: {latency['p95']:.2f} ms   P99: {latency['p99']:.2f} ms")
        lines.append("")
        lines.append("Throughput:")
        lines.append(f"   Total Transactions: {throughput['total_transactions']}")
        lines.append(f"   Success Rate: {throughput['success_rate']:.2f}%")
        lines.append(f"   TPS (avg): {throughput['transactions_per_second']:.2f}")
        lines.append("")
        lines.append("Security:")
        lines.append(f"   Total Threats Blocked: {security['total_threats_blocked']}")
        lines.append(f"   Replay Attacks Prevented: {security['replay_attacks_prevented']}")
        lines.append(f"   Rate Limits Enforced: {security['rate_limits_enforced']}")
        lines.append(f"   Malicious Commands Blocked: {security['malicious_commands_blocked']}")
        lines.append(f"   Unauthorized Access Blocked: {security['unauthorized_access_blocked']}")

        if self.mode == 'blockchain' and gas['total_gas'] > 0:
            lines.append("")
            lines.append("Gas Usage:")
            lines.append(f"   Mean Gas: {gas['mean_gas']:,.0f}")
            lines.append(f"   Total Gas: {gas['total_gas']:,.0f}")

        lines.append("=" * 80)
        return "\n".join(lines)

    # ------------------------------------------------------------------
    # Export
    # ------------------------------------------------------------------

    def export_to_json(self, filename: str):
        """Export the comprehensive report to a JSON file"""
        with open(filename, 'w') as f:
            json.dump(self.get_comprehensive_report(), f, indent=2)

    def export_to_csv(self, filename: str):
        """Export a flattened version of the comprehensive report to CSV"""
        report = self.get_comprehensive_report()
        flat = {'mode': report['mode']}

        for section in ('latency', 'throughput', 'security', 'gas_consumption'):
            for key, value in report[section].items():
                if isinstance(value, dict):
                    continue
                flat[f"{section}_{key}"] = value

        with open(filename, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(flat.keys())
            writer.writerow(flat.values())